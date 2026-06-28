// Verify special-type questions: subjective, fill-blanks, t/f, integer with range answers,
// bonus questions, and old questions (pre-2000).
// Picks 2 of each special category and verifies against the source page.

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

function extractAllQuestions(html) {
  const re = /questions:\[\{(?!title:)/g;
  let m;
  const arrays = [];
  while ((m = re.exec(html)) !== null) {
    const slice = balanceSlice(html, m.index + 'questions:'.length);
    if (slice) arrays.push(slice);
  }
  const all = [];
  for (const src of arrays) {
    try {
      const arr = eval('(' + src + ')');
      if (Array.isArray(arr)) all.push(...arr);
    } catch {}
  }
  return all;
}

function normalize(s) {
  if (!s) return '';
  return s.replace(/\s+/g, ' ').trim();
}

async function verifyQuestion(q, label) {
  process.stdout.write(`[${label}] ${q.question_id} (${q.subject}/${q.chapter}, ${q.year}, type=${q.type}) ... `);
  let html;
  try {
    html = await fetchText(q.url);
  } catch (e) {
    console.log(`FETCH FAIL: ${e.message}`);
    return false;
  }
  const siteQs = extractAllQuestions(html);
  const siteQ = siteQs.find(x => x.question_id === q.question_id);
  if (!siteQ) {
    console.log(`NOT FOUND ON PAGE`);
    return false;
  }
  const en = siteQ.question?.en || {};
  const issues = [];
  
  if (normalize(en.content) !== normalize(q.question_text)) {
    const a = normalize(en.content);
    const b = normalize(q.question_text);
    if (a.length !== b.length) {
      issues.push(`question_text length: site=${a.length} ours=${b.length}`);
      if (a.length > 0 && b.length > 0) {
        // Show first difference
        const minLen = Math.min(a.length, b.length, 300);
        for (let i = 0; i < minLen; i++) {
          if (a[i] !== b[i]) {
            issues.push(`  first diff at char ${i}: site=${JSON.stringify(a.slice(Math.max(0,i-20), i+30))}, ours=${JSON.stringify(b.slice(Math.max(0,i-20), i+30))}`);
            break;
          }
        }
      }
    }
  }
  
  const siteOpts = (en.options || []).map(o => o.identifier).join(',');
  const ourOpts = q.options.map(o => o.identifier).join(',');
  if (siteOpts !== ourOpts) issues.push(`option IDs: site=${siteOpts} ours=${ourOpts}`);
  
  const siteCorrect = (en.correct_options || []).sort().join(',');
  const ourCorrect = [...q.correct_options].sort().join(',');
  if (siteCorrect !== ourCorrect) issues.push(`correct_options: site=${siteCorrect} ours=${ourCorrect}`);
  
  if ((en.answer || null) !== (q.answer || null)) {
    issues.push(`answer: site=${JSON.stringify(en.answer)} ours=${JSON.stringify(q.answer)}`);
  }
  
  if ((en.explanation || null) !== (q.explanation || null)) {
    const sLen = en.explanation ? en.explanation.length : 0;
    const oLen = q.explanation ? q.explanation.length : 0;
    if (sLen !== oLen) issues.push(`explanation length: site=${sLen} ours=${oLen}`);
  }
  
  if (siteQ.year !== q.year) issues.push(`year: site=${siteQ.year} ours=${q.year}`);
  if (siteQ.paperId !== q.paper_id) issues.push(`paper_id: site=${siteQ.paperId} ours=${q.paper_id}`);
  if (siteQ.type !== q.type) issues.push(`type: site=${siteQ.type} ours=${q.type}`);
  if (siteQ.marks !== q.marks) issues.push(`marks: site=${siteQ.marks} ours=${q.marks}`);
  if (siteQ.negMarks !== q.negative_marks) issues.push(`negMarks: site=${siteQ.negMarks} ours=${q.negative_marks}`);
  if (!!siteQ.isOutOfSyllabus !== q.is_out_of_syllabus) issues.push(`isOutOfSyllabus differs`);
  if (!!siteQ.isBonus !== q.is_bonus) issues.push(`isBonus differs`);
  
  if (issues.length === 0) {
    console.log(`OK`);
    return true;
  } else {
    console.log(`MISMATCH:`);
    for (const i of issues) console.log(`    - ${i}`);
    return false;
  }
}

async function main() {
  const data = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
  
  // Build flat list of all questions
  const allQs = [];
  for (const s of data.subjects) {
    for (const c of s.chapters) {
      for (const q of c.questions) {
        allQs.push(q);
      }
    }
  }
  
  // Pick 2 of each special category
  const categories = {
    'subjective':   allQs.filter(q => q.type === 'subjective'),
    'fill-blanks':  allQs.filter(q => q.type === 'fill-blanks'),
    't/f':          allQs.filter(q => q.type === 't/f'),
    'integer-range':allQs.filter(q => q.type === 'integer' && q.answer && q.answer.includes('to')),
    'bonus':        allQs.filter(q => q.is_bonus),
    'pre-1995':     allQs.filter(q => q.year < 1995),
    'mcqm-2021+':   allQs.filter(q => q.type === 'mcqm' && q.year >= 2021),
    'no-answer':    allQs.filter(q => !q.has_answer),
  };
  
  let totalChecked = 0;
  let totalPass = 0;
  
  for (const [cat, qs] of Object.entries(categories)) {
    console.log(`\n=== ${cat} (${qs.length} available, checking 2) ===`);
    for (const q of qs.slice(0, 2)) {
      totalChecked++;
      const ok = await verifyQuestion(q, cat);
      if (ok) totalPass++;
      await new Promise(r => setTimeout(r, 400));
    }
  }
  
  console.log(`\n=== FINAL ===`);
  console.log(`Checked: ${totalChecked}`);
  console.log(`Passed: ${totalPass}`);
  console.log(`Pass rate: ${(100*totalPass/totalChecked).toFixed(1)}%`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
