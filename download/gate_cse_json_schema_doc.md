# GATE CSE Questions — JSON Schema Documentation

> **Source file:** `gate_cse_questions.json` (~6 MB, ~2,575 questions)
> **Origin:** Scraped from `https://questions.examside.com/past-years/gate/gate-cse`
> **Use case:** Backend data source for a GATE CSE practice / quiz website.

---

## 1. Top-Level Structure

The file is a single JSON object with metadata + a nested `subjects[]` array.

```jsonc
{
  "source": "https://questions.examside.com/past-years/gate/gate-cse",
  "scraped_at": "2026-06-28T17:07:47.704Z",
  "total_subjects": 14,
  "total_chapters": 66,
  "total_questions": 2575,
  "subjects": [ /* Subject[] */ ]
}
```

| Field              | Type     | Description                                            |
| ------------------ | -------- | ------------------------------------------------------ |
| `source`           | string   | URL of the original ExamSIDE index page                |
| `scraped_at`       | ISO date | When the scrape was run                                |
| `total_subjects`   | number   | Count of subjects (14)                                 |
| `total_chapters`   | number   | Count of chapters (66)                                 |
| `total_questions`  | number   | Count of questions across all chapters (2,575)         |
| `subjects`         | array    | See §2                                                 |

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

This is the core entity. Every question carries its own metadata, so you can flatten the array if you prefer a denormalized table.

```jsonc
{
  "question_id": "mmz0yv1u",
  "year": 2026,
  "paper_id": "gate-cse-2026-set-1",
  "paper_title": "GATE CSE 2026 Set 1",
  "type": "mcqm",
  "marks": 1,
  "negative_marks": 0,
  "topic": null,
  "is_out_of_syllabus": false,
  "is_bonus": false,
  "permalink": "pwith-respect-to-deadlocks-in-an-operating-system-which-o-...",
  "url": "https://questions.examside.com/past-years/gate/question/pwith-respect-to-...",
  "question_text": "<p>With respect to deadlocks in an operating system, which of the following statements is/are FALSE?</p>\n",
  "options": [
    { "identifier": "A", "content": "<p>Banker's algorithm is used to prevent deadlocks</p>\n" },
    { "identifier": "B", "content": "<p>Deadlock formation can be prevented by ensuring that the hold and wait condition is not allowed</p>\n" },
    { "identifier": "C", "content": "<p>An assignment edge in a resource allocation graph is marked from a process to a resource</p>\n" },
    { "identifier": "D", "content": "<p>A safe state guarantees that all processes can finish without formation of a deadlock</p>" }
  ],
  "correct_options": ["A", "C"],
  "answer": null,
  "explanation": "<p>(a) Banker's algorithm ensures that the system never enters an unsafe state...</p>"
}
```

### Field reference

| Field                | Type     | Nullable | Description                                                                                          |
| -------------------- | -------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `question_id`        | string   | no       | Stable unique ID from ExamSIDE. Use as primary key.                                                  |
| `year`               | number   | no       | 4-digit year of the GATE paper (1987 – 2026)                                                         |
| `paper_id`           | string   | no       | Exam paper key, e.g. `"gate-cse-2005"`, `"gate-cse-2026-set-1"`                                      |
| `paper_title`        | string   | no       | Human-readable paper title                                                                           |
| `type`               | string   | no       | Question type — see §5                                                                               |
| `marks`              | number   | no       | Positive marks for correct answer (1 or 2)                                                           |
| `negative_marks`     | number   | no       | Marks deducted for wrong answer (0, 0.33, 0.67, etc.)                                                |
| `topic`              | string   | **yes**  | Sub-topic name, usually `null`                                                                      |
| `is_out_of_syllabus` | boolean  | no       | True if question is from a removed topic                                                             |
| `is_bonus`           | boolean  | no       | True if everyone was awarded marks (no correct answer counted)                                       |
| `permalink`          | string   | no       | ExamSIDE permalink (last path segment)                                                              |
| `url`                | string   | no       | Full URL back to source                                                                              |
| `question_text`      | string   | **yes**  | HTML (may include `<p>`, `<br>`, `<code>`, `<sup>`, `$...$` LaTeX) — see §6                         |
| `options`            | array    | **yes**  | `[{identifier, content}]` — empty for NAT questions                                                  |
| `correct_options`    | string[] | **yes**  | Array of correct option identifiers, e.g. `["A"]` or `["A","C"]`. Empty for NAT.                     |
| `answer`             | string   | **yes**  | Correct numerical answer for NAT questions, otherwise `null`                                         |
| `explanation`        | string   | **yes**  | HTML solution walkthrough. Present on ~35% of questions.                                             |

### Option object

