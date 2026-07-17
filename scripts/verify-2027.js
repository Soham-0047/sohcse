// Verify OFFICIAL 2027 weightage
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

console.log(`Loaded ${global.window.GATE_DATA.total_questions} questions\n`);

// Build 3 mock tests and verify
for (let run = 1; run <= 3; run++) {
    const mock = global.window.SOH_QEngine.buildMockTest('mixed', { totalQuestions: 65, totalMarks: 100 });
    const stats = global.window.SOH_QEngine.computePaperStats(mock);

    console.log(`\n${'='.repeat(70)}`);
    console.log(`RUN ${run}: ${stats.total} Qs, ${stats.marks} marks`);
    console.log(`${'='.repeat(70)}`);

    // Compute marks per subject (combining DS+PL into PDS)
    const subjMarks = {};
    for (const q of mock) {
        let subj = q.subject;
        // Map DS and PL to combined PDS
        if (subj === 'data-structures' || subj === 'programming-languages') {
            subj = 'programming-and-data-structures';
        }
        if (!subjMarks[subj]) subjMarks[subj] = { marks: 0, count: 0 };
        subjMarks[subj].marks += q.marks;
        subjMarks[subj].count++;
    }

    const official = global.window.SOH_QEngine.GATE_PATTERN.subject_marks;
    console.log('\nSubject                                | Official | Got  | Match');
    console.log('-'.repeat(70));
    let allMatch = true;
    let totalMarks = 0;
    for (const [subj, target] of Object.entries(official)) {
        if (target === 0) continue;
        const actual = subjMarks[subj]?.marks || 0;
        const match = actual === target;
        if (!match) allMatch = false;
        totalMarks += actual;
        const label = subj.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        console.log(`${label.padEnd(40)}| ${String(target).padStart(8)} | ${String(actual).padStart(4)} | ${match ? '✅' : '❌'}`);
    }
    console.log('-'.repeat(70));
    console.log(`${'TOTAL'.padEnd(40)}| ${'100'.padStart(8)} | ${String(totalMarks).padStart(4)} | ${totalMarks === 100 ? '✅' : '❌'}`);

    // Section breakdown
    console.log(`\nGA: ${stats.sectionBreakdown.ga} Qs, ${stats.gaMarks} marks (target: 10, 15) ${stats.gaMarks === 15 ? '✅' : '❌'}`);
    console.log(`Tech 1m: ${stats.sectionBreakdown.tech1m} Qs, ${stats.tech1mMarks} marks (target: 25, 25) ${stats.tech1mMarks === 25 ? '✅' : '❌'}`);
    console.log(`Tech 2m: ${stats.sectionBreakdown.tech2m} Qs, ${stats.tech2mMarks} marks (target: 30, 60) ${stats.tech2mMarks === 60 ? '✅' : '❌'}`);

    // Uniqueness
    console.log(`\nUnique IDs: ${stats.uniqueIds}/${stats.total} ${stats.uniqueIds === stats.total ? '✅' : '❌'}`);
    console.log(`Unique Hashes: ${stats.uniqueHashes}/${stats.total} ${stats.uniqueHashes === stats.total ? '✅' : '❌'}`);

    // Realism
    const realism = global.window.SOH_QEngine.computeRealismScore(mock);
    console.log(`Realism Score: ${realism}/100 ${realism >= 80 ? '✅' : '⚠️'}`);

    if (allMatch && totalMarks === 100) {
        console.log('\n🎉 ALL SUBJECTS MATCH OFFICIAL 2027 WEIGHTAGE!');
    }
}
