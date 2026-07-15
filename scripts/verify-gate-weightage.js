// Verify exact marks per subject
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

const mock = global.window.SOH_QEngine.buildMockTest('mixed', { totalQuestions: 65, totalMarks: 100 });

// Compute marks per subject
const subjStats = {};
for (const q of mock) {
    if (!subjStats[q.subject]) subjStats[q.subject] = { questions: 0, marks: 0, oneMark: 0, twoMark: 0 };
    subjStats[q.subject].questions++;
    subjStats[q.subject].marks += q.marks;
    if (q.marks === 1) subjStats[q.subject].oneMark++;
    else subjStats[q.subject].twoMark++;
}

const official = global.window.SOH_QEngine.GATE_PATTERN.subject_marks;
console.log('\n=== OFFICIAL GATE WEIGHTAGE VERIFICATION ===\n');
console.log('Subject                                | Target | Got  | Qs  | 1m  | 2m');
console.log('-'.repeat(80));
let totalMarks = 0;
for (const [subj, stats] of Object.entries(subjStats).sort((a, b) => b[1].marks - a[1].marks)) {
    const target = official[subj] || 0;
    const match = stats.marks === target ? '✅' : (Math.abs(stats.marks - target) <= 1 ? '⚠️' : '❌');
    console.log(`${subj.padEnd(40)}| ${String(target).padStart(6)} | ${String(stats.marks).padStart(4)} ${match}| ${String(stats.questions).padStart(3)} | ${String(stats.oneMark).padStart(3)} | ${String(stats.twoMark).padStart(3)}`);
    totalMarks += stats.marks;
}
console.log('-'.repeat(80));
console.log(`${'TOTAL'.padEnd(40)}| ${'100'.padStart(6)} | ${String(totalMarks).padStart(4)}    | ${String(mock.length).padStart(3)}`);

// Section summary
const gaMarks = subjStats['general-aptitude']?.marks || 0;
const mathMarks = subjStats['discrete-mathematics']?.marks || 0;
const coreMarks = totalMarks - gaMarks - mathMarks;
console.log('\n=== SECTION SUMMARY ===');
console.log(`General Aptitude:  ${gaMarks} marks (target: 15) ${gaMarks === 15 ? '✅' : '❌'}`);
console.log(`Mathematics:       ${mathMarks} marks (target: 13) ${mathMarks === 13 ? '✅' : '⚠️'}`);
console.log(`Core CS:           ${coreMarks} marks (target: 72) ${coreMarks === 72 ? '✅' : '⚠️'}`);

// Verify uniqueness
const ids = new Set(mock.map(q => q.question_id));
const hashes = new Set(mock.map(q => global.window.SOH_QEngine.hashContent(q.question_text)));
console.log('\n=== UNIQUENESS ===');
console.log(`Unique IDs: ${ids.size}/${mock.length} ${ids.size === mock.length ? '✅' : '❌'}`);
console.log(`Unique Hashes: ${hashes.size}/${mock.length} ${hashes.size === mock.length ? '✅' : '❌'}`);

// Difficulty
const diff = { easy: 0, medium: 0, hard: 0 };
for (const q of mock) diff[q._difficulty]++;
console.log('\n=== DIFFICULTY ===');
console.log(`Easy: ${diff.easy} (${Math.round(diff.easy/mock.length*100)}%) — target ~30%`);
console.log(`Medium: ${diff.medium} (${Math.round(diff.medium/mock.length*100)}%) — target ~50%`);
console.log(`Hard: ${diff.hard} (${Math.round(diff.hard/mock.length*100)}%) — target ~20%`);

// Chapter diversity
const chapCount = {};
for (const q of mock) {
    const k = `${q.subject}/${q.chapter}`;
    chapCount[k] = (chapCount[k] || 0) + 1;
}
const maxPerChap = Math.max(...Object.values(chapCount));
console.log('\n=== DIVERSITY ===');
console.log(`Max questions per chapter: ${maxPerChap} (target: ≤4)`);
console.log(`Number of unique chapters: ${Object.keys(chapCount).length}`);

// Year recency
const recent = mock.filter(q => q.year >= 2021).length;
console.log(`Recent (2021+): ${recent}/${mock.length} (${Math.round(recent/mock.length*100)}%)`);

// Hot topics
const hot = mock.filter(q => q._isHotTopic).length;
console.log(`Hot topic questions: ${hot}/${mock.length} (${Math.round(hot/mock.length*100)}%)`);
