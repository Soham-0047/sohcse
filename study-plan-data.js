// SOH CSE — 120-Day Study Plan for GATE CSE 2027 (Target: 65-70 marks)
// Generated based on official 2027 weightage + PYQ trend analysis
// Focus: High-yield topics first, progressive difficulty, daily practice

const STUDY_PLAN_120_DAYS = {
    target: '65-70 marks in GATE CSE 2027',
    duration: 120,
    phases: [
        {
            phase: 1, name: 'Foundation Building', days: 'Day 1-40',
            focus: 'High-weightage subjects + GA daily',
            goal: 'Master PDS (15m), CN (10m), OS (9m) — covers 34/100 marks',
            daily_schedule: {
                morning: '2h theory + concept notes',
                afternoon: '1.5h PYQ practice (20 questions)',
                evening: '30min GA practice + 30min flashcard review',
            },
            weeks: [
                { week: 1, subject: 'Programming & Data Structures (15m)', topics: ['Programming in C', 'Arrays, Stacks, Queues', 'Linked Lists'], pyq_target: 50, mock_target: 0 },
                { week: 2, subject: 'Programming & Data Structures (15m)', topics: ['Trees, BST, Binary Heaps', 'Graphs', 'Hashing'], pyq_target: 50, mock_target: 0 },
                { week: 3, subject: 'Computer Networks (10m)', topics: ['Layering, Switching', 'Data Link Layer', 'Routing (DV & LS)'], pyq_target: 40, mock_target: 0 },
                { week: 4, subject: 'Computer Networks (10m)', topics: ['IPv4, CIDR, NAT', 'TCP: Flow/Congestion Control', 'DNS & HTTP'], pyq_target: 40, mock_target: 1 },
                { week: 5, subject: 'Operating System (9m)', topics: ['Processes, Threads, IPC', 'Concurrency & Synchronization', 'Deadlocks'], pyq_target: 40, mock_target: 0 },
                { week: 6, subject: 'Operating System (9m)', topics: ['CPU & I/O Scheduling', 'Memory Management & Virtual Memory', 'File Systems'], pyq_target: 40, mock_target: 1 },
            ],
        },
        {
            phase: 2, name: 'Core Subject Mastery', days: 'Day 41-80',
            focus: 'Medium-weight subjects + daily GA + weekly mocks',
            goal: 'Master COA (8m), Algo (7m), DBMS (7m), Discrete Math (13m) — covers 35/100 marks',
            daily_schedule: {
                morning: '2h theory + concept notes',
                afternoon: '1.5h PYQ practice (20 questions)',
                evening: '30min GA + 30min flashcards + weekend mock test',
            },
            weeks: [
                { week: 7, subject: 'Computer Organization (8m)', topics: ['Instruction Set & Addressing', 'ALU & Control Unit Design', 'Memory Hierarchy & Cache'], pyq_target: 40, mock_target: 0 },
                { week: 8, subject: 'Computer Organization (8m)', topics: ['I/O Interface (Interrupt & DMA)', 'Instruction Pipelining & Hazards'], pyq_target: 35, mock_target: 1 },
                { week: 9, subject: 'Algorithms (7m)', topics: ['Searching, Sorting, Hashing', 'Asymptotic Complexity', 'Greedy, DP, Divide & Conquer'], pyq_target: 35, mock_target: 0 },
                { week: 10, subject: 'Algorithms (7m)', topics: ['Graph Traversals, MST, Shortest Paths'], pyq_target: 30, mock_target: 1 },
                { week: 11, subject: 'Databases (7m)', topics: ['ER-Model', 'Relational Algebra & SQL', 'Normalization (1NF-BCNF)'], pyq_target: 35, mock_target: 0 },
                { week: 12, subject: 'Databases (7m)', topics: ['File Organization & Indexing (B+ Trees)', 'Transactions & Concurrency Control'], pyq_target: 30, mock_target: 1 },
            ],
        },
        {
            phase: 3, name: 'Math + Remaining + Revision', days: 'Day 81-105',
            focus: 'Engineering Math (13m) + remaining subjects + spaced repetition',
            goal: 'Master Math (13m), DL (6m), TOC (6m), CD (4m) + revise all',
            daily_schedule: {
                morning: '2h theory (Math/TOC/CD/DL)',
                afternoon: '1h PYQ + 1h revision of Phase 1-2 subjects',
                evening: '30min GA + 30min flashcards + mock every 3rd day',
            },
            weeks: [
                { week: 13, subject: 'Engineering Mathematics (13m)', topics: ['Discrete: Logic, Sets, Relations', 'Graph Theory: Connectivity, Coloring', 'Combinatorics'], pyq_target: 50, mock_target: 0 },
                { week: 14, subject: 'Engineering Mathematics (13m)', topics: ['Linear Algebra: Matrices, Eigenvalues', 'Calculus: Limits, Maxima/Minima, Integration', 'Probability: Distributions, Bayes'], pyq_target: 50, mock_target: 1 },
                { week: 15, subject: 'Theory of Computation (6m) + Digital Logic (6m)', topics: ['DFA, NFA, Regular Expressions', 'PDA, CFG, Pumping Lemma', 'Boolean Algebra, K-Maps, Circuits'], pyq_target: 50, mock_target: 1 },
                { week: 16, subject: 'Compiler Design (4m) + Full Revision', topics: ['Lexical Analysis, Parsing', 'Syntax-Directed Translation, Code Gen', 'REVIEW ALL SUBJECTS'], pyq_target: 40, mock_target: 2 },
            ],
        },
        {
            phase: 4, name: 'Final Sprint & Mock Tests', days: 'Day 106-120',
            focus: 'Full-length mock tests every 2 days + error notebook + weak area drilling',
            goal: 'Score 65+ consistently in mock tests',
            daily_schedule: {
                morning: '3h full mock test (65 Qs, 100 marks, 3 hours)',
                afternoon: '2h review: analyze mistakes, read explanations',
                evening: '1h AI-generated practice on weak areas + flashcards',
            },
            weeks: [
                { week: 17, subject: 'Mock Test Marathon', topics: ['Mock #1-3: Full papers with review', 'Focus: Time management + accuracy'], pyq_target: 0, mock_target: 3 },
                { week: 18, subject: 'Mock Test Marathon + Weak Areas', topics: ['Mock #4-6: Focus on weak subjects', 'AI-generated drilling for <60% areas'], pyq_target: 30, mock_target: 3 },
            ],
        },
    ],
    // High-yield topics that appear in 4+ of last 5 GATE papers
    // These MUST be mastered for 65+ score
    high_yield_topics: [
        { subject: 'general-aptitude', topic: 'numerical-ability', reason: '43 questions in 5 years — 43% of GA' },
        { subject: 'general-aptitude', topic: 'verbal-ability', reason: '31 questions in 5 years — 31% of GA' },
        { subject: 'discrete-mathematics', topic: 'graph-theory', reason: '21 questions in 5 years' },
        { subject: 'discrete-mathematics', topic: 'linear-algebra', reason: '21 questions in 5 years' },
        { subject: 'discrete-mathematics', topic: 'probability', reason: '21 questions in 5 years' },
        { subject: 'data-structures', topic: 'trees', reason: '20 questions in 5 years — 43% of DS' },
        { subject: 'theory-of-computation', topic: 'finite-automata-and-regular-language', reason: '27 questions — 53% of TOC' },
        { subject: 'theory-of-computation', topic: 'push-down-automata-and-context-free-language', reason: '20 questions — 39% of TOC' },
        { subject: 'compiler-design', topic: 'parsing', reason: '17 questions — 44% of CD' },
        { subject: 'operating-systems', topic: 'memory-management', reason: '17 questions — 35% of OS' },
        { subject: 'computer-networks', topic: 'network-layer', reason: '16 questions — 31% of CN' },
        { subject: 'computer-organization', topic: 'memory-interfacing', reason: '16 questions — 31% of COA' },
        { subject: 'computer-organization', topic: 'pipelining', reason: '14 questions — 28% of COA' },
        { subject: 'digital-logic', topic: 'number-systems', reason: '16 questions — 36% of DL' },
        { subject: 'algorithms', topic: 'complexity-analysis-and-asymptotic-notations', reason: '14 questions — 38% of Algo' },
    ],
    // Score breakdown for 65-70 target
    target_breakdown: {
        'General Aptitude (15m)': { target: 13, strategy: 'Easy — practice 10 GA questions daily' },
        'Engineering Mathematics (13m)': { target: 10, strategy: 'High scoring — master Probability + Graph Theory + Linear Algebra' },
        'Programming & Data Structures (15m)': { target: 11, strategy: 'Trees + Graphs + C programming — frequent practice' },
        'Computer Networks (10m)': { target: 7, strategy: 'Focus on IP addressing + TCP + routing' },
        'Operating System (9m)': { target: 6, strategy: 'Memory management + scheduling + deadlock' },
        'Computer Organization (8m)': { target: 5, strategy: 'Pipelining + cache + addressing modes' },
        'Algorithms (7m)': { target: 5, strategy: 'Complexity analysis + DP + greedy' },
        'Databases (7m)': { target: 5, strategy: 'Normalization + SQL + transactions' },
        'Digital Logic (6m)': { target: 4, strategy: 'Number systems + Boolean algebra + K-maps' },
        'Theory of Computation (6m)': { target: 4, strategy: 'DFA + regular languages + PDA' },
        'Compiler Design (4m)': { target: 2, strategy: 'Parsing is 44% — focus there' },
        'TOTAL': { target: 72, strategy: '72/100 = Top 500-1000 rank (PSU/IIT eligible)' },
    },
};
