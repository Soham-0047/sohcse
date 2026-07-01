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

    // ============ Navbar Hide/Show & Focus Mode ============
    function initNavToggle() {
        // Add navbar toggle button to topnav
        const topnav = document.querySelector('.topnav-inner');
        if (!topnav || document.getElementById('navbarToggle')) return;
        const btn = document.createElement('button');
        btn.id = 'navbarToggle';
        btn.className = 'navbar-toggle';
        btn.title = 'Hide navbar for more reading space (Ctrl+H)';
        btn.setAttribute('aria-label', 'Toggle navbar');
        btn.innerHTML = '👁';
        btn.onclick = toggleNavbar;
        const menuBtn = topnav.querySelector('.topnav-menu-btn');
        if (menuBtn) { topnav.insertBefore(btn, menuBtn); } else { topnav.appendChild(btn); }

        // Add restore button (floating, shown when navbar hidden)
        const restore = document.createElement('button');
        restore.className = 'navbar-restore';
        restore.id = 'navbarRestore';
        restore.innerHTML = '👁';
        restore.title = 'Show navbar';
        restore.onclick = showNavbar;
        document.body.appendChild(restore);

        // Add sidebar restore button (shown when sidebar collapsed via focus mode)
        const sbRestore = document.createElement('button');
        sbRestore.className = 'sidebar-restore';
        sbRestore.id = 'sidebarRestore';
        sbRestore.innerHTML = '▶';
        sbRestore.title = 'Show sidebar';
        sbRestore.onclick = showSidebar;
        document.body.appendChild(sbRestore);
    }

    function toggleNavbar() {
        const topnav = document.querySelector('.topnav');
        const restore = document.getElementById('navbarRestore');
        if (topnav.classList.contains('hidden')) {
            showNavbar();
        } else {
            topnav.classList.add('hidden');
            if (restore) restore.classList.add('visible');
        }
    }

    function showNavbar() {
        const topnav = document.querySelector('.topnav');
        const restore = document.getElementById('navbarRestore');
        topnav.classList.remove('hidden');
        if (restore) restore.classList.remove('visible');
        // Also exit focus mode if active
        document.body.classList.remove('focus-mode');
    }

    function toggleFocusMode() {
        if (document.body.classList.contains('focus-mode')) {
            document.body.classList.remove('focus-mode');
            const sb = document.getElementById('sidebar');
            if (sb) sb.classList.remove('collapsed');
            if (window.showToast) window.showToast('Focus mode off', 'info');
        } else {
            document.body.classList.add('focus-mode');
            if (window.showToast) window.showToast('🎯 Focus mode on — navbar & sidebar hidden. Press Ctrl+F to exit.', 'info', 4000);
        }
    }

    function showSidebar() {
        const sb = document.getElementById('sidebar');
        if (sb) sb.classList.remove('collapsed');
        document.body.classList.remove('focus-mode');
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

            // Ctrl+H or Cmd+H — Toggle navbar (hide/show for more reading space)
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                toggleNavbar();
                return;
            }

            // Ctrl+F or Cmd+F — Toggle focus mode (hide both navbar & sidebar)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
                e.preventDefault();
                toggleFocusMode();
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
        initNavToggle();
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
        showToast,
        toggleNavbar,
        toggleFocusMode,
        showNavbar,
        showSidebar
    };
})();

