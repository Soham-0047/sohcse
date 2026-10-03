/* ==========================================================================
   SOH CSE — Gamification Engine v1
   Adds XP, levels, achievements, and rank progression across the platform.
   Listens to attempt/quiz/flashcard events and awards XP automatically.
   ========================================================================== */

(function () {
    'use strict';

    const G_KEY = 'sohcse_gamification_v1';

    const RANKS = [
        { name: 'Aspirant',       minXP: 0,     icon: '🌱', color: '#94a3b8' },
        { name: 'Learner',        minXP: 200,   icon: '📖', color: '#60a5fa' },
        { name: 'Practitioner',   minXP: 600,   icon: '⚙️', color: '#34d399' },
        { name: 'Problem Solver', minXP: 1500,  icon: '🧩', color: '#fbbf24' },
        { name: 'Scholar',        minXP: 3000,  icon: '🎓', color: '#a78bfa' },
        { name: 'Strategist',     minXP: 5500,  icon: '🎯', color: '#f472b6' },
        { name: 'Topper',         minXP: 9000,  icon: '🏆', color: '#fbbf24' },
        { name: 'GATE Champion',  minXP: 15000, icon: '👑', color: '#f59e0b' },
    ];

    const ACHIEVEMENTS = [
        // First-time milestones
        { id: 'first_blood',    name: 'First Step',           desc: 'Answer your first PYQ',           icon: '👣', xp: 25,  check: s => s.totalAttempts >= 1 },
        { id: 'first_quiz',     name: 'Quiz Rookie',          desc: 'Complete your first quiz',         icon: '🎯', xp: 50,  check: s => s.totalQuizzes >= 1 },
        { id: 'first_mock',     name: 'Mock Trial',           desc: 'Complete a full mock test',        icon: '⚔️', xp: 100, check: s => s.mocksCompleted >= 1 },
        { id: 'first_card',     name: 'Card Flipper',         desc: 'Review your first flashcard',      icon: '🎴', xp: 25,  check: s => s.flashcardsReviewed >= 1 },
        { id: 'first_bookmark', name: 'Bookmarker',           desc: 'Bookmark your first question',     icon: '🔖', xp: 25,  check: s => s.bookmarks >= 1 },
        { id: 'first_note',     name: 'Note Taker',           desc: 'Save your first note',             icon: '📓', xp: 25,  check: s => s.notesCreated >= 1 },
        { id: 'first_ai',       name: 'AI Pioneer',           desc: 'Ask the AI tutor a question',      icon: '🤖', xp: 25,  check: s => s.aiQueries >= 1 },

        // Volume milestones
        { id: 'pyq_50',     name: 'PYQ Grinder',       desc: 'Attempt 50 PYQs',           icon: '📝', xp: 100,  check: s => s.totalAttempts >= 50 },
        { id: 'pyq_250',    name: 'PYQ Marathoner',    desc: 'Attempt 250 PYQs',          icon: '🏃', xp: 300,  check: s => s.totalAttempts >= 250 },
        { id: 'pyq_1000',   name: 'PYQ Legend',        desc: 'Attempt 1,000 PYQs',        icon: '⭐', xp: 1000, check: s => s.totalAttempts >= 1000 },
        { id: 'quiz_10',    name: 'Quiz Master',       desc: 'Complete 10 quizzes',       icon: '🎯', xp: 200,  check: s => s.totalQuizzes >= 10 },
        { id: 'quiz_50',    name: 'Quiz Champion',     desc: 'Complete 50 quizzes',       icon: '🏅', xp: 500,  check: s => s.totalQuizzes >= 50 },
        { id: 'flash_30',   name: 'Card Collector',    desc: 'Review 30 flashcards',      icon: '🎴', xp: 200,  check: s => s.flashcardsReviewed >= 30 },
        { id: 'mock_5',     name: 'Mock Veteran',      desc: 'Complete 5 mock tests',     icon: '⚔️', xp: 500,  check: s => s.mocksCompleted >= 5 },

        // Accuracy milestones
        { id: 'streak_5',   name: 'Hot Streak',        desc: '5 PYQs correct in a row',           icon: '🔥', xp: 100,  check: s => (s.bestCorrectStreak || 0) >= 5 },
        { id: 'streak_15',  name: 'On Fire',           desc: '15 PYQs correct in a row',          icon: '🔥', xp: 250,  check: s => (s.bestCorrectStreak || 0) >= 15 },
        { id: 'acc_80',     name: 'Sharp Shooter',     desc: 'Get 80%+ on a quiz (10+ Qs)',       icon: '🎯', xp: 200,  check: s => s.bestQuizAccuracy >= 80 },
        { id: 'acc_100',    name: 'Perfectionist',     desc: 'Score 100% on a quiz (5+ Qs)',      icon: '💯', xp: 400,  check: s => s.perfectQuizzes >= 1 },
        { id: 'mock_pass',  name: 'Mock Cracker',      desc: 'Score 60+ in a mock test',          icon: '🚀', xp: 500,  check: s => s.bestMockScore >= 60 },

        // Streak milestones
        { id: 'day_3',      name: 'Habit Forming',     desc: '3-day study streak',                icon: '📅', xp: 100,  check: s => (s.bestDayStreak || 0) >= 3 },
        { id: 'day_7',      name: 'Week Warrior',      desc: '7-day study streak',                icon: '📅', xp: 200,  check: s => (s.bestDayStreak || 0) >= 7 },
        { id: 'day_30',     name: 'Monthly Master',    desc: '30-day study streak',               icon: '💎', xp: 1000, check: s => (s.bestDayStreak || 0) >= 30 },
        { id: 'day_100',    name: 'Centurion',         desc: '100-day study streak',              icon: '🏆', xp: 3000, check: s => (s.bestDayStreak || 0) >= 100 },

        // Subject mastery
        { id: 'subj_1',     name: 'Subject Initiate',  desc: 'Master 1 subject (70%+ accuracy)',  icon: '📘', xp: 200,  check: s => s.subjectsMastered >= 1 },
        { id: 'subj_5',     name: 'Polymath',          desc: 'Master 5 subjects',                 icon: '📚', xp: 1000, check: s => s.subjectsMastered >= 5 },
        { id: 'subj_all',   name: 'Renaissance Mind',  desc: 'Master all 10 core subjects',       icon: '👑', xp: 5000, check: s => s.subjectsMastered >= 10 },

        // Time investment
        { id: 'focus_1h',   name: 'Focus Mode',        desc: 'Complete 1 hour of Pomodoro',       icon: '⏱️', xp: 100,  check: s => s.pomodoroMinutes >= 60 },
        { id: 'focus_10h',  name: 'Deep Worker',       desc: 'Complete 10 hours of Pomodoro',     icon: '🧘', xp: 500,  check: s => s.pomodoroMinutes >= 600 },

        // Special
        { id: 'night_owl',  name: 'Night Owl',         desc: 'Study after 11 PM',                 icon: '🦉', xp: 50,   check: s => s.nightOwl },
        { id: 'early_bird', name: 'Early Bird',        desc: 'Study before 6 AM',                 icon: '🐦', xp: 50,   check: s => s.earlyBird },
        { id: 'ai_50',      name: 'AI Whisperer',      desc: 'Ask AI tutor 50 questions',         icon: '🤖', xp: 300,  check: s => s.aiQueries >= 50 },
        { id: 'plan_master',name: 'Plan Master',       desc: 'Complete 20 planner tasks',         icon: '📋', xp: 200,  check: s => s.tasksCompleted >= 20 },
    ];

    function load() {
        try {
            const data = JSON.parse(localStorage.getItem(G_KEY));
            if (data) return data;
        } catch {}
        return {
            xp: 0,
            unlocked: [], // achievement IDs
            stats: {
                totalAttempts: 0,
                correctAttempts: 0,
                totalQuizzes: 0,
                mocksCompleted: 0,
                flashcardsReviewed: 0,
                bookmarks: 0,
                notesCreated: 0,
                aiQueries: 0,
                tasksCompleted: 0,
                pomodoroMinutes: 0,
                bestCorrectStreak: 0,
                bestQuizAccuracy: 0,
                perfectQuizzes: 0,
                bestMockScore: 0,
                bestDayStreak: 0,
                subjectsMastered: 0,
                nightOwl: false,
                earlyBird: false,
            },
            history: [], // [{xp, reason, ts}]
            currentCorrectStreak: 0,
        };
    }

    function save(data) {
        try { localStorage.setItem(G_KEY, JSON.stringify(data)); } catch (e) { console.warn('Gamification save failed:', e); }
    }

    function getRank(xp) {
        let rank = RANKS[0];
        let nextRank = null;
        for (let i = 0; i < RANKS.length; i++) {
            if (xp >= RANKS[i].minXP) {
                rank = RANKS[i];
                nextRank = RANKS[i + 1] || null;
            }
        }
        return { current: rank, next: nextRank };
    }

    function getLevelProgress(xp) {
        const { current, next } = getRank(xp);
        if (!next) {
            return { pct: 100, currentXP: xp - current.minXP, neededXP: 0, current, next };
        }
        const rangeXP = next.minXP - current.minXP;
        const earnedXP = xp - current.minXP;
        return { pct: Math.min(100, (earnedXP / rangeXP) * 100), currentXP: earnedXP, neededXP: rangeXP, current, next };
    }

    function computeStats() {
        // Pull from other trackers
        const data = load();
        const stats = data.stats;

        // Tracker-based stats
        if (typeof window.getTotalStats === 'function') {
            const t = window.getTotalStats();
            stats.totalAttempts = t.totalAttempts;
            stats.correctAttempts = t.correct;
        }

        // Bookmarks
        try {
            const bm = JSON.parse(localStorage.getItem('sohcse_question_bookmarks') || '[]');
            stats.bookmarks = bm.length;
        } catch {}

        // Flashcards reviewed
        try {
            const fc = JSON.parse(localStorage.getItem('sohcse_flashcard_state_v1') || '{}');
            const reviewed = fc.stats ? Object.values(fc.stats).filter(s => s.reviews > 0).length : 0;
            stats.flashcardsReviewed = reviewed;
        } catch {}

        // Quizzes
        try {
            const q = JSON.parse(localStorage.getItem('sohcse_quiz_results') || '[]');
            stats.totalQuizzes = q.length;
            if (q.length > 0) {
                stats.bestQuizAccuracy = Math.max(...q.map(r => parseFloat(r.percentage) || 0));
                stats.perfectQuizzes = q.filter(r => parseFloat(r.percentage) === 100 && r.total >= 5).length;
            }
        } catch {}

        // Notes
        try {
            const notes = JSON.parse(localStorage.getItem('sohcse_personal_notes') || '[]');
            stats.notesCreated = notes.length;
        } catch {}

        // Planner tasks completed
        try {
            const tasks = JSON.parse(localStorage.getItem('sohcse_planner_tasks_v1') || '[]');
            stats.tasksCompleted = tasks.filter(t => t.completed).length;
        } catch {}

        // Streak
        try {
            const streak = JSON.parse(localStorage.getItem('sohcse_streak_v1') || '{}');
            stats.bestDayStreak = Math.max(stats.bestDayStreak || 0, streak.count || 0);
        } catch {}

        // Subject mastery (>= 70% accuracy with >= 5 attempts)
        if (typeof window.getSubjectPerformance === 'function') {
            const perf = window.getSubjectPerformance();
            let mastered = 0;
            for (const s of Object.values(perf)) {
                if (s.total >= 5 && s.accuracy >= 70) mastered++;
            }
            stats.subjectsMastered = mastered;
        }

        // Time-of-day flags
        const h = new Date().getHours();
        if (h >= 23 || h < 4) stats.nightOwl = true;
        if (h >= 4 && h < 6) stats.earlyBird = true;

        data.stats = stats;
        save(data);
        return data;
    }

    function awardXP(amount, reason) {
        if (amount <= 0) return;
        const data = load();
        data.xp += amount;
        data.history.push({ xp: amount, reason, ts: Date.now() });
        if (data.history.length > 100) data.history = data.history.slice(-100);
        save(data);
        showXPNotification(amount, reason);
        checkAchievements();
    }

    function checkAchievements() {
        const data = load();
        const stats = computeStats().stats;
        let newUnlocks = [];

        for (const ach of ACHIEVEMENTS) {
            if (data.unlocked.includes(ach.id)) continue;
            if (ach.check(stats)) {
                data.unlocked.push(ach.id);
                data.xp += ach.xp;
                newUnlocks.push(ach);
            }
        }

        if (newUnlocks.length > 0) {
            save(data);
            for (const a of newUnlocks) {
                showAchievementNotification(a);
            }
        }
    }

    function showXPNotification(amount, reason) {
        const el = document.createElement('div');
        el.className = 'xp-notification';
        el.innerHTML = `
            <div class="xp-icon">⚡</div>
            <div class="xp-content">
                <div class="xp-amount">+${amount} XP</div>
                <div class="xp-reason">${reason}</div>
            </div>
        `;
        document.body.appendChild(el);
        requestAnimationFrame(() => el.classList.add('visible'));
        setTimeout(() => {
            el.classList.remove('visible');
            setTimeout(() => el.remove(), 400);
        }, 2500);
    }

    function showAchievementNotification(ach) {
        const el = document.createElement('div');
        el.className = 'achievement-popup';
        el.innerHTML = `
            <div class="ach-icon-large">${ach.icon}</div>
            <div class="ach-content">
                <div class="ach-label">🏆 Achievement Unlocked!</div>
                <div class="ach-name">${ach.name}</div>
                <div class="ach-desc">${ach.desc}</div>
                <div class="ach-xp">+${ach.xp} XP</div>
            </div>
        `;
        document.body.appendChild(el);
        requestAnimationFrame(() => el.classList.add('visible'));
        setTimeout(() => {
            el.classList.remove('visible');
            setTimeout(() => el.remove(), 500);
        }, 5000);

        // Confetti if available
        if (window.celebrateConfetti) {
            window.celebrateConfetti();
        }
    }

    // ============ Public API ============
    window.SOH_Game = {
        RANKS,
        ACHIEVEMENTS,
        getData: load,
        getRank,
        getLevelProgress,
        awardXP,
        checkAchievements,
        computeStats,

        // Event hooks for other modules
        onAttempt(correct) {
            const data = load();
            if (correct) {
                data.currentCorrectStreak = (data.currentCorrectStreak || 0) + 1;
                data.stats.bestCorrectStreak = Math.max(data.stats.bestCorrectStreak || 0, data.currentCorrectStreak);
                awardXP(10, 'Correct answer');
            } else {
                data.currentCorrectStreak = 0;
                awardXP(3, 'Attempted (keep going!)');
            }
            save(data);
            checkAchievements();
        },

        onQuizComplete(result) {
            const xp = Math.round((result.percentage || 0) * 2 + (result.correct || 0) * 5);
            awardXP(xp, `Quiz complete (${result.percentage}%)`);
            checkAchievements();
        },

        onMockComplete(score, maxScore) {
            const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
            const data = load();
            data.stats.mocksCompleted = (data.stats.mocksCompleted || 0) + 1;
            data.stats.bestMockScore = Math.max(data.stats.bestMockScore || 0, pct);
            save(data);
            awardXP(Math.round(pct * 5), `Mock complete (${pct.toFixed(1)}%)`);
            checkAchievements();
        },

        onFlashcardReview(quality) {
            // quality 0-3 (Again/Hard/Good/Easy)
            const xp = [2, 5, 10, 15][quality] || 5;
            awardXP(xp, 'Flashcard reviewed');
            checkAchievements();
        },

        onAIQuery() {
            const data = load();
            data.stats.aiQueries = (data.stats.aiQueries || 0) + 1;
            save(data);
            awardXP(5, 'Asked AI tutor');
            checkAchievements();
        },

        onBookmark() {
            awardXP(15, 'Bookmarked a question');
            checkAchievements();
        },

        onNoteCreated() {
            awardXP(20, 'Created a note');
            checkAchievements();
        },

        onTaskCompleted() {
            awardXP(15, 'Completed a study task');
            checkAchievements();
        },

        onPomodoroComplete(minutes) {
            const data = load();
            data.stats.pomodoroMinutes = (data.stats.pomodoroMinutes || 0) + minutes;
            save(data);
            awardXP(minutes * 2, `${minutes}-min focus session`);
            checkAchievements();
        },

        onDayStreak(count) {
            const data = load();
            data.stats.bestDayStreak = Math.max(data.stats.bestDayStreak || 0, count);
            save(data);
            awardXP(count * 10, `${count}-day study streak!`);
            checkAchievements();
        },

        // Get all achievements with unlocked status
        getAllAchievements() {
            const data = load();
            return ACHIEVEMENTS.map(a => ({ ...a, unlocked: data.unlocked.includes(a.id) }));
        },

        // Get next N locked achievements closest to unlocking
        getUpcomingAchievements(n = 3) {
            const data = load();
            const stats = computeStats().stats;
            return ACHIEVEMENTS
                .filter(a => !data.unlocked.includes(a.id))
                .map(a => ({ ...a, unlocked: false }))
                .slice(0, n);
        },
    };

    // Run check on every page load
    document.addEventListener('DOMContentLoaded', () => {
        computeStats();
        checkAchievements();
    });

})();
