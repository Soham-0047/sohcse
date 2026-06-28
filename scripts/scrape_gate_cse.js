// Scrape all GATE CSE previous-year questions from ExamSIDE.
// Fetches each chapter page, parses the embedded SvelteKit payload,
// and writes a single consolidated JSON file organized by subject > chapter > questions.
//
// Output: /home/z/my-project/download/gate_cse_questions.json
//
// Usage: node scrape_gate_cse.js

const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE = 'https://questions.examside.com';
const OUT_FILE = '/home/z/my-project/download/gate_cse_questions.json';
const PROGRESS_FILE = '/home/z/my-project/scripts/scrape_progress.json';

// Subject -> [chapter slug, chapter slug, ...]
// 'index' chapter means the subject-level page itself has questions we should also pull.
const SUBJECTS = {
  'algorithms': [
    'complexity-analysis-and-asymptotic-notations',
    'divide-and-conquer-method',
    'dynamic-programming',
    'greedy-method',
    'p-and-np-concepts',
    'searching-and-sorting',
  ],
  'compiler-design': [
    'code-generation-and-optimization',
    'lexical-analysis',
    'parsing',
    'syntax-directed-translation',
  ],
  'computer-networks': [
    'application-layer-protocol',
    'concepts-of-layering',
    'data-link-layer-and-switching',
    'lan-technologies-and-wi-fi',
    'network-layer',
    'network-security',
    'routing-algorithm',
    'tcp-udp-sockets-and-congestion-control',
  ],
  'computer-organization': [
    'alu-data-path-and-control-unit',
    'computer-arithmetic',
    'io-interface',
    'machine-instructions-and-addressing-modes',
    'memory-interfacing',
    'pipelining',
    'secondary-memory',
  ],
  'data-structures': [
    'arrays',
    'graphs',
    'hashing',
    'linked-list',
    'stacks-and-queues',
    'trees',
  ],
  'database-management-system': [
    'er-diagrams',
    'file-structures-and-indexing',
    'functional-dependencies-and-normalization',
    'relational-algebra',
    'structured-query-language',
    'transactions-and-concurrency',
  ],
  'digital-logic': [
    'boolean-algebra',
    'combinational-circuits',
    'k-maps',
    'number-systems',
    'sequential-circuits',
  ],
  'discrete-mathematics': [
    'calculus',
    'combinatorics',
    'graph-theory',
    'linear-algebra',
    'mathematical-logic',
    'probability',
    'set-theory-and-algebra',
  ],
  'general-aptitude': [
    'logical-reasoning',
    'numerical-ability',
    'verbal-ability',
  ],
  'operating-systems': [
    'deadlocks',
    'file-system-io-and-protection',
    'memory-management',
    'process-concepts-and-cpu-scheduling',
    'synchronization-and-concurrency',
  ],
  'programming-languages': [
    'basic-of-programming-language',
    'function-and-recursion',
    'pointer-and-structure-in-c',
  ],
  'software-engineering': [
    'software-engineering',
  ],
  'theory-of-computation': [
    'finite-automata-and-regular-language',
    'push-down-automata-and-context-free-language',
    'recursively-enumerable-language-and-turing-machine',
    'undecidability',
  ],
  'web-technologies': [
    'web-technologies',
  ],
};

// ---------- Fetch helper ----------
function fetchText(url, { retries = 3, timeoutMs = 30000 } = {}) {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      const req = https.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: timeoutMs,
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = new URL(res.headers.location, url).toString();
          res.resume();
          return resolve(fetchText(next, { retries, timeoutMs }));
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      });
      req.on('timeout', () => {
        req.destroy(new Error('timeout'));
      });
      req.on('error', (err) => {
        if (n < retries) {
          setTimeout(() => attempt(n + 1), 1500 * (n + 1));
        } else {
          reject(err);
        }
      });
    };
    attempt(0);
  });
}

// ---------- Parser ----------
function balanceSlice(src, startIdx) {
  if (src[startIdx] !== '[') return null;
  let depth = 0;
  let inStr = false;
  let strCh = '';
  let escaped = false;
  for (let i = startIdx; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (escaped) { escaped = false; }
      else if (c === '\\') { escaped = true; }
      else if (c === strCh) { inStr = false; }
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      inStr = true; strCh = c; continue;
    }
    if (c === '[' || c === '{') depth++;
    else if (c === ']' || c === '}') {
      depth--;
      if (depth === 0) return src.slice(startIdx, i + 1);
    }
  }
  return null;
}

