/* ==========================================================================
   GATE CSE — Curated Video Catalog v2
   - Each subject has 2-3 curated playlists + 1 search-based embed
   - Uses iframe embeds (reliable, no API needed)
   ========================================================================== */

const VIDEO_CATALOG = {
    'algorithms': {
        label: 'Algorithms', icon: '⚡',
        playlists: [
            { id: 'PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O', type: 'playlist', title: 'Algorithms — Complete Course', channel: 'Abdul Bari', description: 'The most popular GATE algorithms course on YouTube. Covers time complexity, sorting, searching, DP, greedy, divide & conquer, and graph algorithms in depth.', videos: 100 },
            { id: 'PLmXKhU9FNesPRgyzVqZQE2OBHxN2Ffj-1', type: 'playlist', title: 'Design and Analysis of Algorithms', channel: 'Gate Smashers', description: 'Complete DAA playlist for GATE CSE — asymptotic analysis, recurrence relations, sorting, DP, greedy, backtracking, and P/NP concepts.', videos: 80 },
            { searchQuery: 'GATE CSE algorithms complete course', type: 'search', title: '🔍 All GATE Algorithms Videos', channel: 'YouTube Search', description: 'Live YouTube search results for GATE CSE algorithms. Always shows the latest and most relevant videos.', videos: '∞' }
        ],
        channels: [
            { name: 'Abdul Bari', url: 'https://www.youtube.com/@abdulbari', why: 'Best Algorithms teacher on YouTube' },
            { name: 'Gate Smashers', url: 'https://www.youtube.com/@GateSmashers', why: 'All GATE CSE subjects in Hindi/English' },
            { name: "Jenny's Lectures", url: 'https://www.youtube.com/@JennysLectures', why: 'Clear DS and Algorithms explanations' }
        ]
    },
    'data-structures': {
        label: 'Data Structures', icon: '🌳',
        playlists: [
            { id: 'PLdo5W4Nhv31bbKJzrsKfMpo_grxuLlKLU', type: 'playlist', title: 'Data Structures Complete Course', channel: "Jenny's Lectures", description: 'Comprehensive DS course — arrays, linked lists, stacks, queues, trees, graphs, hashing, and heaps with C implementations.', videos: 130 },
            { id: 'PLmXKhU9FNesSanpbPnZ5tdc1Ucf8T7vlo', type: 'playlist', title: 'Data Structures for GATE', channel: 'Gate Smashers', description: 'GATE-focused DS playlist with complexity analysis and PYQ discussions on every topic.', videos: 70 },
            { searchQuery: 'GATE CSE data structures complete course', type: 'search', title: '🔍 All GATE DS Videos', channel: 'YouTube Search', description: 'Live YouTube search results for GATE CSE data structures videos.', videos: '∞' }
        ],
        channels: [
            { name: "Jenny's Lectures", url: 'https://www.youtube.com/@JennysLectures', why: 'Best DS course with diagrams' },
            { name: 'Gate Smashers', url: 'https://www.youtube.com/@GateSmashers', why: 'GATE-focused DS lectures' },
            { name: 'CodeNCode', url: 'https://www.youtube.com/@CodeNCode', why: 'DSA with competitive programming angle' }
        ]
    },
    'discrete-mathematics': {
        label: 'Discrete Mathematics', icon: '∑',
        playlists: [
            { id: 'PLxCzCOWd7aiHANh5UJoCCrW1uIdqKciKg', type: 'playlist', title: 'Discrete Mathematics', channel: 'Gate Smashers', description: 'Complete DM course — set theory, logic, relations, functions, combinatorics, graph theory, probability, and linear algebra.', videos: 100 },
            { searchQuery: 'GATE CSE discrete mathematics complete course', type: 'search', title: '🔍 All GATE DM Videos', channel: 'YouTube Search', description: 'Live YouTube search results for GATE CSE discrete mathematics.', videos: '∞' }
        ],
        channels: [
            { name: 'Gate Smashers', url: 'https://www.youtube.com/@GateSmashers', why: 'Most popular DM course' },
            { name: 'Knowledge Gate', url: 'https://www.youtube.com/@KnowGateHindi', why: 'Hindi/English DM lectures' },
            { name: 'Neso Academy', url: 'https://www.youtube.com/@nesoacademy', why: 'Math-focused explanations' }
        ]
    },
    'operating-systems': {
        label: 'Operating Systems', icon: '⚙️',
        playlists: [
            { id: 'PLxCzCOWd7aiGRz8DLPNQsv5BeA9PbpBde', type: 'playlist', title: 'Operating System Complete', channel: 'Gate Smashers', description: 'Complete OS course — processes, scheduling, synchronization, deadlocks, memory management, paging, virtual memory, and file systems.', videos: 100 },
            { id: 'PLdo5W4Nhv31bJakmYCyGc2z7n5jz6vBUX', type: 'playlist', title: 'Operating System', channel: "Jenny's Lectures", description: 'Detailed OS lectures with diagrams — process scheduling algorithms, Banker\'s algorithm, paging, and segmentation explained clearly.', videos: 70 },
            { searchQuery: 'GATE CSE operating system complete course', type: 'search', title: '🔍 All GATE OS Videos', channel: 'YouTube Search', description: 'Live YouTube search results for GATE CSE operating system videos.', videos: '∞' }
        ],
        channels: [
            { name: 'Gate Smashers', url: 'https://www.youtube.com/@GateSmashers', why: 'Most-watched OS course' },
            { name: "Jenny's Lectures", url: 'https://www.youtube.com/@JennysLectures', why: 'OS with great visual diagrams' },
            { name: 'Knowledge Gate', url: 'https://www.youtube.com/@KnowGateHindi', why: 'Hindi OS lectures' }
        ]
    },
    'database-management-system': {
        label: 'DBMS', icon: '🗄️',
        playlists: [
            { id: 'PLxCzCOWd7aiHANh5UJoCCrW1uIdqKciKg', type: 'playlist', title: 'DBMS Complete Course', channel: 'Gate Smashers', description: 'The most popular GATE DBMS course — ER model, relational model, normalization, SQL, transactions, concurrency control, indexing, and B+ trees.', videos: 110 },
            { searchQuery: 'GATE CSE DBMS complete course', type: 'search', title: '🔍 All GATE DBMS Videos', channel: 'YouTube Search', description: 'Live YouTube search results for GATE CSE DBMS videos.', videos: '∞' }
        ],
        channels: [
            { name: 'Gate Smashers', url: 'https://www.youtube.com/@GateSmashers', why: 'Best DBMS playlist for GATE' },
            { name: 'Knowledge Gate', url: 'https://www.youtube.com/@KnowGateHindi', why: 'Hindi DBMS lectures' },
            { name: "Jenny's Lectures", url: 'https://www.youtube.com/@JennysLectures', why: 'DBMS with examples' }
        ]
    },
    'computer-networks': {
        label: 'Computer Networks', icon: '🌐',
        playlists: [
            { id: 'PLxCzCOWd7aiH8h_IoA7O_JW0urT0cCMqA', type: 'playlist', title: 'Computer Networks Complete', channel: 'Gate Smashers', description: 'Complete CN course — OSI/TCP-IP models, all 5 layers, IP addressing, routing protocols (DV/LS), TCP/UDP, congestion control, and application protocols.', videos: 90 },
            { id: 'PLOG_8OlGMp73hMyn-WX1M2Q4ON98DmaRq', type: 'playlist', title: 'Computer Networks — Ankit Doyla (Unacademy)', channel: 'Ankit Doyla', description: 'Highly-rated CN playlist by Ankit Doyla Sir (Unacademy). Covers all GATE CN topics with detailed explanations and problem-solving.', videos: 60 },
            { searchQuery: 'GATE CSE computer networks complete course', type: 'search', title: '🔍 All GATE CN Videos', channel: 'YouTube Search', description: 'Live YouTube search results for GATE CSE computer networks videos.', videos: '∞' }
        ],
        channels: [
            { name: 'Gate Smashers', url: 'https://www.youtube.com/@GateSmashers', why: 'Best CN playlist for GATE' },
            { name: 'Ankit Doyla (Unacademy)', url: 'https://www.youtube.com/@AnkitDoyla', why: 'Excellent CN and TOC lectures' },
            { name: 'Knowledge Gate', url: 'https://www.youtube.com/@KnowGateHindi', why: 'CN in Hindi' },
            { name: 'Neso Academy', url: 'https://www.youtube.com/@nesoacademy', why: 'CN with deep protocol analysis' }
        ]
    },
    'theory-of-computation': {
        label: 'Theory of Computation', icon: '🔤',
        playlists: [
            { id: 'PLBlnK6fEyqRgp46KUvYZYqN-2_FM3jAQD', type: 'playlist', title: 'Theory of Computation', channel: 'Neso Academy', description: 'Comprehensive TOC course — finite automata (DFA/NFA), regular expressions, CFG, pushdown automata, Turing machines, decidability, and reducibility.', videos: 150 },
            { id: 'PLOG_8OlGMp72SAVxAk3VwEKQNbLkpN4Vs', type: 'playlist', title: 'TOC — Ankit Doyla (Unacademy)', channel: 'Ankit Doyla', description: 'Highly-rated TOC playlist by Ankit Doyla Sir (Unacademy). Covers automata theory, grammars, Turing machines, and decidability with GATE focus.', videos: 50 },
            { searchQuery: 'GATE CSE theory of computation complete course', type: 'search', title: '🔍 All GATE TOC Videos', channel: 'YouTube Search', description: 'Live YouTube search results for GATE CSE theory of computation videos.', videos: '∞' }
        ],
        channels: [
            { name: 'Neso Academy', url: 'https://www.youtube.com/@nesoacademy', why: 'Best TOC course on YouTube' },
            { name: 'Ankit Doyla (Unacademy)', url: 'https://www.youtube.com/@AnkitDoyla', why: 'Excellent TOC lectures' },
            { name: 'Gate Smashers', url: 'https://www.youtube.com/@GateSmashers', why: 'GATE-focused TOC' },
            { name: 'Knowledge Gate', url: 'https://www.youtube.com/@KnowGateHindi', why: 'Hindi TOC lectures' }
        ]
    },
    'compiler-design': {
        label: 'Compiler Design', icon: '🔧',
        playlists: [
            { id: 'PLBlnK6fEyqRhUvOIeAS1Z8LQTHR5ES7m9', type: 'playlist', title: 'Compiler Design', channel: 'Neso Academy', description: 'Complete CD course — lexical analysis, parsing (LL, LR), syntax-directed translation, intermediate code generation, symbol tables, and optimization.', videos: 80 },
            { searchQuery: 'GATE CSE compiler design complete course', type: 'search', title: '🔍 All GATE CD Videos', channel: 'YouTube Search', description: 'Live YouTube search results for GATE CSE compiler design videos.', videos: '∞' }
        ],
        channels: [
            { name: 'Neso Academy', url: 'https://www.youtube.com/@nesoacademy', why: 'Best CD course' },
            { name: 'Gate Smashers', url: 'https://www.youtube.com/@GateSmashers', why: 'GATE-focused CD' },
            { name: 'Knowledge Gate', url: 'https://www.youtube.com/@KnowGateHindi', why: 'Hindi CD lectures' }
        ]
    },
    'digital-logic': {
        label: 'Digital Logic', icon: '🔌',
        playlists: [
            { id: 'PLBlnK6fEyqRjECCOhtj6tMzwB7gs-U5bO', type: 'playlist', title: 'Digital Electronics', channel: 'Neso Academy', description: 'Complete digital electronics — number systems, Boolean algebra, K-maps, combinational circuits, sequential circuits (flip-flops, counters, registers).', videos: 175 },
            { searchQuery: 'GATE CSE digital logic complete course', type: 'search', title: '🔍 All GATE DL Videos', channel: 'YouTube Search', description: 'Live YouTube search results for GATE CSE digital logic videos.', videos: '∞' }
        ],
        channels: [
            { name: 'Neso Academy', url: 'https://www.youtube.com/@nesoacademy', why: 'Best digital electronics course' },
            { name: 'Gate Smashers', url: 'https://www.youtube.com/@GateSmashers', why: 'GATE-focused DL' },
            { name: 'Knowledge Gate', url: 'https://www.youtube.com/@KnowGateHindi', why: 'Hindi DL lectures' }
        ]
    },
    'computer-organization': {
        label: 'Computer Organization', icon: '💻',
        playlists: [
            { id: 'PLxCzCOWd7aiFG-QcZjxdFmV_jUPiB3i7q', type: 'playlist', title: 'Computer Organization & Architecture', channel: 'Gate Smashers', description: 'Complete COA course — machine instructions, addressing modes, ALU, datapath, control unit, pipelining, memory hierarchy, cache, and I/O.', videos: 80 },
            { searchQuery: 'GATE CSE computer organization complete course', type: 'search', title: '🔍 All GATE CO Videos', channel: 'YouTube Search', description: 'Live YouTube search results for GATE CSE computer organization videos.', videos: '∞' }
        ],
        channels: [
            { name: 'Gate Smashers', url: 'https://www.youtube.com/@GateSmashers', why: 'Best COA for GATE' },
            { name: 'Knowledge Gate', url: 'https://www.youtube.com/@KnowGateHindi', why: 'Hindi COA lectures' },
            { name: 'Neso Academy', url: 'https://www.youtube.com/@nesoacademy', why: 'COA with deep analysis' }
        ]
    },
    'programming-languages': {
        label: 'Programming & C', icon: '👨‍💻',
        playlists: [
            { id: 'PLdo5W4Nhv31a8UcMN9-35ghv8qyFWD9_S', type: 'playlist', title: 'C Programming Complete Course', channel: "Jenny's Lectures", description: 'Complete C programming — variables, operators, control flow, functions, arrays, pointers, structures, file handling, and recursion.', videos: 110 },
            { id: 'PLsFNQxJIUtui3ppX6PZ4iQk6HBp-WWd2x', type: 'playlist', title: 'C Programming', channel: 'CodeWithHarry', description: 'Beginner-friendly C course with hands-on examples — covers all fundamentals needed for GATE C sections.', videos: 130 },
            { searchQuery: 'GATE CSE C programming complete course', type: 'search', title: '🔍 All GATE C Programming Videos', channel: 'YouTube Search', description: 'Live YouTube search results for GATE CSE C programming videos.', videos: '∞' }
        ],
        channels: [
            { name: "Jenny's Lectures", url: 'https://www.youtube.com/@JennysLectures', why: 'Best C for GATE' },
            { name: 'CodeWithHarry', url: 'https://www.youtube.com/@CodeWithHarry', why: 'Beginner-friendly C' },
            { name: 'Gate Smashers', url: 'https://www.youtube.com/@GateSmashers', why: 'C concepts for GATE' }
        ]
    },
    'general-aptitude': {
        label: 'General Aptitude', icon: '🧮',
        playlists: [
            { id: 'PLpyc33-aeUuY8Ti5sVq5Q3YmKam19S99b', type: 'playlist', title: 'Aptitude for GATE', channel: 'CareerRide', description: 'Topic-wise aptitude lectures with shortcuts — time-work, time-speed-distance, percentages, profit-loss, ratios, and reasoning.', videos: 80 },
            { searchQuery: 'GATE CSE general aptitude complete course', type: 'search', title: '🔍 All GATE Aptitude Videos', channel: 'YouTube Search', description: 'Live YouTube search results for GATE CSE general aptitude videos.', videos: '∞' }
        ],
        channels: [
            { name: 'CareerRide', url: 'https://www.youtube.com/@Careerride', why: 'Best aptitude shortcuts' },
            { name: 'Gate Smashers', url: 'https://www.youtube.com/@GateSmashers', why: 'GATE aptitude lectures' },
            { name: 'Feel Free to Learn', url: 'https://www.youtube.com/@FeelFreetoLearn', why: 'Aptitude basics' }
        ]
    },
    'software-engineering': {
        label: 'Software Engineering', icon: '📐',
        playlists: [
            { searchQuery: 'GATE CSE software engineering complete course', type: 'search', title: '🔍 All GATE SE Videos', channel: 'YouTube Search', description: 'Live YouTube search results for GATE CSE software engineering videos.', videos: '∞' }
        ],
        channels: [
            { name: 'Gate Smashers', url: 'https://www.youtube.com/@GateSmashers', why: 'SE lectures for GATE' },
            { name: 'Knowledge Gate', url: 'https://www.youtube.com/@KnowGateHindi', why: 'Hindi SE lectures' }
        ]
    },
    'web-technologies': {
        label: 'Web Technologies', icon: '🌍',
        playlists: [
            { searchQuery: 'GATE CSE web technologies complete course', type: 'search', title: '🔍 All GATE Web Tech Videos', channel: 'YouTube Search', description: 'Live YouTube search results for GATE CSE web technologies videos.', videos: '∞' }
        ],
        channels: [
            { name: 'Telusko', url: 'https://www.youtube.com/@Telusko', why: 'Web dev basics' },
            { name: 'CodeWithHarry', url: 'https://www.youtube.com/@CodeWithHarry', why: 'HTML/CSS/JS tutorials' }
        ]
    }
};

const RECOMMENDED_CHANNELS = [
    { name: 'Gate Smashers', url: 'https://www.youtube.com/@GateSmashers', why: 'Most popular GATE CSE channel — all subjects in Hindi/English' },
    { name: 'Neso Academy', url: 'https://www.youtube.com/@nesoacademy', why: 'Excellent for Digital Logic, TOC, and Compiler Design' },
    { name: "Jenny's Lectures", url: 'https://www.youtube.com/@JennysLectures', why: 'Great for DS, OS, DBMS, and C programming' },
    { name: 'Knowledge Gate', url: 'https://www.youtube.com/@KnowGateHindi', why: 'Hindi/English lectures on all GATE subjects' },
    { name: 'Abdul Bari', url: 'https://www.youtube.com/@abdulbari', why: 'Best Algorithms course on YouTube' },
    { name: 'Unacademy GATE & ESE', url: 'https://www.youtube.com/@unacademygateandese', why: 'Free crash courses and live classes' },
    { name: 'GeeksforGeeks', url: 'https://www.youtube.com/@GeeksforGeeksVideos', why: 'Concept videos and DSA tutorials' },
    { name: 'CareerRide', url: 'https://www.youtube.com/@Careerride', why: 'Aptitude and reasoning shortcuts' }
];
