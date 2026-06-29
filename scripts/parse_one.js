// Parse a single ExamSIDE chapter HTML page to extract all questions.
// The chapter page has structure: questions:[{title, key, questions:[{...}]}, ...]
// We need to walk into each group's questions[] array.
//
// Usage: node parse_one.js <html_file>
// Outputs JSON array of questions to stdout.

const fs = require('fs');

const file = process.argv[2];
if (!file) {
  console.error('Usage: node parse_one.js <html_file>');
  process.exit(1);
}

const html = fs.readFileSync(file, 'utf8');

// Find the outer questions:[{title:...}] array (the "groups" array).
function findOuterArray(src) {
  // Marker for the start of the groups array on a chapter page.
  const marker = 'groupMode:"marks",questions:[';
  const i = src.indexOf(marker);
  if (i === -1) return null;
  const startIdx = i + marker.length - 1; // points at `[`
  return balanceSlice(src, startIdx);
}

// Find the inner questions:[{question_id:...}] arrays.
function findInnerArrays(src) {
  const results = [];
  const re = /questions:\[\{question_id:/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const startIdx = m.index + m[0].length - 1; // points at `[`
    // The `[` is at position m.index + 'questions:'.length
    const slice = balanceSlice(src, m.index + 'questions:'.length);
    if (slice) results.push(slice);
  }
  return results;
}

// Given src and a position of `[`, return the slice up to and including the matching `]`.
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

const innerArrays = findInnerArrays(html);
if (innerArrays.length === 0) {
  console.error('No question arrays found.');
  process.exit(2);
}

// Each inner array contains question objects but they use a "compact" format:
// {question_id,chapter,chapterGroup,country,difficulty,exam,examGroup,...}
// We need to extract the full question data. But the chapter page compact form may not include
// question text/options/answer — let's check.

// Try evaluating the first inner array to see what fields are present.
let firstArr;
try {
  firstArr = eval('(' + innerArrays[0] + ')');
} catch (e) {
  console.error('Eval failed on first array:', e.message);
  fs.writeFileSync('/tmp/inner_first.js', innerArrays[0]);
  process.exit(3);
}

// Print keys of first item to stderr for debugging.
if (firstArr.length > 0) {
  console.error('First question keys:', Object.keys(firstArr[0]).join(','));
  console.error('First question sample:', JSON.stringify(firstArr[0]).slice(0, 600));
}

// Combine all inner arrays.
const all = [];
for (const src of innerArrays) {
  let arr;
  try { arr = eval('(' + src + ')'); }
  catch (e) {
    console.error('Eval failed on an inner array:', e.message);
    continue;
  }
  for (const q of arr) all.push(q);
}

console.error(`Total questions extracted: ${all.length}`);

console.log(JSON.stringify(all, null, 2));
