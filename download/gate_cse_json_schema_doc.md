# GATE CSE Questions — JSON Schema Documentation

> **Source file:** `gate_cse_questions.json` (~7.3 MB, **2,736 questions**)
> **Origin:** Scraped from `https://questions.examside.com/past-years/gate/gate-cse`
> **Use case:** Backend data source for a GATE CSE practice / quiz website.
> **Last verified:** All 66 chapters match the source site exactly (0 mismatches).

---

## 1. Top-Level Structure

The file is a single JSON object with metadata, a nested `subjects[]` array, and a `stats` block.

```jsonc
{
  "source": "https://questions.examside.com/past-years/gate/gate-cse",
  "scraped_at": "2026-06-28T17:07:47.704Z",
  "processed_at": "2026-06-28T18:00:00.000Z",
  "total_subjects": 14,
  "total_chapters": 66,
  "total_questions": 2736,
  "subjects": [ /* Subject[] */ ],
  "stats": {
    "total_questions": 2736,
    "with_answer": 2730,
    "with_explanation": 896,
    "answer_coverage_pct": 99.78,
    "explanation_coverage_pct": 32.75,
    "by_type": { "mcq": 2018, "nat": 415, "msq": 171, "subjective": 92, "true_false": 27, "fill_blanks": 13 },
    "by_year": { "1987": 14, "1988": 4, /* ... */ "2026": 130 },
    "year_range": { "min": 1987, "max": 2026 }
  }
}
```

| Field              | Type     | Description                                            |
| ------------------ | -------- | ------------------------------------------------------ |
| `source`           | string   | URL of the original ExamSIDE index page                |
| `scraped_at`       | ISO date | When the scrape was run                                |
| `processed_at`     | ISO date | When the post-processing (enrichment + sort) was run   |
| `total_subjects`   | number   | Count of subjects (14)                                 |
| `total_chapters`   | number   | Count of chapters (66)                                 |
| `total_questions`  | number   | Count of questions across all chapters (2,736)         |
| `subjects`         | array    | See §2                                                 |
| `stats`            | object   | Aggregated statistics — see §7.5                       |

---

## 2. Subject Object

Each subject groups its chapters and carries rollup counts.

```jsonc
{
  "subject": "operating-systems",
  "subject_label": "Operating Systems",
  "subject_url": "https://questions.examside.com/past-years/gate/gate-cse/operating-systems",
  "total_chapters": 5,
  "total_questions": 255,
  "chapters": [ /* Chapter[] */ ]
}
```

| Field              | Type   | Description                                                      |
| ------------------ | ------ | ---------------------------------------------------------------- |
| `subject`          | string | URL-safe slug, e.g. `"operating-systems"` — use as route param  |
| `subject_label`    | string | Human-readable title (Title Case)                                |
| `subject_url`      | string | Canonical URL on ExamSIDE                                        |
| `total_chapters`   | number | Number of chapters under this subject                            |
| `total_questions`  | number | Sum of questions across all chapters                             |
| `chapters`         | array  | See §3                                                           |

---

## 3. Chapter Object

```jsonc
{
  "chapter": "deadlocks",
  "chapter_label": "Deadlocks",
  "chapter_url": "https://questions.examside.com/past-years/gate/gate-cse/operating-systems/deadlocks",
  "question_count": 26,
  "questions": [ /* Question[] */ ]
}
```

| Field              | Type   | Description                                              |
| ------------------ | ------ | -------------------------------------------------------- |
| `chapter`          | string | URL-safe slug, e.g. `"deadlocks"` — use as route param  |
| `chapter_label`    | string | Human-readable title                                     |
| `chapter_url`      | string | Canonical URL on ExamSIDE                                |
| `question_count`   | number | `questions.length` after deduplication                   |
| `questions`        | array  | See §4                                                   |

---

## 4. Question Object

This is the core entity. Every question is **self-contained** — it carries its own subject/chapter denormalization plus pre-computed flags so you can filter without walking the tree.

