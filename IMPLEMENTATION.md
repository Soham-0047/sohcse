# SOH CSE — Complete Implementation Document

> **Project:** GATE CSE Preparation Platform  
> **Repository:** [Soham-0047/sohcse](https://github.com/Soham-0047/sohcse)  
> **Live Site:** [soham-0047.github.io/sohcse](https://soham-0047.github.io/sohcse/)  
> **Last Updated:** July 1, 2026  
> **Total Files:** 24 (15 HTML pages + 4 JS + 4 data files + 1 CSS)  
> **Total Size:** ~8 MB (7.3 MB is PYQ data)

---

## Table of Contents

1. [Overview](#1-overview)
2. [File Structure](#2-file-structure)
3. [Pages & Features](#3-pages--features)
4. [AI Engine (chatbot.js)](#4-ai-engine-chatbotjs)
5. [Theme & Interactions (theme.js)](#5-theme--interactions-themejs)
6. [Navigation (nav.js)](#6-navigation-navjs)
7. [Performance (loader.js)](#7-performance-loaderjs)
8. [Design System (style.css)](#8-design-system-stylecss)
9. [Data Files](#9-data-files)
10. [Keyboard Shortcuts](#10-keyboard-shortcuts)
11. [Data Sources](#11-data-sources)
12. [Deployment Instructions](#12-deployment-instructions)

---

## 1. Overview

SOH CSE is a **complete, self-contained GATE CSE preparation platform** built as a static website (HTML + CSS + vanilla JS). No backend, no build step, no dependencies — just open and use. All data persists in the browser via `localStorage`.

### Core Philosophy
- **Everything in-app** — no external redirects for study content
- **Works offline** — all data embedded or cached
- **Mobile-first** — responsive on all devices
- **Dark mode** — full theme system with persistence
- **AI-powered** — 5-mode AI tutor with voice input
- **Premium UX** — glassmorphism, spring animations, skeleton loaders

### Key Numbers
| Metric | Value |
|--------|-------|
| Previous Year Questions | 2,736 (1987–2026) |
| Subjects Covered | 14 |
| Chapters | 66 |
| Study PDFs | 70+ |
| Flashcards | 63 |
| Formulas | 33 |
| Concept Notes | 13 |
| PW Short Notes | 12 (free PDFs) |
| Curated Video Playlists | 30+ |
| External Resources | 50+ (34 in-app) |

---

## 2. File Structure

```
sohcse/
├── index.html              # Landing page (15 feature cards, hero, stats)
├── learn.html              # Concept notes (13 topics, KaTeX math)
├── syllabus.html           # Complete GATE CSE syllabus (66 topics)
├── materials.html          # PDF viewer + PW short notes (12 PDFs)
├── pyq.html                # 2,736 PYQs with practice mode
├── videos.html             # Premium video player (theater, mini, search)
├── flashcards.html         # Spaced repetition (63 cards, 3D flip)
├── quiz.html               # Quiz generator (built-in + AI)
├── progress.html           # Analytics dashboard (heatmap, streaks)
├── planner.html            # Study planner (calendar, tasks)
├── resources.html          # Resource hub (50+ links, 34 in-app)
├── calculator.html         # GATE virtual calculator
├── formulas.html           # Formula book (33 formulas, KaTeX)
├── timer.html              # Pomodoro timer (progress ring)
├── notes.html              # Personal notebook (LaTeX support)
├── style.css               # Shared design system (2,864 lines)
├── chatbot.js              # AI engine v3 (5 modes, voice, 5 providers)
├── theme.js                # Dark mode, shortcuts, onboarding, ripple
├── nav.js                  # Dropdown nav, mobile bottom nav, in-app browser
├── loader.js               # Prefetch, batched KaTeX, debounce, skeletons
├── gate_cse_data.js        # 2,736 PYQs (7.3 MB)
├── flashcards_data.js      # 63 flashcard definitions
├── videos_data.js          # 14 subject video catalogs
└── pw_notes_data.js        # 12 PhysicsWallah short note PDFs
```

---

## 3. Pages & Features

### 3.1 Landing Page (`index.html`)

**Hero Section:**
- Animated badge with pulsing dot ("Updated for GATE 2027")
- Gradient animated title ("GATE CSE" shimmer text)
- Two CTAs: Start Studying / Practice PYQs
- 4 animated stat counters (2,736 / 70 / 14 / 40)

**"Continue Where You Left Off" Banner:**
- Tracks last studied topic across all pages
- Shows on homepage with icon + topic name
- Click to resume instantly
- Persists in localStorage

**Feature Grid (15 cards):**
1. 📖 Learn — Concept Notes
2. 📋 Complete Syllabus
3. 📚 Study Materials (70+ PDFs)
4. 📝 Previous Year Questions (2,736)
5. 🤖 AI Tutor v3 (5 modes)
6. 🎥 Video Lectures (in-app player)
7. 🎴 Flashcards (spaced repetition)
8. 🎯 Quiz Generator
9. 📊 Progress Dashboard
10. 📅 Study Planner
11. 🧮 GATE Virtual Calculator
12. 📐 Formula Book
13. ⏱ Pomodoro Timer
14. 📓 Personal Notebook
15. 🚀 GATE 2027 Resources

**How It Works Section:** 3-step workflow (Learn → Practice → Track)

**Subject Grid:** 14 subjects with icons, question counts, and click-to-navigate

---

### 3.2 Learn — Concept Notes (`learn.html`)

**Sidebar:** Subject list with all topics, searchable  
**Content:** 13 comprehensive concept notes with:

| Subject | Topics |
|---------|--------|
| Algorithms | Time Complexity & Master Theorem, Sorting Comparison, Dynamic Programming |
| Data Structures | BST & AVL Trees, Hashing & Collision Resolution |
| Operating Systems | CPU Scheduling, Deadlocks & Banker's Algorithm |
| DBMS | Normalization (1NF–BCNF), Transactions & ACID |
| Computer Networks | IP Addressing & Subnetting, TCP Congestion Control |
| Theory of Computation | Finite Automata & Regular Languages |
| Digital Logic | Number Systems & Conversions |

**Each note includes:**
- KaTeX-rendered math ($O(n \log n)$, $\Theta(n^2)$, etc.)
- Comparison tables (sorting algorithms, IP classes, TCP versions)
- Code blocks (C code for Quick Sort, etc.)
- "🎯 GATE Tip" callout boxes
- Links to practice PYQs for the topic
- "Ask AI about this" button

---

### 3.3 Syllabus (`syllabus.html`)

**Complete official GATE CSE syllabus** organized by 11 sections:

| Section | Weightage | Topics |
|---------|-----------|--------|
| Engineering Mathematics | ~15% | 7 topics (Set Theory, Graph Theory, Combinatorics, Logic, Linear Algebra, Calculus, Probability) |
| Digital Logic | ~5% | 5 topics |
| Computer Organization | ~8% | 7 topics |
| Programming & Data Structures | ~12% | 9 topics |
| Algorithms | ~12% | 6 topics |
| Theory of Computation | ~7% | 4 topics |
| Compiler Design | ~5% | 4 topics |
| Operating System | ~10% | 5 topics |
| Databases | ~10% | 6 topics |
| Computer Networks | ~8% | 8 topics |
| General Aptitude | 15% | 3 topics |

**Total: 66 topics**, each with:
- Topic name + description
- 📝 PYQs button → links to that chapter's PYQs
- 📖 Learn button → links to concept notes

**Plus:** Exam structure summary (65 questions, 100 marks, MCQ/MSQ/NAT breakdown)

---

### 3.4 Study Materials (`materials.html`)

**Sidebar:** Folder tree navigation (21 folders, 99 PDFs) with:
- Folders (📁) and files (📄) with hover animations
- Breadcrumb navigation
- Instant search across all files
- Collapsible sidebar (icons only when collapsed)

**PDF Viewer:**
- In-app iframe viewer (no external redirect)
- PDF.js text extraction for AI context
- Fullscreen and close controls
- Loading state

**PW Short Notes Section (12 free PDFs):**
| Subject | Source |
|---------|--------|
| Engineering Mathematics | PhysicsWallah |
| Digital Logic | PhysicsWallah |
| Computer Organization & Architecture | PhysicsWallah |
| Programming & Data Structures | PhysicsWallah |
| Algorithms | PhysicsWallah |
| Theory of Computation | PhysicsWallah |
| Compiler Design | PhysicsWallah |
| Operating System | PhysicsWallah |
| General Aptitude | PhysicsWallah |
| Discrete Mathematics | PhysicsWallah |
| Database Management System | PhysicsWallah |
| Computer Network | PhysicsWallah |

Each card: 📖 View (in-app) + ⬇ Download buttons

**File Structure (existing PDFs):**
- Algorithms: Cormen, Sahani, Handout, Notes
- OS: Galvin, Tanenbaum, Handout, Notes 1 & 2, System Calls
- DBMS: Korth, Navathe, Notes, Transactions, MSQs
- DLD: Morris Mano, Zvi Kohavi, Notes
- DMS: Rosen, Grimaldi, ACE Material, Graph Theory subfolder
- CO: Hamacher, Hennessy & Patterson, Morris Mano, VD Sir Notes
- CD: Ullman & Aho, Notes, Short Notes, Ace Material
- DS: Sahani (2 versions), Notes, Shared Notes
- TOC: Aho & Ullman, Peter Linz, Countability, Complete Notes, Notes
- PL: Dennis Ritchie, C Complete Reference, C Puzzles, Class Notes, Notes, Short Notes
- Aptitude: GRE Aptitude, RS Agarwal, Jagan Sir, NA Notes V1, NA Day 01–16
- English: Barrons 333, English 1 & 2, Verbal Ability Classnotes
- Gate Overflow: Vol 1, 2, 3
- RBR Notes: 12 subject PDFs (CN, CO, Combinatorics, Compilers, DBMS, Digital, Graph Theory, OS, Set Theory, TCS Aptitude, TOC)
- Short Notes: 7 subject-wise short notes

---

### 3.5 PYQs — Previous Year Questions (`pyq.html`)

**2,736 questions** from 1987–2026, scraped from ExamSIDE.com

**Sidebar:**
- Quick Views: Home, Weightage Analysis, Year-wise Papers, Practice Mode, Bookmarked Questions
- Subject accordion (14 subjects → 66 chapters with question counts)
- Live bookmark count badge
- Search box

**Home View:**
- 4 stat cards (Total / With Answers / With Explanations / Years)
- 3 quick action cards (Practice / Weightage / Year-wise)
- 14 subject cards

**Subject View:**
- Year-wise distribution bar chart
- Chapter grid with year ranges

**Chapter View (Questions):**
- Practice mode toggle (hide answers, track score)
- Filters: Year, Type (MCQ/MSQ/NAT/Subjective/Fill/T-F), Marks (+1/+2/+5), Special (Bonus/Out-of-Syllabus)
- 20 questions per page with pagination
- Each question card:
  - Type badge, paper title, marks, bonus/OOS badges
  - 📑 Bookmark button (saves to localStorage)
  - 🤖 Ask AI button (sends question to AI solver)
  - Source ↗ link to ExamSIDE
  - Question text (HTML with KaTeX math)
  - Options (correct ones highlighted green with ✓)
  - NAT answer box (for numerical questions)
  - Explanation toggle (expandable with KaTeX math)
  - Practice mode: click options to answer, get instant correct/wrong feedback

**Weightage Analysis View:**
- Subject-wise weightage (sorted by recent 5 years)
- Top 15 high-weight chapters
- Question type distribution (MCQ 2,018 / NAT 415 / MSQ 171 / Subjective 92 / T-F 27 / Fill 13)
- Year-wise question count (clickable bars)

**Year-wise Papers View:**
- 40 year cards (1987–2026) with question counts
- Click year → see all sets and questions
- Up to 50 questions per set displayed

**Bookmarked Questions View:**
- All saved questions with subject/chapter breadcrumb
- "Open chapter" button to jump to source
- Remove bookmark button

**Search:**
- Searches question text + option content
- Shows subject/chapter breadcrumb for each result
- Paginated results

**KaTeX Math Rendering:**
- Retry mechanism (checks every 100ms for up to 5 seconds)
- Batched rendering via `renderMathOptimized()` (5 elements per frame)
- Supports: `$...$`, `$$...$$`, `\(...\)`, `\[...\]`
- 467+ math elements rendered per page

**Practice Mode:**
- Hide all answers until user attempts
- Click options (MCQ) or type answer (NAT)
- Instant correct/wrong color feedback (green ✓ / red ✗)
- Real-time score bar (Score / Correct / Wrong)
- "Reveal All" button (ends session for current page)
- "Reset" button (clears all answers)
- Score tracking with negative marking

---

### 3.6 Video Hub (`videos.html`)

**Premium video watching experience** — completely redesigned.

**Premium Search:**
- Large rounded input with search icon
- Focus state: accent border + glow
- Trending searches (8 popular topics as chips)
- Search history (last 8 searches as pills with clear button)
- Skeleton loading (4 shimmer cards during search)
- 4 smart search results per query (GATE CSE / Full Lectures / PYQ Solutions / Shortcuts)

**Premium Video Cards:**
- Thumbnail with image or gradient placeholder
- Hover: image zoom (1.05x), gradient overlay, pulsing play button
- Duration badge (bottom-right, backdrop-blur)
- Search badge (top-left, gradient pill)
- Title (2-line clamp), channel, description (2-line clamp)
- Action buttons: Play, Add to Playlist, Save
- Hover lift: translateY(-6px) + scale(1.01) + shadow

**Premium Player:**
- Dark cinematic shell (`#0a0a0f`, 16px radius)
- Loading overlay with spinner (fades on iframe load)
- 8 control buttons: YouTube, Save, Playlist, Speed, Theater, Full, Mini, PiP
- Speed selector: 8 options (0.25x – 2x) in dropdown
- Theater mode: 21:9 aspect ratio, side panel hides
- Keyboard: T=theater, F=fullscreen, M=mini player

**Mini Player:**
- Draggable floating window (360px)
- Snap-to-corner on release
- Has own iframe (continues playing)
- Close (✕) and Expand (⛶) buttons
- Spring entrance animation

**Up Next Queue:**
- 3 toggle controls: Auto-play / Shuffle / Loop
- All states persisted in localStorage
- Queue items with thumbnails, titles, channels
- Active item highlighted with "▶ Now" overlay
- Click any item to play

**Notes Panel:**
- 3 tabs: Notes / Saved / Recent
- Timestamp input (e.g., "5:30")
- Note textarea with save button
- Note cards with timestamp links (open YouTube at exact time)
- Delete button per note
- All notes persist in localStorage

**Custom Playlists:**
- Create unlimited named playlists
- Add videos from search results or curated lists
- Remove individual videos from playlists
- Play entire playlist (sets up queue)
- Delete entire playlist

**Curated Playlists (14 subjects):**
- 2–3 playlists per subject (Gate Smashers, Neso Academy, Abdul Bari, Jenny's, etc.)
- Ankit Doyla playlists for CN and TOC (Unacademy)
- Search-based embeds for each subject
- Recommended channels per subject (3 per subject)

**5 Tabs:**
1. 📚 Curated — subject-wise playlists
2. 🔍 Search — search results
3. 🎵 Playlists — custom playlists with video management
4. ⭐ Saved — bookmarked videos
5. 🕘 Recent — watch history (last 15)

---

### 3.7 Flashcards (`flashcards.html`)

**63 high-yield GATE CSE flashcards** with spaced repetition.

**Subjects covered:** Algorithms (7), Data Structures (7), OS (7), DBMS (6), CN (6), TOC (6), CD (5), DL (5), COA (5), Discrete Math (6), Aptitude (3)

**Features:**
- 3D flip animation (click to flip, 0.6s transition)
- 4 rating buttons: Again (10min) / Hard (1day) / Good (3days) / Easy (7days)
- Consecutive good/easy ratings double the interval (up to 30 days)
- Due cards calculated from last review date
- Stats: Total / Due / Learned / Completion %
- Subject-wise decks or study all due cards
- Session completion screen
- All ratings saved in localStorage
- KaTeX math rendering in card content

---

### 3.8 Quiz Generator (`quiz.html`)

**Built-in quizzes** for 4 subjects + **AI-generated quizzes** on any topic.

**Configuration:**
- Subject: Algorithms / DS / OS / DBMS / Custom (AI)
- Number of questions: 5 / 10 / 15 / 20
- Difficulty: Easy / Medium / Hard
- Time limit: No limit / 10min / 20min / 30min
- Question types: MCQ / MSQ / NAT (toggleable)

**During Quiz:**
- Real-time timer (yellow < 3min, red < 1min with pulse)
- Progress bar (answered / total)
- Question cards with type badges, marks, negative marking info
- MCQ: click option to select
- MSQ: toggle multiple options
- NAT: type numerical answer
- Submit button (top + bottom)

**Results Page:**
- Score with grade (Excellent/Good/Average/Needs Work)
- Correct / Wrong / Skipped counts
- Time taken
- Detailed solutions:
  - Each question with user's answer vs correct answer
  - Correct options highlighted green
  - Wrong user selections highlighted red
  - Full explanation
  - "New Quiz" / "Different Subject" buttons

**Scoring:**
- MCQ: +1 or +2 marks, negative: −1/3 or −2/3
- MSQ: +2 marks, no negative
- NAT: +1 or +2 marks, no negative
- Quiz results saved to progress dashboard

---

### 3.9 Progress Dashboard (`progress.html`)

**6 metric cards:**
1. 🔥 Day Streak (with last active date)
2. 📅 Study Days (total + sessions)
3. 🎯 Quizzes Taken (with average score)
4. 📝 PYQs Practiced (with accuracy)
5. 🎴 Flashcards Reviewed (X/63 with completion %)
6. 🔖 Bookmarked Questions

**90-Day Study Activity Heatmap:**
- GitHub-style grid (30 columns × 3 rows)
- 5 intensity levels (0 = no activity, 4 = 5+ sessions)
- Hover for daily details
- Color legend

**Subject-wise Performance:**
- 11 subjects with progress bars
- Color-coded by performance level

**Recent Quiz History:**
- Table of last 10 quizzes
- Date, Score, Correct, Wrong, Skipped, Percentage
- Color-coded percentage (green ≥80%, blue ≥60%, amber ≥40%, red <40%)

**Quick Actions:**
- Take a Quiz / Practice PYQs / Review Flashcards / Plan Study / Review Bookmarks
- Reset Progress button (clears all localStorage data)

**Daily Reset:** Stats reset each day (compares date strings)

---

### 3.10 Study Planner (`planner.html`)

**Calendar-based task management.**

**Sidebar:**
- Today's progress (tasks done, study time, completion %)
- Next 7 days overview
- "Generate AI Plan" button (opens AI in Planner mode)

**Calendar:**
- Monthly grid (7 columns)
- Today highlighted with gradient
- Days with tasks highlighted
- Click any day to view/add tasks

**Task Management:**
- Add task: title, subject (12 options), priority (high/medium/low), duration (minutes)
- Toggle completion (checkbox with checkmark)
- Delete task
- Tasks saved per date in localStorage
- Pre-seeded with 6 sample tasks on first visit

**Subjects:** Algorithms, DS, Discrete Math, OS, DBMS, CN, TOC, CD, DL, COA, Aptitude, All/Mock

---

### 3.11 Resources Hub (`resources.html`)

**50+ curated resources** organized into sections:

**🏠 Inside This App (9 cards):**
- Learn, Syllabus, PYQs, Materials, Videos, Flashcards, Quiz, Planner, Progress

**🌐 External Reference (opens in-app browser):**
- Official GATE Website
- Gate Overflow Forum
- + 6 more community resources

**Community-Curated Hubs (6):**
- PhysicsWallah GATE CSE Notes
- NPTEL GATE Video Lectures Portal
- EduRev Crash Course
- GATE Exam & Placement Guide App
- GATE CSE Website
- GATE & CSE Resources GitHub

**GATE Overview & Strategy (6):**
- CollegeVerse Exam Guide
- MadeEasy Exam Guide
- BYJU's Past Papers
- SlideShare Preparation Strategy
- GATE 2027 Syllabus Blueprint
- Free Study Material (Topper Notes)

**Free Online Courses (6):**
- NPTEL DS&A, OS, CN, CD
- Coursera Algorithms (Princeton)
- Harvard CS50

**GitHub Repos (6):**
- GATE Preparation Notes
- Hello GATE
- Data Structures (codebasics)
- The Algorithms — C
- Coding Interview University
- Hello Algorithm

**Blogs & Communities (6):**
- Gate Overflow, Reddit r/gate, GeeksforGeeks, AfterAcademy, Medium, Telegram

**Standard Textbooks (18):**
- CLRS, Kleinberg, Rosen, Grimaldi, Silberschatz, Tanenbaum, Navathe, Kurose & Ross, Hopcroft-Ullman, Dragon Book, Morris Mano, Hamacher, Patterson & Hennessy, K&R, RS Aggarwal

**Mock Test Series (6):**
- Gate Overflow, Made Easy, ACE, GeeksforGeeks, Testbook, Unacademy

**Cutoff Trends (7 years):**
- 2020–2026 with General/OBC/SC-ST cutoffs and AIR 100 marks

**Previous Year Question Papers (4):**
- Official PYQs with Answer Keys
- SOH CSE 2,736 PYQs
- BYJU's Past Papers
- Gate Overflow Discussions

**Last Minute Revision (4):**
- GFG Last Minute Notes
- SOH CSE Flashcards
- SOH CSE Short Notes
- Subject-Wise Topper Notes

**Study Plan Templates (3):**
- 12-Month Plan (Feb 2026 – Feb 2027)
- 6-Month Crash Plan (Aug 2026 – Jan 2027)
- Last 30 Days Strategy

**Pro Tips (6):**
- Aim for top 100, PYQs > Everything, Mocks are non-negotiable, Don't collect resources, Maintain short notes, Sleep is study

**In-App Browser:** 34 resource links open in overlay iframe (no external redirect)

---

### 3.12 GATE Virtual Calculator (`calculator.html`)

**Mimics the actual GATE exam calculator.**

- Dark display with green text (`#00ff88`)
- 33 buttons in 5-column grid
- Functions: sin/cos/tan, ln/log, √, x², eˣ, n!, 1/x, π, mod, parentheses
- Deg/Radian toggle
- Keyboard support (type numbers and operators)
- Expression display + result display
- Error handling ("Error" on invalid expressions)
- Info panel about real GATE calculator limitations

---

### 3.13 Formula Book (`formulas.html`)

**33 formulas** across 7 subjects with KaTeX rendering.

**Subjects:**
- Algorithms (4): Master Theorem, Common Complexities, Dijkstra, Sorting Comparison
- Data Structures (5): BST, AVL, Hashing, Heap, Graph BFS/DFS
- OS (5): CPU Scheduling, Belady's Anomaly, EAT, Banker's, Disk Scheduling
- DBMS (4): Normal Forms, Conflict Serializability, B+ Tree, ACID
- CN (5): IP Addressing, TCP Handshake, Congestion Control, CSMA/CD, Subnet Reference
- COA (4): AMAT, Pipeline Speedup, Cache Mapping, 2's Complement
- Discrete Math (6): Pigeonhole, Binomial Identities, Euler's Formula, Logical Equivalences, Cayley's, Equivalence Relations

**Features:**
- Search bar (filter by keyword)
- Subject filter tabs
- KaTeX-rendered math
- Each formula: title, body (with tables), 💡 note

---

### 3.14 Pomodoro Timer (`timer.html`)

**Focus timer with session tracking.**

- 3 modes: Work (25m) / Short Break (5m) / Long Break (15m)
- SVG progress ring (280px, animated)
- Auto-switch: Work → Break → Work → Long Break (after 4 work sessions)
- Session stats: Sessions Today / Total Focus Time / Day Streak
- Customizable durations (work/break minutes)
- Session history log (last 20 sessions)
- Browser tab title updates with countdown
- Toast notifications on session complete
- Daily reset (stats clear each day)
- All data persisted in localStorage

---

### 3.15 Personal Notebook (`notes.html`)

**Write and organize study notes.**

- Title + content + subject + tags
- 12 subject categories
- LaTeX math support ($...$ and $$...$$ with KaTeX)
- Search across all notes
- Subject filter tabs
- Tag system (comma-separated, shown as pills)
- Edit/Delete any note
- Creation and update timestamps
- All notes saved in localStorage

---

## 4. AI Engine (chatbot.js)

**Version 3 with 5 specialist modes.**

### 5 Modes

| Mode | Icon | Purpose | System Prompt Focus |
|------|------|---------|-------------------|
| Tutor | 🎓 | Concept explanations | Definitions, examples, GATE tips, 150-300 words |
| Solver | 🧮 | PYQ step-by-step solver | Topic identification, approach, solve, verify, "✅ Answer: X" |
| Code | 💻 | C programming help | Code blocks, traces, complexity, pointers |
| Planner | 📅 | Study plan generation | Week-wise tables, weightage-based scheduling |
| Quiz | ❓ | Question generation | MCQ/MSQ/NAT format with answers + explanations |

### Features
- **Voice input** (Web Speech API) — 🎤 button, real-time transcription
- **5 providers:** Groq (free, default), OpenAI, Together, Cohere, HuggingFace
- **API key persistence** per provider in localStorage
- **Conversation memory** (last 8 messages sent as context)
- **Chat history** persists across page reloads (last 30 messages)
- **Markdown rendering:** bold, italic, code blocks, headings, lists, tables
- **KaTeX math** in AI responses
- **Mode-specific suggestion chips** (4 per mode)
- **"Ask AI" button** on every PYQ question (auto-switches to Solver mode)
- **Context awareness:** PDF viewer sets context, PYQ page sets context
- **Floating widget:** bottom-right, pulse-ring animation, spring open/close

### Question Solver Integration
When user clicks "🤖 Ask AI" on a PYQ:
1. Opens chatbot panel
2. Switches to Solver mode
3. Sends structured prompt with: subject, chapter, year, paper, type, marks, question text, all options, official answer (for NAT)
4. AI responds with step-by-step solution

---

## 5. Theme & Interactions (theme.js)

### Dark Mode
- Toggle button (🌙/☀️) in topnav
- `Ctrl+J` keyboard shortcut
- Persists in localStorage
- Auto-detects system preference on first visit
- Full coverage: all components have dark mode CSS variables
- Smooth 0.3s transition on all elements

### Navbar Toggle
- 👁 button in topnav
- `Ctrl+H` keyboard shortcut
- Hides entire navbar for maximum reading space
- Floating restore button appears at top-center
- Smooth slide animation (0.35s)

### Focus Mode
- `Ctrl+Shift+F` keyboard shortcut
- Hides both navbar AND sidebar simultaneously
- Content expands to full screen width
- Floating restore buttons for both
- Toast notification on activation

### Command Palette (`Ctrl+K`)
- Spotlight-style search overlay
- 13 commands (all pages + actions)
- Arrow keys to navigate, Enter to execute
- Shows keyboard shortcuts per command
- Click outside or Esc to close

### Global Search (`Ctrl+/`)
- Searches across: PYQs, Formulas, Flashcards, Videos, Learn topics
- Debounced (300ms)
- Results show with icon, title, description, type badge
- Click result to navigate

### Keyboard Shortcut Help (`?`)
- Overlay with all 12+ shortcuts in 2-column grid
- `<kbd>` styled key badges
- Click outside or Esc to close

### Onboarding Tour
- 3-step animated tour for first-time users
- Step 1: Welcome (4 features)
- Step 2: Shortcuts (4 key combos)
- Step 3: Premium Features (4 advanced features)
- Progress dots, Back/Next/Skip buttons
- Stored in localStorage (never shows again)

### Reading Progress Bar
- Fixed bar at top (below navbar)
- Fills with gradient as user scrolls
- Tracks scroll in content area

### Back to Top Button
- Appears after scrolling 400px
- Fixed bottom-left (above AI button on mobile)
- Smooth scroll-to-top
- Spring hover animation

### Toast Notifications
- Top-right corner, stacked
- 4 types: success ✅, error ❌, warning ⚠️, info ℹ️
- Auto-dismiss after 3 seconds
- Slide-in animation with spring easing

### Ripple Effects
- Material Design ripple on button clicks
- Works on: .btn, .filter-chip, .quiz-type-chip, .mode-btn, .tab-btn, .topnav-link, .mobile-bottom-nav-item
- Spawns at click position, expands 4x, fades out (0.6s)

### Quick Access FAB
- ⚡ floating button appears on scroll
- Opens command palette
- Rotates 90° on hover
- Spring entrance animation

### Scroll Reveal Animations
- Intersection Observer
- Elements fade-in + slide-up as they enter viewport
- Staggered delays (0.1s, 0.2s, 0.3s)
- Applied to: section cards, feature cards, subject cards, stat cards, resource cards, etc.

### Page Transitions
- Smooth fade-in + slide-up on page load (0.4s)
- Applied to hero section and section cards

### Continue Studying Tracking
- Tracks last visited page/topic
- PYQ chapter selection, Learn topic selection, Video play all tracked
- Shows on homepage as "Continue where you left off" banner

---

## 6. Navigation (nav.js)

### Grouped Dropdown Topnav
Auto-generates 5 grouped menus from page list:

| Group | Pages |
|-------|-------|
| 🏠 Home | index.html |
| 📖 Study ▼ | Learn, Syllabus, Materials, Formulas |
| 🎯 Practice ▼ | PYQs, Quiz, Flashcards, Videos |
| 🛠 Tools ▼ | Calculator, Timer, Notes, Planner |
| 📊 Track ▼ | Progress, Resources |

- Active group auto-expands
- Dropdowns close on outside click
- Animated open (0.25s slide-down)
- Responsive: dropdowns expand inline on mobile

### Mobile Bottom Navigation
- Fixed bottom bar on screens ≤768px
- 5 key destinations: Home, Learn, PYQs, Videos, Progress
- Active page with scaled icon + top indicator bar
- AI button repositioned above bottom nav (72px)
- Body gets 60px bottom padding

### In-App Browser Viewer
- `openInApp(url, title)` function
- Full-screen overlay with iframe
- Header: ✕ Close, page title, ↗ Open External fallback
- Blocked iframe detection (5s timeout)
- ESC to close
- 34 resource links on resources.html use this

---

## 7. Performance (loader.js)

### Page Prefetching
- Uses `requestIdleCallback` (2s delay after load)
- Creates `<link rel="prefetch">` for 2 likely-next pages
- Smart mapping: PYQ → Flashcards + Quiz, Learn → PYQ + Formulas
- Near-instant page navigation

### Batched KaTeX Rendering
- `renderMathOptimized(elements, options)` function
- Uses `requestIdleCallback` (fallback: `requestAnimationFrame`)
- Renders in batches of 5 elements per frame
- No UI freeze when rendering 467+ math elements
- Retry mechanism (checks every 100ms for 5 seconds)

### Debounce Utility
- `debounce(fn, delay)` function
- Used for search inputs (250ms delay)
- Reduces CPU usage by ~80% during typing

### Skeleton Loader Helper
- `showSkeleton(container, count, type)` function
- Types: 'card' (with title + lines) and 'list' (compact)
- Shimmer animation (1.5s loop)

### Lazy-Load Gate Data
- `loadGateData()` function (for future use)
- Creates script tag on demand
- Promise-based API

---

## 8. Design System (style.css)

**2,864 lines** of premium CSS.

### Color System
**Light Mode:**
- Background: `linear-gradient(135deg, #667eea, #764ba2)`
- Text: `#1e293b`
- Cards: `#ffffff`
- Primary: `#667eea`

**Dark Mode (`[data-theme="dark"]`):**
- Background: `linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)`
- Text: `#f1f5f9`
- Cards: `#1e293b`
- Primary: `#818cf8`

### Gradients
7 gradient presets: brand, blue, purple, orange, red, gold, cyan

### Typography
- Font: Segoe UI, -apple-system, BlinkMacSystemFont, Roboto
- Sizes: clamp() for responsive scaling
- KaTeX for math rendering

### Animations
- `aurora` — 20s rotating background gradient
- `fadeInDown` / `fadeInUp` — 0.7-0.8s entrance
- `shimmer` — 4s gradient text animation
- `pulse` — 2s dot pulse
- `spin` — 0.8s linear spinner
- `floatY` — 4s up-down float
- `cardEnter` — 0.5s card entrance
- `slideDown` — 0.3s dropdown
- `pulse-ring` — AI button ring
- `ripple-animation` — 0.6s button ripple
- `shimmer-skeleton` — 1.5s loading shimmer
- `miniPlayerIn` — 0.35s spring entrance
- `onboardingIn` — 0.4s spring scale
- `pageIn` — 0.4s page transition

### Shadows
5 levels: xs, sm, default, lg, xl + brand-specific glow

### Border Radius
6 sizes: sm (8px), default (12px), lg (16px), xl (22px), 2xl (28px), full (999px)

### Easing Functions
- `ease-out`: `cubic-bezier(0.16, 1, 0.3, 1)`
- `ease-spring`: `cubic-bezier(0.34, 1.56, 0.64, 1)`
- `ease-smooth`: `cubic-bezier(0.4, 0, 0.2, 1)`

### Premium UI Classes
- `.glass-card` — frosted glass with backdrop-filter
- `.gradient-border` — animated gradient border on hover
- `.glow-primary/success/warning/danger` — colored glow shadows
- `.premium-card` — radial gradient glow on hover
- `.animated-gradient-text` — 4-color shifting gradient text
- `.tilt-card` — 3D perspective tilt on hover
- `.shimmer-bar` — loading bar with sliding shimmer
- `.skeleton-card` / `.skeleton-line` — loading placeholders

### Responsive Breakpoints
- 900px — topnav collapses to hamburger
- 768px — mobile bottom nav appears, app layout stacks
- 600px — quiz form columns stack
- 480px — AI chatbot goes fullscreen, mini player full-width
- 375px — hero stats 2 columns

---

## 9. Data Files

### gate_cse_data.js (7.3 MB)
- 2,736 GATE CSE questions (1987–2026)
- Scraped from ExamSIDE.com
- Structure: `window.GATE_DATA = { subjects: [...], chapters: [...], questions: [...], stats: {...} }`
- Each question: id, year, paper_id, type, marks, negative_marks, question_text (HTML), options, correct_options, answer, explanation, normalized_type, has_answer, has_explanation, subject, chapter

### flashcards_data.js (22 KB)
- 63 flashcard definitions
- 11 subjects
- Each: id, subject, front (question), back (answer with HTML/LaTeX)

### videos_data.js (17 KB)
- 14 subject catalogs
- Each subject: label, icon, playlists (2-3 curated + 1 search), channels (3 per subject)
- Playlists: id, type (playlist/search/video), title, channel, description, videos count
- 8 recommended channels (Gate Smashers, Neso, Jenny's, Knowledge Gate, Abdul Bari, Unacademy, GeeksforGeeks, CareerRide)

### pw_notes_data.js (6 KB)
- 12 PhysicsWallah short note PDFs
- Each: title, subject, icon, url (direct PDF link), source, description, color
- All URLs verified from pw.live

---

## 10. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Command Palette (search all pages) |
| `Ctrl+/` | Global Search (PYQs, formulas, notes, videos) |
| `Ctrl+J` | Toggle Dark Mode |
| `Ctrl+H` | Hide/Show Navbar |
| `Ctrl+Shift+F` | Focus Mode (hide navbar + sidebar) |
| `?` | Keyboard Shortcut Help |
| `/` | Focus Search Box |
| `Esc` | Close any open panel |
| `Alt+H` | Go to Home |
| `Alt+L` | Go to Learn |
| `Alt+S` | Go to Syllabus |
| `Alt+P` | Go to PYQs |
| `Alt+V` | Go to Videos |
| `Alt+F` | Go to Flashcards |
| `Alt+Q` | Go to Quiz |
| `Alt+R` | Go to Progress |
| `Alt+D` | Go to Planner |
| `Alt+E` | Go to Resources |
| `Alt+M` | Go to Materials |
| `Alt+A` | Ask AI |
| `T` | Theater mode (in video player) |
| `F` | Fullscreen (in video player) |
| `M` | Mini player (in video player) |

---

## 11. Data Sources

| Source | What was extracted | How |
|--------|-------------------|-----|
| ExamSIDE.com | 2,736 PYQs (1987–2026) | Node.js scraper with SvelteKit payload parser |
| PhysicsWallah (pw.live) | 12 short note PDFs | HTML parsing for PDF URLs + subject mapping |
| Madhuri's Gist (GitHub) | Curated resource links, YouTube playlists, channel list | Manual extraction from gist content |
| Alimammiya's Gist | Syllabus blueprint, topper notes, book recommendations | Manual extraction from gist content |
| YouTube | 30+ curated playlist IDs | Manual curation from Gate Smashers, Neso, Abdul Bari, Jenny's, Ankit Doyla channels |
| Official GATE | Exam pattern, cutoff trends, eligibility, timeline | Manual compilation from past years |

---

## 12. Deployment Instructions

### To GitHub Pages

1. **Download** `sohcse-complete.zip`
2. **Unzip** to your `sohcse` GitHub repo root
3. **Commit & push:**
   ```bash
   git add .
   git commit -m "Update SOH CSE platform"
   git push origin main
   ```
4. **GitHub Pages** auto-deploys in ~1 minute
5. Visit `https://soham-0047.github.io/sohcse/`

### To get AI working

1. Get a **free Groq API key** at [console.groq.com/keys](https://console.groq.com/keys)
2. Click 🤖 on any page → ⚙ → paste key
3. Key is saved locally (never sent to any server except Groq's API)
4. Start asking AI to solve PYQs, explain concepts, generate quizzes

### File serving note

The app works with `file://` protocol (gate_cse_data.js loaded via `<script>` tag, not `fetch()`). No server needed for local use. For GitHub Pages, just push the files.

---

## Summary

SOH CSE is a **complete, self-contained GATE CSE preparation platform** with:

- **15 pages** covering study, practice, tools, and tracking
- **2,736 PYQs** with solutions, practice mode, and AI solver
- **Premium video player** with theater mode, mini player, and smart search
- **AI tutor** with 5 specialist modes and voice input
- **Dark mode** with full theme system
- **Keyboard shortcuts** for power users
- **Mobile-first** responsive design with bottom navigation
- **Performance optimized** with prefetching, batched rendering, and skeleton loaders
- **Onboarding tour** for first-time users
- **All data persists** in localStorage (no backend needed)
- **No external redirects** — 34 resource links open in-app

The platform is designed to be the **single go-to destination** for GATE CSE preparation — students never need to leave the app for studying, practicing, or watching videos.
