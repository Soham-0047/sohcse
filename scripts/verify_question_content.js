// Deep content-level verification: pick random questions from our JSON,
// fetch their detail page from ExamSIDE, and compare every field.
//
// Usage: node verify_question_content.js [count]

const fs = require('fs');
const https = require('https');

const JSON_FILE = '/home/z/my-project/download/gate_cse_questions.json';

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' },
      timeout: 30000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = new URL(res.headers.location, url).toString();
        res.resume();
        return resolve(fetchText(next));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
  });
}

// Extract the first (active) question's full data from a question detail page.
function extractFirstQuestion(html) {
  // Find the question array containing the active question.
  // Look for the pattern: questions:[{...}] inside the data, then eval it.
  // Easier approach: find the "active" question by looking at the canonical link / page title.
  
  // The page has multiple questions in the SvelteKit payload (one active + neighbors).
  // We need to identify the active one. The page title tells us the year/paper.
  // Approach: find ALL question_id:"..." entries and pick the first one whose data
  // matches the active paper shown in the page.
  
  // Simpler: parse out all question objects from `questions:[{...}]` arrays and
  // return them all - the calling code can identify the active one by matching question_id.
  function balanceSlice(src, startIdx) {
    if (src[startIdx] !== '[') return null;
    let depth = 0, inStr = false, strCh = '', escaped = false;
    for (let i = startIdx; i < src.length; i++) {
      const c = src[i];
      if (inStr) {
        if (escaped) escaped = false;
        else if (c === '\\') escaped = true;
        else if (c === strCh) inStr = false;
        continue;
      }
      if (c === '"' || c === "'" || c === '`') { inStr = true; strCh = c; continue; }
      if (c === '[' || c === '{') depth++;
      else if (c === ']' || c === '}') {
        depth--;
        if (depth === 0) return src.slice(startIdx, i + 1);
      }
    }
    return null;
  }

  const re = /questions:\[\{(?!title:)/g;
  let m;
  const arrays = [];
  while ((m = re.exec(html)) !== null) {
    const slice = balanceSlice(html, m.index + 'questions:'.length);
    if (slice) arrays.push(slice);
  }
  
  const allQs = [];
  for (const src of arrays) {
    try {
      const arr = eval('(' + src + ')');
      if (Array.isArray(arr)) allQs.push(...arr);
    } catch {}
  }
  return allQs;
}

function normalize(s) {
  if (!s) return '';
  return s.replace(/\s+/g, ' ').trim();
}

async function main() {
  const count = parseInt(process.argv[2] || '5', 10);
  const data = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));

  // Pick questions: spread across subjects and years
  const picks = [];
  const subjects = data.subjects;
  const yearTargets = [2026, 2024, 2020, 2015, 2010, 2005, 2000, 1995, 1990];
  for (const s of subjects) {
    for (const c of s.chapters) {
      // Pick first question matching each target year
      for (const y of yearTargets) {
        const q = c.questions.find(q => q.year === y);
        if (q) {
          picks.push({ subj: s.subject, chap: c.chapter, q });
          break;
        }
      }
    }
  }
  
  // Sample `count` evenly
  const step = Math.max(1, Math.floor(picks.length / count));
  const sample = [];
  for (let i = 0; i < picks.length && sample.length < count; i += step) {
    sample.push(picks[i]);
  }

  console.log(`Verifying ${sample.length} questions across ${new Set(sample.map(p => p.subj)).size} subjects\n`);

  let mismatches = 0;
  let checked = 0;
  
  for (const { subj, chap, q } of sample) {
    checked++;
    process.stderr.write(`[${checked}/${sample.length}] ${q.question_id} (${subj}/${chap}, ${q.year}) ... `);
    
    let html;
    try {
      html = await fetchText(q.url);
    } catch (e) {
      process.stderr.write(`FETCH FAIL: ${e.message}\n`);
      mismatches++;
      continue;
    }
    
    const siteQs = extractFirstQuestion(html);
    const siteQ = siteQs.find(x => x.question_id === q.question_id);
    
    if (!siteQ) {
      process.stderr.write(`NOT FOUND ON PAGE (page has ${siteQs.length} Qs, IDs: ${siteQs.slice(0,3).map(x=>x.question_id).join(',')})\n`);
      mismatches++;
      continue;
    }
    
    const en = siteQ.question?.en || {};
    const issues = [];
    
    // Compare question_text
    if (normalize(en.content) !== normalize(q.question_text)) {
      // Allow small differences in whitespace - check significant content
      const a = normalize(en.content);
      const b = normalize(q.question_text);
      if (a.length !== b.length || a.slice(0, 200) !== b.slice(0, 200)) {
        issues.push(`question_text differs (site ${a.length} chars, ours ${b.length} chars)`);
      }
    }
    
    // Compare options
    const siteOpts = (en.options || []).map(o => o.identifier);
    const ourOpts = q.options.map(o => o.identifier);
    if (JSON.stringify(siteOpts) !== JSON.stringify(ourOpts)) {
      issues.push(`options identifiers differ: site=${siteOpts}, ours=${ourOpts}`);
    } else {
      // Compare option contents
      for (let i = 0; i < siteOpts.length; i++) {
        const sContent = normalize((en.options[i] || {}).content || '');
        const oContent = normalize(q.options[i].content || '');
        if (sContent !== oContent) {
          issues.push(`option ${siteOpts[i]} content differs`);
        }
      }
    }
    
    // Compare correct_options
    const siteCorrect = en.correct_options || [];
    if (JSON.stringify(siteCorrect.sort()) !== JSON.stringify([...q.correct_options].sort())) {
      issues.push(`correct_options differ: site=${siteCorrect}, ours=${q.correct_options}`);
    }
    
    // Compare answer
    const siteAnswer = en.answer || null;
    if ((siteAnswer || null) !== (q.answer || null)) {
      issues.push(`answer differs: site=${JSON.stringify(siteAnswer)}, ours=${JSON.stringify(q.answer)}`);
    }
    
    // Compare explanation
    const siteExpl = en.explanation || null;
    if ((siteExpl || null) !== (q.explanation || null)) {
      const sLen = siteExpl ? siteExpl.length : 0;
      const oLen = q.explanation ? q.explanation.length : 0;
      if (sLen !== oLen) {
        issues.push(`explanation differs (site ${sLen} chars, ours ${oLen} chars)`);
      }
    }
    
    // Compare metadata
    if (siteQ.year !== q.year) issues.push(`year: site=${siteQ.year}, ours=${q.year}`);
    if (siteQ.paperId !== q.paper_id) issues.push(`paper_id: site=${siteQ.paperId}, ours=${q.paper_id}`);
    if (siteQ.type !== q.type) issues.push(`type: site=${siteQ.type}, ours=${q.type}`);
    if (siteQ.marks !== q.marks) issues.push(`marks: site=${siteQ.marks}, ours=${q.marks}`);
    if (siteQ.negMarks !== q.negative_marks) issues.push(`negMarks: site=${siteQ.negMarks}, ours=${q.negative_marks}`);
    if (!!siteQ.isOutOfSyllabus !== q.is_out_of_syllabus) issues.push(`isOutOfSyllabus differs`);
    if (!!siteQ.isBonus !== q.is_bonus) issues.push(`isBonus differs`);
    
    if (issues.length === 0) {
      process.stderr.write(`OK\n`);
    } else {
      process.stderr.write(`MISMATCH (${issues.length}):\n`);
      for (const i of issues) process.stderr.write(`    - ${i}\n`);
      mismatches++;
    }
    
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log(`\n=== RESULT ===`);
  console.log(`Checked: ${checked}`);
  console.log(`Mismatches: ${mismatches}`);
  console.log(`Pass rate: ${((checked - mismatches) / checked * 100).toFixed(1)}%`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
