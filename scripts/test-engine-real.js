// Test with REAL 2736-question dataset
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
console.log(`Loaded ${global.window.GATE_DATA.total_questions} questions`);

// Mock tracker (no user history yet)
global.window.getTotalStats = function() { return { totalAttempts: 0, accuracy: 0, totalQuizzes: 0 }; };
global.window.getSubjectPerformance = function() { return {}; };

// Load engine
const engineCode = fs.readFileSync('./question-engine.js', 'utf8');
eval(engineCode);

console.log('\n=== Testing with REAL 2736 PYQ dataset ===\n');

// Test 1: Build full mock test (65 questions)
console.log('Test 1: Build full GATE mock test (65 Qs, 100 marks)...');
const start = Date.now();
const mock = global.window.SOH_QEngine.buildMockTest('mixed', { totalQuestions: 65, totalMarks: 100 });
const elapsed = Date.now() - start;
console.log(`  Selected ${mock.length} questions in ${elapsed}ms`);

// Verify all unique
const ids = mock.map(q => q.question_id);
const uniqueIds = new Set(ids);
console.log(`  All unique IDs: ${uniqueIds.size === mock.length ? '✅' : '❌'} (${uniqueIds.size}/${mock.length})`);

// Verify content hash uniqueness
const hashes = mock.map(q => global.window.SOH_QEngine.hashContent(q.question_text));
const uniqueHashes = new Set(hashes);
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
console.log(`  Total marks: ${totalMarks} (target: 100, off by ${Math.abs(totalMarks - 100)})`);

// Check type distribution
const typeCount = {};
for (const q of mock) typeCount[q.normalized_type] = (typeCount[q.normalized_type] || 0) + 1;
console.log(`  Type distribution:`, typeCount);

// Check year distribution
const yearCount = {};
for (const q of mock) yearCount[q.year] = (yearCount[q.year] || 0) + 1;
console.log(`  Year distribution:`);
Object.entries(yearCount).sort((a,b) => b[0] - a[0]).forEach(([y, c]) => {
    console.log(`    ${y}: ${c}`);
});

// Check chapter diversity (max questions per chapter)
const chapCount = {};
for (const q of mock) {
    const k = `${q.subject}/${q.chapter}`;
    chapCount[k] = (chapCount[k] || 0) + 1;
}
const maxPerChap = Math.max(...Object.values(chapCount));
console.log(`  Max questions per chapter: ${maxPerChap} (target: <6 for diversity)`);

// Test 2: Run 5 mock tests and verify each is unique (no repeats across runs not required, but within a test yes)
console.log('\nTest 2: Run 5 mock tests, verify no duplicates within each...');
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
summary.topSubjects.forEach(s => {
    console.log(`    ${s.subject}: ${s.count} Qs (${((s.count/summary.totalQuestions)*100).toFixed(1)}%)`);
});

console.log('\n=== REAL DATA TESTS COMPLETE ===');
