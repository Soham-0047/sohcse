/* ==========================================================================
   SOH CSE — Admin Service Client (Browser Edition)
   
   Integrates with admin-service (https://admin-w1i8.onrender.com) for
   AI model routing with automatic failover across all configured providers.
   
   Instead of hardcoding a single Gemini/Groq key, this client:
   1. Asks admin-service for the healthiest free LLM right now
   2. Calls that provider directly (OpenAI-compatible API)
   3. On failure, automatically tries the next best provider
   4. Reports outcomes back so the router learns
   
   Configuration is in config.js:
   - ADMIN_SERVICE_URL: The admin-service backend URL
   - ADMIN_SERVICE_TOKEN: The shared service token
   
   SECURITY: The service token is visible in the browser since this is a
   static site. For production, restrict access via CORS or use a proxy.
   ========================================================================== */

(function () {
    'use strict';

    function getAdminUrl() {
        return (typeof SOH_CONFIG !== 'undefined' && SOH_CONFIG.ADMIN_SERVICE_URL) || 'https://admin-w1i8.onrender.com';
    }
    function getServiceToken() {
        return (typeof SOH_CONFIG !== 'undefined' && SOH_CONFIG.ADMIN_SERVICE_TOKEN) || '';
    }

    // Cache for model routing (60 second TTL)
    let routeCache = null;
    let routeCacheTime = 0;
    const ROUTE_TTL = 60_000;

    // ============ Warmup (wake the Render backend) ============
    async function warmup() {
        try {
            await fetch(`${getAdminUrl()}/warmup`, { method: 'GET' });
        } catch (e) {
            // Silent fail — warmup is best-effort
        }
    }

    // ============ Get ranked model candidates ============
    async function routeModels(opts = {}) {
        const now = Date.now();
        
        // Return cache if fresh
        if (routeCache && (now - routeCacheTime) < ROUTE_TTL) {
            return routeCache;
        }

        const params = new URLSearchParams({
            kind: 'llm',
            freeOnly: opts.freeOnly !== false ? '1' : '0',
            limit: String(opts.limit || 5),
        });

        const res = await fetch(`${getAdminUrl()}/public/providers/route-models?${params}`, {
            headers: {
                'Authorization': `Bearer ${getServiceToken()}`,
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            throw new Error(`Admin service error: ${res.status}`);
        }

        const data = await res.json();
        routeCache = data;
        routeCacheTime = now;
        return data;
    }

    // ============ Report provider result ============
    async function reportResult(providerId, ok, latencyMs, reason, model) {
        try {
            await fetch(`${getAdminUrl()}/public/providers/${providerId}/report`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getServiceToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ok, latencyMs, reason, model }),
            });
        } catch (e) {
            // Silent fail — reporting is fire-and-forget
        }
    }

    // ============ Call an OpenAI-compatible provider ============
    async function callOpenAICompatible(candidate, messages, signal) {
        const apiKey = candidate.values?.apiKey;
        const baseURL = candidate.values?.baseURL || candidate.baseURL;
        const model = candidate.model;

        if (!baseURL) throw new Error('No baseURL for provider');
        if (!apiKey) throw new Error('No API key for provider');

        const url = `${baseURL.replace(/\/$/, '')}/chat/completions`;
        const start = Date.now();

        const res = await fetch(url, {
            method: 'POST',
            signal,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages,
                max_tokens: 2000,
                temperature: 0.5,
            }),
        });

        const latencyMs = Date.now() - start;

        if (!res.ok) {
            const errorText = await res.text().catch(() => '');
            // Report failure
            reportResult(candidate.id, false, latencyMs, `${res.status}`, model);
            
            if (res.status === 429) throw new Error('Rate limited');
            if (res.status === 401 || res.status === 403) throw new Error('Auth failed');
            throw new Error(`Provider error: ${res.status} ${errorText.slice(0, 100)}`);
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || '';

        // Report success
        reportResult(candidate.id, true, latencyMs, undefined, model);

        return content;
    }

    // ============ Generate text with automatic failover ============
    // This is the main function to call — replaces direct Gemini/Groq calls.
    // Tries the best model first, then races the next few in parallel on failure.
    window.adminGenerate = async function (messages, opts = {}) {
        const { primary, candidates } = await routeModels({
            freeOnly: opts.freeOnly !== false,
            limit: opts.limit || 5,
        });

        if (!primary && (!candidates || candidates.length === 0)) {
            throw new Error('No AI models available. Check admin-service configuration.');
        }

        const allCandidates = [primary, ...(candidates || [])].filter(Boolean);

        // Try primary first (10s timeout)
        const primaryController = new AbortController();
        const primaryTimeout = setTimeout(() => primaryController.abort(), 10_000);

        try {
            const result = await callOpenAICompatible(primary, messages, primaryController.signal);
            clearTimeout(primaryTimeout);
            return result;
        } catch (primaryError) {
            clearTimeout(primaryTimeout);
            console.warn(`Primary model failed (${primaryError.message}), trying fallbacks...`);
        }

        // Race the next 3 candidates in parallel (60s overall budget)
        const fallbacks = allCandidates.slice(1, 4);
        if (fallbacks.length === 0) {
            throw new Error('Primary model failed and no fallbacks available.');
        }

        const raceController = new AbortController();
        const raceTimeout = setTimeout(() => raceController.abort(), 60_000);

        const promises = fallbacks.map(candidate =>
            callOpenAICompatible(candidate, messages, raceController.signal)
                .then(result => ({ result, candidate }))
        );

        try {
            // First to succeed wins
            const winner = await Promise.any(promises);
            clearTimeout(raceTimeout);
            return winner.result;
        } catch (aggregateError) {
            clearTimeout(raceTimeout);
            throw new Error('All AI providers failed. Try again later.');
        }
    };

    // ============ Check if admin-service is configured ============
    window.isAdminServiceConfigured = function () {
        return !!(getServiceToken() && getAdminUrl());
    };

    // ============ Get available models (for display) ============
    window.getAvailableModels = async function () {
        try {
            const data = await routeModels({ freeOnly: true, limit: 10 });
            return (data.candidates || []).map(c => ({
                provider: c.providerId,
                model: c.model,
                healthy: c.modelStatus === 'healthy',
                free: c.freeTier,
            }));
        } catch {
            return [];
        }
    };

    // ============ Warmup on load ============
    if (window.isAdminServiceConfigured && window.isAdminServiceConfigured()) {
        warmup();
    }

})();
