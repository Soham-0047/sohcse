/* ==========================================================================
   SOH CSE — Theme & Interactive Features
   - Dark mode toggle (persisted in localStorage)
   - Scroll reveal animations (Intersection Observer)
   - Keyboard shortcuts (Ctrl+K command palette, / for search, Esc to close)
   - Command palette (quick navigation)
   - Toast notifications
   - Back to top button
   - Reading progress bar
   ========================================================================== */

(function () {
    'use strict';

    const THEME_KEY = 'sohcse_theme';

    // ============ Dark Mode ============
    function initTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = saved || (prefersDark ? 'dark' : 'light');
        applyTheme(theme);
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
        // Update meta theme-color
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.content = theme === 'dark' ? '#0f172a' : '#667eea';
        }
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        showToast(next === 'dark' ? '🌙 Dark mode on' : '☀️ Light mode on', 'info');
    }

    function injectThemeToggle() {
        // Find topnav and add a toggle button before the menu button or links
        const topnav = document.querySelector('.topnav-inner');
        if (!topnav || document.getElementById('themeToggle')) return;
        const btn = document.createElement('button');
        btn.id = 'themeToggle';
        btn.className = 'theme-toggle';
        btn.title = 'Toggle dark mode (Ctrl+J)';
        btn.setAttribute('aria-label', 'Toggle dark mode');
        btn.innerHTML = '<span class="moon-icon">🌙</span><span class="sun-icon">☀️</span>';
        btn.onclick = toggleTheme;
        // Insert before menu button or at the end
        const menuBtn = topnav.querySelector('.topnav-menu-btn');
        if (menuBtn) {
            topnav.insertBefore(btn, menuBtn);
        } else {
            topnav.appendChild(btn);
        }
    }

    // ============ Scroll Reveal ============
    function initScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        // Add reveal class to common elements
        const selectors = [
            '.section-card',
            '.feature-card',
            '.subject-card',
            '.stat-card',
            '.resource-card',
            '.chapter-card',
            '.playlist-card',
            '.metric-card',
            '.question-card',
            '.timeline-card',
            '.book-item'
        ];
        document.querySelectorAll(selectors.join(',')).forEach((el, i) => {
            el.classList.add('reveal');
            if (i % 3 === 1) el.classList.add('reveal-delay-1');
            if (i % 3 === 2) el.classList.add('reveal-delay-2');
            observer.observe(el);
        });
    }

    // ============ Back to Top ============
    function initBackToTop() {
        const btn = document.createElement('button');
        btn.className = 'back-to-top';
        btn.innerHTML = '↑';
        btn.title = 'Back to top';
        btn.setAttribute('aria-label', 'Back to top');
        btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
        document.body.appendChild(btn);

        const scrollContainer = document.getElementById('contentArea');
        const target = scrollContainer || window;

        target.addEventListener('scroll', () => {
            const scrollTop = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
            if (scrollTop > 400) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        });
    }

    // ============ Reading Progress Bar ============
    function initReadingProgress() {
        const bar = document.createElement('div');
        bar.className = 'reading-progress';
        bar.style.width = '0%';
        document.body.appendChild(bar);

        const scrollContainer = document.getElementById('contentArea');
        const target = scrollContainer || window;

        target.addEventListener('scroll', () => {
            const scrollTop = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
            const scrollHeight = scrollContainer
                ? scrollContainer.scrollHeight - scrollContainer.clientHeight
                : document.documentElement.scrollHeight - window.innerHeight;
            const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            bar.style.width = pct + '%';
        });
    }

    // ============ Toast Notifications ============
    function injectToastContainer() {
        if (document.getElementById('toastContainer')) return;
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    window.showToast = function (message, type = 'info', duration = 3000) {
        injectToastContainer();
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    };

    // ============ Command Palette ============
    const COMMANDS = [
        { icon: '🏠', title: 'Home', desc: 'Go to landing page', url: './index.html', shortcut: 'Alt+H' },
        { icon: '📖', title: 'Learn', desc: 'Concept notes & study material', url: './learn.html', shortcut: 'Alt+L' },
        { icon: '📋', title: 'Syllabus', desc: 'Complete GATE CSE syllabus', url: './syllabus.html', shortcut: 'Alt+S' },
        { icon: '📝', title: 'PYQs', desc: 'Previous year questions', url: './pyq.html', shortcut: 'Alt+P' },
        { icon: '🎥', title: 'Videos', desc: 'Video lectures', url: './videos.html', shortcut: 'Alt+V' },
        { icon: '🎴', title: 'Flashcards', desc: 'Spaced repetition cards', url: './flashcards.html', shortcut: 'Alt+F' },
        { icon: '🎯', title: 'Quiz', desc: 'Take a practice quiz', url: './quiz.html', shortcut: 'Alt+Q' },
        { icon: '📊', title: 'Progress', desc: 'View your progress dashboard', url: './progress.html', shortcut: 'Alt+R' },
        { icon: '📅', title: 'Planner', desc: 'Study planner & calendar', url: './planner.html', shortcut: 'Alt+D' },
        { icon: '🚀', title: 'Resources', desc: 'All GATE prep resources', url: './resources.html', shortcut: 'Alt+E' },
        { icon: '📚', title: 'Materials', desc: 'Study PDFs & textbooks', url: './materials.html', shortcut: 'Alt+M' },
        { icon: '🤖', title: 'Ask AI', desc: 'Open AI chatbot', action: () => window.SOH_AI && window.SOH_AI.open(), shortcut: 'Alt+A' },
        { icon: '🌙', title: 'Toggle Dark Mode', desc: 'Switch between light and dark', action: toggleTheme, shortcut: 'Ctrl+J' },
    ];

    function initCommandPalette() {
        const overlay = document.createElement('div');
        overlay.className = 'cmd-palette-overlay';
        overlay.innerHTML = `
            <div class="cmd-palette">
                <div class="cmd-input-wrap">
                    <span style="font-size:1.2rem;">🔍</span>
                    <input type="text" id="cmdInput" placeholder="Search commands or type a page name..." autocomplete="off">
                </div>
                <div class="cmd-results" id="cmdResults"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        let selectedIndex = 0;

        function renderResults(query) {
            const results = COMMANDS.filter(c =>
                c.title.toLowerCase().includes(query.toLowerCase()) ||
                c.desc.toLowerCase().includes(query.toLowerCase())
            );
            const container = document.getElementById('cmdResults');
            if (results.length === 0) {
                container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);">No commands found</div>';
                return;
            }
            container.innerHTML = results.map((cmd, i) => `
                <div class="cmd-result ${i === selectedIndex ? 'selected' : ''}" data-idx="${i}">
                    <span class="cmd-icon">${cmd.icon}</span>
                    <div class="cmd-text">
                        <strong>${cmd.title}</strong>
                        <small>${cmd.desc}</small>
                    </div>
                    ${cmd.shortcut ? `<span class="cmd-shortcut">${cmd.shortcut}</span>` : ''}
                </div>
            `).join('');
            container.querySelectorAll('.cmd-result').forEach((el, i) => {
                el.onclick = () => executeCommand(results[i]);
                el.onmouseenter = () => { selectedIndex = i; updateSelection(); };
            });
        }

        function updateSelection() {
            document.querySelectorAll('.cmd-result').forEach((el, i) => {
                el.classList.toggle('selected', i === selectedIndex);
            });
        }

        function executeCommand(cmd) {
            closePalette();
            if (cmd.action) {
                cmd.action();
            } else if (cmd.url) {
                window.location.href = cmd.url;
            }
        }

        function openPalette() {
            overlay.classList.add('open');
            const input = document.getElementById('cmdInput');
            input.value = '';
            selectedIndex = 0;
            renderResults('');
            setTimeout(() => input.focus(), 50);
        }

        function closePalette() {
            overlay.classList.remove('open');
        }

        overlay.onclick = (e) => { if (e.target === overlay) closePalette(); };

        document.getElementById('cmdInput').addEventListener('input', (e) => {
            selectedIndex = 0;
            renderResults(e.target.value);
        });

        document.getElementById('cmdInput').addEventListener('keydown', (e) => {
            const results = COMMANDS.filter(c =>
                c.title.toLowerCase().includes(e.target.value.toLowerCase()) ||
                c.desc.toLowerCase().includes(e.target.value.toLowerCase())
            );
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
                updateSelection();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, 0);
                updateSelection();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (results[selectedIndex]) executeCommand(results[selectedIndex]);
            } else if (e.key === 'Escape') {
                closePalette();
            }
        });

        window.openCommandPalette = openPalette;
        window.closeCommandPalette = closePalette;
    }

    // ============ Keyboard Shortcuts ============
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+K or Cmd+K — Command palette
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (document.querySelector('.cmd-palette-overlay.open')) {
                    window.closeCommandPalette();
                } else {
                    window.openCommandPalette();
                }
                return;
            }

            // Ctrl+J or Cmd+J — Toggle dark mode
            if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
                e.preventDefault();
                toggleTheme();
                return;
            }

            // Alt+key shortcuts for navigation
            if (e.altKey && !e.ctrlKey && !e.metaKey) {
                const keyMap = {
                    'h': './index.html',
                    'l': './learn.html',
                    's': './syllabus.html',
                    'p': './pyq.html',
                    'v': './videos.html',
                    'f': './flashcards.html',
                    'q': './quiz.html',
                    'r': './progress.html',
                    'd': './planner.html',
                    'e': './resources.html',
                    'm': './materials.html'
                };
                const key = e.key.toLowerCase();
                if (keyMap[key]) {
                    e.preventDefault();
                    window.location.href = keyMap[key];
                    return;
                }
                if (key === 'a') {
                    e.preventDefault();
                    if (window.SOH_AI) window.SOH_AI.open();
                    return;
                }
            }

            // / key — Focus search box (if exists and not in input)
            if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                const search = document.getElementById('searchBox') || document.querySelector('.search-box');
                if (search) {
                    e.preventDefault();
                    search.focus();
                }
            }

            // Escape — Close open panels
            if (e.key === 'Escape') {
                if (document.querySelector('.cmd-palette-overlay.open')) {
                    window.closeCommandPalette();
                }
            }
        });
    }

    // ============ Init All ============
    function init() {
        initTheme();
        injectThemeToggle();
        initCommandPalette();
        initKeyboardShortcuts();
        injectToastContainer();

        // Delay scroll-dependent features to ensure DOM is ready
        setTimeout(() => {
            initScrollReveal();
            initBackToTop();
            initReadingProgress();
        }, 100);

        // Welcome toast on first visit
        if (!sessionStorage.getItem('sohcse_welcomed')) {
            setTimeout(() => {
                showToast('💡 Press Ctrl+K for quick navigation', 'info', 4000);
                sessionStorage.setItem('sohcse_welcomed', '1');
            }, 1500);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose API
    window.SOH_THEME = {
        toggle: toggleTheme,
        setTheme: applyTheme,
        getTheme: () => document.documentElement.getAttribute('data-theme') || 'light',
        showToast
    };
})();
