/* ==========================================================================
   SOH CSE — Shared AI Chatbot Widget
   Drop into any page with: <script src="./chatbot.js"></script>
   Requires: style.css loaded
   Persists API keys per-provider in localStorage.
   Supports: Groq (free), HuggingFace, Cohere, Together AI, OpenAI.
   ========================================================================== */

(function () {
    'use strict';

    const STORAGE_KEY = 'sohcse_ai_keys';
    const CONTEXT_KEY = 'sohcse_ai_context';

    let isOpen = false;
    let isSending = false;
    let currentContext = ''; // Pages can set this (e.g., PDF text, question text)

    // ---------- API key persistence ----------
    function loadKeys() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
        catch { return {}; }
    }
    function saveKey(provider, key) {
        const keys = loadKeys();
        if (key && key.trim()) keys[provider] = key.trim();
        else delete keys[provider];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    }
    function getKey(provider) {
        return loadKeys()[provider] || '';
    }

    // ---------- Context (set by host page) ----------
    window.setAIContext = function (text) {
        currentContext = text || '';
        localStorage.setItem(CONTEXT_KEY, text || '');
    };
    window.getAIContext = function () {
        return localStorage.getItem(CONTEXT_KEY) || currentContext || '';
    };
    // Restore context on load
    currentContext = localStorage.getItem(CONTEXT_KEY) || '';

    // ---------- Inject UI ----------
    function inject() {
        if (document.getElementById('aiToggleBtn')) return; // already injected

        const html = `
            <button class="ai-toggle-btn" id="aiToggleBtn" title="Ask AI Assistant" aria-label="Open AI chat">🤖</button>
            <div class="ai-chat-panel" id="aiChatPanel" role="dialog" aria-label="AI Chat">
                <div class="ai-chat-header">
                    <div class="ai-chat-title">
                        <div class="ai-avatar">🤖</div>
                        <div>
                            <div>AI Study Assistant</div>
                            <small style="opacity:0.85;font-size:0.7rem;font-weight:500;" id="aiStatusText">Ready to help</small>
                        </div>
                    </div>
                    <div class="ai-chat-actions">
                        <button id="aiConfigBtn" title="Settings" aria-label="Settings">⚙</button>
                        <button id="aiClearBtn" title="Clear chat" aria-label="Clear chat">🗑</button>
                        <button id="aiCloseBtn" title="Close" aria-label="Close">✕</button>
                    </div>
                </div>
                <div class="ai-chat-messages" id="aiChatMessages">
                    <div class="message system">👋 Hi! I'm your GATE CSE study assistant. Ask me anything about algorithms, data structures, aptitude, or any topic you're studying.</div>
                </div>
                <div class="ai-suggestions" id="aiSuggestions">
                    <button class="ai-suggestion-chip" data-q="Explain Big-O notation with examples">Explain Big-O</button>
                    <button class="ai-suggestion-chip" data-q="What is the difference between TCP and UDP?">TCP vs UDP</button>
                    <button class="ai-suggestion-chip" data-q="Explain Banker's algorithm for deadlock avoidance">Banker's algo</button>
                    <button class="ai-suggestion-chip" data-q="Suggest a 30-day GATE CSE revision plan">Revision plan</button>
                </div>
                <div class="ai-chat-config" id="aiChatConfig">
                    <div class="config-row">
                        <select id="aiProvider" aria-label="AI provider">
                            <option value="groq">⚡ Groq (Free)</option>
                            <option value="huggingface">🤗 HuggingFace (Free)</option>
                            <option value="cohere">💫 Cohere (Free)</option>
                            <option value="together">🤝 Together AI (Free)</option>
                            <option value="openai">🤖 OpenAI (Paid)</option>
                        </select>
                    </div>
                    <input type="password" id="aiApiKey" placeholder="Enter API key (saved locally)" aria-label="API key">
                    <div class="config-status">
                        <div class="dot" id="aiKeyDot"></div>
                        <span id="aiKeyStatus">No API key saved</span>
                    </div>
                </div>
                <div class="ai-chat-input-area">
                    <div class="ai-input-group">
                        <textarea class="ai-chat-input" id="aiChatInput" placeholder="Ask anything about GATE CSE…" rows="1" aria-label="Type your question"></textarea>
                        <button class="ai-send-btn" id="aiSendBtn" aria-label="Send">➤</button>
                    </div>
                </div>
            </div>
        `;
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div.firstElementChild); // toggle btn
        document.body.appendChild(div.lastElementChild);   // panel
        // Re-append because innerHTML parses both elements but firstElementChild moves out
        if (!document.getElementById('aiChatPanel')) {
            document.body.appendChild(div.querySelector('#aiChatPanel'));
        }

        attachListeners();
        loadSavedKey();
    }

    // ---------- Listeners ----------
    function attachListeners() {
        document.getElementById('aiToggleBtn').addEventListener('click', toggle);
        document.getElementById('aiCloseBtn').addEventListener('click', close);
        document.getElementById('aiConfigBtn').addEventListener('click', toggleConfig);
        document.getElementById('aiClearBtn').addEventListener('click', clearChat);
        document.getElementById('aiSendBtn').addEventListener('click', sendMessage);
        document.getElementById('aiChatInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        // Auto-resize textarea
        document.getElementById('aiChatInput').addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(120, e.target.scrollHeight) + 'px';
        });
        // Provider change → load saved key
        document.getElementById('aiProvider').addEventListener('change', loadSavedKey);
        // Save key on blur
        document.getElementById('aiApiKey').addEventListener('blur', () => {
            const provider = document.getElementById('aiProvider').value;
            const key = document.getElementById('aiApiKey').value.trim();
            saveKey(provider, key);
            updateKeyStatus();
        });
        // Suggestion chips
        document.querySelectorAll('.ai-suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.getElementById('aiChatInput').value = chip.dataset.q;
                sendMessage();
            });
        });
        // ESC to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) close();
        });
    }

    function loadSavedKey() {
        const provider = document.getElementById('aiProvider').value;
        document.getElementById('aiApiKey').value = getKey(provider);
        updateKeyStatus();
    }

    function updateKeyStatus() {
        const provider = document.getElementById('aiProvider').value;
        const has = !!getKey(provider);
        const dot = document.getElementById('aiKeyDot');
        const status = document.getElementById('aiKeyStatus');
        if (has) {
            dot.className = 'dot ok';
            status.textContent = `✓ Key saved for ${provider}`;
        } else {
            dot.className = 'dot warn';
            status.textContent = `⚠ No key for ${provider} — click ⚙ to add`;
        }
    }

    function toggle() {
        isOpen ? close() : open();
    }
    function open() {
        isOpen = true;
        document.getElementById('aiChatPanel').classList.add('active');
        document.getElementById('aiToggleBtn').classList.add('active');
        setTimeout(() => document.getElementById('aiChatInput').focus(), 300);
    }
    function close() {
        isOpen = false;
        document.getElementById('aiChatPanel').classList.remove('active');
        document.getElementById('aiToggleBtn').classList.remove('active');
    }
    function toggleConfig() {
        document.getElementById('aiChatConfig').classList.toggle('open');
    }
    function clearChat() {
        const msgs = document.getElementById('aiChatMessages');
        msgs.innerHTML = '<div class="message system">🗑 Chat cleared. Ask me anything!</div>';
    }

    function addMessage(type, content) {
        const msgs = document.getElementById('aiChatMessages');
        const div = document.createElement('div');
        div.className = `message ${type}`;
        div.textContent = content;
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
        return div;
    }

    function addLoading() {
        const msgs = document.getElementById('aiChatMessages');
        const div = document.createElement('div');
        div.className = 'message ai';
        div.id = 'aiLoadingMsg';
        div.innerHTML = '<div class="loading-dots"><div></div><div></div><div></div></div>';
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
    }
    function removeLoading() {
        const el = document.getElementById('aiLoadingMsg');
        if (el) el.remove();
    }

    // ---------- Send message ----------
    async function sendMessage() {
        if (isSending) return;
        const input = document.getElementById('aiChatInput');
        const question = input.value.trim();
        if (!question) return;

        // Check API key
        const provider = document.getElementById('aiProvider').value;
        const apiKey = getKey(provider);
        if (!apiKey) {
            addMessage('error', `⚠ No API key for ${provider}. Click ⚙ to add your key (it's saved locally only).`);
            toggleConfig();
            return;
        }

        isSending = true;
        document.getElementById('aiSendBtn').disabled = true;
        input.value = '';
        input.style.height = 'auto';

        addMessage('user', question);
        addLoading();
        document.getElementById('aiStatusText').textContent = 'Thinking…';

        try {
            const context = window.getAIContext();
            const prompt = context
                ? `Context from current page: ${context.substring(0, 1500)}\n\nQuestion: ${question}\n\nProvide a helpful, educational answer focused on GATE CSE preparation.`
                : `Question: ${question}\n\nProvide a helpful, educational answer focused on GATE CSE preparation. Be clear and concise with examples where helpful.`;

            const response = await callProvider(provider, prompt, apiKey);
            removeLoading();
            addMessage('ai', response);
            document.getElementById('aiStatusText').textContent = 'Ready to help';
        } catch (err) {
            removeLoading();
            addMessage('error', `❌ ${err.message}`);
            document.getElementById('aiStatusText').textContent = 'Error — check API key';
        } finally {
            isSending = false;
            document.getElementById('aiSendBtn').disabled = false;
            input.focus();
        }
    }

    // ---------- Provider implementations ----------
    async function callProvider(provider, prompt, apiKey) {
        switch (provider) {
            case 'groq': return callGroq(prompt, apiKey);
            case 'huggingface': return callHuggingFace(prompt, apiKey);
            case 'cohere': return callCohere(prompt, apiKey);
            case 'together': return callTogether(prompt, apiKey);
            case 'openai': return callOpenAI(prompt, apiKey);
            default: throw new Error('Unknown provider: ' + provider);
        }
    }

    const SYSTEM_PROMPT = 'You are a helpful AI tutor specializing in GATE CSE (Graduate Aptitude Test in Computer Science) preparation. Provide clear, accurate, educational answers. Use examples, simple language, and structured explanations. Focus on helping students build conceptual understanding.';

    async function callGroq(prompt, apiKey) {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 1500,
                temperature: 0.6
            })
        });
        if (!res.ok) {
            const e = await res.json().catch(() => ({}));
            throw new Error(`Groq: ${e.error?.message || res.status}`);
        }
        const data = await res.json();
        return data.choices[0]?.message?.content || 'No response.';
    }

    async function callHuggingFace(prompt, apiKey) {
        const res = await fetch('https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: 'meta-llama/Llama-3.2-3B-Instruct',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 1000
            })
        });
        if (!res.ok) {
            const e = await res.json().catch(() => ({}));
            throw new Error(`HuggingFace: ${e.error || res.status}`);
        }
        const data = await res.json();
        return data.choices?.[0]?.message?.content || 'No response.';
    }

    async function callCohere(prompt, apiKey) {
        const res = await fetch('https://api.cohere.ai/v1/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                message: prompt,
                preamble: SYSTEM_PROMPT,
                max_tokens: 1000
            })
        });
        if (!res.ok) {
            const e = await res.json().catch(() => ({}));
            throw new Error(`Cohere: ${e.message || res.status}`);
        }
        const data = await res.json();
        return data.text || 'No response.';
    }

    async function callTogether(prompt, apiKey) {
        const res = await fetch('https://api.together.xyz/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 1000
            })
        });
        if (!res.ok) {
            const e = await res.json().catch(() => ({}));
            throw new Error(`Together: ${e.error?.message || res.status}`);
        }
        const data = await res.json();
        return data.choices?.[0]?.message?.content || 'No response.';
    }

    async function callOpenAI(prompt, apiKey) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 1500,
                temperature: 0.6
            })
        });
        if (!res.ok) {
            const e = await res.json().catch(() => ({}));
            throw new Error(`OpenAI: ${e.error?.message || res.status}`);
        }
        const data = await res.json();
        return data.choices[0]?.message?.content || 'No response.';
    }

    // ---------- Auto-inject on DOMContentLoaded ----------
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }

    // Expose minimal API
    window.SOH_AI = {
        open, close, toggle,
        setContext: window.setAIContext,
        addMessage: (type, text) => addMessage(type, text)
    };
})();
