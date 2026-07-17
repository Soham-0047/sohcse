// Quick verification of v5 improvements
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

console.log('=== V5 VERIFICATION ===\n');

let totalRealism = 0;
let allValid = true;
let allMarksCorrect = true;
let allUnique = true;

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

    const mcqPct = Math.round((stats.byType.mcq / stats.total) * 100);
    const msqPct = Math.round((stats.byType.msq / stats.total) * 100);
    const natPct = Math.round((stats.byType.nat / stats.total) * 100);
    const easyPct = Math.round((stats.byDifficulty.easy / stats.total) * 100);
    const medPct = Math.round((stats.byDifficulty.medium / stats.total) * 100);
    const hardPct = Math.round((stats.byDifficulty.hard / stats.total) * 100);

    console.log(`Run ${run}: ${stats.total}Qs, ${stats.marks}m | MCQ:${mcqPct}% MSQ:${msqPct}% NAT:${natPct}% (invalid:${invalidCount}) | Easy:${easyPct}% Med:${medPct}% Hard:${hardPct}% | Realism:${realism}/100`);
}

console.log(`\n=== SUMMARY ===`);
console.log(`Avg Realism: ${Math.round(totalRealism / 5)}/100`);
console.log(`All types valid (no subjective/fill_blanks/true_false): ${allValid ? '✅' : '❌'}`);
console.log(`All marks = 100: ${allMarksCorrect ? '✅' : '❌'}`);
console.log(`All unique: ${allUnique ? '✅' : '❌'}`);
