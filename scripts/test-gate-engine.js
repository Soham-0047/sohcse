// Comprehensive test of GATE Engine v3 with real 2736 PYQ dataset
global.window = {};
global.localStorage = {
    _data: {},
    getItem: function(k) { return this._data[k] || null; },
    setItem: function(k, v) { this._data[k] = v; },
    removeItem: function(k) { delete this._data[k]; },
};

console.log('Loading real PYQ data...');
const fs = require('fs');
const dataCode = fs.readFileSync('./gate_cse_data.js', 'utf8');
eval(dataCode);
console.log(`Loaded ${global.window.GATE_DATA.total_questions} questions\n`);

// Mock tracker (no user history)
global.window.getTotalStats = function() { return { totalAttempts: 0, accuracy: 0, totalQuizzes: 0 }; };
global.window.getSubjectPerformance = function() { return {}; };

// Load the GATE Engine v3
const engineCode = fs.readFileSync('./gate-engine.js', 'utf8');
eval(engineCode);

console.log('=== Testing GATE Intelligent Engine v3 ===\n');

// Test 1: Build full GATE mock test
console.log('Test 1: Build full GATE mock test (65 Qs, 100 marks)...');
const start = Date.now();
const mock = global.window.SOH_QEngine.buildMockTest('mixed', { totalQuestions: 65, totalMarks: 100 });
const elapsed = Date.now() - start;
console.log(`  Selected ${mock.length} questions in ${elapsed}ms`);

// Verify all unique
const ids = mock.map(q => q.question_id);
const uniqueIds = new Set(ids);
const hashes = mock.map(q => global.window.SOH_QEngine.hashContent(q.question_text));
const uniqueHashes = new Set(hashes);
console.log(`  All unique IDs: ${uniqueIds.size === mock.length ? '✅' : '❌'} (${uniqueIds.size}/${mock.length})`);
console.log(`  All unique content: ${uniqueHashes.size === mock.length ? '✅' : '❌'} (${uniqueHashes.size}/${mock.length})`);

// Check subject distribution
const subjCount = {};
for (const q of mock) subjCount[q.subject] = (subjCount[q.subject] || 0) + 1;
console.log(`  Subject distribution:`);
Object.entries(subjCount).sort((a,b) => b[1] - a[1]).forEach(([s, c]) => {
    console.log(`    ${s}: ${c}`);
});

// Check marks total
const totalMarks = mock.reduce((s, q) => s + (q.marks || 1), 0);
console.log(`  Total marks: ${totalMarks} (target: 100)`);

// Check marks distribution
const oneMark = mock.filter(q => q.marks === 1).length;
const twoMark = mock.filter(q => q.marks === 2).length;
console.log(`  Marks distribution: ${oneMark}×1m + ${twoMark}×2m = ${oneMark + twoMark * 2} marks (target: 25×1 + 40×2 = 105)`);
console.log(`  GATE pattern match: ${oneMark >= 22 && oneMark <= 28 && twoMark >= 37 && twoMark <= 43 ? '✅' : '⚠️'}`);

// Check type distribution
const typeCount = {};
for (const q of mock) typeCount[q.normalized_type] = (typeCount[q.normalized_type] || 0) + 1;
const mcqPct = (typeCount.mcq / mock.length * 100).toFixed(0);
const msqPct = (typeCount.msq / mock.length * 100).toFixed(0);
const natPct = (typeCount.nat / mock.length * 100).toFixed(0);
console.log(`  Type distribution: MCQ ${mcqPct}%, MSQ ${msqPct}%, NAT ${natPct}% (target: 52/16/32)`);
console.log(`  GATE type match: ${mcqPct >= 45 && mcqPct <= 60 && natPct >= 25 && natPct <= 40 ? '✅' : '⚠️'}`);

// Check chapter diversity (max per chapter)
const chapCount = {};
for (const q of mock) {
    const k = `${q.subject}/${q.chapter}`;
    chapCount[k] = (chapCount[k] || 0) + 1;
}
const maxPerChap = Math.max(...Object.values(chapCount));
console.log(`  Max questions per chapter: ${maxPerChap} (target: ≤4 for diversity)`);
console.log(`  Chapter diversity: ${maxPerChap <= 5 ? '✅' : '⚠️'}`);

// Check year distribution
const yearCount = {};
for (const q of mock) yearCount[q.year] = (yearCount[q.year] || 0) + 1;
const recentCount = mock.filter(q => q.year >= 2021).length;
console.log(`  Recent questions (2021+): ${recentCount}/${mock.length} (${(recentCount/mock.length*100).toFixed(0)}%)`);

// Check hot topics included
const hotCount = mock.filter(q => q._isHotTopic).length;
console.log(`  Hot topic questions: ${hotCount}/${mock.length} (${(hotCount/mock.length*100).toFixed(0)}%)`);