```jsonc
{
  "question_id": "5RPhN3W9WzBk6vWf",
  "year": 2016,
  "paper_id": "gate-cse-2016-set-2",
  "paper_title": "GATE CSE 2016 Set 2",
  "type": "integer",
  "normalized_type": "nat",          // canonical type, see §5
  "marks": 2,
  "negative_marks": 0,
  "topic": null,
  "is_out_of_syllabus": false,
  "is_bonus": false,
  "permalink": "the-given-diagram-shows-the-flowchart-...",
  "url": "https://questions.examside.com/past-years/gate/question/the-given-diagram-...",
  "question_text": "The given diagram shows the flowchart for a recursive function...",
  "options": [],
  "correct_options": [],
  "answer": "2.2 to 2.4",
  "has_answer": true,                // true if correct_options OR answer is non-empty
  "has_explanation": false,
  "explanation": null,
  "subject": "algorithms",            // denormalized for flat queries
  "subject_label": "Algorithms",
  "chapter": "complexity-analysis-and-asymptotic-notations",
  "chapter_label": "Complexity Analysis And Asymptotic Notations"
}
```

### Field reference

| Field                | Type     | Nullable | Description                                                                                          |
| -------------------- | -------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `question_id`        | string   | no       | Stable unique ID from ExamSIDE. Use as primary key.                                                  |
| `year`               | number   | no       | 4-digit year of the GATE paper (1987 – 2026)                                                         |
| `paper_id`           | string   | no       | Exam paper key, e.g. `"gate-cse-2005"`, `"gate-cse-2026-set-1"`                                      |
| `paper_title`        | string   | no       | Human-readable paper title                                                                           |
| `type`               | string   | no       | Raw type from source — see §5                                                                        |
| `normalized_type`    | string   | no       | Canonical type: `mcq` / `msq` / `nat` / `subjective` / `fill_blanks` / `true_false` — see §5        |
| `marks`              | number   | no       | Positive marks for correct answer (1, 2, or 5 for old subjective)                                    |
| `negative_marks`     | number   | no       | Marks deducted for wrong answer (0, 0.33, 0.67, etc.)                                                |
| `topic`              | string   | **yes**  | Sub-topic name, usually `null`                                                                      |
| `is_out_of_syllabus` | boolean  | no       | True if question is from a removed topic                                                             |
| `is_bonus`           | boolean  | no       | True if everyone was awarded marks (no correct answer counted)                                       |
| `permalink`          | string   | no       | ExamSIDE permalink (last path segment)                                                              |
| `url`                | string   | no       | Full URL back to source                                                                              |
| `question_text`      | string   | **yes**  | HTML (may include `<p>`, `<br>`, `<code>`, `<sup>`, `<img>`, `$...$` LaTeX) — see §6                |
| `options`            | array    | **yes**  | `[{identifier, content}]` — empty for NAT/subjective/fill_blanks                                     |
| `correct_options`    | string[] | **yes**  | Array of correct option identifiers, e.g. `["A"]` or `["A","C"]`. Empty for non-MCQ.                 |
| `answer`             | string   | **yes**  | For NAT: numeric answer (may be a range like `"2.2 to 2.4"`). For fill_blanks: LaTeX. Else `null`. |
| `has_answer`         | boolean  | no       | Pre-computed: `correct_options.length > 0 \|\| answer != null`                                       |
| `has_explanation`    | boolean  | no       | Pre-computed: `explanation != null && explanation.trim() != ""`                                      |
| `explanation`        | string   | **yes**  | HTML solution walkthrough. Present on ~33% of questions.                                             |
| `subject`            | string   | no       | Subject slug (denormalized)                                                                          |
| `subject_label`      | string   | no       | Subject title (denormalized)                                                                         |
| `chapter`            | string   | no       | Chapter slug (denormalized)                                                                          |
| `chapter_label`      | string   | no       | Chapter title (denormalized)                                                                         |

### Option object

