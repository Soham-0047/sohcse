/* ==========================================================================
   SOH CSE — Performance Loader & Optimizer
   - Lazy-loads gate_cse_data.js only when needed (not on every page)
   - Defers KaTeX rendering with requestIdleCallback
   - Preloads likely-next pages during idle time
   - Provides skeleton loaders for perceived speed
   - Caches rendered content to avoid re-renders
   ========================================================================== */

(function () {
    'use strict';

    // ============ Lazy-load gate_cse_data.js ============
    // Instead of loading 7.3MB on page load, load it on demand
    let _gateDataPromise = null;

    window.loadGateData = function () {
        if (_gateDataPromise) return _gateDataPromise;
        if (typeof window.GATE_DATA !== 'undefined') {
            _gateDataPromise = Promise.resolve(window.GATE_DATA);
            return _gateDataPromise;
        }
        _gateDataPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = './gate_cse_data.js';
            script.onload = () => resolve(window.GATE_DATA);
            script.onerror = () => reject(new Error('Failed to load PYQ data'));
            document.head.appendChild(script);
        });
        return _gateDataPromise;
    };

    // ============ Prefetch likely-next pages ============
    function prefetchPages() {
        // Use requestIdleCallback to prefetch during idle time
        const prefetch = (url) => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            link.as = 'document';
            document.head.appendChild(link);
        };

        const currentPath = window.location.pathname;
        const filename = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';

        // Define likely-next pages based on current page
        const nextPages = {
            'index.html': ['learn.html', 'pyq.html'],
            'learn.html': ['pyq.html', 'formulas.html'],
            'syllabus.html': ['pyq.html', 'learn.html'],
            'materials.html': ['pyq.html', 'videos.html'],
            'pyq.html': ['flashcards.html', 'quiz.html'],
            'videos.html': ['pyq.html', 'notes.html'],
            'flashcards.html': ['quiz.html', 'pyq.html'],
            'quiz.html': ['progress.html', 'pyq.html'],
            'progress.html': ['planner.html', 'pyq.html'],
            'planner.html': ['timer.html', 'progress.html'],
            'calculator.html': ['formulas.html', 'pyq.html'],
            'formulas.html': ['calculator.html', 'learn.html'],
            'timer.html': ['notes.html', 'progress.html'],
            'notes.html': ['planner.html', 'learn.html'],
            'resources.html': ['materials.html', 'pyq.html'],
        };

        const toPrefetch = nextPages[filename] || ['index.html'];
        
        // Use requestIdleCallback if available, otherwise setTimeout
        const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 2000));
        schedule(() => {
            toPrefetch.forEach(page => prefetch('./' + page));
        });
    }

    // ============ Optimized KaTeX rendering with requestIdleCallback ============
    window.renderMathOptimized = function (elements, options) {
        const defaults = {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false },
                { left: '\\(', right: '\\)', display: false },
                { left: '\\[', right: '\\]', display: true },
            ],
            throwOnError: false,
            ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
        };
        const opts = { ...defaults, ...options };

        if (typeof renderMathInElement !== 'function') {
            // KaTeX not loaded yet — retry
            setTimeout(() => window.renderMathOptimized(elements, opts), 100);
            return;
        }

        // Use requestIdleCallback for non-critical rendering
        const schedule = window.requestIdleCallback || ((cb) => requestAnimationFrame(cb));
        
        if (!elements || !elements.length) return;
        
        // Convert NodeList to array
        const els = Array.from(elements);
        let idx = 0;

        function renderBatch(deadline) {
            // Render in batches of 5 elements per frame for smooth UX
            const batchSize = 5;
            const end = Math.min(idx + batchSize, els.length);

            for (; idx < end; idx++) {
                try {
                    renderMathInElement(els[idx], opts);
                } catch (e) { /* skip errors */ }
            }

            if (idx < els.length) {
                schedule(renderBatch);
            }
        }

        schedule(renderBatch);
    };

    // ============ Skeleton loader helper ============
    window.showSkeleton = function (container, count = 3, type = 'card') {
        if (!container) return;
        const skeletons = [];
        for (let i = 0; i < count; i++) {
            if (type === 'card') {
                skeletons.push(`
                    <div class="skeleton-card">
                        <div class="skeleton-line w-50 h-20"></div>
                        <div class="skeleton-line w-100"></div>
                        <div class="skeleton-line w-75"></div>
                        <div class="skeleton-line w-100"></div>
                        <div class="skeleton-line w-50"></div>
                    </div>
                `);
            } else if (type === 'list') {
                skeletons.push(`
                    <div class="skeleton-card" style="padding:14px;">
                        <div class="skeleton-line w-75"></div>
                        <div class="skeleton-line w-50"></div>
                    </div>
                `);
            }
        }
        container.innerHTML = skeletons.join('');
    };

    // ============ Debounced search ============
    window.debounce = function (fn, delay = 250) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    };

    // ============ Init ============
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', prefetchPages);
    } else {
        prefetchPages();
    }
})();
