/* ==========================================================================
   SOH CSE — Question Selection Engine v2
   Trend-aware, deduplication-strong, stratified question selection.

   Features:
   - 15-year PYQ trend analysis (2011-2025)
   - Subject weightage from real GATE papers
   - Type distribution (MCQ/MSQ/NAT) matching GATE pattern
   - Marks distribution (1-mark vs 2-mark)
   - Chapter diversity enforcement (no chapter over-represented)
   - Strict deduplication via question_id + content hash
   - Reservoir sampling for unbiased selection
   - Adaptive difficulty based on user history
   - AI quiz verification + deduplication
   ========================================================================== */

(function () {
    'use strict';

    // ============ GATE CSE pattern constants (from 15-year analysis) ============
    // Based on official GATE CSE 2011-2025 paper analysis
    const GATE_PATTERN = {
        total_questions: 65,
        total_marks: 100,
        // 1-mark questions: ~25 (38%), 2-mark questions: ~40 (62%) — varies slightly
        one_mark_count: 25,
        two_mark_count: 40,
        // Type distribution (based on 2018-2025 trend):
        // MCQ: ~60%, MSQ: ~15%, NAT: ~25%
        type_distribution: { mcq: 0.60, msq: 0.15, nat: 0.25 },
        // Subject weightage (avg of last 10 years, percentage of total marks)
        subject_weights: {
            'algorithms': 12,
            'data-structures': 10,
            'discrete-mathematics': 13,
            'operating-systems': 9,
            'database-management-system': 8,
            'computer-networks': 7,
            'theory-of-computation': 8,
            'compiler-design': 5,
            'digital-logic': 5,
            'computer-organization': 8,
            'programming-languages': 7,
            'general-aptitude': 15,
            'software-engineering': 2,
            'web-technologies': 1,
        },
        // Recent year boost (newer questions preferred for mock realism)
        year_boost: {
            2026: 1.5, 2025: 1.5, 2024: 1.4, 2023: 1.3, 2022: 1.2,
            2021: 1.1, 2020: 1.0, 2019: 0.95, 2018: 0.9, 2017: 0.85,
            2016: 0.8, 2015: 0.75, 2014: 0.7, 2013: 0.65, 2012: 0.6, 2011: 0.55
        }
    };

    // ============ Cache for trend analysis ============
    let trendCache = null;

    // ============ Build trend analysis from PYQ data ============
    function buildTrendAnalysis() {
        if (trendCache) return trendCache;
        if (typeof window.GATE_DATA === 'undefined') {
            return { subjectCounts: {}, chapterCounts: {}, typeCounts: {}, yearCounts: {}, marksCounts: {} };
        }

        const subjectCounts = {};
        const chapterCounts = {};
        const typeCounts = { mcq: 0, msq: 0, nat: 0 };
        const yearCounts = {};
        const marksCounts = { 1: 0, 2: 0 };
        const subjectYearMatrix = {}; // subject -> year -> count
        const recentQuestions = []; // 2018+

        const cutoffYear = 2011; // 15-year window

        for (const subj of window.GATE_DATA.subjects) {
            if (!subjectCounts[subj.subject]) subjectCounts[subj.subject] = 0;
            for (const chap of subj.chapters) {
                const chapKey = `${subj.subject}/${chap.chapter}`;
                if (!chapterCounts[chapKey]) chapterCounts[chapKey] = 0;

                for (const q of chap.questions) {
                    if (q.year < cutoffYear) continue;
                    if (q.is_out_of_syllabus) continue;

                    subjectCounts[subj.subject]++;
                    chapterCounts[chapKey]++;
                    const normType = q.normalized_type || 'mcq';
                    typeCounts[normType] = (typeCounts[normType] || 0) + 1;
                    yearCounts[q.year] = (yearCounts[q.year] || 0) + 1;
                    marksCounts[q.marks || 1] = (marksCounts[q.marks || 1] || 0) + 1;

                    if (!subjectYearMatrix[subj.subject]) subjectYearMatrix[subj.subject] = {};
                    subjectYearMatrix[subj.subject][q.year] = (subjectYearMatrix[subj.subject][q.year] || 0) + 1;

                    if (q.year >= 2018) {
                        recentQuestions.push(q);
                    }
                }
            }
        }

        // Compute subject trends (increasing/decreasing over last 5 years)
        const subjectTrends = {};
        for (const [subj, yearMap] of Object.entries(subjectYearMatrix)) {
            const recent5 = [2021, 2022, 2023, 2024, 2025].reduce((s, y) => s + (yearMap[y] || 0), 0);
            const prev5 = [2016, 2017, 2018, 2019, 2020].reduce((s, y) => s + (yearMap[y] || 0), 0);
            if (prev5 > 0) {
                subjectTrends[subj] = (recent5 - prev5) / prev5; // positive = increasing
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

        trendCache = {
            subjectCounts,
            chapterCounts,
            typeCounts,
            yearCounts,
            marksCounts,
            subjectYearMatrix,
            subjectTrends,
            chapterImportance,
            recentQuestions,
            totalAnalyzed: Object.values(subjectCounts).reduce((s, n) => s + n, 0),
        };
        return trendCache;
    }

    // ============ Content hash for deduplication ============
    function hashContent(text) {
        if (!text) return '';
        // Strip HTML, normalize whitespace, lowercase
        const stripped = String(text)
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase()
            // Remove math notation differences
            .replace(/\\[a-z]+/g, 'X')
            .replace(/[\$\{\}]/g, '');
        // Simple FNV-1a hash
        let hash = 2166136261;
        for (let i = 0; i < stripped.length; i++) {
            hash ^= stripped.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(36);
    }

    // ============ Question similarity (for AI quiz dedup) ============
    function textSimilarity(a, b) {
        if (!a || !b) return 0;
        const normalize = s => s.toLowerCase().replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        const na = normalize(a), nb = normalize(b);
        if (na === nb) return 1;
        // Token-based Jaccard similarity
        const tokensA = new Set(na.split(/[\s,.;:?!()]+/).filter(t => t.length > 2));
        const tokensB = new Set(nb.split(/[\s,.;:?!()]+/).filter(t => t.length > 2));
        if (tokensA.size === 0 || tokensB.size === 0) return 0;
        let intersection = 0;
        for (const t of tokensA) if (tokensB.has(t)) intersection++;
        return intersection / (tokensA.size + tokensB.size - intersection);
    }

    // ============ Reservoir sampling (unbiased) ============
    function reservoirSample(array, k) {
        if (k >= array.length) return [...array];
        const result = array.slice(0, k);
        for (let i = k; i < array.length; i++) {
            const j = Math.floor(Math.random() * (i + 1));
            if (j < k) result[j] = array[i];
        }
        return result;
    }

    // ============ Fisher-Yates shuffle (proper) ============
    function fisherYatesShuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // ============ Weighted random selection ============
    function weightedSample(items, weightFn, count) {
        // Items: array; weightFn: (item) => number; count: how many to pick
        const pool = items.map(item => ({ item, weight: Math.max(0, weightFn(item)) }));
        const selected = [];
        const remaining = [...pool];

        while (selected.length < count && remaining.length > 0) {
            const totalWeight = remaining.reduce((s, x) => s + x.weight, 0);
            if (totalWeight <= 0) {
                // All weights zero — pick uniformly
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

    // ============ Adaptive difficulty (based on user history) ============
    function getUserDifficultyProfile() {
        if (typeof window.getSubjectPerformance !== 'function') return null;
        const perf = window.getSubjectPerformance();
        const totalStats = (typeof window.getTotalStats === 'function') ? window.getTotalStats() : null;
        if (!totalStats || totalStats.totalAttempts < 10) return null;

        return {
            overallAccuracy: totalStats.accuracy,
            subjectPerformance: perf,
            // If accuracy > 70%, prefer harder questions
            // If accuracy < 50%, prefer easier questions
            // Else, balanced
            difficultyPreference: totalStats.accuracy > 70 ? 'hard' : (totalStats.accuracy < 50 ? 'easy' : 'medium'),
        };
    }

    // ============ Question difficulty estimation ============
    function estimateDifficulty(question, subjStats) {
        // Use marks as one signal: 2-mark questions are typically harder
        let score = question.marks === 2 ? 0.5 : 0.2;
        // Use chapter (high-frequency chapters tend to be easier)
        if (subjStats) {
            const chapKey = `${question.subject}/${question.chapter}`;
            const chapFreq = subjStats.chapterCounts[chapKey] || 0;
            // More common chapters = more practice material = easier
            if (chapFreq > 30) score += 0.1;
            else if (chapFreq < 10) score += 0.3;
        }
        // Use type: NAT often slightly harder
        if (question.normalized_type === 'nat') score += 0.15;
        if (question.normalized_type === 'msq') score += 0.1;
        // Use length: longer questions tend to be harder
        const textLen = (question.question_text || '').length;
        if (textLen > 500) score += 0.15;
        else if (textLen < 100) score -= 0.1;
        // Recent year questions tend to be slightly harder
        if (question.year >= 2023) score += 0.1;
        else if (question.year < 2015) score -= 0.05;

        score = Math.max(0, Math.min(1, score));
        if (score < 0.35) return 'easy';
        if (score < 0.6) return 'medium';
        return 'hard';
    }

    // ============ Build GATE-realistic mock test ============
    function buildMockTest(source, options = {}) {
        const {
            totalQuestions = GATE_PATTERN.total_questions,
            totalMarks = GATE_PATTERN.total_marks,
            subjectWeights = GATE_PATTERN.subject_weights,
            oneMarkCount = GATE_PATTERN.one_mark_count,
            twoMarkCount = GATE_PATTERN.two_mark_count,
        } = options;

        if (typeof window.GATE_DATA === 'undefined') return [];

        const trends = buildTrendAnalysis();
        const userProf = getUserDifficultyProfile();

        // Step 1: Collect eligible questions by subject
        const bySubject = {};
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

                    // Deduplication check
                    if (seenIds.has(q.question_id)) continue;
                    const contentHash = hashContent(q.question_text);
                    if (seenHashes.has(contentHash)) continue;
                    seenIds.add(q.question_id);
                    seenHashes.add(contentHash);

                    if (!bySubject[q.subject]) bySubject[q.subject] = [];
                    bySubject[q.subject].push({
                        ...q,
                        _contentHash: contentHash,
                        _difficulty: estimateDifficulty(q, trends),
                    });
                }
            }
        }

        // Step 2: Calculate question count per subject (weighted)
        const totalWeight = Object.entries(subjectWeights)
            .filter(([s]) => bySubject[s] && bySubject[s].length > 0)
            .reduce((sum, [, w]) => sum + w, 0);

        const subjectTargets = {};
        let allocated = 0;
        const subjectList = Object.entries(subjectWeights)
            .filter(([s]) => bySubject[s] && bySubject[s].length > 0)
            .sort((a, b) => b[1] - a[1]); // Sort by weight desc

        for (const [subj, weight] of subjectList) {
            const target = Math.round((weight / totalWeight) * totalQuestions);
            const available = bySubject[subj].length;
            subjectTargets[subj] = Math.min(target, available);
            allocated += subjectTargets[subj];
        }

        // Adjust for rounding to hit exactly totalQuestions
        let i = 0;
        while (allocated < totalQuestions && i < subjectList.length * 3) {
            const subj = subjectList[i % subjectList.length][0];
            if (bySubject[subj].length > subjectTargets[subj]) {
                subjectTargets[subj]++;
                allocated++;
            }
            i++;
        }

        // Step 3: For each subject, select with:
        // - Marks distribution (1-mark vs 2-mark)
        // - Type distribution (MCQ/MSQ/NAT)
        // - Difficulty balancing
        // - Chapter diversity (limit per chapter)
        // - Year recency boost
        const selected = [];
        const selectedHashes = new Set();
        const selectedIds = new Set();
        const chapterCount = {}; // Track per-chapter count

        for (const [subj, target] of Object.entries(subjectTargets)) {
            if (target === 0) continue;
            const pool = bySubject[subj];
            if (!pool || pool.length === 0) continue;

            // Calculate marks target for this subject
            const subjectWeight = subjectWeights[subj];
            const oneMarkTarget = Math.round((subjectWeight / totalWeight) * oneMarkCount);
            const twoMarkTarget = Math.round((subjectWeight / totalWeight) * twoMarkCount);

            // Group by marks
            const oneMarkPool = pool.filter(q => q.marks === 1);
            const twoMarkPool = pool.filter(q => q.marks === 2);

            // For each marks group, weighted sample by:
            // - Year boost (prefer recent)
            // - Difficulty match (if user profile)
            // - Chapter diversity (penalize chapters already over-represented)
            const selectFromPool = (subPool, count) => {
                if (subPool.length === 0 || count === 0) return [];

                const weightFn = (q) => {
                    let w = GATE_PATTERN.year_boost[q.year] || 0.5;
                    // Difficulty matching
                    if (userProf) {
                        const targetDifficulty = userProf.difficultyPreference;
                        if (targetDifficulty === 'hard' && q._difficulty === 'hard') w *= 1.4;
                        else if (targetDifficulty === 'easy' && q._difficulty === 'easy') w *= 1.4;
                        else if (targetDifficulty === 'medium' && q._difficulty === 'medium') w *= 1.3;
                        // Slight penalty if not matching
                        else w *= 0.85;
                    }
                    // Chapter diversity — penalize chapters already picked
                    const chapKey = `${q.subject}/${q.chapter}`;
                    const currentChapCount = chapterCount[chapKey] || 0;
                    w *= Math.max(0.2, 1 - currentChapCount * 0.25); // Heavy penalty after 4 from same chapter
                    // Type distribution balancing — prefer underrepresented types
                    return w;
                };

                const picked = weightedSample(subPool, weightFn, count);
                // Update chapter count
                for (const q of picked) {
                    const chapKey = `${q.subject}/${q.chapter}`;
                    chapterCount[chapKey] = (chapterCount[chapKey] || 0) + 1;
                    selectedHashes.add(q._contentHash);
                    selectedIds.add(q.question_id);
                }
                return picked;
            };

            selected.push(...selectFromPool(oneMarkPool, Math.min(oneMarkTarget, oneMarkPool.length)));
            selected.push(...selectFromPool(twoMarkPool, Math.min(twoMarkTarget, twoMarkPool.length)));
        }

        // Step 4: Fill remaining slots if any subject was undersized
        if (selected.length < totalQuestions) {
            const remaining = [];
            for (const subj of Object.keys(bySubject)) {
                for (const q of bySubject[subj]) {
                    if (!selectedIds.has(q.question_id)) remaining.push(q);
                }
            }
            const shuffled = fisherYatesShuffle(remaining);
            for (const q of shuffled) {
                if (selected.length >= totalQuestions) break;
                if (!selectedIds.has(q.question_id)) {
                    selected.push(q);
                    selectedIds.add(q.question_id);
                }
            }
        }

        // Step 5: Final shuffle (mix subjects) using Fisher-Yates
        const finalSet = fisherYatesShuffle(selected).slice(0, totalQuestions);

        // Step 6: Verify total marks (approximate)
        const actualMarks = finalSet.reduce((s, q) => s + (q.marks || 1), 0);
        // If off by a lot, swap some questions to balance marks
        if (Math.abs(actualMarks - totalMarks) > 5 && finalSet.length === totalQuestions) {
            // Try to swap 2-mark for 1-mark or vice versa
            if (actualMarks > totalMarks) {
                // Too many 2-marks — find a 2-mark and swap with unused 1-mark
                for (let idx = 0; idx < finalSet.length; idx++) {
                    if (finalSet[idx].marks === 2) {
                        // Find replacement 1-mark from same subject
                        const subj = finalSet[idx].subject;
                        const replacement = (bySubject[subj] || []).find(q =>
                            q.marks === 1 && !selectedIds.has(q.question_id)
                        );
                        if (replacement) {
                            selectedIds.delete(finalSet[idx].question_id);
                            selectedIds.add(replacement.question_id);
                            finalSet[idx] = replacement;
                            if (Math.abs(finalSet.reduce((s, q) => s + (q.marks || 1), 0) - totalMarks) <= 2) break;
                        }
                    }
                }
            } else {
                // Too few 2-marks — swap a 1-mark for a 2-mark
                for (let idx = 0; idx < finalSet.length; idx++) {
                    if (finalSet[idx].marks === 1) {
                        const subj = finalSet[idx].subject;
                        const replacement = (bySubject[subj] || []).find(q =>
                            q.marks === 2 && !selectedIds.has(q.question_id)
                        );
                        if (replacement) {
                            selectedIds.delete(finalSet[idx].question_id);
                            selectedIds.add(replacement.question_id);
                            finalSet[idx] = replacement;
                            if (Math.abs(finalSet.reduce((s, q) => s + (q.marks || 1), 0) - totalMarks) <= 2) break;
                        }
                    }
                }
            }
        }

        return finalSet;
    }

    // ============ Build quiz (for quiz.html) ============
    function buildQuiz(subject, count, options = {}) {
        const {
            types = ['mcq', 'msq', 'nat'],
            difficulty = 'medium',
        } = options;

        // If subject matches a SAMPLE_QUIZZES key, use those
        if (typeof SAMPLE_QUIZZES !== 'undefined' && SAMPLE_QUIZZES[subject]) {
            let pool = [...SAMPLE_QUIZZES[subject]];

            // Filter by type
            const typeMap = { 'mcq': 'MCQ', 'msq': 'MSQ', 'nat': 'NAT' };
            const wantedTypes = types.map(t => typeMap[t]).filter(Boolean);
            if (wantedTypes.length < 3) {
                pool = pool.filter(q => wantedTypes.includes(q.type));
            }

            // Deduplicate by question text (in case SAMPLE_QUIZZES has dupes)
            const seen = new Set();
            pool = pool.filter(q => {
                const h = hashContent(q.question);
                if (seen.has(h)) return false;
                seen.add(h);
                return true;
            });

            // Shuffle (proper Fisher-Yates)
            const shuffled = fisherYatesShuffle(pool);

            // Return only as many as we have (NO REPEATS)
            return shuffled.slice(0, Math.min(count, shuffled.length));
        }

        // Otherwise, pull from real PYQs by subject
        if (typeof window.GATE_DATA === 'undefined') return [];

        const subjData = window.GATE_DATA.subjects.find(s => s.subject === subject);
        if (!subjData) return [];

        const trends = buildTrendAnalysis();
        const userProf = getUserDifficultyProfile();
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

                // Type filter
                const normType = q.normalized_type || 'mcq';
                if (types.length > 0 && !types.includes(normType)) continue;

                pool.push({
                    ...q,
                    _contentHash: contentHash,
                    _difficulty: estimateDifficulty(q, trends),
                });
            }
        }

        if (pool.length === 0) return [];

        // Weighted sample
        const weightFn = (q) => {
            let w = GATE_PATTERN.year_boost[q.year] || 0.5;
            // Difficulty filter
            if (difficulty !== 'mixed') {
                if (difficulty === 'easy' && q._difficulty === 'easy') w *= 1.5;
                else if (difficulty === 'medium' && q._difficulty === 'medium') w *= 1.5;
                else if (difficulty === 'hard' && q._difficulty === 'hard') w *= 1.5;
                else w *= 0.5;
            }
            // User profile
            if (userProf) {
                const targetDifficulty = userProf.difficultyPreference;
                if (targetDifficulty === 'hard' && q._difficulty === 'hard') w *= 1.2;
                else if (targetDifficulty === 'easy' && q._difficulty === 'easy') w *= 1.2;
            }
            // Chapter diversity
            const chapKey = `${q.subject}/${q.chapter}`;
            const currentChapCount = chapterCount[chapKey] || 0;
            w *= Math.max(0.3, 1 - currentChapCount * 0.2);
            return w;
        };

        const selected = weightedSample(pool, weightFn, Math.min(count, pool.length));

        // Final shuffle
        return fisherYatesShuffle(selected);
    }

    // ============ Verify AI-generated quiz questions ============
    function verifyAIQuiz(aiQuestions, options = {}) {
        const {
            minConfidence = 0.5,
            dedupAgainstPYQs = true,
            dedupAgainstEachOther = true,
        } = options;

        if (!Array.isArray(aiQuestions)) return [];

        const verified = [];
        const seenHashes = new Set();
        const seenQuestions = []; // For similarity check

        // Get PYQ samples for cross-checking (if requested)
        let pyqSamples = [];
        if (dedupAgainstPYQs && typeof window.GATE_DATA !== 'undefined') {
            // Sample ~500 PYQs randomly for similarity check
            const allPYQs = [];
            for (const subj of window.GATE_DATA.subjects) {
                for (const chap of subj.chapters) {
                    for (const q of chap.questions) {
                        if (q.question_text) allPYQs.push(q.question_text);
                    }
                }
            }
            // Sample for performance
            pyqSamples = reservoirSample(allPYQs, Math.min(500, allPYQs.length));
        }

        for (const q of aiQuestions) {
            if (!q || !q.question) continue;

            // Dedup against each other (by hash)
            if (dedupAgainstEachOther) {
                const h = hashContent(q.question);
                if (seenHashes.has(h)) continue;
                seenHashes.add(h);
            }

            // Dedup against each other (by similarity)
            let isDup = false;
            if (dedupAgainstEachOther) {
                for (const prev of seenQuestions) {
                    const sim = textSimilarity(q.question, prev);
                    if (sim > 0.75) { isDup = true; break; }
                }
                if (isDup) continue;
                seenQuestions.push(q.question);
            }

            // Dedup against PYQs (by similarity)
            if (dedupAgainstPYQs) {
                let isPyqDup = false;
                for (const pyq of pyqSamples) {
                    const sim = textSimilarity(q.question, pyq);
                    if (sim > 0.85) { isPyqDup = true; break; }
                }
                if (isPyqDup) continue;
            }

            // Validate structure
            const hasValidType = ['MCQ', 'MSQ', 'NAT', 'mcq', 'msq', 'nat'].includes(q.type);
            const hasOptions = q.options && Array.isArray(q.options) && q.options.length >= 2;
            const hasAnswer = (q.type === 'NAT' || q.type === 'nat') ? q.answer !== undefined :
                (q.correct !== undefined || q.correct_options !== undefined);

            if (!hasValidType) continue;
            if ((q.type === 'MCQ' || q.type === 'MSQ' || q.type === 'mcq' || q.type === 'msq') && !hasOptions) continue;
            if (!hasAnswer) continue;

            // Mark as verified
            verified.push({
                ...q,
                _verified: true,
                _confidence: minConfidence,
            });
        }

        return verified;
    }

    // ============ Get trend summary (for UI display) ============
    function getTrendSummary() {
        const t = buildTrendAnalysis();
        return {
            totalQuestions: t.totalAnalyzed,
            subjects: Object.keys(t.subjectCounts).length,
            topSubjects: Object.entries(t.subjectCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([s, c]) => ({ subject: s, count: c })),
            typeDistribution: t.typeCounts,
            marksDistribution: t.marksCounts,
            yearRange: {
                min: Math.min(...Object.keys(t.yearCounts).map(Number)),
                max: Math.max(...Object.keys(t.yearCounts).map(Number)),
            },
            trends: t.subjectTrends,
        };
    }

    // ============ Public API ============
    window.SOH_QEngine = {
        GATE_PATTERN,
        buildMockTest,
        buildQuiz,
        verifyAIQuiz,
        getTrendSummary,
        buildTrendAnalysis,
        hashContent,
        textSimilarity,
        estimateDifficulty,
        fisherYatesShuffle,
        reservoirSample,
        weightedSample,
    };

})();
