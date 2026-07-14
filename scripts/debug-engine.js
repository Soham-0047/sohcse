// Debug test
global.window = {};
global.localStorage = {
    _data: {},
    getItem: function(k) { return this._data[k] || null; },
    setItem: function(k, v) { this._data[k] = v; },
    removeItem: function(k) { delete this._data[k]; },
};

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

global.window.getTotalStats = function() { return { totalAttempts: 0, accuracy: 0 }; };
global.window.getSubjectPerformance = function() { return {}; };

const fs = require('fs');
const engineCode = fs.readFileSync('./question-engine.js', 'utf8');
eval(engineCode);

// Test similarity for each PYQ vs AI Q3
const aiQ3 = 'Compute complexity?';
const pyqs = ['What is Big-O?', 'Master Theorem?', 'Compute T(n)=2T(n/2)+n?', 'BST property?', 'AVL rotations?'];
console.log('AI Q3:', aiQ3);
console.log('---');
for (const p of pyqs) {
    const sim = global.window.SOH_QEngine.textSimilarity(aiQ3, p);
    console.log(`vs "${p}": sim=${sim.toFixed(3)} ${sim > 0.85 ? '⚠️ DUP' : ''}`);
}

// Now also test AI Q1
console.log('\nAI Q1: What is Big-O?');
for (const p of pyqs) {
    const sim = global.window.SOH_QEngine.textSimilarity('What is Big-O?', p);
    console.log(`vs "${p}": sim=${sim.toFixed(3)} ${sim > 0.85 ? '⚠️ DUP' : ''}`);
}

// Run verifyAIQuiz with debug
const aiQuestions = [
    { type: 'MCQ', question: 'What is Big-O?', options: ['A', 'B', 'C', 'D'], correct: 0, explanation: 'test' },
    { type: 'MCQ', question: 'What is Big-O?', options: ['A', 'B', 'C', 'D'], correct: 0, explanation: 'test' },
    { type: 'NAT', question: 'Compute complexity?', answer: '5', explanation: 'test' },
    { type: 'MCQ', question: '', options: ['A', 'B'], correct: 0, explanation: 'test' },
];
console.log('\n--- Verification ---');
const verified = global.window.SOH_QEngine.verifyAIQuiz(aiQuestions);
console.log(`Input: ${aiQuestions.length}, Output: ${verified.length}`);
for (const q of verified) {
    console.log(`  - "${q.question}"`);
}
