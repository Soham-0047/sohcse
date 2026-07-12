/* ==========================================================================
   SOH CSE — Progress Tracker
   Shared module for real per-subject/chapter accuracy tracking.
   Used by: pyq.html (practice mode), quiz.html, mocktest.html, progress.html
   
   Storage structure (localStorage key: 'sohcse_progress_tracker'):
   {
     attempts: [
       {
         id: "attempt_<timestamp>",
         timestamp: 1234567890,
         source: "practice" | "quiz" | "mocktest",
         subject: "algorithms",
         chapter: "complexity-analysis-and-asymptotic-notations",
         question_id: "mmz0zl71",
         type: "mcq" | "msq" | "nat",
         correct: true | false,
         time_spent: 30,  // seconds (optional)
       },
       ...
     ],
     quizzes: [
       {
         id: "quiz_<timestamp>",
         timestamp: 1234567890,
         source: "quiz" | "mocktest",
         total: 10,
         correct: 7,
         wrong: 2,
         unattempted: 1,
         score: 6.33,
         max_score: 15,
         duration_sec: 600,
         subject_breakdown: { "algorithms": {correct: 3, wrong: 1}, ... }
       }
     ]
   }
   ========================================================================== */

(function () {
    'use strict';

    const TRACKER_KEY = 'sohcse_progress_tracker';

    function getData() {
        try {
            return JSON.parse(localStorage.getItem(TRACKER_KEY)) || { attempts: [], quizzes: [] };
        } catch {
            return { attempts: [], quizzes: [] };
        }
    }

    function saveData(data) {
        try {
            // Keep last 5000 attempts to avoid localStorage overflow
            if (data.attempts.length > 5000) {
                data.attempts = data.attempts.slice(-5000);
            }
            localStorage.setItem(TRACKER_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Tracker save failed:', e);
        }
    }

    // ============ Log a single attempt ============
    window.logAttempt = function (attempt) {
        const data = getData();
        data.attempts.push({
            id: 'attempt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
            timestamp: Date.now(),
            source: attempt.source || 'practice',
            subject: attempt.subject || null,
            chapter: attempt.chapter || null,
            question_id: attempt.question_id || null,
            type: attempt.type || null,
            correct: !!attempt.correct,
            time_spent: attempt.time_spent || null,
        });
        saveData(data);
    };

    // ============ Log a quiz/mocktest result ============
    window.logQuizResult = function (result) {
        const data = getData();
        data.quizzes.push({
            id: 'quiz_' + Date.now(),
            timestamp: Date.now(),
            source: result.source || 'quiz',
            total: result.total || 0,
            correct: result.correct || 0,
            wrong: result.wrong || 0,
            unattempted: result.unattempted || 0,
            score: result.score || 0,
            max_score: result.max_score || 0,
            duration_sec: result.duration_sec || 0,
            subject_breakdown: result.subject_breakdown || {},
        });
        saveData(data);
    };

    // ============ Get subject-wise accuracy ============
    window.getSubjectPerformance = function () {
        const data = getData();
        const subjects = {};

        for (const a of data.attempts) {
            if (!a.subject) continue;
            if (!subjects[a.subject]) {
                subjects[a.subject] = { total: 0, correct: 0, wrong: 0 };
            }
            subjects[a.subject].total++;
            if (a.correct) subjects[a.subject].correct++;
            else subjects[a.subject].wrong++;
        }

        // Convert to array with percentages
        const result = {};
        for (const [subj, stats] of Object.entries(subjects)) {
            result[subj] = {
                ...stats,
                accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
            };
        }
        return result;
    };

    // ============ Get chapter-wise accuracy ============
    window.getChapterPerformance = function (subject) {
        const data = getData();
        const chapters = {};

        for (const a of data.attempts) {
            if (!a.chapter) continue;
            if (subject && a.subject !== subject) continue;
            if (!chapters[a.chapter]) {
                chapters[a.chapter] = { total: 0, correct: 0, wrong: 0 };
            }
            chapters[a.chapter].total++;
            if (a.correct) chapters[a.chapter].correct++;
            else chapters[a.chapter].wrong++;
        }

        const result = {};
        for (const [chap, stats] of Object.entries(chapters)) {
            result[chap] = {
                ...stats,
                accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
            };
        }
        return result;
    };

    // ============ Get total stats ============
    window.getTotalStats = function () {
        const data = getData();
        const attempts = data.attempts;
        const quizzes = data.quizzes;

        const totalAttempts = attempts.length;
        const correct = attempts.filter(a => a.correct).length;
        const wrong = totalAttempts - correct;
        const accuracy = totalAttempts > 0 ? Math.round((correct / totalAttempts) * 100) : 0;

        const totalQuizzes = quizzes.length;
        const avgScore = totalQuizzes > 0
            ? quizzes.reduce((s, q) => s + (q.max_score > 0 ? (q.score / q.max_score) * 100 : 0), 0) / totalQuizzes
            : 0;

        return {
            totalAttempts,
            correct,
            wrong,
            accuracy,
            totalQuizzes,
            avgScore: Math.round(avgScore * 10) / 10,
            quizzes,
        };
    };

    // ============ Get weak chapters (accuracy < 60%) ============
    window.getWeakChapters = function (threshold = 60) {
        const subjPerf = window.getSubjectPerformance();
        const weak = [];

        for (const [subj, stats] of Object.entries(subjPerf)) {
            if (stats.total >= 2 && stats.accuracy < threshold) {
                weak.push({ subject: subj, ...stats });
            }
        }

        // Also check chapter-level
        const data = getData();
        const chapterStats = {};
        for (const a of data.attempts) {
            if (!a.chapter) continue;
            const key = `${a.subject}/${a.chapter}`;
            if (!chapterStats[key]) chapterStats[key] = { subject: a.subject, chapter: a.chapter, total: 0, correct: 0 };
            chapterStats[key].total++;
            if (a.correct) chapterStats[key].correct++;
        }

        for (const [key, stats] of Object.entries(chapterStats)) {
            if (stats.total >= 2) {
                const acc = Math.round((stats.correct / stats.total) * 100);
                if (acc < threshold) {
                    weak.push({ ...stats, accuracy: acc });
                }
            }
        }

        return weak.sort((a, b) => a.accuracy - b.accuracy);
    };

    // ============ Export all data ============
    window.exportProgress = function () {
        const data = getData();
        const exportObj = {
            version: 1,
            exported_at: new Date().toISOString(),
            tracker: data,
            bookmarks: JSON.parse(localStorage.getItem('sohcse_question_bookmarks') || '[]'),
            flashcards: JSON.parse(localStorage.getItem('sohcse_flashcard_state_v1') || '{}'),
            quiz_results: JSON.parse(localStorage.getItem('sohcse_quiz_results') || '[]'),
            planner: JSON.parse(localStorage.getItem('sohcse_planner_tasks_v1') || '[]'),
            notes: JSON.parse(localStorage.getItem('sohcse_personal_notes') || '[]'),
            streak: JSON.parse(localStorage.getItem('sohcse_streak_v1') || '{}'),
            study_log: JSON.parse(localStorage.getItem('sohcse_study_log_v1') || '{}'),
            ai_history: JSON.parse(localStorage.getItem('sohcse_ai_history_v3') || '[]'),
        };
        return JSON.stringify(exportObj, null, 2);
    };

    // ============ Import data ============
    window.importProgress = function (jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.tracker) {
                localStorage.setItem(TRACKER_KEY, JSON.stringify(data.tracker));
            }
            if (data.bookmarks) {
                localStorage.setItem('sohcse_question_bookmarks', JSON.stringify(data.bookmarks));
            }
            if (data.flashcards) {
                localStorage.setItem('sohcse_flashcard_state_v1', JSON.stringify(data.flashcards));
            }
            if (data.quiz_results) {
                localStorage.setItem('sohcse_quiz_results', JSON.stringify(data.quiz_results));
            }
            if (data.planner) {
                localStorage.setItem('sohcse_planner_tasks_v1', JSON.stringify(data.planner));
            }
            if (data.notes) {
                localStorage.setItem('sohcse_personal_notes', JSON.stringify(data.notes));
            }
            if (data.streak) {
                localStorage.setItem('sohcse_streak_v1', JSON.stringify(data.streak));
            }
            if (data.study_log) {
                localStorage.setItem('sohcse_study_log_v1', JSON.stringify(data.study_log));
            }
            if (data.ai_history) {
                localStorage.setItem('sohcse_ai_history_v3', JSON.stringify(data.ai_history));
            }
            return true;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    };

    // ============ Error Notebook ============
    const ERROR_NOTEBOOK_KEY = 'sohcse_error_notebook';

    window.getErrorNotebook = function () {
        try {
            return JSON.parse(localStorage.getItem(ERROR_NOTEBOOK_KEY) || '[]');
        } catch { return []; }
    };

    window.addToErrorNotebook = function (question) {
        const errors = window.getErrorNotebook();
        // Don't add duplicates
        if (errors.some(e => e.question_id === question.question_id)) return false;
        errors.push({
            question_id: question.question_id,
            subject: question.subject,
            chapter: question.chapter,
            subject_label: question.subject_label,
            chapter_label: question.chapter_label,
            question_text: question.question_text,
            options: question.options,
            correct_options: question.correct_options,
            answer: question.answer,
            type: question.type,
            normalized_type: question.normalized_type,
            explanation: question.explanation,
            year: question.year,
            paper_title: question.paper_title,
            url: question.url,
            added_at: Date.now(),
            // SM-2 fields for spaced repetition
            ease_factor: 2.5,
            interval: 0,
            repetitions: 0,
            next_review: Date.now(),
        });
        try {
            localStorage.setItem(ERROR_NOTEBOOK_KEY, JSON.stringify(errors));
        } catch (e) {
            console.warn('Error notebook save failed:', e);
        }
        return true;
    };

    window.removeFromErrorNotebook = function (questionId) {
        const errors = window.getErrorNotebook();
        const filtered = errors.filter(e => e.question_id !== questionId);
        localStorage.setItem(ERROR_NOTEBOOK_KEY, JSON.stringify(filtered));
    };

    window.getErrorNotebookDue = function () {
        const errors = window.getErrorNotebook();
        const now = Date.now();
        return errors.filter(e => e.next_review <= now);
    };

    // ============ SM-2 Algorithm for Error Notebook ============
    window.rateErrorCard = function (questionId, quality) {
        // quality: 0 (again), 1 (hard), 2 (good), 3 (easy)
        const errors = window.getErrorNotebook();
        const card = errors.find(e => e.question_id === questionId);
        if (!card) return;

        const q = [0, 1, 2, 3][quality] || 2;

        // SM-2 implementation
        if (q < 2) {
            // Failed — reset
            card.repetitions = 0;
            card.interval = 1;
        } else {
            if (card.repetitions === 0) {
                card.interval = 1;
            } else if (card.repetitions === 1) {
                card.interval = 3;
            } else {
                card.interval = Math.round(card.interval * card.ease_factor);
            }
            card.repetitions++;
        }

        // Update ease factor
        const qValue = q + 1; // SM-2 uses 0-5, we use 0-3 → map to 1-4
        card.ease_factor = Math.max(1.3, card.ease_factor + 0.1 - (5 - qValue) * (0.08 + (5 - qValue) * 0.02));

        // Schedule next review
        const dayInMs = 24 * 60 * 60 * 1000;
        card.next_review = Date.now() + (card.interval * dayInMs);

        localStorage.setItem(ERROR_NOTEBOOK_KEY, JSON.stringify(errors));
    };

    // ============ Clear all tracking data ============
    window.clearAllProgress = function () {
        localStorage.removeItem(TRACKER_KEY);
        localStorage.removeItem(ERROR_NOTEBOOK_KEY);
        localStorage.removeItem('sohcse_quiz_results');
        localStorage.removeItem('sohcse_flashcard_state_v1');
        localStorage.removeItem('sohcse_streak_v1');
        localStorage.removeItem('sohcse_study_log_v1');
    };

})();