function findInnerQuestionArrays(src) {
  const results = [];
  // Match `questions:[{` but NOT when immediately followed by `title:` (that's the outer groups array).
  // The inner question arrays start with any of the question fields, in any order.
  const re = /questions:\[\{(?!title:)/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const startIdx = m.index + 'questions:'.length;
    const slice = balanceSlice(src, startIdx);
    if (slice) results.push(slice);
  }
  return results;
}

function parseChapterHtml(html) {
  const innerArrays = findInnerQuestionArrays(html);
  const all = [];
  for (const src of innerArrays) {
    let arr;
    try { arr = eval('(' + src + ')'); }
    catch (e) { continue; }
    for (const q of arr) all.push(q);
  }
  return all;
}

function cleanQuestion(q) {
  const en = q.question && q.question.en ? q.question.en : {};
  return {
    question_id: q.question_id || null,
    year: q.year ?? null,
    paper_id: q.paperId || null,
    paper_title: q.paperTitle || null,
    type: q.type || null,
    marks: q.marks ?? null,
    negative_marks: q.negMarks ?? null,
    topic: q.topic || q.topicName || null,
    is_out_of_syllabus: !!q.isOutOfSyllabus,
    is_bonus: !!q.isBonus,
    permalink: q.permalink || null,
    url: q.permalink ? `${BASE}/past-years/gate/question/${q.permalink}` : null,
    question_text: en.content || null,
    options: Array.isArray(en.options) ? en.options.map(o => ({ identifier: o.identifier, content: o.content })) : [],
    correct_options: Array.isArray(en.correct_options) ? en.correct_options : [],
    answer: en.answer || null,
    explanation: en.explanation || null,
  };
}

// ---------- Progress (resume support) ----------
function loadProgress() {
  try {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  } catch { return {}; }
}
function saveProgress(p) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2));
}

// ---------- Main ----------
async function main() {
  const progress = loadProgress();
  const subjects = Object.keys(SUBJECTS);
  const result = {
    source: BASE + '/past-years/gate/gate-cse',
    scraped_at: new Date().toISOString(),
    total_subjects: subjects.length,
    total_chapters: subjects.reduce((n, s) => n + SUBJECTS[s].length, 0),
    total_questions: 0,
    subjects: [],
  };

  let totalQuestions = 0;
  let processedChapters = 0;
  const totalChapters = result.total_chapters;

  for (const subjectKey of subjects) {
    const chapters = SUBJECTS[subjectKey];
    const subjectEntry = {
      subject: subjectKey,
      subject_label: subjectKey.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      subject_url: `${BASE}/past-years/gate/gate-cse/${subjectKey}`,
      total_chapters: chapters.length,
      total_questions: 0,
      chapters: [],
    };

    for (const chapterSlug of chapters) {
      const url = `${BASE}/past-years/gate/gate-cse/${subjectKey}/${chapterSlug}`;
      const chapterKey = `${subjectKey}/${chapterSlug}`;
      processedChapters++;

      // Resume: skip if already done
      if (progress[chapterKey]) {
        console.error(`[${processedChapters}/${totalChapters}] SKIP (cached) ${chapterKey} - ${progress[chapterKey].question_count} Qs`);
        subjectEntry.chapters.push({
          chapter: chapterSlug,
          chapter_label: chapterSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          chapter_url: url,
          question_count: progress[chapterKey].question_count,
          questions: progress[chapterKey].questions,
        });
        subjectEntry.total_questions += progress[chapterKey].question_count;
        totalQuestions += progress[chapterKey].question_count;
        continue;
      }

      let html;
      try {
        process.stderr.write(`[${processedChapters}/${totalChapters}] FETCH ${chapterKey} ... `);
        html = await fetchText(url);
      } catch (err) {
        process.stderr.write(`FAIL: ${err.message}\n`);
        // Record empty entry so we keep structure but mark as failed.
        subjectEntry.chapters.push({
          chapter: chapterSlug,
          chapter_label: chapterSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          chapter_url: url,
          question_count: 0,
          questions: [],
          error: err.message,
        });
        continue;
      }

      const rawQs = parseChapterHtml(html);
      const cleanedQs = rawQs.map(cleanQuestion);

      // Deduplicate by question_id (chapter page may list same Q under multiple groups).
      const seen = new Set();
      const dedupedQs = cleanedQs.filter(q => {
        if (!q.question_id) return true;
        if (seen.has(q.question_id)) return false;
        seen.add(q.question_id);
        return true;
      });

      const chapEntry = {
        chapter: chapterSlug,
        chapter_label: chapterSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        chapter_url: url,
        question_count: dedupedQs.length,
        questions: dedupedQs,
      };
      subjectEntry.chapters.push(chapEntry);
      subjectEntry.total_questions += dedupedQs.length;
      totalQuestions += dedupedQs.length;

      // Persist progress so we can resume.
      progress[chapterKey] = {
        question_count: dedupedQs.length,
        questions: dedupedQs,
      };
      saveProgress(progress);

      process.stderr.write(`OK - ${dedupedQs.length} Qs\n`);

      // Be polite - 800ms between requests.
      await new Promise(r => setTimeout(r, 800));
    }

    result.subjects.push(subjectEntry);
    // Save partial result after each subject.
    result.total_questions = totalQuestions;
    fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(result, null, 2));
    process.stderr.write(`  -> Subject done: ${subjectKey} (${subjectEntry.total_questions} Qs). Saved partial.\n`);
  }

  result.total_questions = totalQuestions;
  fs.writeFileSync(OUT_FILE, JSON.stringify(result, null, 2));
  process.stderr.write(`\n=== DONE ===\nTotal subjects: ${result.total_subjects}\nTotal chapters: ${result.total_chapters}\nTotal questions: ${totalQuestions}\nOutput: ${OUT_FILE}\n`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
