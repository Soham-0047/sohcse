// Compare every cached chapter's question count against a fresh fetch.
// Outputs a list of chapters where the cache is stale (count mismatch).
//
// Usage: node verify_all_chapters.js
//
// This is a read-only check — it does NOT modify the cache or the output JSON.

const fs = require('fs');
const https = require('https');

const PROGRESS_FILE = '/home/z/my-project/scripts/scrape_progress.json';

const SUBJECTS = null; // not used; we inline the subject map below

// Inline subject list (same as scrape_gate_cse.js)
const SUBJECT_MAP = {
  'algorithms': ['complexity-analysis-and-asymptotic-notations','divide-and-conquer-method','dynamic-programming','greedy-method','p-and-np-concepts','searching-and-sorting'],
  'compiler-design': ['code-generation-and-optimization','lexical-analysis','parsing','syntax-directed-translation'],
  'computer-networks': ['application-layer-protocol','concepts-of-layering','data-link-layer-and-switching','lan-technologies-and-wi-fi','network-layer','network-security','routing-algorithm','tcp-udp-sockets-and-congestion-control'],
  'computer-organization': ['alu-data-path-and-control-unit','computer-arithmetic','io-interface','machine-instructions-and-addressing-modes','memory-interfacing','pipelining','secondary-memory'],
  'data-structures': ['arrays','graphs','hashing','linked-list','stacks-and-queues','trees'],
  'database-management-system': ['er-diagrams','file-structures-and-indexing','functional-dependencies-and-normalization','relational-algebra','structured-query-language','transactions-and-concurrency'],
  'digital-logic': ['boolean-algebra','combinational-circuits','k-maps','number-systems','sequential-circuits'],
  'discrete-mathematics': ['calculus','combinatorics','graph-theory','linear-algebra','mathematical-logic','probability','set-theory-and-algebra'],
  'general-aptitude': ['logical-reasoning','numerical-ability','verbal-ability'],
  'operating-systems': ['deadlocks','file-system-io-and-protection','memory-management','process-concepts-and-cpu-scheduling','synchronization-and-concurrency'],
  'programming-languages': ['basic-of-programming-language','function-and-recursion','pointer-and-structure-in-c'],
  'software-engineering': ['software-engineering'],
  'theory-of-computation': ['finite-automata-and-regular-language','push-down-automata-and-context-free-language','recursively-enumerable-language-and-turing-machine','undecidability'],
  'web-technologies': ['web-technologies'],
};

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

function countQuestionIds(html) {
  const set = new Set();
  const re = /question_id:"([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) set.add(m[1]);
  return set;
}

async function main() {
  const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  const mismatches = [];
  let checked = 0;
  const total = Object.keys(SUBJECT_MAP).reduce((n, s) => n + SUBJECT_MAP[s].length, 0);

  for (const [subj, chapters] of Object.entries(SUBJECT_MAP)) {
    for (const chap of chapters) {
      const key = `${subj}/${chap}`;
      const url = `https://questions.examside.com/past-years/gate/gate-cse/${subj}/${chap}`;
      checked++;
      process.stderr.write(`[${checked}/${total}] ${key} ... `);
      try {
        const html = await fetchText(url);
        const siteIds = countQuestionIds(html);
        const cachedCount = progress[key] ? progress[key].question_count : -1;
        if (cachedCount !== siteIds.size) {
          mismatches.push({ key, url, cached: cachedCount, site: siteIds.size });
          process.stderr.write(`MISMATCH (cache=${cachedCount}, site=${siteIds.size})\n`);
        } else {
          process.stderr.write(`OK (${siteIds.size})\n`);
        }
      } catch (e) {
        process.stderr.write(`FETCH ERROR: ${e.message}\n`);
        mismatches.push({ key, url, error: e.message });
      }
      await new Promise(r => setTimeout(r, 600));
    }
  }

  console.log('\n=== MISMATCHES ===');
  console.log(JSON.stringify(mismatches, null, 2));
  console.log(`\nTotal mismatches: ${mismatches.length}`);
  fs.writeFileSync('/home/z/my-project/scripts/mismatches.json', JSON.stringify(mismatches, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
