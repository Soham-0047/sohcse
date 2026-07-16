// Deep analysis of algorithm weaknesses
global.window = {};
global.localStorage = {
    _data: {}, getItem: function(k) { return this._data[k] || null; },
    setItem: function(k, v) { this._data[k] = v; }, removeItem: function(k) { delete this._data[k]; },
};
const fs = require('fs');
eval(fs.readFileSync('./gate_cse_data.js', 'utf8'));
global.window.getTotalStats = function() { return { totalAttempts: 0, accuracy: 0 }; };
global.window.getSubjectPerformance = function() { return {}; };
eval(fs.readFileSync('./gate-engine.js', 'utf8'));

console.log('=== DEEP ANALYSIS OF ALGORITHM WEAKNESSES ===\n');

// Issue 1: Find all question types in the data
const typeCounts = {};
for (const subj of window.GATE_DATA.subjects) {
    for (const chap of subj.chapters) {
        for (const q of chap.questions) {
            const t = q.normalized_type || 'unknown';
            typeCounts[t] = (typeCounts[t] || 0) + 1;
        }
    }
}
console.log('1. ALL QUESTION TYPES IN PYQ DATA:');
console.log(JSON.stringify(typeCounts, null, 2));

// Issue 2: Count valid vs invalid types
const validTypes = ['mcq', 'msq', 'nat'];
let valid = 0, invalid = 0;
const invalidExamples = [];
for (const subj of window.GATE_DATA.subjects) {
    for (const chap of subj.chapters) {
        for (const q of chap.questions) {
            const t = q.normalized_type || 'unknown';
            if (validTypes.includes(t)) {
                valid++;
            } else {
                invalid++;
                if (invalidExamples.length < 5) {
                    invalidExamples.push({ type: t, qid: q.question_id, subject: q.subject, year: q.year });
                }
            }
        }
    }
}
console.log(`\n2. VALID vs INVALID TYPES:`);
console.log(`  Valid (mcq/msq/nat): ${valid}`);
console.log(`  Invalid (other): ${invalid}`);
console.log(`  Invalid examples:`, JSON.stringify(invalidExamples, null, 2));

// Issue 3: Run 5 mock tests and analyze type distribution
console.log('\n3. TYPE DISTRIBUTION ACROSS 5 MOCK TESTS:');
console.log('Run | MCQ | MSQ | NAT | Other | MCQ% | MSQ% | NAT% | Target: 52/16/32');
console.log('-'.repeat(75));
for (let i = 1; i <= 5; i++) {
    const mock = global.window.SOH_QEngine.buildMockTest('mixed', { totalQuestions: 65, totalMarks: 100 });
    const types = { mcq: 0, msq: 0, nat: 0 };
    let other = 0;
    for (const q of mock) {
        const t = q.normalized_type;
        if (types.hasOwnProperty(t)) types[t]++;
        else other++;
    }
    const total = mock.length;
    console.log(`  ${i} | ${types.mcq}  | ${types.msq}  | ${types.nat}  | ${other}     | ${Math.round(types.mcq/total*100)}%  | ${Math.round(types.msq/total*100)}%   | ${Math.round(types.nat/total*100)}%   |`);
}

// Issue 4: Analyze difficulty distribution
console.log('\n4. DIFFICULTY DISTRIBUTION ACROSS 5 MOCK TESTS:');
console.log('Run | Easy | Medium | Hard | Target: 30/50/20');
console.log('-'.repeat(50));
for (let i = 1; i <= 5; i++) {
    const mock = global.window.SOH_QEngine.buildMockTest('mixed', { totalQuestions: 65, totalMarks: 100 });
    const diff = { easy: 0, medium: 0, hard: 0 };
    for (const q of mock) {
        if (q._difficulty) diff[q._difficulty]++;
    }
    const total = mock.length;
    console.log(`  ${i} | ${diff.easy}    | ${diff.medium}      | ${diff.hard}   | ${Math.round(diff.easy/total*100)}/${Math.round(diff.medium/total*100)}/${Math.round(diff.hard/total*100)}`);
}

// Issue 5: Check marks accuracy
console.log('\n5. MARKS ACCURACY ACROSS 5 MOCK TESTS:');
console.log('Run | Total Marks | Target | 1m Qs | 2m Qs | GA Marks | Tech1m | Tech2m');
console.log('-'.repeat(75));
for (let i = 1; i <= 5; i++) {
    const mock = global.window.SOH_QEngine.buildMockTest('mixed', { totalQuestions: 65, totalMarks: 100 });
    const stats = global.window.SOH_QEngine.computePaperStats(mock);
    console.log(`  ${i} | ${stats.marks}         | 100    | ${stats.byMarks[1]}     | ${stats.byMarks[2]}     | ${stats.gaMarks}        | ${stats.tech1mMarks}     | ${stats.tech2mMarks}`);
}

// Issue 6: Check for broken questions (no options for MCQ, no answer for NAT)
console.log('\n6. BROKEN QUESTIONS CHECK:');
let noOptionsMCQ = 0, noAnswerNAT = 0, noExplanation = 0;
for (const subj of window.GATE_DATA.subjects) {
    for (const chap of subj.chapters) {
        for (const q of chap.questions) {
            if (q.is_out_of_syllabus) continue;
            const t = q.normalized_type;
            if ((t === 'mcq' || t === 'msq') && (!q.options || q.options.length < 2)) noOptionsMCQ++;
            if (t === 'nat' && !q.answer && !q.has_answer) noAnswerNAT++;
            if (!q.has_explanation) noExplanation++;
        }
    }
}
console.log(`  MCQ/MSQ without options: ${noOptionsMCQ}`);
console.log(`  NAT without answer: ${noAnswerNAT}`);
console.log(`  Questions without explanation: ${noExplanation}`);

// Issue 7: Realism scores
console.log('\n7. REALISM SCORES:');
for (let i = 1; i <= 5; i++) {
    const mock = global.window.SOH_QEngine.buildMockTest('mixed', { totalQuestions: 65, totalMarks: 100 });
    const realism = global.window.SOH_QEngine.computeRealismScore(mock);
    console.log(`  Run ${i}: ${realism}/100`);
}
