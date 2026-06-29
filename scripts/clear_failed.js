// Re-scrape only the chapters that previously returned 0 questions.
// We do this by clearing their entries from the progress file and re-running.
const fs = require('fs');

const PROGRESS_FILE = '/home/z/my-project/scripts/scrape_progress.json';
const failed = [
  'computer-networks/network-security',
  'software-engineering/software-engineering',
  'theory-of-computation/undecidability',
  'web-technologies/web-technologies',
];

const p = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
for (const k of failed) {
  if (p[k]) {
    console.log(`Removing cached entry for ${k} (had ${p[k].question_count} Qs)`);
    delete p[k];
  }
}
fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2));
console.log('Done. Re-run scrape_gate_cse.js to refetch these chapters.');
