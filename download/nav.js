/* ==========================================================================
   SOH CSE — Shared Navigation Component
   - Generates grouped dropdown topnav on all pages
   - Generates mobile bottom navigation
   - Highlights active page
   - Provides in-app browser for external links
   ========================================================================== */

(function () {
    'use strict';

    // ============ Page definitions ============
    const PAGES = {
        'index.html':         { label: '🏠 Home',        group: 'main' },
        'learn.html':         { label: '📖 Learn',       group: 'study' },
        'syllabus.html':      { label: '📋 Syllabus',    group: 'study' },
        'materials.html':     { label: '📚 Materials',   group: 'study' },
        'formulas.html':      { label: '📐 Formulas',    group: 'study' },
        'pyq.html':           { label: '📝 PYQs',        group: 'practice' },
        'quiz.html':          { label: '🎯 Quiz',        group: 'practice' },
        'flashcards.html':    { label: '🎴 Flashcards',  group: 'practice' },
        'videos.html':        { label: '🎥 Videos',      group: 'practice' },
        'calculator.html':    { label: '🧮 Calculator',  group: 'tools' },
        'timer.html':         { label: '⏱ Timer',       group: 'tools' },
        'notes.html':         { label: '📓 Notes',       group: 'tools' },
        'planner.html':       { label: '📅 Planner',     group: 'tools' },
        'progress.html':      { label: '📊 Progress',    group: 'track' },
        'resources.html':     { label: '🚀 Resources',   group: 'track' },
    };

    const GROUPS = {
        'main':     { label: '🏠 Home',         pages: ['index.html'] },
        'study':    { label: '📖 Study',        pages: ['learn.html', 'syllabus.html', 'materials.html', 'formulas.html'] },
        'practice': { label: '🎯 Practice',     pages: ['pyq.html', 'quiz.html', 'flashcards.html', 'videos.html'] },
        'tools':    { label: '🛠 Tools',        pages: ['calculator.html', 'timer.html', 'notes.html', 'planner.html'] },
        'track':    { label: '📊 Track',        pages: ['progress.html', 'resources.html'] },
    };

    // ============ Get current page ============
    function getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
        return filename;
    }

    // ============ Generate topnav links ============
    function generateTopnavLinks() {
        const current = getCurrentPage();
        let html = '';

        for (const [groupKey, group] of Object.entries(GROUPS)) {
            const isActive = group.pages.includes(current);
            if (group.pages.length === 1) {
                // Single page — direct link
                const page = group.pages[0];
                const pageDef = PAGES[page];
                html += `<a href="./${page}" class="topnav-link ${isActive ? 'active' : ''}">${pageDef.label}</a>`;
            } else {
                // Multiple pages — dropdown
                const activePage = group.pages.find(p => p === current);
                const triggerLabel = activePage ? PAGES[activePage].label : group.label;
                html += `<div class="topnav-dropdown ${isActive ? 'open' : ''}" data-group="${groupKey}">`;
                html += `<button class="topnav-dropdown-trigger ${isActive ? 'active' : ''}" onclick="this.parentElement.classList.toggle('open')">`;
                html += `${triggerLabel} <span class="caret">▼</span></button>`;
                html += `<div class="topnav-dropdown-menu">`;
                for (const page of group.pages) {
                    const pageDef = PAGES[page];
                    const active = page === current ? 'active' : '';
                    html += `<a href="./${page}" class="${active}">${pageDef.label}</a>`;
                }
                html += `</div></div>`;
            }
        }
        return html;
    }

    // ============ Generate mobile bottom nav ============
    function generateMobileBottomNav() {
        const current = getCurrentPage();
        // Show 5 key pages on bottom nav
        const bottomPages = ['index.html', 'learn.html', 'pyq.html', 'videos.html', 'progress.html'];
        let html = '';
        for (const page of bottomPages) {
            const def = PAGES[page];
            const isActive = page === current;
            const icon = def.label.split(' ')[0];
            const label = def.label.split(' ').slice(1).join(' ');
            html += `<a href="./${page}" class="mobile-bottom-nav-item ${isActive ? 'active' : ''}">`;
            html += `<span class="icon">${icon}</span><span>${label}</span></a>`;
        }
        return html;
    }

    // ============ Inject navigation ============
    function injectNav() {
        // Replace topnav links with grouped dropdowns
        const topnavLinks = document.querySelector('.topnav-links');
        if (topnavLinks && !topnavLinks.dataset.upgraded) {
            topnavLinks.innerHTML = generateTopnavLinks();
            topnavLinks.dataset.upgraded = 'true';
        }

        // Add mobile bottom nav
        if (!document.getElementById('mobileBottomNav')) {
            const bottomNav = document.createElement('nav');
            bottomNav.id = 'mobileBottomNav';
            bottomNav.className = 'mobile-bottom-nav';
            bottomNav.innerHTML = generateMobileBottomNav();
            document.body.appendChild(bottomNav);
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.topnav-dropdown')) {
                document.querySelectorAll('.topnav-dropdown.open').forEach(d => {
                    // Only close if not the active group
                    const activePage = d.querySelector('.topnav-dropdown-trigger.active');
                    if (!activePage) d.classList.remove('open');
                });
            }
        });
    }

    // ============ In-App Browser Viewer ============
    window.openInApp = function (url, title) {
        // Remove existing overlay
        const existing = document.getElementById('inAppBrowser');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'inAppBrowser';
        overlay.className = 'in-app-browser-overlay';

        overlay.innerHTML = `
            <div class="in-app-browser-header">
                <button onclick="closeInApp()" class="close-btn">✕ Close</button>
                <span class="title">${title || url}</span>
                <button onclick="window.open('${url}', '_blank')">↗ Open External</button>
            </div>
            <iframe class="in-app-browser-frame" src="${url}" onload="this.dataset.loaded='true'"></iframe>
            <div class="in-app-browser-fallback" style="display:none;">
                <div class="icon">🌐</div>
                <h3>This site can't be embedded</h3>
                <p>Some websites block embedding for security. Click below to open in a new tab.</p>
                <a href="${url}" target="_blank" class="btn btn-primary btn-sm">↗ Open in New Tab</a>
            </div>
        `;

        document.body.appendChild(overlay);
        overlay.classList.add('open');

        // Check if iframe loaded or was blocked
        const iframe = overlay.querySelector('.in-app-browser-frame');
        const fallback = overlay.querySelector('.in-app-browser-fallback');
        iframe.addEventListener('error', () => {
            iframe.style.display = 'none';
            fallback.style.display = 'flex';
        });

        // Timeout: if iframe doesn't load in 5s, show fallback
        setTimeout(() => {
            if (!iframe.dataset.loaded) {
                // Try to detect blocking — some sites send X-Frame-Options
                try {
                    if (!iframe.contentWindow || iframe.contentWindow.length === 0) {
                        iframe.style.display = 'none';
                        fallback.style.display = 'flex';
                    }
                } catch(e) {
                    // Cross-origin — likely loaded but we can't check
                }
            }
        }, 5000);

        // ESC to close
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeInApp();
                document.removeEventListener('keydown', escHandler);
            }
        });
    };

    window.closeInApp = function () {
        const overlay = document.getElementById('inAppBrowser');
        if (overlay) {
            overlay.classList.remove('open');
            setTimeout(() => overlay.remove(), 250);
        }
    };

    // ============ Convert external links to in-app browser ============
    function convertExternalLinks() {
        // Only convert links with data-inapp attribute or resource cards
        document.querySelectorAll('a[data-inapp="true"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const url = link.href;
                // Try to get a clean title from the card
                let title = link.dataset.title;
                if (!title) {
                    const titleEl = link.querySelector('.resource-title') || link.querySelector('.pw-title');
                    if (titleEl) title = titleEl.textContent.trim();
                    else title = 'External Resource';
                }
                window.openInApp(url, title);
            });
        });
    }

    // ============ Init ============
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectNav();
            setTimeout(convertExternalLinks, 200);
        });
    } else {
        injectNav();
        setTimeout(convertExternalLinks, 200);
    }
})();