// ============ Global Search (Ctrl+/ or click search icon) ============
function initGlobalSearch() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'globalSearchOverlay';
    overlay.className = 'cmd-palette-overlay';
    overlay.innerHTML = `
        <div class="cmd-palette" style="max-width:650px;">
            <div class="cmd-input-wrap">
                <span style="font-size:1.2rem;">🔍</span>
                <input type="text" id="globalSearchInput" placeholder="Search across PYQs, formulas, notes, videos, topics..." autocomplete="off">
            </div>
            <div class="cmd-results" id="globalSearchResults" style="max-height:500px;">
                <div style="padding:20px;text-align:center;color:var(--text-muted);font-size:0.85rem;">
                    Type to search across all resources. Results will appear here.
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('open');
    });

    let searchTimeout;
    document.getElementById('globalSearchInput').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim().toLowerCase();
        if (query.length < 2) {
            document.getElementById('globalSearchResults').innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:0.85rem;">Type at least 2 characters...</div>';
            return;
        }
        searchTimeout = setTimeout(() => performGlobalSearch(query), 300);
    });

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            overlay.classList.add('open');
            setTimeout(() => document.getElementById('globalSearchInput').focus(), 50);
        }
        if (e.key === 'Escape' && overlay.classList.contains('open')) {
            overlay.classList.remove('open');
        }
    });
}

function performGlobalSearch(query) {
    const results = [];

    // Search PYQs if data is available
    if (typeof window.GATE_DATA !== 'undefined' && window.GATE_DATA) {
        let count = 0;
        for (const subj of window.GATE_DATA.subjects) {
            for (const chap of subj.chapters) {
                for (const q of chap.questions) {
                    if (count > 20) break;
                    const text = (q.question_text || '').toLowerCase();
                    if (text.includes(query)) {
                        results.push({
                            type: '📝 PYQ',
                            title: text.substring(0, 80) + '...',
                            desc: `${subj.subject_label} › ${chap.chapter_label} • ${q.year}`,
                            url: `./pyq.html?subject=${subj.subject}&chapter=${chap.chapter}`,
                            icon: '📝'
                        });
                        count++;
                    }
                }
                if (count > 20) break;
            }
            if (count > 20) break;
        }
    }

    // Search formulas if available
    if (typeof FORMULAS !== 'undefined') {
        FORMULAS.forEach(f => {
            if (f.title.toLowerCase().includes(query) || f.body.toLowerCase().includes(query)) {
                results.push({
                    type: '📐 Formula',
                    title: f.title,
                    desc: 'Formula reference',
                    url: './formulas.html',
                    icon: '📐'
                });
            }
        });
    }

    // Search flashcards if available
    if (typeof FLASHCARDS !== 'undefined') {
        FLASHCARDS.forEach(c => {
            if (c.front.toLowerCase().includes(query) || c.back.toLowerCase().includes(query)) {
                results.push({
                    type: '🎴 Flashcard',
                    title: c.front.replace(/<[^>]+>/g, '').substring(0, 80),
                    desc: 'Flashcard concept',
                    url: './flashcards.html',
                    icon: '🎴'
                });
            }
        });
    }

    // Search video catalog
    if (typeof VIDEO_CATALOG !== 'undefined') {
        Object.entries(VIDEO_CATALOG).forEach(([key, subj]) => {
            if (subj.label.toLowerCase().includes(query)) {
                results.push({
                    type: '🎥 Video',
                    title: `${subj.label} — Video Lectures`,
                    desc: `${subj.playlists.length} playlists available`,
                    url: `./videos.html?subject=${key}`,
                    icon: '🎥'
                });
            }
        });
    }

    // Search learn topics
    const learnTopics = [
        { title: 'Time Complexity & Asymptotic Notations', subject: 'algorithms' },
        { title: 'Sorting Algorithms Comparison', subject: 'algorithms' },
        { title: 'Dynamic Programming — Key Patterns', subject: 'algorithms' },
        { title: 'BST and AVL Trees', subject: 'data-structures' },
        { title: 'Hashing — Collision Resolution', subject: 'data-structures' },
        { title: 'CPU Scheduling Algorithms', subject: 'operating-systems' },
        { title: 'Deadlocks — Conditions & Banker\'s Algorithm', subject: 'operating-systems' },
        { title: 'Normalization — 1NF to BCNF', subject: 'database-management-system' },
        { title: 'Transactions & ACID Properties', subject: 'database-management-system' },
        { title: 'IP Addressing & Subnetting', subject: 'computer-networks' },
        { title: 'TCP Congestion Control', subject: 'computer-networks' },
        { title: 'Finite Automata & Regular Languages', subject: 'theory-of-computation' },
        { title: 'Number Systems & Conversions', subject: 'digital-logic' },
    ];
    learnTopics.forEach(t => {
        if (t.title.toLowerCase().includes(query)) {
            results.push({
                type: '📖 Learn',
                title: t.title,
                desc: 'Concept notes with examples',
                url: `./learn.html?subject=${t.subject}`,
                icon: '📖'
            });
        }
    });

    // Render results
    const container = document.getElementById('globalSearchResults');
    if (results.length === 0) {
        container.innerHTML = '<div style="padding:30px;text-align:center;color:var(--text-muted);"><div style="font-size:2rem;margin-bottom:8px;">🔍</div>No results found for "' + query + '"</div>';
        return;
    }
    container.innerHTML = results.slice(0, 20).map(r => `
        <a href="${r.url}" class="cmd-result" style="text-decoration:none;">
            <span class="cmd-icon">${r.icon}</span>
            <div class="cmd-text">
                <strong>${r.title}</strong>
                <small>${r.desc}</small>
            </div>
            <span class="cmd-shortcut">${r.type}</span>
        </a>
    `).join('');
}

// ============ Continue Where You Left Off ============
function initContinueStudying() {
    // Only on homepage
    if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') return;

    const lastStudied = localStorage.getItem('sohcse_last_studied');
    if (!lastStudied) return;

    try {
        const data = JSON.parse(lastStudied);
        if (!data.url || !data.title) return;

        // Find the hero section and add a "continue" banner
        const hero = document.querySelector('.hero');
        if (!hero || document.getElementById('continueBanner')) return;

        const banner = document.createElement('div');
        banner.id = 'continueBanner';
        banner.style.cssText = 'max-width:600px;margin:20px auto 0;padding:14px 20px;background:rgba(255,255,255,0.15);backdrop-filter:blur(14px);border-radius:16px;border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;gap:14px;cursor:pointer;transition:all 0.3s;animation:fadeInUp 0.8s var(--ease-out) 0.5s both;';
        banner.innerHTML = `
            <div style="font-size:1.5rem;">${data.icon || '📖'}</div>
            <div style="flex:1;text-align:left;color:white;">
                <div style="font-size:0.72rem;opacity:0.8;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Continue where you left off</div>
                <div style="font-size:0.95rem;font-weight:700;margin-top:2px;">${data.title}</div>
            </div>
            <div style="font-size:1.2rem;color:white;">→</div>
        `;
        banner.onclick = () => { window.location.href = data.url; };
        banner.onmouseenter = () => { banner.style.background = 'rgba(255,255,255,0.25)'; banner.style.transform = 'translateY(-2px)'; };
        banner.onmouseleave = () => { banner.style.background = 'rgba(255,255,255,0.15)'; banner.style.transform = 'translateY(0)'; };
        hero.appendChild(banner);
    } catch(e) {}
}

// Track what the user studies
window.trackStudyActivity = function(url, title, icon) {
    localStorage.setItem('sohcse_last_studied', JSON.stringify({ url, title, icon, timestamp: Date.now() }));
};

// ============ Keyboard Shortcut Help (press ?) ============
function initShortcutHelp() {
    const overlay = document.createElement('div');
    overlay.id = 'shortcutHelpOverlay';
    overlay.className = 'cmd-palette-overlay';
    overlay.innerHTML = `
        <div class="cmd-palette" style="max-width:550px;">
            <div class="cmd-input-wrap" style="justify-content:space-between;">
                <span style="font-size:1.1rem;font-weight:700;color:var(--text);">⌨️ Keyboard Shortcuts</span>
                <button onclick="document.getElementById('shortcutHelpOverlay').classList.remove('open')" style="background:none;border:none;font-size:1.2rem;cursor:pointer;color:var(--text-muted);">✕</button>
            </div>
            <div class="cmd-results" style="padding:16px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 20px;font-size:0.85rem;">
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-soft);"><span style="color:var(--text);">Command Palette</span><kbd style="background:var(--bg-light);padding:2px 8px;border-radius:4px;border:1px solid var(--border);font-family:monospace;font-size:0.78rem;">Ctrl+K</kbd></div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-soft);"><span style="color:var(--text);">Global Search</span><kbd style="background:var(--bg-light);padding:2px 8px;border-radius:4px;border:1px solid var(--border);font-family:monospace;font-size:0.78rem;">Ctrl+/</kbd></div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-soft);"><span style="color:var(--text);">Dark Mode</span><kbd style="background:var(--bg-light);padding:2px 8px;border-radius:4px;border:1px solid var(--border);font-family:monospace;font-size:0.78rem;">Ctrl+J</kbd></div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-soft);"><span style="color:var(--text);">Hide/Show Navbar</span><kbd style="background:var(--bg-light);padding:2px 8px;border-radius:4px;border:1px solid var(--border);font-family:monospace;font-size:0.78rem;">Ctrl+H</kbd></div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-soft);"><span style="color:var(--text);">Focus Mode</span><kbd style="background:var(--bg-light);padding:2px 8px;border-radius:4px;border:1px solid var(--border);font-family:monospace;font-size:0.78rem;">Ctrl+Shift+F</kbd></div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-soft);"><span style="color:var(--text);">Shortcut Help</span><kbd style="background:var(--bg-light);padding:2px 8px;border-radius:4px;border:1px solid var(--border);font-family:monospace;font-size:0.78rem;">?</kbd></div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-soft);"><span style="color:var(--text);">Focus Search Box</span><kbd style="background:var(--bg-light);padding:2px 8px;border-radius:4px;border:1px solid var(--border);font-family:monospace;font-size:0.78rem;">/</kbd></div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-soft);"><span style="color:var(--text);">Close Panels</span><kbd style="background:var(--bg-light);padding:2px 8px;border-radius:4px;border:1px solid var(--border);font-family:monospace;font-size:0.78rem;">Esc</kbd></div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-soft);"><span style="color:var(--text);">Go to Home</span><kbd style="background:var(--bg-light);padding:2px 8px;border-radius:4px;border:1px solid var(--border);font-family:monospace;font-size:0.78rem;">Alt+H</kbd></div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-soft);"><span style="color:var(--text);">Go to PYQs</span><kbd style="background:var(--bg-light);padding:2px 8px;border-radius:4px;border:1px solid var(--border);font-family:monospace;font-size:0.78rem;">Alt+P</kbd></div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-soft);"><span style="color:var(--text);">Go to Videos</span><kbd style="background:var(--bg-light);padding:2px 8px;border-radius:4px;border:1px solid var(--border);font-family:monospace;font-size:0.78rem;">Alt+V</kbd></div>
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-soft);"><span style="color:var(--text);">Ask AI</span><kbd style="background:var(--bg-light);padding:2px 8px;border-radius:4px;border:1px solid var(--border);font-family:monospace;font-size:0.78rem;">Alt+A</kbd></div>
                </div>
                <p style="text-align:center;margin-top:14px;font-size:0.78rem;color:var(--text-muted);">Press <kbd style="background:var(--bg-light);padding:2px 6px;border-radius:3px;border:1px solid var(--border);font-family:monospace;">?</kbd> anytime to see this help</p>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('open');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            e.preventDefault();
            overlay.classList.toggle('open');
        }
    });
}