| Field         | Type   | Description                                            |
| ------------- | ------ | ------------------------------------------------------ |
| `identifier`  | string | `"A"` / `"B"` / `"C"` / `"D"` (sometimes `"E"`)        |
| `content`     | string | HTML — same rules as `question_text`                   |

---

## 5. Question Types

The source exposes six raw `type` values. We map them to a canonical `normalized_type` so your UI only has to handle six cases.

| `type` (raw)    | `normalized_type` | Meaning                                | Has `options`? | How to grade                                            |
| ---------------- | ----------------- | -------------------------------------- | -------------- | ------------------------------------------------------- |
| `"mcq"`          | `mcq`             | Single correct MCQ                     | yes            | User picks 1 option. Correct if it equals `correct_options[0]`. |
| `"mcqm"`         | `msq`             | Multiple-correct MSQ (GATE 2021+)      | yes            | User toggles N options. Correct iff their set equals `correct_options`. |
| `"msq"`          | `msq`             | Older MSQ variant (rare)               | yes            | Same as `mcqm`.                                         |
| `"nat"`          | `nat`             | Numerical Answer Type (GATE 2016+)     | **no**         | Compare `answer` (string) to user input. Use float tolerance. |
| `"integer"`      | `nat`             | Older numerical variant (pre-2016)     | **no**         | Same as `nat`.                                          |
| `"t/f"`          | `true_false`      | Old true/false (2 options: A=True, B=False) | yes       | Treat like `mcq`.                                       |
| `"fill-blanks"`  | `fill_blanks`     | Old fill-in-the-blank (pre-2000)       | **no**         | `answer` field contains the expected text (often LaTeX). |
| `"subjective"`   | `subjective`      | Old long-answer (pre-2000)             | **no**         | Not gradable — show `answer` as a reference solution if present. |

