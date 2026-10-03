/* ==========================================================================
   SOH CSE — Advanced Analytics Engine v1
   - Streak forecasting (will you break your streak?)
   - Study time insights (peak hours, weekly trends)
   - Performance trajectory (improving/declining?)
   - Concept mastery heatmap data
   - Personalized insights & recommendations
   ========================================================================== */

(function () {
    'use strict';

    // ============ Streak Forecasting ============
    function forecastStreak() {
        const streak = JSON.parse(localStorage.getItem('sohcse_streak_v1') || '{}');
        const studyLog = JSON.parse(localStorage.getItem('sohcse_study_log_v1') || '{}');
        const today = new Date().toISOString().slice(0, 10);
        const now = new Date();

        // Did user study today?
        const studiedToday = (studyLog[today] || 0) > 0;
        const currentStreak = streak.count || 0;

        // Find last study day
        let lastStudyDay = streak.lastDay;
        let daysSinceLastStudy = 0;
        if (lastStudyDay) {
            const last = new Date(lastStudyDay);
            daysSinceLastStudy = Math.floor((now - last) / (1000 * 60 * 60 * 24));
        }

        // Streak risk assessment
        let riskLevel = 'safe';
        let riskMessage = '';
        let deadlineHours = 24;

        if (currentStreak === 0) {
            riskLevel = 'none';
            riskMessage = 'Start a streak today!';
        } else if (studiedToday) {
            riskLevel = 'safe';
            riskMessage = `Streak safe for today. Study tomorrow to extend to ${currentStreak + 1}.`;
            // Calculate hours until midnight
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            deadlineHours = Math.floor((midnight - now) / (1000 * 60 * 60));
        } else if (daysSinceLastStudy === 1) {
            // Studied yesterday, not today
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            deadlineHours = Math.floor((midnight - now) / (1000 * 60 * 60));
            if (deadlineHours < 4) {
                riskLevel = 'danger';
                riskMessage = `⚠ Only ${deadlineHours}h left to save your ${currentStreak}-day streak!`;
            } else if (deadlineHours < 8) {
                riskLevel = 'warning';
                riskMessage = `${deadlineHours}h left to extend your streak to ${currentStreak + 1} days.`;
            } else {
                riskLevel = 'safe';
                riskMessage = `Study today to extend streak to ${currentStreak + 1} days.`;
            }
        } else if (daysSinceLastStudy >= 2) {
            riskLevel = 'broken';
            riskMessage = `Streak broken ${daysSinceLastStudy} days ago. Start a new one today!`;
        }

        // Best day of week for this user
        const dayActivity = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
        for (const [date, count] of Object.entries(studyLog)) {
            const day = new Date(date).getDay();
            dayActivity[day] += count;
        }
        const bestDay = dayActivity.indexOf(Math.max(...dayActivity));
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        // Projected streak if user keeps current pace
        const last7Days = Object.entries(studyLog)
            .filter(([d]) => (new Date() - new Date(d)) < 7 * 24 * 60 * 60 * 1000)
            .length;
        const pace = last7Days / 7;
        const projected30Day = Math.round(pace * 30);

        return {
            currentStreak,
            studiedToday,
            riskLevel, // 'none' | 'safe' | 'warning' | 'danger' | 'broken'
            riskMessage,
            deadlineHours,
            bestDay: dayNames[bestDay],
            bestDayCount: dayActivity[bestDay],
            weeklyActivity: dayActivity,
            projected30DayStreak: projected30Day,
            pace, // sessions per day
        };
    }

    // ============ Study Time Insights ============
    function studyTimeInsights() {
        const trackerData = JSON.parse(localStorage.getItem('sohcse_progress_tracker') || '{}');
        const attempts = trackerData.attempts || [];

        // Hour-of-day activity
        const hourActivity = new Array(24).fill(0);
        // Day-of-week activity
        const dayActivity = [0, 0, 0, 0, 0, 0, 0];
        // Last 30 days daily activity
        const dailyActivity = {};

        for (const a of attempts) {
            const d = new Date(a.timestamp);
            hourActivity[d.getHours()]++;
            dayActivity[d.getDay()]++;
            const dateStr = d.toISOString().slice(0, 10);
            dailyActivity[dateStr] = (dailyActivity[dateStr] || 0) + 1;
        }

        // Find peak hours (top 3)
        const peakHours = hourActivity
            .map((count, hour) => ({ hour, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .filter(h => h.count > 0);

        // Categorize time of day
        const morning = hourActivity.slice(5, 12).reduce((s, n) => s + n, 0);
        const afternoon = hourActivity.slice(12, 17).reduce((s, n) => s + n, 0);
        const evening = hourActivity.slice(17, 21).reduce((s, n) => s + n, 0);
        const night = hourActivity.slice(21, 24).reduce((s, n) => s + n, 0) + hourActivity.slice(0, 5).reduce((s, n) => s + n, 0);

        const totalActivity = morning + afternoon + evening + night;
        const timeOfDay = totalActivity > 0 ? {
            morning: { count: morning, pct: Math.round((morning / totalActivity) * 100) },
            afternoon: { count: afternoon, pct: Math.round((afternoon / totalActivity) * 100) },
            evening: { count: evening, pct: Math.round((evening / totalActivity) * 100) },
            night: { count: night, pct: Math.round((night / totalActivity) * 100) },
        } : null;

        // Avg session length (estimate from clustering of attempts)
        const sessionLengths = [];
        const sorted = [...attempts].sort((a, b) => a.timestamp - b.timestamp);
        let sessionStart = null;
        let lastTime = null;
        for (const a of sorted) {
            if (!sessionStart) {
                sessionStart = a.timestamp;
                lastTime = a.timestamp;
            } else if (a.timestamp - lastTime > 30 * 60 * 1000) {
                // Gap > 30 min — new session
                sessionLengths.push((lastTime - sessionStart) / 60000); // minutes
                sessionStart = a.timestamp;
            }
            lastTime = a.timestamp;
        }
        if (sessionStart && lastTime) sessionLengths.push((lastTime - sessionStart) / 60000);

        const avgSessionLength = sessionLengths.length > 0
            ? Math.round(sessionLengths.reduce((s, n) => s + n, 0) / sessionLengths.length)
            : 0;
        const totalStudyMinutes = sessionLengths.reduce((s, n) => s + n, 0);

        // Last 7 days vs previous 7 days comparison
        const now = Date.now();
        const last7 = attempts.filter(a => a.timestamp > now - 7 * 24 * 60 * 60 * 1000).length;
        const prev7 = attempts.filter(a => a.timestamp > now - 14 * 24 * 60 * 60 * 1000 && a.timestamp <= now - 7 * 24 * 60 * 60 * 1000).length;
        const weekOverWeek = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : (last7 > 0 ? 100 : 0);

        return {
            peakHours,
            timeOfDay,
            dayOfWeek: dayActivity,
            avgSessionMinutes: avgSessionLength,
            totalStudyMinutes,
            totalSessions: sessionLengths.length,
            last7DaysActivity: last7,
            prev7DaysActivity: prev7,
            weekOverWeekChange: weekOverWeek,
            dailyActivity,
        };
    }

    // ============ Performance Trajectory ============
    function performanceTrajectory() {
        const trackerData = JSON.parse(localStorage.getItem('sohcse_progress_tracker') || '{}');
        const attempts = trackerData.attempts || [];

        if (attempts.length < 10) return null;

        // Sort by timestamp
        const sorted = [...attempts].sort((a, b) => a.timestamp - b.timestamp);

        // Split into 5 buckets
        const bucketSize = Math.floor(sorted.length / 5);
        const buckets = [];
        for (let i = 0; i < 5; i++) {
            const start = i * bucketSize;
            const end = i === 4 ? sorted.length : (i + 1) * bucketSize;
            const bucket = sorted.slice(start, end);
            const correct = bucket.filter(a => a.correct).length;
            const accuracy = bucket.length > 0 ? Math.round((correct / bucket.length) * 100) : 0;
            buckets.push({
                index: i,
                count: bucket.length,
                correct,
                accuracy,
                startTime: bucket[0]?.timestamp,
                endTime: bucket[bucket.length - 1]?.timestamp,
            });
        }

        // Trend: compare first half vs second half
        const firstHalf = buckets.slice(0, 2);
        const secondHalf = buckets.slice(3);
        const firstAvg = firstHalf.reduce((s, b) => s + b.accuracy, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((s, b) => s + b.accuracy, 0) / secondHalf.length;
        const trend = secondAvg - firstAvg;

        let trendLabel, trendColor;
        if (trend > 10) { trendLabel = '📈 Improving'; trendColor = '#10b981'; }
        else if (trend > 0) { trendLabel = '➡ Slightly improving'; trendColor = '#3b82f6'; }
        else if (trend > -10) { trendLabel = '⬇ Slightly declining'; trendColor = '#f59e0b'; }
        else { trendLabel = '📉 Declining — review needed'; trendColor = '#ef4444'; }

        // Subject trajectory (which subjects are improving?)
        const subjectBuckets = {};
        for (const a of sorted) {
            if (!a.subject) continue;
            if (!subjectBuckets[a.subject]) subjectBuckets[a.subject] = [];
            subjectBuckets[a.subject].push(a);
        }

        const subjectTrajectories = {};
        for (const [subj, subjAttempts] of Object.entries(subjectBuckets)) {
            if (subjAttempts.length < 5) continue;
            const halfIdx = Math.floor(subjAttempts.length / 2);
            const firstCorrect = subjAttempts.slice(0, halfIdx).filter(a => a.correct).length;
            const secondCorrect = subjAttempts.slice(halfIdx).filter(a => a.correct).length;
            const firstTotal = halfIdx;
            const secondTotal = subjAttempts.length - halfIdx;
            if (firstTotal === 0 || secondTotal === 0) continue;
            const firstAcc = (firstCorrect / firstTotal) * 100;
            const secondAcc = (secondCorrect / secondTotal) * 100;
            subjectTrajectories[subj] = {
                change: Math.round(secondAcc - firstAcc),
                firstAcc: Math.round(firstAcc),
                secondAcc: Math.round(secondAcc),
                total: subjAttempts.length,
            };
        }

        return {
            buckets,
            trend,
            trendLabel,
            trendColor,
            subjectTrajectories,
            currentAccuracy: buckets[buckets.length - 1]?.accuracy || 0,
            startingAccuracy: buckets[0]?.accuracy || 0,
        };
    }

    // ============ Personalized Insights ============
    function generateInsights() {
        const insights = [];
        const streak = forecastStreak();
        const timeData = studyTimeInsights();
        const trajectory = performanceTrajectory();

        // Streak insights
        if (streak.riskLevel === 'danger') {
            insights.push({
                type: 'urgent',
                icon: '⏰',
                title: 'Streak at risk!',
                desc: streak.riskMessage,
                action: 'Practice now',
                href: './pyq.html',
            });
        } else if (streak.currentStreak >= 7) {
            insights.push({
                type: 'success',
                icon: '🔥',
                title: `${streak.currentStreak}-day streak!`,
                desc: `You're on fire. Best day to study: ${streak.bestDay}.`,
                action: 'Keep going',
                href: './pyq.html',
            });
        }

        // Study time insights
        if (timeData.peakHours.length > 0) {
            const topHour = timeData.peakHours[0];
            const hour12 = topHour.hour === 0 ? '12 AM' : topHour.hour < 12 ? `${topHour.hour} AM` : topHour.hour === 12 ? '12 PM' : `${topHour.hour - 12} PM`;
            insights.push({
                type: 'info',
                icon: '⏰',
                title: `Peak study hour: ${hour12}`,
                desc: `You attempt ${topHour.count} questions at this hour. Schedule important topics around this time.`,
            });
        }

        if (timeData.weekOverWeekChange > 20) {
            insights.push({
                type: 'success',
                icon: '📈',
                title: 'Activity up ' + timeData.weekOverWeekChange + '%',
                desc: `You've practiced ${timeData.last7DaysActivity} questions in the last 7 days vs ${timeData.prev7DaysActivity} the week before. Keep the momentum!`,
            });
        } else if (timeData.weekOverWeekChange < -20) {
            insights.push({
                type: 'warning',
                icon: '📉',
                title: 'Activity down ' + Math.abs(timeData.weekOverWeekChange) + '%',
                desc: `You practiced ${timeData.last7DaysActivity} questions this week vs ${timeData.prev7DaysActivity} last week. Take a small step today to rebuild momentum.`,
                action: 'Practice 5 PYQs',
                href: './pyq.html',
            });
        }

        // Performance trajectory
        if (trajectory) {
            if (trajectory.trend > 10) {
                insights.push({
                    type: 'success',
                    icon: '🎯',
                    title: 'Accuracy improving!',
                    desc: `Your accuracy went from ${trajectory.startingAccuracy}% to ${trajectory.currentAccuracy}% — a ${trajectory.trend} point improvement. Great progress!`,
                });
            } else if (trajectory.trend < -10) {
                insights.push({
                    type: 'warning',
                    icon: '⚠️',
                    title: 'Accuracy declining',
                    desc: `Your accuracy dropped from ${trajectory.startingAccuracy}% to ${trajectory.currentAccuracy}%. Consider revisiting fundamentals with flashcards.`,
                    action: 'Review flashcards',
                    href: './flashcards.html',
                });
            }

            // Subject trajectory — find most improved and most declined
            const subjTraj = Object.entries(trajectory.subjectTrajectories);
            if (subjTraj.length > 0) {
                const mostImproved = subjTraj.sort((a, b) => b[1].change - a[1].change)[0];
                if (mostImproved[1].change > 15) {
                    const label = mostImproved[0].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                    insights.push({
                        type: 'success',
                        icon: '🚀',
                        title: `Most improved: ${label}`,
                        desc: `Accuracy up ${mostImproved[1].change} points (${mostImproved[1].firstAcc}% → ${mostImproved[1].secondAcc}%).`,
                    });
                }
            }
        }

        // Session length insights
        if (timeData.avgSessionMinutes > 0) {
            if (timeData.avgSessionMinutes < 15) {
                insights.push({
                    type: 'info',
                    icon: '⏱',
                    title: 'Short study sessions',
                    desc: `Your average session is ${timeData.avgSessionMinutes} min. Consider longer focused sessions (25-45 min) for deeper learning.`,
                    action: 'Start Pomodoro',
                    href: './timer.html',
                });
            } else if (timeData.avgSessionMinutes > 60) {
                insights.push({
                    type: 'success',
                    icon: '🧘',
                    title: 'Deep focus sessions',
                    desc: `Your average session is ${timeData.avgSessionMinutes} min — excellent for deep work. Take regular breaks to avoid burnout.`,
                });
            }
        }

        return insights;
    }

    // ============ Export API ============
    window.SOH_Analytics = {
        forecastStreak,
        studyTimeInsights,
        performanceTrajectory,
        generateInsights,
    };

})();