// ============ Page Transition Animation ============
function initPageTransition() {
    const main = document.getElementById('mainContent') || document.querySelector('.app-content-scroll') || document.querySelector('.hero');
    if (main) {
        main.classList.add('page-transition');
    }
    // Also add to section cards
    document.querySelectorAll('.section-card').forEach(el => el.classList.add('page-transition'));
}

// ============ Track page visits for "Continue Studying" ============
function trackCurrentPage() {
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    // Don't track the homepage itself
    if (filename === 'index.html') return;

    const titles = {
        'learn.html': { title: 'Learning Concept Notes', icon: '📖' },
        'syllabus.html': { title: 'Viewing Syllabus', icon: '📋' },
        'materials.html': { title: 'Study Materials', icon: '📚' },
        'pyq.html': { title: 'Practicing PYQs', icon: '📝' },
        'videos.html': { title: 'Watching Video Lectures', icon: '🎥' },
        'flashcards.html': { title: 'Reviewing Flashcards', icon: '🎴' },
        'quiz.html': { title: 'Taking a Quiz', icon: '🎯' },
        'calculator.html': { title: 'Using Calculator', icon: '🧮' },
        'formulas.html': { title: 'Browsing Formulas', icon: '📐' },
        'timer.html': { title: 'Study Timer', icon: '⏱' },
        'notes.html': { title: 'Personal Notes', icon: '📓' },
        'planner.html': { title: 'Study Planner', icon: '📅' },
        'progress.html': { title: 'Progress Dashboard', icon: '📊' },
        'resources.html': { title: 'GATE Resources', icon: '🚀' },
    };

    const info = titles[filename];
    if (info) {
        window.trackStudyActivity(window.location.href, info.title, info.icon);
    }
}

