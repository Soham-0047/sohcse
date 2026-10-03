/* ==========================================================================
   SOH CSE — Configuration File (v2 — User-Managed Keys)

   ┌──────────────────────────────────────────────────────────────┐
   │  SECURITY UPDATE (v2)                                         │
   │                                                               │
   │  No API keys are hardcoded in this file anymore.              │
   │                                                               │
   │  All API keys are now managed via the in-app Settings page:   │
   │  → Open settings.html (or click ⚙ in the AI chat panel)       │
   │  → Enter your keys — they're stored ONLY in localStorage      │
   │  → Keys never leave your browser                              │
   │                                                               │
   │  This file contains only the admin-service URL (a public      │
   │  endpoint — the service token is also user-managed now).      │
   └──────────────────────────────────────────────────────────────┘

   SETUP INSTRUCTIONS:
   
   1. Open settings.html in your browser (or click ⚙ in AI chat)
   2. Add at least ONE of:
      - Admin Service Token (recommended — gives access to all AI providers)
      - Gemini API key (free, 1500 req/day — https://aistudio.google.com/apikey)
      - Groq API key (free, fast — https://console.groq.com/keys)
      - OpenAI / Together / Cohere / HuggingFace keys (optional)
   3. Optionally add YouTube Data API v3 key for video search
      (https://console.cloud.google.com/ — enable YouTube Data API v3)
   
   All keys stored locally in your browser only. Never transmitted
   to any server except the provider you're calling.
   ========================================================================== */

const SOH_CONFIG = {
    // ═══════════════════════════════════════════════════════
    // ADMIN SERVICE — AI Model Routing (smart failover)
    // URL is public; the SERVICE_TOKEN is user-managed via Settings
    // ═══════════════════════════════════════════════════════
    ADMIN_SERVICE_URL: 'https://admin-w1i8.onrender.com',
    // Token is loaded from localStorage by admin-client.js

    // ═══════════════════════════════════════════════════════
    // All API keys below are loaded from localStorage at runtime
    // (set via settings.html). These empty defaults ensure no
    // keys are ever committed to source code.
    // ═══════════════════════════════════════════════════════
    ADMIN_SERVICE_TOKEN: '',
    YOUTUBE_API_KEY: '',
    GEMINI_API_KEY: '',
    GROQ_API_KEY: '',

    // Whether to allow users to enter their own keys via the UI
    ALLOW_USER_KEYS: true,
};

// ============ Runtime override: pull keys from localStorage ============
// This runs at load time and overlays user-saved keys on top of config
(function loadUserKeys() {
    if (typeof window === 'undefined') return;
    try {
        const USER_KEYS_KEY = 'sohcse_user_keys';
        const saved = JSON.parse(localStorage.getItem(USER_KEYS_KEY) || '{}');
        // Map stored keys to config (only if not already set in config.js)
        if (saved.admin_service_token && !SOH_CONFIG.ADMIN_SERVICE_TOKEN) {
            SOH_CONFIG.ADMIN_SERVICE_TOKEN = saved.admin_service_token;
        }
        if (saved.youtube_api_key && !SOH_CONFIG.YOUTUBE_API_KEY) {
            SOH_CONFIG.YOUTUBE_API_KEY = saved.youtube_api_key;
        }
        if (saved.gemini_api_key && !SOH_CONFIG.GEMINI_API_KEY) {
            SOH_CONFIG.GEMINI_API_KEY = saved.gemini_api_key;
        }
        if (saved.groq_api_key && !SOH_CONFIG.GROQ_API_KEY) {
            SOH_CONFIG.GROQ_API_KEY = saved.groq_api_key;
        }
        // Other providers (loaded by chatbot.js directly)
    } catch (e) {
        console.warn('Failed to load user keys:', e);
    }
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.SOH_CONFIG = SOH_CONFIG;
}
