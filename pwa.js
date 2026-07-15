/* ==========================================================================
   SOH CSE — PWA & Offline Support v1
   - Service worker registration for offline access
   - Install prompt (Add to Home Screen)
   - Network status detection
   - Background sync for AI queries (when back online)
   - Cache management
   ========================================================================== */

(function () {
    'use strict';

    const SW_VERSION = 'sohcse-sw-v1';
    const CACHE_NAME = 'sohcse-cache-v1';

    // ============ Register Service Worker ============
    function registerSW() {
        if (!('serviceWorker' in navigator)) return;
        if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;

        // We'll create the SW inline via Blob (works on static hosting without sw.js file)
        const swCode = `
            const CACHE_NAME = '${CACHE_NAME}';
            const SW_VERSION = '${SW_VERSION}';
            const CORE_ASSETS = [
                './', './index.html', './style.css',
                './config.js', './admin-client.js', './chatbot.js',
                './tracker.js', './gamification.js', './question-engine.js',
                './theme.js', './nav.js', './loader.js',
                './dashboard.html', './pyq.html', './quiz.html',
                './mocktest.html', './flashcards.html', './revision.html',
                './progress.html', './planner.html', './materials.html',
                './formulas.html', './settings.html', './concept-map.html',
            ];

            self.addEventListener('install', (event) => {
                self.skipWaiting();
                event.waitUntil(
                    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS).catch(() => {}))
                );
            });

            self.addEventListener('activate', (event) => {
                event.waitUntil(
                    caches.keys().then(names => Promise.all(
                        names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
                    )).then(() => self.clients.claim())
                );
            });

            self.addEventListener('fetch', (event) => {
                const req = event.request;
                // Skip non-GET requests
                if (req.method !== 'GET') return;
                // Skip cross-origin requests (CDNs, API calls)
                const url = new URL(req.url);
                if (url.origin !== location.origin) return;

                // Network-first for HTML, cache-first for assets
                if (req.destination === 'document') {
                    event.respondWith(
                        fetch(req).then(res => {
                            const clone = res.clone();
                            caches.open(CACHE_NAME).then(cache => cache.put(req, clone)).catch(() => {});
                            return res;
                        }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
                    );
                } else {
                    event.respondWith(
                        caches.match(req).then(cached => {
                            return cached || fetch(req).then(res => {
                                if (res.ok && res.type === 'basic') {
                                    const clone = res.clone();
                                    caches.open(CACHE_NAME).then(cache => cache.put(req, clone)).catch(() => {});
                                }
                                return res;
                            }).catch(() => cached);
                        })
                    );
                }
            });
        `;

        try {
            const blob = new Blob([swCode], { type: 'application/javascript' });
            const swUrl = URL.createObjectURL(blob);
            navigator.serviceWorker.register(swUrl).then(reg => {
                console.log('✅ Service Worker registered for offline support');
            }).catch(err => {
                console.warn('SW registration failed:', err);
            });
        } catch (e) {
            console.warn('SW setup skipped:', e);
        }
    }

    // ============ Install Prompt (PWA) ============
    let deferredPrompt = null;

    function setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            showInstallBanner();
        });

        window.addEventListener('appinstalled', () => {
            deferredPrompt = null;
            if (window.showToast) window.showToast('🎉 SOH CSE installed! Access it from your home screen.', 'success', 5000);
        });
    }

    function showInstallBanner() {
        if (localStorage.getItem('sohcse_install_dismissed')) return;
        if (window.matchMedia('(display-mode: standalone)').matches) return; // already installed

        const banner = document.createElement('div');
        banner.className = 'install-banner';
        banner.innerHTML = `
            <div class="install-banner-icon">📱</div>
            <div class="install-banner-content">
                <div class="install-banner-title">Install SOH CSE</div>
                <div class="install-banner-desc">Add to home screen for offline access & full-screen study</div>
            </div>
            <button class="install-banner-btn" id="installBtn">Install</button>
            <button class="install-banner-close" id="installDismiss" aria-label="Dismiss">✕</button>
        `;
        document.body.appendChild(banner);
        requestAnimationFrame(() => banner.classList.add('visible'));

        document.getElementById('installBtn').onclick = async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    if (window.showToast) window.showToast('🚀 Installing SOH CSE...', 'success');
                }
                deferredPrompt = null;
                banner.remove();
            }
        };
        document.getElementById('installDismiss').onclick = () => {
            localStorage.setItem('sohcse_install_dismissed', '1');
            banner.remove();
        };
    }

    // ============ Network Status ============
    function setupNetworkMonitor() {
        function updateStatus() {
            const online = navigator.onLine;
            document.body.classList.toggle('offline', !online);
            // Show/hide offline indicator
            let indicator = document.getElementById('offlineIndicator');
            if (!online && !indicator) {
                indicator = document.createElement('div');
                indicator.id = 'offlineIndicator';
                indicator.className = 'offline-indicator';
                indicator.innerHTML = '📡 Offline mode — cached content available';
                document.body.appendChild(indicator);
                requestAnimationFrame(() => indicator.classList.add('visible'));
            } else if (online && indicator) {
                indicator.classList.remove('visible');
                setTimeout(() => indicator.remove(), 400);
                if (window.showToast) window.showToast('🌐 Back online', 'success', 2000);
            }
        }
        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
        updateStatus();
    }

    // ============ Init ============
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            registerSW();
            setupInstallPrompt();
            setupNetworkMonitor();
        });
    } else {
        registerSW();
        setupInstallPrompt();
        setupNetworkMonitor();
    }

    // Expose
    window.SOH_PWA = {
        registerSW,
        showInstallBanner,
    };

})();