// ============ Add to init ============
const _originalInit = window.SOH_THEME ? null : null;

// Patch into existing init — these run after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            initGlobalSearch();
            initShortcutHelp();
            initContinueStudying();
            initPageTransition();
            trackCurrentPage();
        }, 200);
    });
} else {
    setTimeout(() => {
        initGlobalSearch();
        initShortcutHelp();
        initContinueStudying();
        initPageTransition();
        trackCurrentPage();
    }, 200);
}

// ============ Ripple Effect on Buttons ============
function initRippleEffect() {
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.btn, .filter-chip, .quiz-type-chip, .mode-btn, .tab-btn, .topnav-link, .mobile-bottom-nav-item');
        if (!target) return;
        
        const rect = target.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        target.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
}

// ============ Onboarding Tour ============
function initOnboarding() {
    if (localStorage.getItem('sohcse_onboarded')) return;
    
    const steps = [
        {
            icon: '👋',
            title: 'Welcome to SOH CSE!',
            desc: 'Your complete GATE CSE preparation platform. Everything you need — study materials, PYQs, videos, AI tutor — all in one place.',
            features: [
                ['📖', '13 Concept Notes'],
                ['📝', '2,736 PYQs with Solutions'],
                ['🎥', 'In-app Video Player'],
                ['🤖', 'AI Tutor (5 modes)'],
            ]
        },
        {
            icon: '⌨️',
            title: 'Powerful Keyboard Shortcuts',
            desc: 'Navigate instantly without touching your mouse. Press ? anytime to see all shortcuts.',
            features: [
                ['Ctrl+K', 'Command Palette'],
                ['Ctrl+/', 'Global Search'],
                ['Ctrl+J', 'Dark Mode'],
                ['Ctrl+H', 'Hide Navbar'],
            ]
        },
        {
            icon: '🎨',
            title: 'Premium Features',
            desc: 'Dark mode, focus mode, progress tracking, flashcards, quizzes, formula book, GATE calculator, and more — all free, all in-app.',
            features: [
                ['🌙', 'Dark Mode'],
                ['🎯', 'Focus Mode'],
                ['📊', 'Progress Dashboard'],
                ['🎴', 'Spaced Repetition'],
            ]
        },
    ];

    let currentStep = 0;
    
    const overlay = document.createElement('div');
    overlay.className = 'onboarding-overlay';
    overlay.id = 'onboardingOverlay';
    document.body.appendChild(overlay);

    function renderStep() {
        const step = steps[currentStep];
        const dots = steps.map((_, i) => `<div class="onboarding-dot ${i === currentStep ? 'active' : ''}"></div>`).join('');
        
        overlay.innerHTML = `
            <div class="onboarding-card">
                <div class="ob-icon">${step.icon}</div>
                <div class="onboarding-dots">${dots}</div>
                <h2>${step.title}</h2>
                <p>${step.desc}</p>
                <div class="ob-features">
                    ${step.features.map(f => `<div class="ob-feature"><span>${f[0]}</span><span>${f[1]}</span></div>`).join('')}
                </div>
                <div class="ob-actions">
                    ${currentStep > 0 ? '<button class="btn btn-ghost btn-sm" onclick="window._obPrev()">← Back</button>' : ''}
                    ${currentStep < steps.length - 1 
                        ? `<button class="btn btn-primary btn-sm" onclick="window._obNext()">Next →</button>` 
                        : `<button class="btn btn-primary btn-sm" onclick="window._obFinish()">🚀 Get Started</button>`}
                    <button class="btn btn-ghost btn-sm" onclick="window._obSkip()">Skip</button>
                </div>
            </div>
        `;
    }

    window._obNext = () => { if (currentStep < steps.length - 1) { currentStep++; renderStep(); } };
    window._obPrev = () => { if (currentStep > 0) { currentStep--; renderStep(); } };
    window._obSkip = () => { overlay.classList.remove('open'); localStorage.setItem('sohcse_onboarded', '1'); };
    window._obFinish = () => { 
        overlay.classList.remove('open'); 
        localStorage.setItem('sohcse_onboarded', '1');
        if (window.showToast) window.showToast('🎉 Welcome aboard! Press ? for shortcuts.', 'success', 4000);
    };

    // Show after 1.5s delay
    setTimeout(() => {
        overlay.classList.add('open');
        renderStep();
    }, 1500);
}

// ============ Quick Access FAB ============
function initQuickFAB() {
    const fab = document.createElement('button');
    fab.className = 'quick-fab';
    fab.title = 'Quick actions (Alt+A for AI, Ctrl+K for commands)';
    fab.innerHTML = '⚡';
    fab.onclick = () => {
        if (window.openCommandPalette) window.openCommandPalette();
    };
    document.body.appendChild(fab);

    let lastScroll = 0;
    const scrollContainer = document.getElementById('contentArea') || window;
    scrollContainer.addEventListener('scroll', () => {
        const scrollTop = scrollContainer.scrollTop || window.scrollY;
        if (scrollTop > 200 && scrollTop < lastScroll) {
            fab.classList.add('visible');
        } else if (scrollTop > 600) {
            fab.classList.add('visible');
        } else {
            fab.classList.remove('visible');
        }
        lastScroll = scrollTop;
    });
}

// ============ Initialize new features ============
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            initRippleEffect();
            initOnboarding();
            initQuickFAB();
        }, 300);
    });
} else {
    setTimeout(() => {
        initRippleEffect();
        initOnboarding();
        initQuickFAB();
    }, 300);
}
