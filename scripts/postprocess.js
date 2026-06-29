// Post-process the scraped JSON:
// 1. Add `normalized_type` field that maps source types to a canonical set: mcq | msq | nat | subjective | fill_blanks | true_false
// 2. Add `has_answer` and `has_explanation` boolean fields for easy filtering
// 3. Add per-question `subject` and `chapter` fields (denormalized) so each question is self-contained
// 4. Re-sort questions within each chapter by year descending (newest first)
// 5. Recompute all rollup counts
// 6. Write a small "stats" block at the top level
//
// Usage: node postprocess.js

const fs = require('fs');

const IN_FILE = '/home/z/my-project/download/gate_cse_questions.json';
const OUT_FILE = '/home/z/my-project/download/gate_cse_questions.json';

function normalizeType(t) {
  switch (t) {
    case 'mcq':    return 'mcq';
    case 'mcqm':   return 'msq';
    case 'msq':    return 'msq';
    case 'nat':    return 'nat';
    case 'integer': return 'nat';      // GATE Numerical Answer Type
    case 't/f':    return 'true_false';
    case 'fill-blanks': return 'fill_blanks';
    case 'subjective': return 'subjective';
    default: return t || 'unknown';
  }
}

function main() {
  const data = JSON.parse(fs.readFileSync(IN_FILE, 'utf8'));

  let totalQ = 0;
  const typeCounter = {};
  const yearCounter = {};
  let withAnswer = 0;
  let withExplanation = 0;

  for (const subj of data.subjects) {
    let subjQ = 0;
    for (const chap of subj.chapters) {
      // Enrich each question
      for (const q of chap.questions) {
        q.subject = subj.subject;
        q.subject_label = subj.subject_label;
        q.chapter = chap.chapter;
        q.chapter_label = chap.chapter_label;
        q.normalized_type = normalizeType(q.type);
        q.has_answer = (Array.isArray(q.correct_options) && q.correct_options.length > 0) || !!q.answer;
        q.has_explanation = !!q.explanation && q.explanation.trim().length > 0;

        if (q.has_answer) withAnswer++;
        if (q.has_explanation) withExplanation++;
        totalQ++;
        subjQ++;
        typeCounter[q.normalized_type] = (typeCounter[q.normalized_type] || 0) + 1;
        if (q.year) yearCounter[q.year] = (yearCounter[q.year] || 0) + 1;
      }

      // Sort by year desc, then by paper_id, then by question_id for stability
      chap.questions.sort((a, b) => {
        if (a.year !== b.year) return (b.year || 0) - (a.year || 0);
        if (a.paper_id !== b.paper_id) return (a.paper_id || '').localeCompare(b.paper_id || '');
        return (a.question_id || '').localeCompare(b.question_id || '');
      });
      chap.question_count = chap.questions.length;
    }
    subj.total_questions = subjQ;
    subj.total_chapters = subj.chapters.length;
  }

  data.total_questions = totalQ;
  data.total_subjects = data.subjects.length;
  data.total_chapters = data.subjects.reduce((n, s) => n + s.chapters.length, 0);

  // Add a stats block
  data.stats = {
    total_questions: totalQ,
    with_answer: withAnswer,
    with_explanation: withExplanation,
    answer_coverage_pct: Number(((100 * withAnswer) / totalQ).toFixed(2)),
    explanation_coverage_pct: Number(((100 * withExplanation) / totalQ).toFixed(2)),
    by_type: typeCounter,
    by_year: yearCounter,
    year_range: {
      min: Math.min(...Object.keys(yearCounter).map(Number)),
      max: Math.max(...Object.keys(yearCounter).map(Number)),
    },
  };

  // Update scraped_at to "post-processed at"
  data.processed_at = new Date().toISOString();

  fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2));
  console.error(`Done. Total questions: ${totalQ}`);
  console.error(`With answer: ${withAnswer} (${((100 * withAnswer) / totalQ).toFixed(1)}%)`);
  console.error(`With explanation: ${withExplanation} (${((100 * withExplanation) / totalQ).toFixed(1)}%)`);
  console.error(`Type distribution:`, typeCounter);
  console.error(`Year range: ${data.stats.year_range.min} - ${data.stats.year_range.max}`);
}

main();
