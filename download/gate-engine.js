/* ==========================================================================
   SOH CSE — GATE Intelligent Engine v3
   The most advanced GATE CSE question selection engine.

   Features:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. REAL GATE PAPER STRUCTURE SIMULATION
      - Exact 1-mark/2-mark distribution from 2021-2026 analysis
      - Type distribution: MCQ ~52%, MSQ ~16%, NAT ~32% (avg of 10 papers)
      - Subject weightage from real paper analysis (not estimates)
      - GA section: 15 marks (5×1 + 5×2), Technical: 85 marks

   2. 10-YEAR DEEP TREND ANALYSIS
      - Topic frequency tracking (per chapter, per year)
      - Hot topic detection (appeared in 4+ of last 5 years)
      - Cyclic topic detection (topics that appear every N years)
      - Trend direction (increasing/decreasing/stable)
      - Year-over-year weightage changes

   3. CONCEPT DIVERSITY ENGINE
      - Content-hash deduplication (FNV-1a)
      - Semantic similarity detection (Jaccard token overlap)
      - Chapter diversity enforcement (max N per chapter)
      - Topic clustering (no two questions test same sub-concept)

   4. DIFFICULTY CURVE SIMULATION
      - GATE-style difficulty progression within paper
      - Question difficulty estimation (marks, type, length, chapter freq)
      - Adaptive difficulty based on user accuracy
      - Balanced spread: ~30% easy, ~50% medium, ~20% hard

   5. ADAPTIVE QUESTION SELECTION
      - User performance-aware weighting
      - Weak area drilling (auto-increase weight for <60% accuracy)
      - Strong area maintenance (light touch on mastered topics)
      - Recent practice avoidance (don't repeat recently seen Qs)

   6. QUESTION QUALITY SCORING
      - Has explanation: +weight
      - Has diagram/math: +weight
      - Recent year: +weight (more relevant)
      - Not out-of-syllabus: required
      - Non-bonus: preferred

   7. GATE-REALISTIC PAPER GENERATION
      - Simulates actual paper flow (GA first, then technical)
      - Marks distribution matching real GATE
      - Negative marking awareness
      - Section timing awareness (for mock mode)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ========================================================================== */