### Special notes on `answer` for NAT questions
The `answer` field for NAT questions can be:
- A single number: `"9"`, `"30"`, `"0.5"`
- A range: `"2.2 to 2.4"`, `"48 to 52"`
- A LaTeX expression (rare, for fill_blanks): `"$$\Theta (m\log m)$$"`
- The string `"Solve by yourself"` (rare, for subjective questions where ExamSIDE doesn't expose the answer)

**Grading suggestion:**
```typescript
function isNATCorrect(userInput: string, expectedAnswer: string): boolean {
  // Handle ranges
  const rangeMatch = expectedAnswer.match(/^(-?\d+(?:\.\d+)?)\s*to\s*(-?\d+(?:\.\d+)?)$/);
  if (rangeMatch) {
    const [, lo, hi] = rangeMatch;
    const v = parseFloat(userInput);
    return v >= parseFloat(lo) - 0.01 && v <= parseFloat(hi) + 0.01;
  }
  // Single value
  const expected = parseFloat(expectedAnswer);
  const actual = parseFloat(userInput);
  if (Number.isNaN(expected) || Number.isNaN(actual)) return false;
  return Math.abs(expected - actual) < 0.01;
}
```

### Questions without answers
**6 questions** (out of 2,736) have `has_answer: false` — ExamSIDE does not expose the official answer for them, only an explanation. They are:
- 4 NAT questions from GATE 2025 Set 1 (`m7wyc2cx`, `m7wyc2ua`, `m7wyc123`, `m7wyc0jq`)
- 1 MCQ from GATE 2026 (`mmz108ru`)
- 1 bonus MCQ from GATE 2020 (`T9jNzVxZA6ZGyUPgNs1da9i2ynkcpqntsk`) — bonus questions have no official answer

Show a graceful "Answer not available" message for these.

---

## 6. Rendering Rules (IMPORTANT)

Three content fields carry HTML + LaTeX, not plain text:
- `question_text`
- `options[].content`
- `explanation`

You MUST handle these three things or your UI will look broken:

### 6.1 HTML tags
Content includes `<p>`, `<br>`, `<b>`, `<i>`, `<code>`, `<pre>`, `<ul>`, `<li>`, `<sup>`, `<sub>`, `<table>`, etc.
**Render with `dangerouslySetInnerHTML` (React) or `v-html` (Vue)** — but sanitize first (DOMPurify) to be safe.

### 6.2 LaTeX math (KaTeX / MathJax)
- Inline math: `$x^2 + y^2 = r^2$`
- Display math: `$$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$$`
- Use `react-katex` / `katex` directly. Replace `$...$` and `$$...$$` with rendered components before injecting HTML.

### 6.3 Unicode escapes
Some strings contain `\u003C` (= `<`) etc. JSON parsers decode these automatically — don't double-decode.

### 6.4 Recommended pipeline
```
raw HTML string
  → split into {html, math[]} chunks
  → sanitize html with DOMPurify
  → render html via dangerouslySetInnerHTML
  → render each math chunk with <InlineMath> or <BlockMath>
```

Libraries that handle this for you:
- React: `react-katex` + `react-html-parser` (or `dangerouslySetInnerHTML` + DOMPurify)
- Vue: `vue-katex` + `v-html`

---

## 7. TypeScript Types

Drop these into `src/types/question.ts`:

```typescript
export interface Option {
  identifier: string;   // "A" | "B" | "C" | "D" | "E"
  content: string;      // HTML
}

// Raw types from ExamSIDE
export type RawQuestionType = "mcq" | "mcqm" | "msq" | "nat" | "integer" | "t/f" | "fill-blanks" | "subjective";

// Canonical types after normalization
export type NormalizedQuestionType = "mcq" | "msq" | "nat" | "subjective" | "fill_blanks" | "true_false";

export interface Question {
  question_id: string;
  year: number;
  paper_id: string;
  paper_title: string;
  type: RawQuestionType;
  normalized_type: NormalizedQuestionType;
  marks: number;
  negative_marks: number;
  topic: string | null;
  is_out_of_syllabus: boolean;
  is_bonus: boolean;
  permalink: string;
  url: string;
  question_text: string | null;       // HTML
  options: Option[];                  // empty for NAT/subjective/fill_blanks
  correct_options: string[];          // empty for non-MCQ
  answer: string | null;              // numeric string / range / LaTeX / null
  has_answer: boolean;
  has_explanation: boolean;
  explanation: string | null;         // HTML, ~33% coverage
  subject: string;                    // denormalized
  subject_label: string;
  chapter: string;
  chapter_label: string;
}

export interface Chapter {
  chapter: string;
  chapter_label: string;
  chapter_url: string;
  question_count: number;
  questions: Question[];   // sorted by year DESC, then paper_id, then question_id
}

export interface Subject {
  subject: string;
  subject_label: string;
  subject_url: string;
  total_chapters: number;
  total_questions: number;
  chapters: Chapter[];
}

export interface Stats {
  total_questions: number;
  with_answer: number;
  with_explanation: number;
  answer_coverage_pct: number;
  explanation_coverage_pct: number;
  by_type: Record<NormalizedQuestionType, number>;
  by_year: Record<string, number>;
  year_range: { min: number; max: number };
}

export interface GateCseData {
  source: string;
  scraped_at: string;
  processed_at: string;
  total_subjects: number;
  total_chapters: number;
  total_questions: number;
  subjects: Subject[];
  stats: Stats;
}
```

---

## 8. Loading & Querying (JavaScript)

### 8.1 Load the file once at build time

For Next.js, put the JSON in `src/data/` and import it directly:

```typescript
// src/lib/data.ts
import data from "@/data/gate_cse_questions.json";
import type { GateCseData, Question, Subject, Chapter } from "@/types/question";

export const gateData = data as GateCseData;

export const subjects = gateData.subjects;

export function getSubject(slug: string): Subject | undefined {
  return gateData.subjects.find((s) => s.subject === slug);
}

export function getChapter(subjectSlug: string, chapterSlug: string): Chapter | undefined {
  return getSubject(subjectSlug)?.chapters.find((c) => c.chapter === chapterSlug);
}

export function getQuestion(questionId: string): Question | undefined {
  for (const s of gateData.subjects) {
    for (const c of s.chapters) {
      const q = c.questions.find((q) => q.question_id === questionId);
      if (q) return q;
    }
  }
  return undefined;
}
```

### 8.2 Build lookup indices for performance

For ~2,500 questions, a flat index makes everything O(1):

```typescript
// src/lib/index.ts
import { gateData } from "./data";
import type { Question } from "@/types/question";

export const allQuestions: Question[] = gateData.subjects.flatMap((s) =>
  s.chapters.flatMap((c) => c.questions)
);

export const questionsById = new Map(allQuestions.map((q) => [q.question_id, q]));

export const questionsByYear = new Map<number, Question[]>();
for (const q of allQuestions) {
  const arr = questionsByYear.get(q.year) ?? [];
  arr.push(q);
  questionsByYear.set(q.year, arr);
}

export const questionsByPaper = new Map<string, Question[]>();
for (const q of allQuestions) {
  const arr = questionsByPaper.get(q.paper_id) ?? [];
  arr.push(q);
  questionsByPaper.set(q.paper_id, arr);
}
```

### 8.3 Grading helper

```typescript
import type { Question } from "@/types/question";

export function gradeQuestion(q: Question, userAnswer: UserAnswer): "correct" | "wrong" {
  switch (q.normalized_type) {
    case "mcq":
    case "true_false": {
      if (q.correct_options.length === 0) return "wrong";
      const expected = q.correct_options[0];
      return userAnswer.selectedOptions?.[0] === expected ? "correct" : "wrong";
    }
    case "msq": {
      if (q.correct_options.length === 0) return "wrong";
      const expected = new Set(q.correct_options);
      const actual = new Set(userAnswer.selectedOptions ?? []);
      return expected.size === actual.size && [...expected].every(x => actual.has(x))
        ? "correct" : "wrong";
    }
    case "nat": {
      if (!q.answer) return "wrong";
      return isNATCorrect(userAnswer.numeric ?? "", q.answer) ? "correct" : "wrong";
    }
    case "fill_blanks":
    case "subjective":
    default:
      // Not auto-gradable
      return "wrong";
  }
}

function isNATCorrect(userInput: string, expectedAnswer: string): boolean {
  // Handle ranges: "2.2 to 2.4"
  const rangeMatch = expectedAnswer.match(/^(-?\d+(?:\.\d+)?)\s*to\s*(-?\d+(?:\.\d+)?)$/);
  if (rangeMatch) {
    const [, lo, hi] = rangeMatch;
    const v = parseFloat(userInput);
    if (Number.isNaN(v)) return false;
    return v >= parseFloat(lo) - 0.01 && v <= parseFloat(hi) + 0.01;
  }
  // Single value
  const expected = parseFloat(expectedAnswer);
  const actual = parseFloat(userInput);
  if (Number.isNaN(expected) || Number.isNaN(actual)) return false;
  return Math.abs(expected - actual) < 0.01;
}

interface UserAnswer {
  selectedOptions?: string[];  // for mcq/msq/true_false
  numeric?: string;            // for nat
}
```

---

## 9. Suggested URL Structure

Map the JSON slugs directly to routes:

| Route                                                      | JSON path                                          |
| --------------------------------------------------------- | -------------------------------------------------- |
| `/subjects`                                               | `data.subjects`                                    |
| `/subjects/[subjectSlug]`                                 | `getSubject(subjectSlug)`                          |
| `/subjects/[subjectSlug]/[chapterSlug]`                   | `getChapter(subjectSlug, chapterSlug)`             |
| `/subjects/[subjectSlug]/[chapterSlug]/[questionId]`      | `getQuestion(questionId)`                          |
| `/years/[year]`                                           | `questionsByYear.get(year)`                        |
| `/papers/[paperId]`                                       | `questionsByPaper.get(paperId)`                    |

---

## 10. Common Pitfalls

| Pitfall                                                            | Fix                                                                                         |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Question text shows raw `<p>` tags                                 | Render via `dangerouslySetInnerHTML` after DOMPurify sanitize                               |
| Math shows raw `$x^2$`                                             | Add KaTeX/MathJax rendering — see §6.4                                                      |
| MSQ graded as MCQ                                                  | Check `type === "mcqm" \|\| type === "msq"` and require set equality                        |
| NAT question has empty `correct_options`                           | Use `answer` field instead; compare with float tolerance                                    |
| `negative_marks` is `0` not `null`                                 | It's always a number. `0` = no negative marking.                                            |
| Same question appears under multiple groups                        | Already deduplicated by `question_id` during scrape                                          |
| `explanation` is `null` for ~67% of questions                      | Show "Explanation not available" gracefully                                                  |
| Some `answer` strings are ranges like `"2.2 to 2.4"`               | Parse with regex; compare user input against the range, not equality                          |
| Some `answer` strings are LaTeX like `"$$\Theta (m\log m)$$"`      | Only happens for `fill_blanks` type. Render as math, don't try to grade.                      |
| Some `answer` is literally `"Solve by yourself"`                   | Happens for old subjective questions. Treat `has_answer` as false for these.                  |
| `paper_id` for older years doesn't have a `-set-X` suffix          | Pre-2014 GATE CSE had single papers — `gate-cse-2005`, not `gate-cse-2005-set-1`            |
| Some `question_text` contains `\u003C`                             | JSON parser decodes this for you. Don't double-process.                                      |
| `is_bonus: true` means everyone got marks                          | Show a "Bonus" badge; still display the official correct answer if present                    |
| Years 2014+ have multiple sets (`gate-cse-2014-set-1` etc.)        | When filtering by year, also offer "by set" if `paper_id` contains `-set-`                  |
| 6 questions have `has_answer: false`                               | ExamSIDE doesn't expose the official answer — show "Answer not available"                     |
| Old questions (pre-2000) may be `t/f`, `fill-blanks`, `subjective` | Use `normalized_type` instead of `type` in your switch statements                             |

---

## 11. Quick Stats (for marketing / dashboard)

- **2,736 questions** across **14 subjects** and **66 chapters**
- **40 years** of papers (1987 – 2026)
- **99.78%** have a correct answer (only 6 questions have no exposed answer)
- **32.75%** have a full written explanation
- **Type breakdown:**
  - MCQ (single correct): 2,018
  - NAT (numerical answer type): 415
  - MSQ (multiple correct): 171
  - Subjective (old long-answer): 92
  - True/False (old): 27
  - Fill-in-the-blanks (old): 13
- Largest subject: **Discrete Mathematics** (555 Qs)
- Smallest subjects: **Web Technologies** (3 Qs), **Software Engineering** (24 Qs)
- Heaviest years: 2015 (165), 2014 (151), 2024 (130), 2025 (130), 2026 (130)
- All 66 chapter counts verified against the source site (0 mismatches as of last scrape)

---

## 12. File Manifest

```
download/
├── gate_cse_questions.json        # 7.3 MB, the data file documented above
└── gate_cse_json_schema_doc.md    # this document

scripts/
├── scrape_gate_cse.js             # main scraper (resume-capable via scrape_progress.json)
├── postprocess.js                 # enriches JSON: normalized_type, has_answer, denormalization, sort, stats
├── verify_all_chapters.js         # sanity check: compares cached counts vs fresh site counts
├── parse_one.js                   # debug parser for a single chapter HTML
├── clear_failed.js                # utility: clears cached 0-question chapters
├── scrape_progress.json           # cache of per-chapter results (for resume)
└── mismatches.json                # output of verify_all_chapters.js (chapters needing re-scrape)
```

---

**End of schema doc.** Drop the JSON into `src/data/`, copy the types from §7, and you should be able to scaffold subject/chapter/question routes in under an hour.
