// Comprehensive v4 verification test
global.window = {};
global.localStorage = {
    _data: {}, getItem: function(k) { return this._data[k] || null; },
    setItem: function(k, v) { this._data[k] = v; }, removeItem: function(k) { delete this._data[k]; },
};
console.log('Loading real PYQ data...');
const fs = require('fs');
eval(fs.readFileSync('./gate_cse_data.js', 'utf8'));
global.window.getTotalStats = function() { return { totalAttempts: 0, accuracy: 0 }; };
global.window.getSubjectPerformance = function() { return {}; };
eval(fs.readFileSync('./gate-engine.js', 'utf8'));

console.log(`Loaded ${global.window.GATE_DATA.total_questions} questions\n`);
console.log('=== GATE Engine v4 Verification ===\n');

// Test 1: Build mock test and verify structure
const mock = global.window.SOH_QEngine.buildMockTest('mixed', { totalQuestions: 65, totalMarks: 100 });
const stats = global.window.SOH_QEngine.computePaperStats(mock);
const realism = global.window.SOH_QEngine.computeRealismScore(mock);

console.log('Test 1: Paper Structure');
console.log(`  Total questions: ${stats.total} (target: 65) ${stats.total === 65 ? '✅' : '❌'}`);
console.log(`  Total marks: ${stats.marks} (target: 100) ${stats.marks === 100 ? '✅' : '❌'}`);
console.log(`  GA section: ${stats.sectionBreakdown.ga} Qs, ${stats.gaMarks} marks (target: 10 Qs, 15 marks) ${stats.sectionBreakdown.ga === 10 && stats.gaMarks === 15 ? '✅' : '❌'}`);
console.log(`  Tech 1-mark: ${stats.sectionBreakdown.tech1m} Qs, ${stats.tech1mMarks} marks (target: 25 Qs, 25 marks) ${stats.sectionBreakdown.tech1m === 25 && stats.tech1mMarks === 25 ? '✅' : '❌'}`);
console.log(`  Tech 2-mark: ${stats.sectionBreakdown.tech2m} Qs, ${stats.tech2mMarks} marks (target: 30 Qs, 60 marks) ${stats.sectionBreakdown.tech2m === 30 && stats.tech2mMarks === 60 ? '✅' : '❌'}`);

console.log('\nTest 2: Uniqueness');
console.log(`  Unique IDs: ${stats.uniqueIds}/${stats.total} ${stats.uniqueIds === stats.total ? '✅' : '❌'}`);
console.log(`  Unique Hashes: ${stats.uniqueHashes}/${stats.total} ${stats.uniqueHashes === stats.total ? '✅' : '❌'}`);

console.log('\nTest 3: Type Distribution');
const mcqPct = Math.round((stats.byType.mcq / stats.total) * 100);
const msqPct = Math.round((stats.byType.msq / stats.total) * 100);
const natPct = Math.round((stats.byType.nat / stats.total) * 100);
console.log(`  MCQ: ${mcqPct}% (target: ~52%)`);
console.log(`  MSQ: ${msqPct}% (target: ~16%)`);
console.log(`  NAT: ${natPct}% (target: ~32%)`);

console.log('\nTest 4: Subject Weightage');
const subjMarks = {};
for (const q of mock) {
    if (!subjMarks[q.subject]) subjMarks[q.subject] = { marks: 0, count: 0 };
    subjMarks[q.subject].marks += q.marks;
    subjMarks[q.subject].count++;
}
const official = global.window.SOH_QEngine.GATE_PATTERN.subject_marks;
let weightageMatch = 0;
for (const [subj, target] of Object.entries(official)) {
    if (target === 0) continue;
    const actual = subjMarks[subj]?.marks || 0;
    const match = actual === target;
    if (match) weightageMatch++;
    console.log(`  ${subj.padEnd(40)} target: ${target}, got: ${actual} ${match ? '✅' : '⚠️'}`);
}
console.log(`  Weightage match: ${weightageMatch}/12 subjects`);

console.log('\nTest 5: Difficulty Distribution');
const easyPct = Math.round((stats.byDifficulty.easy / stats.total) * 100);
const medPct = Math.round((stats.byDifficulty.medium / stats.total) * 100);
const hardPct = Math.round((stats.byDifficulty.hard / stats.total) * 100);
console.log(`  Easy: ${easyPct}% (target: ~30%)`);
console.log(`  Medium: ${medPct}% (target: ~50%)`);
console.log(`  Hard: ${hardPct}% (target: ~20%)`);