| Field         | Type   | Description                                            |
| ------------- | ------ | ------------------------------------------------------ |
| `identifier`  | string | `"A"` / `"B"` / `"C"` / `"D"` (sometimes `"E"`)        |
| `content`     | string | HTML — same rules as `question_text`                   |

---

## 5. Question Types

The `type` field tells you how to render and grade the question.

| `type` value | Meaning                                | Has `options`? | How to grade                                            |
| ------------ | -------------------------------------- | -------------- | ------------------------------------------------------- |
| `"mcq"`      | Single correct MCQ                     | yes            | User picks 1 option. Correct if it's in `correct_options` (length 1). |
| `"mcqm"`     | Multiple-correct MSQ (GATE 2021+)      | yes            | User toggles N options. Correct iff their set equals `correct_options`. |
| `"nat"`      | Numerical Answer Type                  | **no**         | Compare `answer` (string) to user input. Use tolerance for floats. |
| `"msq"`      | Older MSQ variant (rare)               | yes            | Same as `mcqm`.                                         |

> **Tip:** Treat `mcqm` and `msq` identically in your UI. Both grade as "set equality with `correct_options`".

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

export type QuestionType = "mcq" | "mcqm" | "msq" | "nat";

export interface Question {
  question_id: string;
  year: number;
  paper_id: string;
  paper_title: string;
  type: QuestionType;
  marks: number;
  negative_marks: number;
  topic: string | null;
  is_out_of_syllabus: boolean;
  is_bonus: boolean;
  permalink: string;
  url: string;
  question_text: string | null;       // HTML
  options: Option[];                  // empty for NAT
  correct_options: string[];          // empty for NAT
  answer: string | null;              // numeric string for NAT, else null
  explanation: string | null;         // HTML, ~35% coverage
}

export interface Chapter {
  chapter: string;
  chapter_label: string;
  chapter_url: string;
  question_count: number;
  questions: Question[];
}

export interface Subject {
  subject: string;
  subject_label: string;
  subject_url: string;
  total_chapters: number;
  total_questions: number;
  chapters: Chapter[];
}

export interface GateCseData {
  source: string;
  scraped_at: string;
  total_subjects: number;
  total_chapters: number;
  total_questions: number;
  subjects: Subject[];
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

export function gradeQuestion(q: Question, userAnswer: UserAnswer): "correct" | "wrong" | "partial" {
  if (q.type === "nat") {
    if (!q.answer) return "wrong";
    const expected = parseFloat(q.answer);
    const actual = parseFloat(userAnswer.numeric ?? "");
    if (Number.isNaN(actual)) return "wrong";
    // GATE allows 2-decimal tolerance
    return Math.abs(expected - actual) < 0.01 ? "correct" : "wrong";
  }

  // mcq / mcqm / msq
  const expected = new Set(q.correct_options);
  const actual = new Set(userAnswer.selectedOptions ?? []);
  if (expected.size === actual.size && [...expected].every((x) => actual.has(x))) {
    return "correct";
  }
  // Partial marking for MSQ (GATE rule): each correct selection +1, each wrong -1, no negative total
  return "partial";
}

interface UserAnswer {
  selectedOptions?: string[];  // for mcq/mcqm/msq
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
| `explanation` is `null` for ~65% of questions                      | Show "Explanation not available" gracefully                                                  |
| `paper_id` for older years doesn't have a `-set-X` suffix          | Pre-2014 GATE CSE had single papers — `gate-cse-2005`, not `gate-cse-2005-set-1`            |
| Some `question_text` contains `\u003C`                             | JSON parser decodes this for you. Don't double-process.                                      |
| `is_bonus: true` means everyone got marks                          | Show a "Bonus" badge; still display the official correct answer                              |
| Years 2014+ have multiple sets (`gate-cse-2014-set-1` etc.)        | When filtering by year, also offer "by set" if `paper_id` contains `-set-`                  |

---

## 11. Quick Stats (for marketing / dashboard)

- **2,575 questions** across **14 subjects** and **66 chapters**
- **40 years** of papers (1987 – 2026)
- **99.8%** have a correct answer
- **34.6%** have a full written explanation
- Largest subject: **Discrete Mathematics** (541 Qs)
- Smallest subjects: **Web Technologies** (3 Qs), **Software Engineering** (24 Qs)

---

## 12. File Manifest

```
download/
└── gate_cse_questions.json        # 6 MB, the data file documented above

scripts/
├── scrape_gate_cse.js             # main scraper (resume-capable)
├── parse_one.js                   # debug parser for a single chapter HTML
├── clear_failed.js                # utility: clears cached 0-question chapters
└── scrape_progress.json           # cache of per-chapter results (for resume)
```

---

**End of schema doc.** Drop the JSON into `src/data/`, copy the types from §7, and you should be able to scaffold subject/chapter/question routes in under an hour.
