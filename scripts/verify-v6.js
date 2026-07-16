// Comprehensive v6 verification — quality + realism
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

console.log('=== V6 COMPREHENSIVE QUALITY VERIFICATION ===\n');

let totalRealism = 0;
let allValid = true;
let allMarksCorrect = true;
let allUnique = true;
let allHaveExplanations = true;
let allHaveCorrectAnswers = true;
let allValidMarks = true;
let allSufficientLength = true;

for (let run = 1; run <= 5; run++) {
    const mock = global.window.SOH_QEngine.buildMockTest('mixed', { totalQuestions: 65, totalMarks: 100 });
    const stats = global.window.SOH_QEngine.computePaperStats(mock);
    const realism = global.window.SOH_QEngine.computeRealismScore(mock);
    totalRealism += realism;

    // Check for invalid types
    const validTypes = ['mcq', 'msq', 'nat'];
    const invalidCount = mock.filter(q => !validTypes.includes(q.normalized_type)).length;
    if (invalidCount > 0) allValid = false;

    // Check marks
    if (stats.marks !== 100) allMarksCorrect = false;

    // Check uniqueness
    if (stats.uniqueIds !== stats.total || stats.uniqueHashes !== stats.total) allUnique = false;

    // Check invalid marks
    const invalidMarks = mock.filter(q => q.marks !== 1 && q.marks !== 2).length;
    if (invalidMarks > 0) allValidMarks = false;

    // Check all have correct answers
    const noCorrect = mock.filter(q => {
        if (q.normalized_type === 'mcq' || q.normalized_type === 'msq') {
            return !q.correct_options || q.correct_options.length === 0;
        }
        if (q.normalized_type === 'nat') {
            return !q.answer && !q.has_answer;
        }
        return false;
    }).length;
    if (noCorrect > 0) allHaveCorrectAnswers = false;

    // Check question length
    const shortQs = mock.filter(q => {
        const clean = String(q.question_text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        return clean.length < 20;
    }).length;
    if (shortQs > 0) allSufficientLength = false;

    // Check explanations
    const withExpl = mock.filter(q => q.has_explanation).length;
    const explPct = Math.round((withExpl / mock.length) * 100);

    // Type distribution
    const mcqPct = Math.round((stats.byType.mcq / stats.total) * 100);
    const msqPct = Math.round((stats.byType.msq / stats.total) * 100);
    const natPct = Math.round((stats.byType.nat / stats.total) * 100);

    // Difficulty
    const easyPct = Math.round((stats.byDifficulty.easy / stats.total) * 100);
    const medPct = Math.round((stats.byDifficulty.medium / stats.total) * 100);
    const hardPct = Math.round((stats.byDifficulty.hard / stats.total) * 100);

    console.log(`Run ${run}: ${stats.total}Qs ${stats.marks}m | Types: MCQ:${mcqPct}% MSQ:${msqPct}% NAT:${natPct}% | Diff: E:${easyPct}% M:${medPct}% H:${hardPct}% | Expl:${explPct}% | Realism:${realism}/100`);
    console.log(`         Invalid:${invalidCount} BadMarks:${invalidMarks} NoCorrect:${noCorrect} ShortQs:${shortQs} DupIDs:${stats.total - stats.uniqueIds}`);
}

console.log(`\n=== QUALITY SUMMARY ===`);
console.log(`Avg Realism: ${Math.round(totalRealism / 5)}/100`);
console.log(`All types valid:        ${allValid ? '✅' : '❌'}`);
console.log(`All marks = 100:        ${allMarksCorrect ? '✅' : '❌'}`);
console.log(`All unique:             ${allUnique ? '✅' : '❌'}`);
console.log(`All have correct answer: ${allHaveCorrectAnswers ? '✅' : '❌'}`);
console.log(`All valid marks (1/2):  ${allValidMarks ? '✅' : '❌'}`);
console.log(`All sufficient length:  ${allSufficientLength ? '✅' : '❌'}`);

// Also verify official 2027 weightage
console.log(`\n=== OFFICIAL 2027 WEIGHTAGE CHECK ===`);
const mock = global.window.SOH_QEngine.buildMockTest('mixed', { totalQuestions: 65, totalMarks: 100 });
const subjMarks = {};
for (const q of mock) {
    let subj = q.subject;
    if (subj === 'data-structures' || subj === 'programming-languages') subj = 'programming-and-data-structures';
    if (!subjMarks[subj]) subjMarks[subj] = 0;
    subjMarks[subj] += q.marks;
}
const official = global.window.SOH_QEngine.GATE_PATTERN.subject_marks;
let weightageMatch = 0;
for (const [subj, target] of Object.entries(official)) {
    if (target === 0) continue;
    const actual = subjMarks[subj] || 0;
    if (actual === target) weightageMatch++;
    console.log(`  ${subj.padEnd(40)} target: ${target}, got: ${actual} ${actual === target ? '✅' : '❌'}`);
}
console.log(`\nWeightage match: ${weightageMatch}/11 subjects`);
