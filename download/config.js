/* ==========================================================================
   SOH CSE — Configuration File
   ==========================================================================
   
   This file contains built-in API keys so the app works out-of-the-box
   without users needing to enter their own keys.
   
   🔒 SECURITY NOTE: Since this is a static site (no backend), these keys
   are visible in the browser. For production, you should:
   1. Restrict your API keys in Google Cloud Console (HTTP referrer restrictions)
   2. Set quota limits to prevent abuse
   3. Consider using a proxy/backend for production use
   
   To set up:
   1. Get a YouTube Data API v3 key: https://console.cloud.google.com/
      - Enable "YouTube Data API v3"
      - Create API key
      - Restrict to your domain (e.g. soham-0047.github.io)
   
   2. Get a Google AI (Gemini) key: https://aistudio.google.com/app/apikey
      - Create API key
      - Restrict to your domain
   
   3. Paste keys below
   ========================================================================== */

const SOH_CONFIG = {
    // YouTube Data API v3 — for in-app video search
    // Get key: https://console.cloud.google.com/ (enable YouTube Data API v3)
    // Free: 10,000 units/day (~99 searches/day)
    YOUTUBE_API_KEY: '',  // ← Paste your YouTube API key here (e.g. 'AIza...')
    
    // Google AI (Gemini) — for AI Tutor
    // Get key: https://aistudio.google.com/app/apikey
    // Free: 1,500 requests/day
    GEMINI_API_KEY: '',  // ← Paste your Gemini API key here
    
    // Groq — fastest free LLM (optional, backup for AI)
    // Get key: https://console.groq.com/keys
    // Free: ~30 RPM, 1,000 req/day
    GROQ_API_KEY: '',  // ← Paste your Groq API key here (optional)
    
    // Default AI provider to use ('gemini' or 'groq')
    DEFAULT_AI_PROVIDER: 'gemini',
    
    // Whether to allow users to override with their own keys
    ALLOW_USER_KEYS: true,
};

// Make available globally
if (typeof window !== 'undefined') {
    window.SOH_CONFIG = SOH_CONFIG;
}
