// Test the question engine logic in Node
// Mock browser environment
global.window = {};
global.localStorage = {
    _data: {},
    getItem: function(k) { return this._data[k] || null; },
    setItem: function(k, v) { this._data[k] = v; },
    removeItem: function(k) { delete this._data[k]; },
};

// Load PYQ data (small subset for testing)
global.window.GATE_DATA = {
    subjects: [
        {
            subject: 'algorithms', subject_label: 'Algorithms',
            chapters: [
                {
                    chapter: 'complexity', chapter_label: 'Complexity',
                    questions: [
                        { question_id: 'q1', year: 2025, type: 'mcq', marks: 1, normalized_type: 'mcq', question_text: 'What is Big-O?', options: [{identifier:'A',content:'1'},{identifier:'B',content:'2'},{identifier:'C',content:'3'},{identifier:'D',content:'4'}], correct_options: ['A'], explanation: 'test', has_answer: true, has_explanation: true, subject: 'algorithms', chapter: 'complexity' },
                        { question_id: 'q2', year: 2024, type: 'mcq', marks: 2, normalized_type: 'mcq', question_text: 'Master Theorem?', options: [{identifier:'A',content:'1'},{identifier:'B',content:'2'},{identifier:'C',content:'3'},{identifier:'D',content:'4'}], correct_options: ['B'], explanation: 'test', has_answer: true, has_explanation: true, subject: 'algorithms', chapter: 'complexity' },
                        { question_id: 'q3', year: 2023, type: 'nat', marks: 2, normalized_type: 'nat', question_text: 'Compute T(n)=2T(n/2)+n?', answer: 'nlogn', explanation: 'test', has_answer: true, has_explanation: true, subject: 'algorithms', chapter: 'complexity' },
                    ]
                }
            ]
        },
        {
            subject: 'data-structures', subject_label: 'Data Structures',
            chapters: [
                {
                    chapter: 'trees', chapter_label: 'Trees',
                    questions: [
                        { question_id: 'q4', year: 2025, type: 'mcq', marks: 1, normalized_type: 'mcq', question_text: 'BST property?', options: [{identifier:'A',content:'1'},{identifier:'B',content:'2'},{identifier:'C',content:'3'},{identifier:'D',content:'4'}], correct_options: ['A'], explanation: 'test', has_answer: true, has_explanation: true, subject: 'data-structures', chapter: 'trees' },
                        { question_id: 'q5', year: 2022, type: 'msq', marks: 2, normalized_type: 'msq', question_text: 'AVL rotations?', options: [{identifier:'A',content:'1'},{identifier:'B',content:'2'},{identifier:'C',content:'3'},{identifier:'D',content:'4'}], correct_options: ['A','B'], explanation: 'test', has_answer: true, has_explanation: true, subject: 'data-structures', chapter: 'trees' },
                    ]
                }
            ]
        }
    ]
};

// Mock tracker functions
global.window.getTotalStats = function() { return { totalAttempts: 0, accuracy: 0 }; };
global.window.getSubjectPerformance = function() { return {}; };

// Load the engine
const fs = require('fs');
const engineCode = fs.readFileSync('./question-engine.js', 'utf8');
eval(engineCode);

console.log('=== Testing Question Engine v2 ===\n');

// Test 1: Hash content
const h1 = global.window.SOH_QEngine.hashContent('<p>Hello World</p>');
const h2 = global.window.SOH_QEngine.hashContent('hello world');
console.log(`Test 1 - Hash dedup: hash1=${h1}, hash2=${h2}, equal=${h1 === h2 ? '✅ PASS' : '❌ FAIL'}`);

// Test 2: Text similarity
const sim1 = global.window.SOH_QEngine.textSimilarity('What is Big O notation', 'What is Big O notation?');
const sim2 = global.window.SOH_QEngine.textSimilarity('What is Big O notation', 'Binary search complexity');
console.log(`Test 2 - Similarity: identical=${sim1}, different=${sim2}, ${sim1 === 1 && sim2 < 0.3 ? '✅ PASS' : '❌ FAIL'}`);

// Test 3: Fisher-Yates shuffle
const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const shuffled = global.window.SOH_QEngine.fisherYatesShuffle(arr);
console.log(`Test 3 - Fisher-Yates: original=${arr.join(',')}, shuffled=${shuffled.join(',')}, same set=${arr.sort().join(',') === shuffled.sort().join(',') ? '✅ PASS' : '❌ FAIL'}`);

// Test 4: Reservoir sampling
const bigArr = Array.from({length: 100}, (_, i) => i);
const sampled = global.window.SOH_QEngine.reservoirSample(bigArr, 10);
console.log(`Test 4 - Reservoir sample: ${sampled.length === 10 ? '✅ PASS' : '❌ FAIL'} (got ${sampled.length} samples)`);

// Test 5: Build quiz (small pool, requested more than available)
const quiz1 = global.window.SOH_QEngine.buildQuiz('algorithms', 10, { types: ['mcq', 'msq', 'nat'] });
console.log(`Test 5 - Quiz no repeats: requested 10, got ${quiz1.length}, all unique=${new Set(quiz1.map(q => q.question_id)).size === quiz1.length ? '✅ PASS' : '❌ FAIL'}`);

// Test 6: Build mock test
const mock = global.window.SOH_QEngine.buildMockTest('mixed', { totalQuestions: 5 });
console.log(`Test 6 - Mock test: got ${mock.length} questions, all unique=${new Set(mock.map(q => q.question_id)).size === mock.length ? '✅ PASS' : '❌ FAIL'}`);

// Test 7: Verify AI quiz (using questions NOT in PYQ data so they pass)
const aiQuestions = [
    { type: 'MCQ', question: 'What is dynamic programming?', options: ['A', 'B', 'C', 'D'], correct: 0, explanation: 'test' },
    { type: 'MCQ', question: 'What is dynamic programming?', options: ['A', 'B', 'C', 'D'], correct: 0, explanation: 'test' }, // DUPLICATE
    { type: 'NAT', question: 'Compute the factorial of 5?', answer: '120', explanation: 'test' },
    { type: 'MCQ', question: '', options: ['A', 'B'], correct: 0, explanation: 'test' }, // EMPTY - should be dropped
];
const verified = global.window.SOH_QEngine.verifyAIQuiz(aiQuestions);
console.log(`Test 7 - AI verify: input 4 (1 dup, 1 empty), output ${verified.length}, ${verified.length === 2 ? '✅ PASS' : '❌ FAIL'}`);

// Test 8: Trend summary
const summary = global.window.SOH_QEngine.getTrendSummary();
console.log(`Test 8 - Trend summary: total=${summary.totalQuestions}, subjects=${summary.subjects}, ${summary.totalQuestions > 0 ? '✅ PASS' : '❌ FAIL'}`);

console.log('\n=== All tests done ===');