console.log('\nTest 6: Topic-Level Weightage (new in v4)');
// Check if high-weight topics are represented
const topicWeights = global.window.SOH_QEngine.GATE_PATTERN.topic_weights;
let topicCoverage = 0;
let topicTotal = 0;
for (const [subj, topics] of Object.entries(topicWeights)) {
    for (const [chap, weight] of Object.entries(topics)) {
        if (weight >= 0.20) { // Only check top topics (>= 20% weight)
            topicTotal++;
            const hasQ = mock.some(q => q.subject === subj && q.chapter === chap);
            if (hasQ) topicCoverage++;
        }
    }
}
console.log(`  High-weight topic coverage: ${topicCoverage}/${topicTotal}`);

console.log('\nTest 7: Concept Clustering (new in v4)');
// Verify no two questions share >50% concept overlap
const concepts = mock.map(q => q._concepts || new Set()).filter(c => c.size > 0);
let conceptDups = 0;
for (let i = 0; i < concepts.length; i++) {
    for (let j = i + 1; j < concepts.length; j++) {
        const overlap = global.window.SOH_QEngine.conceptOverlap(concepts[i], concepts[j]);
        if (overlap > 0.7) conceptDups++;
    }
}
console.log(`  Concept duplicates (>70% overlap): ${conceptDups} (target: 0) ${conceptDups === 0 ? '✅' : '⚠️'}`);

console.log('\nTest 8: GA Type Enforcement (new in v4)');
const gaQs = mock.filter(q => q.subject === 'general-aptitude');
const gaMcq = gaQs.filter(q => q.normalized_type === 'mcq').length;
const gaMsq = gaQs.filter(q => q.normalized_type === 'msq').length;
const gaNat = gaQs.filter(q => q.normalized_type === 'nat').length;
console.log(`  GA MCQ: ${gaMcq} (should be 10) ${gaMcq === 10 ? '✅' : '❌'}`);
console.log(`  GA MSQ: ${gaMsq} (should be 0) ${gaMsq === 0 ? '✅' : '❌'}`);
console.log(`  GA NAT: ${gaNat} (should be 0) ${gaNat === 0 ? '✅' : '❌'}`);

console.log('\nTest 9: Difficulty Curve (new in v4)');
// Check if tech questions are ordered easy → medium → hard within sections
const tech1m = mock.filter(q => q.subject !== 'general-aptitude' && q.marks === 1);
const tech2m = mock.filter(q => q.subject !== 'general-aptitude' && q.marks === 2);
const diffOrder = { easy: 0, medium: 1, hard: 2 };
const tech1mSorted = tech1m.every((q, i, arr) => i === 0 || (diffOrder[q._difficulty] || 1) >= (diffOrder[arr[i-1]._difficulty] || 1));
const tech2mSorted = tech2m.every((q, i, arr) => i === 0 || (diffOrder[q._difficulty] || 1) >= (diffOrder[arr[i-1]._difficulty] || 1));
console.log(`  Tech 1-mark difficulty curve: ${tech1mSorted ? '✅ Sorted (easy→hard)' : '⚠️ Not sorted'}`);
console.log(`  Tech 2-mark difficulty curve: ${tech2mSorted ? '✅ Sorted (easy→hard)' : '⚠️ Not sorted'}`);

console.log('\nTest 10: Realism Score (new in v4)');
console.log(`  Paper Realism Score: ${realism}/100 ${realism >= 80 ? '✅' : '⚠️'}`);

console.log('\nTest 11: Multi-Paper Variety (5 runs)');
const paperHashes = new Set();
for (let i = 0; i < 5; i++) {
    const m = global.window.SOH_QEngine.buildMockTest('mixed', { totalQuestions: 65 });
    const ids = m.map(q => q.question_id).sort().join(',');
    paperHashes.add(ids);
}
console.log(`  Unique papers out of 5: ${paperHashes.size} (target: 5) ${paperHashes.size === 5 ? '✅' : '⚠️'}`);

console.log('\nTest 12: Quiz Generation');
const quiz = global.window.SOH_QEngine.buildQuiz('algorithms', 20, { types: ['mcq', 'msq', 'nat'] });
const quizIds = new Set(quiz.map(q => q.question_id));
console.log(`  20-Q algorithms quiz: ${quiz.length} questions, ${quizIds.size} unique ${quizIds.size === quiz.length ? '✅' : '❌'}`);

console.log('\n=== VERIFICATION COMPLETE ===');