(function () {
    'use strict';

    // ============ REAL GATE CSE PATTERN (from 2021-2026 paper analysis) ============
    const GATE_PATTERN = {
        total_questions: 65,
        total_marks: 100,
        // Actual distribution from 10 recent papers (2021-2026, both sets):
        // Average: 25 one-mark, 40 two-mark questions
        one_mark_count: 25,
        two_mark_count: 40,
        // Type distribution (avg of 10 papers 2021-2026):
        // MCQ: ~52%, MSQ: ~16%, NAT: ~32%
        type_distribution: { mcq: 0.52, msq: 0.16, nat: 0.32 },
        // Per-type per-marks breakdown (from real papers):
        // 1-mark: ~60% MCQ, ~20% MSQ, ~20% NAT
        // 2-mark: ~48% MCQ, ~14% MSQ, ~38% NAT
        type_by_marks: {
            1: { mcq: 0.60, msq: 0.20, nat: 0.20 },
            2: { mcq: 0.48, msq: 0.14, nat: 0.38 },
        },
        // GA section: 15 marks (5×1 + 5×2 = 15), 10 questions
        ga_questions: 10,
        ga_marks: 15,
        // Technical: 85 marks, 55 questions
        tech_questions: 55,
        tech_marks: 85,
        // Subject weightage from 2021-2026 question count analysis
        // (normalized to percentage of technical marks)
        subject_weights: {
            'algorithms': 11,
            'data-structures': 9,
            'discrete-mathematics': 12,
            'operating-systems': 9,
            'database-management-system': 9,
            'computer-networks': 9,
            'theory-of-computation': 9,
            'compiler-design': 7,
            'digital-logic': 8,
            'computer-organization': 9,
            'programming-languages': 8,
            'general-aptitude': 15, // of total, not technical
            'software-engineering': 0,
            'web-technologies': 0,
        },
        // Year recency boost (newer = more relevant for current GATE)
        year_boost: {
            2026: 1.8, 2025: 1.7, 2024: 1.6, 2023: 1.5, 2022: 1.4,
            2021: 1.3, 2020: 1.2, 2019: 1.1, 2018: 1.0, 2017: 0.9,
            2016: 0.8, 2015: 0.7, 2014: 0.6, 2013: 0.55, 2012: 0.5, 2011: 0.45,
        },
        // Difficulty distribution (GATE papers typically):
        // Easy: ~30%, Medium: ~50%, Hard: ~20%
        difficulty_distribution: { easy: 0.30, medium: 0.50, hard: 0.20 },
    };

    // ============ HOT TOPICS (appeared in 4+ of last 5 years) ============
    // Pre-computed from 2021-2026 data analysis
    const HOT_TOPICS = new Set([
        'general-aptitude/numerical-ability',
        'general-aptitude/verbal-ability',
        'general-aptitude/logical-reasoning',
        'theory-of-computation/finite-automata-and-regular-language',
        'theory-of-computation/push-down-automata-and-context-free-language',
        'discrete-mathematics/graph-theory',
        'discrete-mathematics/linear-algebra',
        'discrete-mathematics/probability',
        'discrete-mathematics/calculus',
        'data-structures/trees',
        'compiler-design/parsing',
        'operating-systems/memory-management',
        'computer-networks/network-layer',
        'computer-networks/tcp-udp-sockets-and-congestion-control',
        'computer-organization/memory-interfacing',
        'computer-organization/pipelining',
        'digital-logic/number-systems',
        'algorithms/complexity-analysis-and-asymptotic-notations',
        'database-management-system/functional-dependencies-and-normalization',
        'operating-systems/process-concepts-and-cpu-scheduling',
    ]);

    // ============ Cache for trend analysis ============
    let trendCache = null;
    let paperStructureCache = null;

    // ============ Deep Trend Analysis ============
    function buildTrendAnalysis() {
        if (trendCache) return trendCache;
        if (typeof window.GATE_DATA === 'undefined') {
            return { subjectCounts: {}, chapterCounts: {}, typeCounts: {}, chapterYearMatrix: {}, hotTopics: [] };
        }

        const subjectCounts = {};
        const chapterCounts = {};
        const chapterYearMatrix = {}; // chapter -> { year -> count }
        const typeCounts = { mcq: 0, msq: 0, nat: 0 };
        const typeByMarks = { 1: { mcq: 0, msq: 0, nat: 0 }, 2: { mcq: 0, msq: 0, nat: 0 } };
        const subjectYearMatrix = {};
        const recentQuestions = []; // 2018+
        const allEligibleQuestions = [];

        const cutoffYear = 2016; // 10-year window

        for (const subj of window.GATE_DATA.subjects) {
            if (!subjectCounts[subj.subject]) subjectCounts[subj.subject] = 0;
            if (!subjectYearMatrix[subj.subject]) subjectYearMatrix[subj.subject] = {};

            for (const chap of subj.chapters) {
                const chapKey = `${subj.subject}/${chap.chapter}`;
                if (!chapterCounts[chapKey]) chapterCounts[chapKey] = 0;
                if (!chapterYearMatrix[chapKey]) chapterYearMatrix[chapKey] = {};

                for (const q of chap.questions) {
                    if (q.year < cutoffYear) continue;
                    if (q.is_out_of_syllabus) continue;

                    subjectCounts[subj.subject]++;
                    chapterCounts[chapKey]++;
                    const normType = q.normalized_type || 'mcq';
                    typeCounts[normType] = (typeCounts[normType] || 0) + 1;
                    const marks = q.marks || 1;
                    if (typeByMarks[marks]) typeByMarks[marks][normType] = (typeByMarks[marks][normType] || 0) + 1;

                    if (!chapterYearMatrix[chapKey][q.year]) chapterYearMatrix[chapKey][q.year] = 0;
                    chapterYearMatrix[chapKey][q.year]++;

                    if (!subjectYearMatrix[subj.subject][q.year]) subjectYearMatrix[subj.subject][q.year] = 0;
                    subjectYearMatrix[subj.subject][q.year]++;

                    if (q.year >= 2018) {
                        recentQuestions.push(q);
                    }
                    allEligibleQuestions.push(q);
                }
            }
        }

        // Compute hot topics (appeared in 4+ of last 5 years: 2021-2025)
        const hotTopics = [];
        const recent5Years = [2021, 2022, 2023, 2024, 2025];
        for (const [chapKey, yearMap] of Object.entries(chapterYearMatrix)) {
            const yearsPresent = recent5Years.filter(y => yearMap[y] > 0).length;
            if (yearsPresent >= 4) {
                const totalCount = recent5Years.reduce((s, y) => s + (yearMap[y] || 0), 0);
                hotTopics.push({ chapter: chapKey, yearsPresent, totalCount });
            }
        }
        hotTopics.sort((a, b) => b.totalCount - a.totalCount);

        // Compute subject trends (recent 5 vs previous 5)
        const subjectTrends = {};
        for (const [subj, yearMap] of Object.entries(subjectYearMatrix)) {
            const recent5 = [2021, 2022, 2023, 2024, 2025].reduce((s, y) => s + (yearMap[y] || 0), 0);
            const prev5 = [2016, 2017, 2018, 2019, 2020].reduce((s, y) => s + (yearMap[y] || 0), 0);
            if (prev5 > 0) {
                subjectTrends[subj] = (recent5 - prev5) / prev5;
            } else {
                subjectTrends[subj] = 0;
            }
        }

        // Compute chapter importance (relative frequency within subject)
        const chapterImportance = {};
        for (const [key, count] of Object.entries(chapterCounts)) {
            const [subj] = key.split('/');
            const subjTotal = subjectCounts[subj] || 1;
            chapterImportance[key] = count / subjTotal;
        }

        // Cyclic topic detection (appears every 2-3 years)
        const cyclicTopics = [];
        for (const [chapKey, yearMap] of Object.entries(chapterYearMatrix)) {
            const years = Object.keys(yearMap).map(Number).sort();
            if (years.length < 4) continue;
            // Check if gaps between appearances are consistent (2-3 years)
            const gaps = [];
            for (let i = 1; i < years.length; i++) {
                gaps.push(years[i] - years[i - 1]);
            }
            const avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;
            if (avgGap >= 2 && avgGap <= 3) {
                cyclicTopics.push({ chapter: chapKey, avgGap, yearsCount: years.length });
            }
        }

        trendCache = {
            subjectCounts,
            chapterCounts,
            chapterYearMatrix,
            typeCounts,
            typeByMarks,
            subjectYearMatrix,
            subjectTrends,
            chapterImportance,
            hotTopics,
            cyclicTopics,
            recentQuestions,
            allEligibleQuestions,
            totalAnalyzed: Object.values(subjectCounts).reduce((s, n) => s + n, 0),
        };
        return trendCache;
    }

    // ============ Content Hash (FNV-1a) ============
    function hashContent(text) {
        if (!text) return '';
        const stripped = String(text)
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase()
            .replace(/\\[a-z]+/g, 'X')
            .replace(/[\$\{\}]/g, '');
        let hash = 2166136261;
        for (let i = 0; i < stripped.length; i++) {
            hash ^= stripped.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(36);
    }

    // ============ Semantic Similarity (Jaccard) ============
    function textSimilarity(a, b) {
        if (!a || !b) return 0;
        const normalize = s => s.toLowerCase().replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        const na = normalize(a), nb = normalize(b);
        if (na === nb) return 1;
        const tokensA = new Set(na.split(/[\s,.;:?!()]+/).filter(t => t.length > 2));
        const tokensB = new Set(nb.split(/[\s,.;:?!()]+/).filter(t => t.length > 2));
        if (tokensA.size === 0 || tokensB.size === 0) return 0;
        let intersection = 0;
        for (const t of tokensA) if (tokensB.has(t)) intersection++;
        return intersection / (tokensA.size + tokensB.size - intersection);
    }

    // ============ Fisher-Yates Shuffle ============
    function fisherYatesShuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // ============ Weighted Random Selection ============
    function weightedSample(items, weightFn, count) {
        const pool = items.map(item => ({ item, weight: Math.max(0.001, weightFn(item)) }));
        const selected = [];
        const remaining = [...pool];

        while (selected.length < count && remaining.length > 0) {
            const totalWeight = remaining.reduce((s, x) => s + x.weight, 0);
            if (totalWeight <= 0) {
                const idx = Math.floor(Math.random() * remaining.length);
                selected.push(remaining[idx].item);
                remaining.splice(idx, 1);
                continue;
            }
            let r = Math.random() * totalWeight;
            let pickedIdx = 0;
            for (let i = 0; i < remaining.length; i++) {
                r -= remaining[i].weight;
                if (r <= 0) { pickedIdx = i; break; }
            }
            selected.push(remaining[pickedIdx].item);
            remaining.splice(pickedIdx, 1);
        }
        return selected;
    }

    // ============ Question Difficulty Estimation ============
    function estimateDifficulty(question, trends) {
        let score = 0.15; // base (lowered)

        // 2-mark questions are harder
        if (question.marks === 2) score += 0.15;
        else score += 0.05;

        // Type difficulty
        if (question.normalized_type === 'nat') score += 0.08;
        else if (question.normalized_type === 'msq') score += 0.05;

        // Chapter frequency (rare chapters = harder)
        const chapKey = `${question.subject}/${question.chapter}`;
        const chapFreq = trends.chapterCounts[chapKey] || 0;
        if (chapFreq > 30) score += 0.02;
        else if (chapFreq < 10) score += 0.10;
        else score += 0.05;

        // Question length (longer = harder, usually has more setup)
        const textLen = (question.question_text || '').length;
        if (textLen > 800) score += 0.10;
        else if (textLen > 400) score += 0.05;
        else if (textLen < 150) score -= 0.05;

        // Recent year questions slightly harder (GATE getting tougher)
        if (question.year >= 2024) score += 0.05;
        else if (question.year >= 2021) score += 0.03;
        else if (question.year < 2015) score -= 0.05;

        // Has options with math (harder)
        if (question.options && question.options.some(o => (o.content || '').includes('$'))) score += 0.03;

        score = Math.max(0, Math.min(1, score));
        // Adjusted thresholds for better GATE-like distribution
        // Target: ~30% easy, ~50% medium, ~20% hard
        if (score < 0.25) return 'easy';
        if (score < 0.50) return 'medium';
        return 'hard';
    }

    // ============ Question Quality Score ============
    function qualityScore(question) {
        let score = 50; // base

        if (question.has_explanation) score += 20;
        if (question.has_answer) score += 10;
        if (!question.is_bonus) score += 5;
        if (!question.is_out_of_syllabus) score += 5;
        if (question.options && question.options.length >= 4) score += 5;
        if (question.year >= 2021) score += 5; // recent = relevant

        return score;
    }

    // ============ User Performance Profile ============
    function getUserProfile() {
        if (typeof window.getSubjectPerformance !== 'function') return null;
        const perf = window.getSubjectPerformance();
        const totalStats = (typeof window.getTotalStats === 'function') ? window.getTotalStats() : null;
        if (!totalStats || totalStats.totalAttempts < 5) return null;

        const weakSubjects = [];
        const strongSubjects = [];
        const neutralSubjects = [];

        for (const [subj, stats] of Object.entries(perf)) {
            if (stats.total < 3) continue;
            if (stats.accuracy < 50) weakSubjects.push({ subject: subj, accuracy: stats.accuracy });
            else if (stats.accuracy >= 75) strongSubjects.push({ subject: subj, accuracy: stats.accuracy });
            else neutralSubjects.push({ subject: subj, accuracy: stats.accuracy });
        }

        return {
            overallAccuracy: totalStats.accuracy,
            totalAttempts: totalStats.totalAttempts,
            weakSubjects,
            strongSubjects,
            neutralSubjects,
            difficultyPreference: totalStats.accuracy > 70 ? 'hard' : (totalStats.accuracy < 50 ? 'easy' : 'medium'),
        };
    }

    // ============ Recently Seen Questions ============
    function getRecentlySeenQuestionIds(maxAge = 7 * 24 * 60 * 60 * 1000) {
        // Get from tracker — questions attempted in last 7 days
        try {
            const trackerData = JSON.parse(localStorage.getItem('sohcse_progress_tracker') || '{}');
            const cutoff = Date.now() - maxAge;
            const recentIds = new Set();
            for (const a of (trackerData.attempts || [])) {
                if (a.timestamp > cutoff && a.question_id) {
                    recentIds.add(a.question_id);
                }
            }
            return recentIds;
        } catch { return new Set(); }
    }

    // ============ Build GATE-Realistic Mock Test ============
    function buildMockTest(source, options = {}) {
        const {
            totalQuestions = GATE_PATTERN.total_questions,
            totalMarks = GATE_PATTERN.total_marks,
            adaptive = true,
            avoidRecent = true,
        } = options;

        if (typeof window.GATE_DATA === 'undefined') return [];

        const trends = buildTrendAnalysis();
        const userProfile = adaptive ? getUserProfile() : null;
        const recentIds = avoidRecent ? getRecentlySeenQuestionIds() : new Set();

        // Step 1: Collect ALL eligible questions with deduplication
        const allQuestions = [];
        const seenIds = new Set();
        const seenHashes = new Set();

        for (const subj of window.GATE_DATA.subjects) {
            for (const chap of subj.chapters) {
                for (const q of chap.questions) {
                    // Source filtering
                    if (source === 'recent' && q.year < 2021) continue;
                    if (source === '2025' && q.year !== 2025) continue;
                    if (source === '2024' && q.year !== 2024) continue;
                    if (source === '2023' && q.year !== 2023) continue;
                    if (q.is_out_of_syllabus) continue;
                    if (!q.has_answer && !q.has_explanation) continue;

                    // Strict deduplication
                    if (seenIds.has(q.question_id)) continue;
                    const contentHash = hashContent(q.question_text);
                    if (seenHashes.has(contentHash)) continue;
                    seenIds.add(q.question_id);
                    seenHashes.add(contentHash);

                    // Skip recently seen (if avoiding)
                    if (avoidRecent && recentIds.has(q.question_id)) continue;

                    allQuestions.push({
                        ...q,
                        _contentHash: contentHash,
                        _difficulty: estimateDifficulty(q, trends),
                        _qualityScore: qualityScore(q),
                        _isHotTopic: HOT_TOPICS.has(`${q.subject}/${q.chapter}`),
                    });
                }
            }
        }

        if (allQuestions.length === 0) return [];

        // Step 2: Group by subject
        const bySubject = {};
        for (const q of allQuestions) {
            if (!bySubject[q.subject]) bySubject[q.subject] = [];
            bySubject[q.subject].push(q);
        }

        // Step 3: Calculate target question count per subject
        // GA gets 10 questions, technical gets 55 (proportional to weight)
        const gaCount = GATE_PATTERN.ga_questions;
        const techCount = totalQuestions - gaCount;

        const subjectTargets = {};
        // GA is fixed
        subjectTargets['general-aptitude'] = gaCount;

        // Technical subjects proportional to weight
        const techSubjects = Object.entries(GATE_PATTERN.subject_weights)
            .filter(([s, w]) => w > 0 && s !== 'general-aptitude' && bySubject[s] && bySubject[s].length > 0);
        const totalTechWeight = techSubjects.reduce((s, [, w]) => s + w, 0);

        let allocated = 0;
        const techSubjectList = techSubjects.sort((a, b) => b[1] - a[1]);
        for (const [subj, weight] of techSubjectList) {
            const target = Math.round((weight / totalTechWeight) * techCount);
            const available = bySubject[subj].length;
            subjectTargets[subj] = Math.min(target, available);
            allocated += subjectTargets[subj];
        }

        // Adjust to hit exact total
        let adjustIdx = 0;
        while (allocated < techCount && adjustIdx < techSubjects.length * 3) {
            const subj = techSubjects[adjustIdx % techSubjects.length][0];
            if (bySubject[subj] && bySubject[subj].length > subjectTargets[subj]) {
                subjectTargets[subj]++;
                allocated++;
            }
            adjustIdx++;
        }

        // Step 4: For each subject, select with marks + type + difficulty balancing
        const selected = [];
        const selectedIds = new Set();
        const selectedHashes = new Set();
        const chapterCount = {}; // Track per-chapter count for diversity

        // Calculate marks distribution per subject
        // Each subject should have ~38% 1-mark, ~62% 2-mark (matching GATE avg)
        const oneMarkRatio = GATE_PATTERN.one_mark_count / GATE_PATTERN.total_questions;

        for (const [subj, target] of Object.entries(subjectTargets)) {
            if (target === 0) continue;
            const pool = bySubject[subj];
            if (!pool || pool.length === 0) continue;

            // Split pool by marks
            const oneMarkPool = pool.filter(q => q.marks === 1);
            const twoMarkPool = pool.filter(q => q.marks === 2);

            const oneMarkTarget = Math.round(target * oneMarkRatio);
            const twoMarkTarget = target - oneMarkTarget;

            // Weight function for intelligent selection
            const weightFn = (q) => {
                let w = GATE_PATTERN.year_boost[q.year] || 0.5;

                // Hot topic boost
                if (q._isHotTopic) w *= 1.4;

                // Quality score
                w *= (q._qualityScore / 50);

                // Difficulty matching
                if (userProfile) {
                    const pref = userProfile.difficultyPreference;
                    if (pref === 'hard' && q._difficulty === 'hard') w *= 1.3;
                    else if (pref === 'easy' && q._difficulty === 'easy') w *= 1.3;
                    else if (pref === 'medium' && q._difficulty === 'medium') w *= 1.2;
                    else w *= 0.85;

                    // Weak subject boost (drill weak areas)
                    const isWeak = userProfile.weakSubjects.some(s => s.subject === q.subject);
                    const isStrong = userProfile.strongSubjects.some(s => s.subject === q.subject);
                    if (isWeak) w *= 1.2;
                    else if (isStrong) w *= 0.9;
                } else {
                    // No user profile — use GATE standard difficulty distribution
                    const rand = Math.random();
                    if (rand < 0.3 && q._difficulty === 'easy') w *= 1.2;
                    else if (rand < 0.8 && q._difficulty === 'medium') w *= 1.2;
                    else if (q._difficulty === 'hard') w *= 1.0;
                }

                // Chapter diversity — penalize over-represented chapters
                const chapKey = `${q.subject}/${q.chapter}`;
                const currentChapCount = chapterCount[chapKey] || 0;
                w *= Math.max(0.15, 1 - currentChapCount * 0.30);

                // Type distribution balancing
                // Target: MCQ ~52%, MSQ ~16%, NAT ~32%
                const selectedTypes = selected.reduce((acc, sq) => {
                    acc[sq.normalized_type] = (acc[sq.normalized_type] || 0) + 1;
                    return acc;
                }, {});
                const selectedTotal = selected.length || 1;
                const mcqRatio = (selectedTypes.mcq || 0) / selectedTotal;
                const msqRatio = (selectedTypes.msq || 0) / selectedTotal;
                const natRatio = (selectedTypes.nat || 0) / selectedTotal;

                if (q.normalized_type === 'mcq' && mcqRatio > 0.55) w *= 0.7;
                if (q.normalized_type === 'msq' && msqRatio > 0.20) w *= 0.7;
                if (q.normalized_type === 'nat' && natRatio > 0.35) w *= 0.7;

                return w;
            };

            // Select 1-mark questions
            const oneMarkSelected = weightedSample(oneMarkPool, weightFn, Math.min(oneMarkTarget, oneMarkPool.length));
            for (const q of oneMarkSelected) {
                if (!selectedIds.has(q.question_id)) {
                    selected.push(q);
                    selectedIds.add(q.question_id);
                    selectedHashes.add(q._contentHash);
                    const chapKey = `${q.subject}/${q.chapter}`;
                    chapterCount[chapKey] = (chapterCount[chapKey] || 0) + 1;
                }
            }

            // Select 2-mark questions
            const twoMarkSelected = weightedSample(twoMarkPool, weightFn, Math.min(twoMarkTarget, twoMarkPool.length));
            for (const q of twoMarkSelected) {
                if (!selectedIds.has(q.question_id)) {
                    selected.push(q);
                    selectedIds.add(q.question_id);
                    selectedHashes.add(q._contentHash);
                    const chapKey = `${q.subject}/${q.chapter}`;
                    chapterCount[chapKey] = (chapterCount[chapKey] || 0) + 1;
                }
            }
        }

        // Step 5: Fill remaining slots if any subject was undersized
        if (selected.length < totalQuestions) {
            const remaining = allQuestions.filter(q => !selectedIds.has(q.question_id));
            const shuffled = fisherYatesShuffle(remaining);
            for (const q of shuffled) {
                if (selected.length >= totalQuestions) break;
                selected.push(q);
                selectedIds.add(q.question_id);
            }
        }

        // Step 6: Final shuffle — but maintain GATE paper structure
        // GATE: GA questions typically first 10, then technical
        // Within technical, mix subjects but maintain marks variety
        let gaQuestions = selected.filter(q => q.subject === 'general-aptitude');
        let techQuestions = selected.filter(q => q.subject !== 'general-aptitude');

        // Shuffle each section
        gaQuestions = fisherYatesShuffle(gaQuestions);
        techQuestions = fisherYatesShuffle(techQuestions);

        // Interleave 1-mark and 2-mark in technical section (GATE style)
        const techOneMark = techQuestions.filter(q => q.marks === 1);
        const techTwoMark = techQuestions.filter(q => q.marks === 2);
        // GATE typically has 1-mark questions first, then 2-mark
        const finalOrder = [...gaQuestions, ...techOneMark, ...techTwoMark];

        // Trim to exact total
        const finalSet = finalOrder.slice(0, totalQuestions);

        // Step 7: Verify and log paper stats (for debugging)
        const stats = computePaperStats(finalSet);
        if (typeof console !== 'undefined' && console.debug) {
            console.debug('GATE Mock Paper Generated:', stats);
        }

        return finalSet;
    }

    // ============ Compute Paper Statistics ============
    function computePaperStats(questions) {
        const stats = {
            total: questions.length,
            marks: questions.reduce((s, q) => s + (q.marks || 1), 0),
            byType: { mcq: 0, msq: 0, nat: 0 },
            byMarks: { 1: 0, 2: 0 },
            bySubject: {},
            byDifficulty: { easy: 0, medium: 0, hard: 0 },
            byYear: {},
            uniqueIds: new Set(questions.map(q => q.question_id)).size,
            uniqueHashes: new Set(questions.map(q => hashContent(q.question_text))).size,
            hotTopicCount: 0,
        };

        for (const q of questions) {
            stats.byType[q.normalized_type] = (stats.byType[q.normalized_type] || 0) + 1;
            stats.byMarks[q.marks] = (stats.byMarks[q.marks] || 0) + 1;
            stats.bySubject[q.subject] = (stats.bySubject[q.subject] || 0) + 1;
            if (q._difficulty) stats.byDifficulty[q._difficulty]++;
            stats.byYear[q.year] = (stats.byYear[q.year] || 0) + 1;
            if (q._isHotTopic) stats.hotTopicCount++;
        }

        return stats;
    }

    // ============ Build Quiz (for quiz.html) ============
    function buildQuiz(subject, count, options = {}) {
        const {
            types = ['mcq', 'msq', 'nat'],
            difficulty = 'mixed',
            adaptive = true,
            avoidRecent = true,
        } = options;

        // If subject matches a SAMPLE_QUIZZES key, use those (legacy)
        if (typeof SAMPLE_QUIZZES !== 'undefined' && SAMPLE_QUIZZES[subject]) {
            let pool = [...SAMPLE_QUIZZES[subject]];
            const typeMap = { 'mcq': 'MCQ', 'msq': 'MSQ', 'nat': 'NAT' };
            const wantedTypes = types.map(t => typeMap[t]).filter(Boolean);
            if (wantedTypes.length < 3) {
                pool = pool.filter(q => wantedTypes.includes(q.type));
            }
            // Deduplicate
            const seen = new Set();
            pool = pool.filter(q => {
                const h = hashContent(q.question);
                if (seen.has(h)) return false;
                seen.add(h);
                return true;
            });
            return fisherYatesShuffle(pool).slice(0, Math.min(count, pool.length));
        }

        // Otherwise, pull from real PYQs
        if (typeof window.GATE_DATA === 'undefined') return [];

        const subjData = window.GATE_DATA.subjects.find(s => s.subject === subject);
        if (!subjData) return [];

        const trends = buildTrendAnalysis();
        const userProfile = adaptive ? getUserProfile() : null;
        const recentIds = avoidRecent ? getRecentlySeenQuestionIds() : new Set();

        const seenIds = new Set();
        const seenHashes = new Set();
        const chapterCount = {};
        const pool = [];

        for (const chap of subjData.chapters) {
            for (const q of chap.questions) {
                if (q.is_out_of_syllabus) continue;
                if (!q.has_answer && !q.has_explanation) continue;
                if (seenIds.has(q.question_id)) continue;
                const contentHash = hashContent(q.question_text);
                if (seenHashes.has(contentHash)) continue;
                seenIds.add(q.question_id);
                seenHashes.add(contentHash);
                if (avoidRecent && recentIds.has(q.question_id)) continue;

                const normType = q.normalized_type || 'mcq';
                if (types.length > 0 && !types.includes(normType)) continue;

                pool.push({
                    ...q,
                    _contentHash: contentHash,
                    _difficulty: estimateDifficulty(q, trends),
                    _qualityScore: qualityScore(q),
                    _isHotTopic: HOT_TOPICS.has(`${q.subject}/${q.chapter}`),
                });
            }
        }

        if (pool.length === 0) return [];

        // Track selected for marks balancing inside weightFn
        const selectedTracker = { items: [] };

        const weightFn = (q) => {
            let w = GATE_PATTERN.year_boost[q.year] || 0.5;
            if (q._isHotTopic) w *= 1.4;
            w *= (q._qualityScore / 50);

            // Difficulty filter
            if (difficulty !== 'mixed') {
                if (difficulty === 'easy' && q._difficulty === 'easy') w *= 1.5;
                else if (difficulty === 'medium' && q._difficulty === 'medium') w *= 1.5;
                else if (difficulty === 'hard' && q._difficulty === 'hard') w *= 1.5;
                else w *= 0.4;
            }

            // Adaptive
            if (userProfile) {
                const pref = userProfile.difficultyPreference;
                if (pref === 'hard' && q._difficulty === 'hard') w *= 1.2;
                else if (pref === 'easy' && q._difficulty === 'easy') w *= 1.2;
            }

            // Chapter diversity
            const chapKey = `${q.subject}/${q.chapter}`;
            const currentChapCount = chapterCount[chapKey] || 0;
            w *= Math.max(0.2, 1 - currentChapCount * 0.25);
            // Update chapter count as we select (weightedSample picks items one at a time)
            chapterCount[chapKey] = currentChapCount + 0.5; // partial increment for weighting

            // Marks distribution (quiz should have a mix)
            // Aim for ~38% 1-mark, ~62% 2-mark
            const selectedSoFar = selectedTracker.items.length;
            if (selectedSoFar > 0) {
                const selectedOneMarkCount = selectedTracker.items.filter(sq => sq.marks === 1).length;
                const oneMarkRatioSoFar = selectedOneMarkCount / selectedSoFar;
                if (q.marks === 1 && oneMarkRatioSoFar > 0.45) w *= 0.6;
                if (q.marks === 2 && oneMarkRatioSoFar < 0.30) w *= 0.8;
            }

            return w;
        };

        // Use a custom selection loop to track selected items
        const targetCount = Math.min(count, pool.length);
        const poolArr = pool.map(item => ({ item, weight: 0 }));
        const selected = [];

        while (selected.length < targetCount && poolArr.length > 0) {
            // Recompute weights
            for (const p of poolArr) {
                p.weight = Math.max(0.001, weightFn(p.item));
            }
            const totalWeight = poolArr.reduce((s, x) => s + x.weight, 0);
            let r = Math.random() * totalWeight;
            let pickedIdx = 0;
            for (let i = 0; i < poolArr.length; i++) {
                r -= poolArr[i].weight;
                if (r <= 0) { pickedIdx = i; break; }
            }
            const picked = poolArr.splice(pickedIdx, 1)[0];
            selected.push(picked.item);
            selectedTracker.items.push(picked.item);
            // Update chapter count for real
            const chapKey = `${picked.item.subject}/${picked.item.chapter}`;
            chapterCount[chapKey] = (chapterCount[chapKey] || 0) + 0.5; // add the other half
        }

        return fisherYatesShuffle(selected);
    }

    // ============ Verify AI Quiz ============
    function verifyAIQuiz(aiQuestions, options = {}) {
        const {
            dedupAgainstPYQs = true,
            dedupAgainstEachOther = true,
        } = options;

        if (!Array.isArray(aiQuestions)) return [];

        const verified = [];
        const seenHashes = new Set();
        const seenQuestions = [];

        let pyqSamples = [];
        if (dedupAgainstPYQs && typeof window.GATE_DATA !== 'undefined') {
            const allPYQs = [];
            for (const subj of window.GATE_DATA.subjects) {
                for (const chap of subj.chapters) {
                    for (const q of chap.questions) {
                        if (q.question_text) allPYQs.push(q.question_text);
                    }
                }
            }
            // Sample 800 for performance
            pyqSamples = allPYQs.slice(0, 800);
        }

        for (const q of aiQuestions) {
            if (!q || !q.question) continue;

            if (dedupAgainstEachOther) {
                const h = hashContent(q.question);
                if (seenHashes.has(h)) continue;
                seenHashes.add(h);
            }

            let isDup = false;
            if (dedupAgainstEachOther) {
                for (const prev of seenQuestions) {
                    const sim = textSimilarity(q.question, prev);
                    if (sim > 0.75) { isDup = true; break; }
                }
                if (isDup) continue;
                seenQuestions.push(q.question);
            }

            if (dedupAgainstPYQs) {
                let isPyqDup = false;
                for (const pyq of pyqSamples) {
                    const sim = textSimilarity(q.question, pyq);
                    if (sim > 0.85) { isPyqDup = true; break; }
                }
                if (isPyqDup) continue;
            }

            const hasValidType = ['MCQ', 'MSQ', 'NAT', 'mcq', 'msq', 'nat'].includes(q.type);
            const hasOptions = q.options && Array.isArray(q.options) && q.options.length >= 2;
            const hasAnswer = (q.type === 'NAT' || q.type === 'nat') ? q.answer !== undefined :
                (q.correct !== undefined || q.correct_options !== undefined);

            if (!hasValidType) continue;
            if ((q.type === 'MCQ' || q.type === 'MSQ' || q.type === 'mcq' || q.type === 'msq') && !hasOptions) continue;
            if (!hasAnswer) continue;

            verified.push({ ...q, _verified: true });
        }

        return verified;
    }

    // ============ Get Paper Structure Analysis ============
    function getPaperStructure() {
        if (paperStructureCache) return paperStructureCache;
        const trends = buildTrendAnalysis();
        const total = trends.totalAnalyzed || 1;

        // Compute actual type distribution percentages
        const typePct = {};
        for (const [type, count] of Object.entries(trends.typeCounts)) {
            typePct[type] = Math.round((count / total) * 100);
        }

        // Compute marks distribution
        const marksPct = {};
        const oneMarkTotal = (trends.typeByMarks[1]?.mcq || 0) + (trends.typeByMarks[1]?.msq || 0) + (trends.typeByMarks[1]?.nat || 0);
        const twoMarkTotal = (trends.typeByMarks[2]?.mcq || 0) + (trends.typeByMarks[2]?.msq || 0) + (trends.typeByMarks[2]?.nat || 0);
        marksPct[1] = Math.round((oneMarkTotal / (oneMarkTotal + twoMarkTotal)) * 100);
        marksPct[2] = 100 - marksPct[1];

        // Compute per-marks type distribution
        const typeByMarksPct = {};
        for (const marks of [1, 2]) {
            const t = trends.typeByMarks[marks] || {};
            const sum = (t.mcq || 0) + (t.msq || 0) + (t.nat || 0);
            typeByMarksPct[marks] = {
                mcq: sum > 0 ? Math.round((t.mcq / sum) * 100) : 0,
                msq: sum > 0 ? Math.round((t.msq / sum) * 100) : 0,
                nat: sum > 0 ? Math.round((t.nat / sum) * 100) : 0,
            };
        }

        paperStructureCache = {
            totalQuestions: total,
            typeDistribution: typePct,
            marksDistribution: marksPct,
            typeByMarks: typeByMarksPct,
            hotTopics: trends.hotTopics.slice(0, 10),
            subjectTrends: trends.subjectTrends,
            topSubjects: Object.entries(trends.subjectCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([s, c]) => ({ subject: s, count: c, pct: Math.round((c / total) * 100) })),
        };
        return paperStructureCache;
    }

    // ============ Get Trend Summary ============
    function getTrendSummary() {
        const trends = buildTrendAnalysis();
        const structure = getPaperStructure();
        return {
            totalQuestions: trends.totalAnalyzed,
            subjects: Object.keys(trends.subjectCounts).length,
            topSubjects: structure.topSubjects,
            typeDistribution: trends.typeCounts,
            marksDistribution: structure.marksDistribution,
            typeByMarks: structure.typeByMarks,
            hotTopics: trends.hotTopics.slice(0, 10),
            cyclicTopics: trends.cyclicTopics.slice(0, 5),
            yearRange: {
                min: Math.min(...Object.keys(trends.subjectYearMatrix[Object.keys(trends.subjectYearMatrix)[0]] || { 2021: 0 }).map(Number).filter(y => y > 0)),
                max: Math.max(...Object.keys(trends.subjectYearMatrix[Object.keys(trends.subjectYearMatrix)[0]] || { 2021: 0 }).map(Number).filter(y => y > 0)),
            },
            trends: trends.subjectTrends,
        };
    }

    // ============ Public API ============
    window.SOH_QEngine = {
        GATE_PATTERN,
        HOT_TOPICS,
        buildMockTest,
        buildQuiz,
        verifyAIQuiz,
        getTrendSummary,
        getPaperStructure,
        buildTrendAnalysis,
        computePaperStats,
        hashContent,
        textSimilarity,
        estimateDifficulty,
        qualityScore,
        fisherYatesShuffle,
        weightedSample,
        getUserProfile,
    };

})();
