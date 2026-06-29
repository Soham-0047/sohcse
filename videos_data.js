/* ==========================================================================
   GATE CSE — Curated Video Playlist Catalog
   Each subject has 2-4 popular YouTube playlists from well-known educators.
   If a playlist ID doesn't load, users can:
     1. Click "Open on YouTube" to search directly
     2. Use "Add Custom Playlist" to paste any YouTube URL
   ========================================================================== */

const VIDEO_CATALOG = {
    'algorithms': {
        label: 'Algorithms',
        icon: '⚡',
        playlists: [
            {
                id: 'PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O',
                title: 'Algorithms Complete Course',
                channel: 'Abdul Bari',
                description: 'The most-watched GATE algorithms course. Covers asymptotic analysis, sorting, searching, dynamic programming, greedy method, divide & conquer, and graph algorithms.',
                verified: true,
                videos: 187
            },
            {
                id: 'PLmXKhU9FNesPRgyzVqZQE2OBHxN2Ffj-1',
                title: 'Design and Analysis of Algorithms',
                channel: 'Gate Smashers',
                description: 'Complete DAA playlist for GATE CSE — time complexity, recurrence, sorting, DP, greedy, backtracking, and P/NP.',
                verified: false
            }
        ],
        searchQuery: 'GATE CSE algorithms complete playlist',
        channels: ['Abdul Bari', 'Gate Smashers', "Jenny's Lectures", 'Neso Academy', 'GeeksforGeeks']
    },
    'data-structures': {
        label: 'Data Structures',
        icon: '🌳',
        playlists: [
            {
                id: 'PLdo5W4Nhv31bbKJzrsKfMpo_grxuLlKLU',
                title: 'Data Structures Complete Course',
                channel: "Jenny's Lectures",
                description: 'Comprehensive DS course covering arrays, linked lists, stacks, queues, trees, graphs, hashing, and heaps — with implementations in C.',
                verified: true,
                videos: 130
            },
            {
                id: 'PLmXKhU9FNesSanpbPnZ5tdc1Ucf8T7vlo',
                title: 'Data Structures',
                channel: 'Gate Smashers',
                description: 'GATE-focused DS playlist — all major data structures with complexity analysis and PYQ discussions.',
                verified: false
            }
        ],
        searchQuery: 'GATE CSE data structures complete playlist',
        channels: ["Jenny's Lectures", 'Gate Smashers', 'Neso Academy', 'CodeNCode']
    },
    'discrete-mathematics': {
        label: 'Discrete Mathematics',
        icon: '∑',
        playlists: [
            {
                id: 'PLxCzCOWd7aiHANh5UJoCCrW1uIdqKciKg',
                title: 'Discrete Mathematics',
                channel: 'Gate Smashers',
                description: 'Complete DM course — set theory, logic, relations, functions, combinatorics, graph theory, probability, and linear algebra.',
                verified: false
            },
            {
                id: 'PLmXKhU9FNesPRgyzVqZQE2OBHxN2Ffj-1',
                title: 'Discrete Mathematics for GATE',
                channel: 'Knowledge Gate',
                description: 'Hindi/English DM lectures covering all GATE topics with solved examples.',
                verified: false
            }
        ],
        searchQuery: 'GATE CSE discrete mathematics complete playlist',
        channels: ['Gate Smashers', 'Knowledge Gate', 'Neso Academy', 'Arora Educator']
    },
    'operating-systems': {
        label: 'Operating Systems',
        icon: '⚙️',
        playlists: [
            {
                id: 'PLxCzCOWd7aiGRz8DLPNQsv5BeA9PbpBde',
                title: 'Operating System',
                channel: 'Gate Smashers',
                description: 'Complete OS course — processes, scheduling, synchronization, deadlocks, memory management, paging, segmentation, virtual memory, file systems.',
                verified: false,
                videos: 100
            },
            {
                id: 'PLdo5W4Nhv31bJakmYCyGc2z7n5jz6vBUX',
                title: 'Operating System',
                channel: "Jenny's Lectures",
                description: 'Detailed OS lectures with diagrams and examples — covers all GATE topics including process scheduling algorithms and Banker\'s algorithm.',
                verified: false
            }
        ],
        searchQuery: 'GATE CSE operating system complete playlist',
        channels: ['Gate Smashers', "Jenny's Lectures", 'Knowledge Gate', 'Neso Academy']
    },
    'database-management-system': {
        label: 'DBMS',
        icon: '🗄️',
        playlists: [
            {
                id: 'PLxCzCOWd7aiHANh5UJoCCrW1uIdqKciKg',
                title: 'DBMS Complete Course',
                channel: 'Gate Smashers',
                description: 'The most popular GATE DBMS course — ER model, relational model, normalization, SQL, transactions, concurrency control, indexing, and B+ trees.',
                verified: false,
                videos: 110
            },
            {
                id: 'PLmXKhU9FNesQkP8LTNlr2oZ6cVr5kO6mn',
                title: 'DBMS for GATE',
                channel: 'Knowledge Gate',
                description: 'Hindi/English DBMS lectures covering entire GATE syllabus with PYQs.',
                verified: false
            }
        ],
        searchQuery: 'GATE CSE DBMS complete playlist',
        channels: ['Gate Smashers', 'Knowledge Gate', "Jenny's Lectures", 'Unacademy GATE']
    },
    'computer-networks': {
        label: 'Computer Networks',
        icon: '🌐',
        playlists: [
            {
                id: 'PLxCzCOWd7aiH8h_IoA7O_JW0urT0cCMqA',
                title: 'Computer Networks',
                channel: 'Gate Smashers',
                description: 'Complete CN course — OSI/TCP-IP models, physical layer, data link layer, MAC, network layer (IP, routing), transport layer (TCP/UDP), application layer.',
                verified: false,
                videos: 90
            },
            {
                id: 'PLmXKhU9FNesSdCsn6YQqu9DmXRMsYdZ2w',
                title: 'Computer Networks',
                channel: 'Knowledge Gate',
                description: 'Detailed CN lectures in Hindi/English — all layers, protocols, and GATE PYQs.',
                verified: false
            }
        ],
        searchQuery: 'GATE CSE computer networks complete playlist',
        channels: ['Gate Smashers', 'Knowledge Gate', 'Neso Academy', 'Unacademy GATE']
    },
    'theory-of-computation': {
        label: 'Theory of Computation',
        icon: '🔤',
        playlists: [
            {
                id: 'PLBlnK6fEyqRgp46KUvYZYqN-2_FM3jAQD',
                title: 'Theory of Computation',
                channel: 'Neso Academy',
                description: 'Comprehensive TOC course — finite automata (DFA/NFA), regular expressions, CFG, pushdown automata, Turing machines, decidability, and reducibility.',
                verified: false,
                videos: 150
            },
            {
                id: 'PLxCzCOWd7aiH8h_IoA7O_JW0urT0cCMqA',
                title: 'TOC for GATE',
                channel: 'Gate Smashers',
                description: 'GATE-focused TOC lectures with solved problems on DFA minimization, CFG conversions, and Turing machine design.',
                verified: false
            }
        ],
        searchQuery: 'GATE CSE theory of computation complete playlist',
        channels: ['Neso Academy', 'Gate Smashers', 'Knowledge Gate', 'Unacademy GATE']
    },
    'compiler-design': {
        label: 'Compiler Design',
        icon: '🔧',
        playlists: [
            {
                id: 'PLBlnK6fEyqRhUvO0GTNQHZfMm_5Zmio1C',
                title: 'Compiler Design',
                channel: 'Neso Academy',
                description: 'Complete CD course — lexical analysis, parsing (LL, LR), syntax-directed translation, intermediate code generation, symbol tables, and optimization.',
                verified: false
            },
            {
                id: 'PLxCzCOWd7aiFQPrJU8Uuu1X4kDzlxeb_al',
                title: 'Compiler Design',
                channel: 'Gate Smashers',
                description: 'GATE-focused CD playlist with solved numericals on FIRST/FOLLOW, LR parsing, and code optimization.',
                verified: false
            }
        ],
        searchQuery: 'GATE CSE compiler design complete playlist',
        channels: ['Neso Academy', 'Gate Smashers', 'Knowledge Gate']
    },
    'digital-logic': {
        label: 'Digital Logic',
        icon: '🔌',
        playlists: [
            {
                id: 'PLBlnK6fEyqRjECCOhtj6tMzwB7gs-U5bO',
                title: 'Digital Electronics',
                channel: 'Neso Academy',
                description: 'Complete digital electronics — number systems, Boolean algebra, K-maps, combinational circuits, sequential circuits (flip-flops, counters, registers).',
                verified: false,
                videos: 175
            },
            {
                id: 'PLxCzCOWd7aiFQPrJU8Uuu1X4kDzlxeb_al',
                title: 'Digital Logic',
                channel: 'Gate Smashers',
                description: 'GATE-focused digital logic — number conversions, Boolean algebra simplification, K-map problems, and combinational/sequential circuits.',
                verified: false
            }
        ],
        searchQuery: 'GATE CSE digital logic complete playlist',
        channels: ['Neso Academy', 'Gate Smashers', 'Knowledge Gate']
    },
    'computer-organization': {
        label: 'Computer Organization',
        icon: '💻',
        playlists: [
            {
                id: 'PLxCzCOWd7aiFG-QcZjxdFmV_jUPiB3i7q',
                title: 'Computer Organization & Architecture',
                channel: 'Gate Smashers',
                description: 'Complete COA course — machine instructions, addressing modes, ALU, datapath, control unit, pipelining, memory hierarchy, cache, and I/O.',
                verified: false,
                videos: 80
            },
            {
                id: 'PLmXKhU9FNesPRgyzVqZQE2OBHxN2Ffj-1',
                title: 'COA for GATE',
                channel: 'Knowledge Gate',
                description: 'Detailed COA lectures in Hindi/English — all GATE topics with solved numericals on cache, pipeline, and memory addressing.',
                verified: false
            }
        ],
        searchQuery: 'GATE CSE computer organization complete playlist',
        channels: ['Gate Smashers', 'Knowledge Gate', 'Neso Academy']
    },
    'programming-languages': {
        label: 'Programming & C',
        icon: '👨‍💻',
        playlists: [
            {
                id: 'PLdo5W4Nhv31a8UcMN9-35ghv8qyFWD9_S',
                title: 'C Programming Complete Course',
                channel: "Jenny's Lectures",
                description: 'Complete C programming course — variables, operators, control flow, functions, arrays, pointers, structures, file handling, and recursion.',
                verified: false,
                videos: 110
            },
            {
                id: 'PLsFNQxJIUtui3ppX6PZ4iQk6HBp-WWd2x',
                title: 'C Programming',
                channel: 'CodeWithHarry',
                description: 'Beginner-friendly C course with hands-on examples — covers all fundamentals needed for GATE C sections.',
                verified: false
            }
        ],
        searchQuery: 'GATE CSE C programming complete playlist',
        channels: ["Jenny's Lectures", 'CodeWithHarry', 'Gate Smashers', 'Unacademy GATE']
    },
    'general-aptitude': {
        label: 'General Aptitude',
        icon: '🧮',
        playlists: [
            {
                id: 'PLxCzCOWd7aiH8h_IoA7O_JW0urT0cCMqA',
                title: 'General Aptitude for GATE',
                channel: 'Gate Smashers',
                description: 'Complete GA course — numerical ability, verbal ability, logical reasoning. Covers all 15 marks of aptitude in GATE.',
                verified: false,
                videos: 60
            },
            {
                id: 'PLpyc33-aeUuY8Ti5sVq5Q3YmKam19S99b',
                title: 'Aptitude for GATE',
                channel: 'CareerRide',
                description: 'Topic-wise aptitude lectures with shortcuts — time-work, time-speed-distance, percentages, profit-loss, ratios, and reasoning.',
                verified: false
            }
        ],
        searchQuery: 'GATE CSE general aptitude complete playlist',
        channels: ['Gate Smashers', 'CareerRide', 'Unacademy GATE', 'Feel Free to Learn']
    },
    'software-engineering': {
        label: 'Software Engineering',
        icon: '📐',
        playlists: [
            {
                id: 'PLmXKhU9FNesPRgyzVqZQE2OBHxN2Ffj-1',
                title: 'Software Engineering',
                channel: 'Gate Smashers',
                description: 'Complete SE course — SDLC, waterfall, agile, requirements, design, testing, COCOMO, risk management, and software quality.',
                verified: false
            }
        ],
        searchQuery: 'GATE CSE software engineering complete playlist',
        channels: ['Gate Smashers', 'Knowledge Gate', 'Unacademy GATE']
    },
    'web-technologies': {
        label: 'Web Technologies',
        icon: '🌍',
        playlists: [
            {
                id: 'PLsyeobzWxl7rjuoWilm9qzU6rQgcgTbIl',
                title: 'Web Technologies',
                channel: 'Telusko',
                description: 'HTML, CSS, JavaScript, and intro to backend — covers the basics of web development (small portion of GATE CSE syllabus).',
                verified: false
            }
        ],
        searchQuery: 'GATE CSE web technologies complete playlist',
        channels: ['Telusko', 'CodeWithHarry', 'Unacademy GATE']
    }
};

// Recommended GATE CSE YouTube channels (general)
const RECOMMENDED_CHANNELS = [
    { name: 'Gate Smashers', handle: 'GateSmashers', why: 'Most popular GATE CSE channel — all subjects in Hindi/English' },
    { name: 'Neso Academy', handle: 'nesoacademy', why: 'Excellent for Digital Logic, TOC, and Compiler Design' },
    { name: "Jenny's Lectures", handle: 'JennysLectures', why: 'Great for DS, OS, DBMS, and C programming' },
    { name: 'Knowledge Gate', handle: 'KnowGateHindi', why: 'Hindi/English lectures on all GATE subjects' },
    { name: 'Abdul Bari', handle: 'abdulbari', why: 'Best Algorithms course on YouTube' },
    { name: 'Unacademy GATE & ESE', handle: 'unacademygateandese', why: 'Free crash courses and live classes' },
    { name: 'GeeksforGeeks', handle: 'GeeksforGeeksVideos', why: 'Concept videos and DSA tutorials' },
    { name: 'CareerRide', handle: 'Careerride', why: 'Aptitude and reasoning shortcuts' }
];