// Check difficulty distribution
const diffCount = { easy: 0, medium: 0, hard: 0 };
for (const q of mock) diffCount[q._difficulty]++;
console.log(`  Difficulty: ${diffCount.easy} easy, ${diffCount.medium} medium, ${diffCount.hard} hard`);
console.log(`  GATE difficulty match: ${diffCount.easy >= 15 && diffCount.easy <= 25 && diffCount.hard >= 8 && diffCount.hard <= 18 ? '✅' : '⚠️'}`);

// Test 2: Run 5 mock tests, verify no duplicates within each
console.log('\nTest 2: Run 5 mock tests, verify no duplicates...');
let allPass = true;
for (let i = 0; i < 5; i++) {
    const m = global.window.SOH_QEngine.buildMockTest('mixed', { totalQuestions: 65, totalMarks: 100 });
    const idSet = new Set(m.map(q => q.question_id));
    const hashSet = new Set(m.map(q => global.window.SOH_QEngine.hashContent(q.question_text)));
    const pass = idSet.size === m.length && hashSet.size === m.length;
    if (!pass) allPass = false;
    console.log(`  Run ${i+1}: ${m.length} Qs, ${idSet.size} unique IDs, ${hashSet.size} unique hashes ${pass ? '✅' : '❌'}`);
}
console.log(`All 5 runs: ${allPass ? '✅ PASS' : '❌ FAIL'}`);

// Test 3: Recent questions only
console.log('\nTest 3: Mock test with recent questions (2021+)...');
const recentMock = global.window.SOH_QEngine.buildMockTest('recent', { totalQuestions: 65, totalMarks: 100 });
const allRecent = recentMock.every(q => q.year >= 2021);
console.log(`  ${recentMock.length} questions, all year >= 2021: ${allRecent ? '✅' : '❌'}`);

// Test 4: Quiz on algorithms
console.log('\nTest 4: Build 20-question quiz on algorithms...');
const quiz = global.window.SOH_QEngine.buildQuiz('algorithms', 20, { types: ['mcq', 'msq', 'nat'] });
const quizIdSet = new Set(quiz.map(q => q.question_id));
const quizHashSet = new Set(quiz.map(q => global.window.SOH_QEngine.hashContent(q.question_text)));
console.log(`  Got ${quiz.length} unique questions, IDs unique: ${quizIdSet.size === quiz.length ? '✅' : '❌'}, hashes unique: ${quizHashSet.size === quiz.length ? '✅' : '❌'}`);

// Test 5: Trend analysis
console.log('\nTest 5: Trend analysis...');
const summary = global.window.SOH_QEngine.getTrendSummary();
console.log(`  Total analyzed: ${summary.totalQuestions}`);
console.log(`  Year range: ${summary.yearRange.min}–${summary.yearRange.max}`);
console.log(`  Type distribution:`, summary.typeDistribution);
console.log(`  Top 5 subjects:`);
summary.topSubjects.slice(0, 5).forEach(s => {
    console.log(`    ${s.subject}: ${s.count} Qs (${s.pct}%)`);
});
console.log(`  Hot topics: ${summary.hotTopics.length}`);
summary.hotTopics.slice(0, 5).forEach(h => {
    console.log(`    ${h.chapter}: ${h.totalCount} Qs in ${h.yearsPresent} of 5 years`);
});

// Test 6: Paper structure
console.log('\nTest 6: Paper structure analysis...');
const structure = global.window.SOH_QEngine.getPaperStructure();
console.log(`  Marks distribution: ${structure.marksDistribution[1]}% 1-mark, ${structure.marksDistribution[2]}% 2-mark`);
console.log(`  Type by marks:`);
console.log(`    1-mark: MCQ ${structure.typeByMarks[1].mcq}%, MSQ ${structure.typeByMarks[1].msq}%, NAT ${structure.typeByMarks[1].nat}%`);
console.log(`    2-mark: MCQ ${structure.typeByMarks[2].mcq}%, MSQ ${structure.typeByMarks[2].msq}%, NAT ${structure.typeByMarks[2].nat}%`);

// Test 7: Verify GATE paper structure (GA first, then 1-mark, then 2-mark)
console.log('\nTest 7: GATE paper structure order...');
const gaCount = mock.filter(q => q.subject === 'general-aptitude').length;
const techCount = mock.length - gaCount;
console.log(`  GA questions: ${gaCount} (target: 10)`);
console.log(`  Technical questions: ${techCount} (target: 55)`);

// Test 8: Quality scoring
console.log('\nTest 8: Question quality scoring...');
const withExplanation = mock.filter(q => q.has_explanation).length;
const withAnswer = mock.filter(q => q.has_answer).length;
console.log(`  Questions with explanation: ${withExplanation}/${mock.length} (${(withExplanation/mock.length*100).toFixed(0)}%)`);
console.log(`  Questions with answer: ${withAnswer}/${mock.length} (${(withAnswer/mock.length*100).toFixed(0)}%)`);
console.log(`  Quality: ${withExplanation >= mock.length * 0.7 ? '✅' : '⚠️'}`);

console.log('\n=== GATE Engine v3 Tests Complete ===');
