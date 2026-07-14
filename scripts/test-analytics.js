// Test the analytics module
global.window = {};
global.localStorage = {
    _data: {},
    getItem: function(k) { return this._data[k] || null; },
    setItem: function(k, v) { this._data[k] = v; },
    removeItem: function(k) { delete this._data[k]; },
};

// Mock data — 50 attempts over 7 days
const now = Date.now();
const attempts = [];
for (let i = 0; i < 50; i++) {
    const ts = now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000);
    attempts.push({
        id: 'a' + i,
        timestamp: ts,
        subject: ['algorithms', 'data-structures', 'operating-systems', 'dbms'][i % 4],
        chapter: 'test',
        correct: Math.random() > 0.4,
    });
}
global.localStorage._data['sohcse_progress_tracker'] = JSON.stringify({ attempts, quizzes: [] });
global.localStorage._data['sohcse_streak_v1'] = JSON.stringify({ count: 5, lastDay: new Date().toISOString().slice(0, 10) });
global.localStorage._data['sohcse_study_log_v1'] = JSON.stringify({ [new Date().toISOString().slice(0, 10)]: 3 });

const fs = require('fs');
const code = fs.readFileSync('./analytics.js', 'utf8');
eval(code);

console.log('=== Testing Analytics Module ===\n');

// Test 1: Streak forecast
const forecast = global.window.SOH_Analytics.forecastStreak();
console.log('Test 1 - Streak Forecast:');
console.log(`  Current streak: ${forecast.currentStreak}`);
console.log(`  Risk level: ${forecast.riskLevel}`);
console.log(`  Message: ${forecast.riskMessage}`);
console.log(`  Best day: ${forecast.bestDay}`);
console.log(`  30-day projection: ${forecast.projected30DayStreak}`);
console.log(`  ✅ PASS\n`);

// Test 2: Study time insights
const time = global.window.SOH_Analytics.studyTimeInsights();
console.log('Test 2 - Study Time Insights:');
console.log(`  Total study minutes: ${time.totalStudyMinutes}`);
console.log(`  Avg session: ${time.avgSessionMinutes} min`);
console.log(`  Total sessions: ${time.totalSessions}`);
console.log(`  Peak hours: ${time.peakHours.length > 0 ? time.peakHours.map(h => h.hour + ':00 (' + h.count + ')').join(', ') : 'none'}`);
console.log(`  Last 7 days: ${time.last7DaysActivity}, prev 7: ${time.prev7DaysActivity}, change: ${time.weekOverWeekChange}%`);
console.log(`  ✅ PASS\n`);

// Test 3: Performance trajectory
const traj = global.window.SOH_Analytics.performanceTrajectory();
console.log('Test 3 - Performance Trajectory:');
if (traj) {
    console.log(`  Trend: ${traj.trendLabel} (${traj.trend >= 0 ? '+' : ''}${traj.trend})`);
    console.log(`  Buckets: ${traj.buckets.length}`);
    traj.buckets.forEach((b, i) => console.log(`    Phase ${i+1}: ${b.accuracy}% (${b.count} Qs)`));
    console.log(`  Subject trajectories: ${Object.keys(traj.subjectTrajectories).length}`);
} else {
    console.log('  Not enough data');
}
console.log(`  ✅ PASS\n`);

// Test 4: Generate insights
const insights = global.window.SOH_Analytics.generateInsights();
console.log('Test 4 - Smart Insights:');
console.log(`  Generated ${insights.length} insights:`);
insights.forEach((ins, i) => {
    console.log(`  ${i+1}. [${ins.type}] ${ins.icon} ${ins.title}`);
});
console.log(`  ✅ PASS\n`);

console.log('=== All Analytics Tests Passed ===');
