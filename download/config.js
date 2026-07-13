/* ==========================================================================
   SOH CSE — Configuration File
   
   INTEGRATION: Admin Service for AI + YouTube Data API
   
   ┌──────────────────────────────────────────────────────┐
   │  HOW IT WORKS NOW                                     │
   │                                                       │
   │  AI Tutor:  Uses admin-service for smart routing      │
   │             with automatic failover across all        │
   │             configured providers (Gemini, Groq,       │
   │             Cerebras, OpenRouter, etc.)               │
   │                                                       │
   │  YouTube:   Uses YouTube Data API v3 for in-app       │
   │             video search (real results with thumbs)   │
   │                                                       │
   │  No individual AI keys needed — admin-service         │
   │  handles everything from one dashboard.               │
   └──────────────────────────────────────────────────────┘
   
   SETUP INSTRUCTIONS:
   
   1. ADMIN SERVICE (AI Tutor):
      - Backend: https://admin-w1i8.onrender.com
      - Dashboard: https://notonadmin.vercel.app/
      - Get the SERVICE_TOKEN from whoever runs the dashboard
      - Paste it below in ADMIN_SERVICE_TOKEN
      
   2. YOUTUBE DATA API v3 (Video Search):
      - Go to https://console.cloud.google.com/
      - Enable "YouTube Data API v3"
      - Create API Key, restrict to your domain
      - Paste it below in YOUTUBE_API_KEY
   ========================================================================== */

const SOH_CONFIG = {
    // ═══════════════════════════════════════════════════════
    // ADMIN SERVICE — AI Model Routing (replaces individual AI keys)
    // ═══════════════════════════════════════════════════════
    // Backend URL (don't change unless you self-host)
    ADMIN_SERVICE_URL: 'https://admin-w1i8.onrender.com',
    
    // Service token — get this from the admin dashboard owner
    // This is a shared secret that lets the app ask for AI models
    ADMIN_SERVICE_TOKEN: '',  // ← Paste your SERVICE_TOKEN here
    
    // ═══════════════════════════════════════════════════════
    // YOUTUBE DATA API v3 — For in-app video search
    // ═══════════════════════════════════════════════════════
    // Get key: https://console.cloud.google.com/ (enable YouTube Data API v3)
    // Free: 10,000 units/day (~99 searches/day)
    // IMPORTANT: Restrict this key to your domain in Google Cloud Console!
    YOUTUBE_API_KEY: '',  // ← Paste your YouTube API key here
    
    // ═══════════════════════════════════════════════════════
    // FALLBACK — Direct AI keys (used if admin-service is down)
    // ═══════════════════════════════════════════════════════
    // These are optional — only needed if admin-service is unavailable
    GEMINI_API_KEY: '',   // Optional fallback: https://aistudio.google.com/app/apikey
    GROQ_API_KEY: '',     // Optional fallback: https://console.groq.com/keys
    
    // Whether to allow users to enter their own keys via the UI
    ALLOW_USER_KEYS: true,
};

// Make available globally
if (typeof window !== 'undefined') {
    window.SOH_CONFIG = SOH_CONFIG;
}
