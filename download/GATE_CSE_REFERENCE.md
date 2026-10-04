# GATE CSE — Consolidated Study Content (fetched from GeeksforGeeks)

Fetched via z-ai `page_reader`. Source URLs + status per subject are noted inline.
This file contains ACTUAL extracted text content (topic lists, definitions,
formulas, examples), not just page structure.

## Fetch Status Summary
| # | Subject | Source URL used | Status |
|---|---------|-----------------|--------|
| 1 | GATE CSE Tutorial (index) | geeksforgeeks.org/gate-cse-tutorial/ | 404 — index reconstructed from subjects below |
| 2 | Operating System | geeksforgeeks.org/operating-systems/ | OK |
| 3 | DBMS | geeksforgeeks.org/dbms/ | OK |
| 4 | Computer Network | geeksforgeeks.org/computer-network-tutorials/ | OK |
| 5 | Compiler Design | geeksforgeeks.org/compiler-design-tutorials/ | OK |
| 6 | Digital Electronics | de articles: /logic-gates/ /boolean-algebra/ /encoder-in-digital-logic/ | OK (3 articles) |
| 7 | COA | geeksforgeeks.org/computer-organization-and-architecture-tutorials/ | OK |
| 8 | TOC | geeksforgeeks.org/theory-of-computation-automata-tutorials/ | OK |
| 9 | Engg. Mathematics | geeksforgeeks.org/engineering-mathematics-tutorials/ | OK |
| 10 | Data Structures & Algorithms | geeksforgeeks.org/data-structures/ | OK |

> Note: 5 of the originally-supplied URLs now return GFG's 404 page
> (gate-cse-tutorial, operating-systems-gate-notes, dbms-gate-notes,
> digital-electronics-logic-gates-tutorials, data-structures-tutorials).
> Working equivalents + individual DE articles were substituted.

============================================================
(1) GATE CSE TUTORIAL INDEX  [original URL = 404]
============================================================
The original /gate-cse-tutorial/ page no longer exists. The canonical GATE
CSE subject index (reconstructed from the live sibling tutorial pages, all of
which cross-link each other in GFG's nav) is:

  1. Engineering Mathematics  (Discrete Math + Probability + Linear Algebra + Calculus)
  2. Digital Electronics / Digital Logic Design
  3. Computer Organization & Architecture (COA)
  4. Data Structures & Algorithms (DSA)
  5. Operating Systems (OS)
  6. DBMS
  7. Computer Networks (CN)
  8. Theory of Computation (TOC)
  9. Compiler Design (CD)
 10. (General Aptitude + Verbal/English — outside the CSE core technical list)

============================================================
(2) OPERATING SYSTEM  (source: /operating-systems/)
============================================================
DEFINITION: An Operating System (OS) is software that manages and handles
hardware and software resources of a computing device.
- Manages computer resources such as CPU, memory, and files
- Acts as an interface between user and hardware
- Performs core functions like process, memory, and file management
Examples: Linux, Unix, Windows 11, MS-DOS, Android, macOS, iOS.

TOPICS COVERED:
* Basics: Introduction, Types of OS, Kernel, System Call, Boot Process
* Process Scheduling: Process, PCB, Process Table, Process States,
  Process Scheduler, CPU Scheduling Algorithms, Preemptive vs Non-Preemptive,
  Dispatcher vs scheduler, Starvation & Aging
* Process Synchronization: IPC, Race Condition, Critical Section,
  Peterson's Algorithm, Dekker's, Bakery Algorithm, Hardware solutions,
  Semaphores, Mutex vs Semaphore, Monitors, Priority Inversion, Classical
  IPC Problems (Producer-Consumer, Readers-Writers, Dining Philosophers)
* Deadlock: Introduction, Deadlock Handling (4 conditions), Prevention,
  Banker's Algorithm (Avoidance), Detection & Recovery, Starvation/Livelock,
  Resource Allocation Graph (RAG)
* Multithreading: User vs Kernel threads, Multithreading models,
  Thread vs Process
* Memory Management: Memory & Memory Units, Buddy System, Overlays,
  Virtual Memory, Paging, Segmentation, Page Replacement Algorithms
  (FIFO, LRU, Optimal), TLB
* I/O & Disk: File Systems, Unix File System, Directory structures,
  File Allocation Methods, Disk Scheduling (FCFS, SSTF, SCAN, C-SCAN, LOOK),
  Spooling vs Buffering, Free space management

GATE-CRITICAL FORMULAS / FACTS:
- Turnaround Time = Waiting Time + Burst Time.
- SJF non-preemptive is optimal for minimum average waiting time.
- Page Fault service time; effective access time (EAT):
    EAT = (1-p)*m  +  p*(page-fault-service-time), p = page-fault rate, m = mem time.
    With TLB hit ratio h and TLB access time t:
    EAT = h*(t+m) + (1-h)*(t + 2m)   [for paged memory with TLB]
- Banker's Safety: Need = Max − Allocation; safe iff a sequence exists where
  each process can finish with Available + finished processes' Allocation.
- Deadlock necessary conditions: Mutual exclusion, Hold & Wait, No
  preemption, Circular wait. Prevention breaks at least one.
- Disk scheduling seeks computed by sorting requests by cylinder and applying
  the algorithm's traversal order.

============================================================
(3) DBMS  (source: /dbms/)
============================================================
DEFINITION: A DBMS is software used to manage data from a database; acts as
interface between DB and end users/applications; ensures data is consistently
organised, easily accessible, secure. Relational: MySQL, Oracle, MS SQL
Server, PostgreSQL, Snowflake. NoSQL: MongoDB, Cassandra, DynamoDB, Redis.

TOPICS COVERED:
* Introduction & Architecture: Need for DBMS, 1/2/3-Tier architectures
* ER Model: Enhanced ER; Generalization, Specialization, Aggregation;
  Recursive relationships; Minimization of ER
* Relational Model & FDs: Keys (Candidate, Super, Primary, Alternate,
  Foreign), Functional Dependency, Attribute Closure, Equivalence of FDs,
  Canonical Cover, Anomalies, Mapping ER→Relational
* Normalization: 1NF,2NF,3NF,BCNF,4NF, Dependency-Preserving Decomposition,
  Lossless Join Decomposition, Highest Normal Form, Domain-Key NF
* Relational Algebra & Calculus: Basic Operators (σ, π, ∪, ∩, −, ×, ⋈, ÷),
  Extended Operators, Inner vs Outer Join, TRC, DRC
* Transactions & Concurrency: ACID, Lock-based, Graph-based (wait-die/
  wound-wait), Multiple Granularity, Timestamp Ordering, Thomas Write Rule,
  Log-based recovery, OLAP types, Deadlock
* File Org, Indexing, B/B+ Trees: clustered/non-clustered, B-Tree, B+ Tree,
  Bitmap, Inverted Index
* Advanced: RAID, Distributed DB, Query Optimization
* Data Warehousing & Mining, HBase, Hive

GATE-CRITICAL FORMULAS / FACTS:
- #superkeys for a key of size k with n attributes = 2^(n-k).
- Lossless binary decomp R(A,B,C)→R1(A,B),R2(B,C): (A∩B)→A or (A∩B)→B must
  hold (common attrs form a key of R1 or R2).
- 2NF: no partial dependency; 3NF: X→A ⇒ X superkey OR A prime;
  BCNF: X→A ⇒ X superkey (for non-trivial FDs).
- B+ tree: order p (max p pointers, p-1 keys); min occupancy ⌈p/2⌉ pointers;
  all data at leaf; height-balanced.
- ACID: Atomicity, Consistency, Isolation, Durability.
- Conflict serializable iff precedence graph is acyclic.
- Timestamp ordering: wound-wait (older preempts), wait-die (younger waits).

============================================================
(4) COMPUTER NETWORK  (source: /computer-network-tutorials/)
============================================================
DEFINITION: A computer network is a system of interconnected devices that
communicate to exchange data via wired/wireless connections.

TOPICS COVERED (by OSI layer):
* Fundamentals; Network Models: OSI (7 layers), TCP/IP (4 layers)
* Physical Layer: topology, media, modes (simplex/half/full duplex)
* Data Link: Switching, VLAN, Framing, Error Detection (parity/CRC),
  Error Correction (Hamming), Flow Control (Stop-and-Wait ARQ, Go-Back-N,
  Selective Repeat, Piggybacking)
* Network Layer: Classful & Classless addressing, IPv4 header, IPv4 vs IPv6,
  subnetting, VLSM, supernetting, routing (static/dynamic, link-state,
  distance-vector), NAT; Protocols: ARP, RARP, DHCP, ICMP, IGMP, RIP, OSPF,
  IS-IS, EIGRP, BGP, MPLS, IP, GRE
* Transport Layer: TCP, 3-Way Handshake, congestion control, UDP, TCP vs
  UDP, SCTP, DCCP, RUDP, QUIC
* Session/Presentation/Application: RPC, PPTP, SSL, MIME, DNS, FTP, SMTP,
  SNMP, HTTP/HTTPS, POP3, IMAP, LDAP, NTP, TFTP, NNTP, MQTT, SIP, SMB
* Performance/QoS: congestion control, Token Bucket, Leaky Bucket
* Security: Authentication, Encryption, Firewalls, IDS, IPS, VPN

GATE-CRITICAL FORMULAS / FACTS:
- IPv4 = 32 bits; IPv6 = 128 bits.
- Class A 1-126 (/8, 16,777,216 hosts); B 128-191 (/16, 65,536);
  C 192-223 (/24, 256); D 224-239 multicast; E 240-255 reserved.
- Hosts in subnet = 2^(host bits) − 2.
- Stop-and-Wait efficiency = 1/(1+2a), a = Tp/Tt.
  Max window W ≤ 1+2a for 100% utilization (Go-Back-N).
- Hamming distance d ⇒ detects (d-1), corrects ⌊(d-1)/2⌋ errors.
- TCP 3-way handshake SYN, SYN-ACK, ACK; sequence numbers in bytes.
- Bandwidth-delay product = bandwidth × RTT.
- RSA: c = m^e mod n; m = c^d mod n; n=pq, ed≡1 mod φ(n).
- Leaky bucket output rate r; token bucket allows burst = bucket capacity.

============================================================
(5) COMPILER DESIGN  (source: /compiler-design-tutorials/)
============================================================
DEFINITION: A compiler translates high-level source code into low-level
machine/assembly code. Stages: lexical analysis, syntax analysis (parsing),
semantic analysis, code generation, optimization.

TOPICS COVERED:
* Introduction: phases, single vs two pass, compiler tools, symbol table,
  error handling, generations of programming languages
* Lexical Analysis: tokens, lexemes, pattern; Flex
* Syntax Analysis: FIRST & FOLLOW, CFG classification, Ambiguous Grammar,
  Parsers (top-down LL(1); bottom-up SLR, CLR/LR(1), LALR), shift-reduce,
  operator precedence
* Syntax-Directed Translation: SDT, S-attributed & L-attributed SDTs
* Intermediate Code & Code Gen: three-address code, data-flow analysis,
  loop detection, code optimization, object code
* Runtime Environments: static & dynamic scoping, storage allocation
  (static/stack/heap), linker, loader

GATE-CRITICAL FORMULAS / FACTS:
- Phase order: Lexical → Syntax → Semantic → IR Gen → Code Opt → Code Gen;
  Symbol Table & Error Handler throughout.
- Token = <token-name, attribute>; lexeme = actual string matched.
- LL(1): predictive top-down, 1-symbol lookahead; grammar must be
  non-left-recursive & unambiguous; parse table conflict-free.
- LR power: LR(0) ⊂ SLR(1) ⊂ LALR(1) ⊂ LR(1); LALR = merge same-core LR(1)
  states.
- Shift-Reduce / Reduce-Reduce conflict ⇒ not LR for that class.
- Three-address code (TAC): x = y op z; quadruples, triples, indirect triples.
- Activation record: return value, params, control link (old FP), access link,
  locals, temporaries.
- Storage: static (globals), stack (activation records, LIFO), heap (dynamic).
- S-attributed: synthesized only; L-attributed: inherited from left
  siblings/parent (single pass).
- Peephole optimization: redundant-instruction elim, control-flow & algebraic
  simplification.

============================================================
(6) DIGITAL ELECTRONICS  (source articles: /logic-gates/, /boolean-algebra/, /encoder-in-digital-logic/)
============================================================
---- 6a. LOGIC GATES ----
Gate definitions & Boolean expressions:
- AND  : X = A·B
- OR   : X = A+B
- NOT  : Y = Ā  (= A')
- NOR  : universal; O = (A+B)'
- NAND : universal; X = (A·B)'
- XOR  : modulo-2 addition; X = A'B + AB'  (= A⊕B)
- XNOR : equivalence; Y = AB + A'B'  (= (A⊕B)')
- NAND & NOR are universal gates (realize any Boolean function).
- XOR accepts only 2 inputs; output high when inputs differ.

---- 6b. BOOLEAN ALGEBRA ----
Precedence (high→low): NOT (', ⇁) > AND (., ∧) > OR (+, ∨).
Truth table rows = 2^n (n = #Boolean variables).

Laws: Annulment, Identity, Idempotent, Complement, Double Negation,
Commutative, Associative, Distributive, Absorption, De Morgan.
- De Morgan: (A·B)' = A' + B' ; (A+B)' = A'·B'.
- Absorption: P + (P·Q) = P ; P·(P+Q) = P.
- Distributive: A + (B·C) = (A+B)·(A+C) ; A·(B+C) = A·B + A·C.

Worked example: Truth table for P + P·Q shows it equals P (Absorption).

GATE PYQs referenced on the page:
- GATE 2008 (1-mark): dual of A + Ā·B = A + B  ⇒  A·(Ā+B) = A·B.
- GATE 2011 (1-mark): #distinct Boolean functions on n variables = 2^(2^n).
  (n variables ⇒ 2^n input rows ⇒ each 0/1 ⇒ 2^(2^n) functions.)

---- 6c. ENCODERS ----
Encoder: combinational circuit; #inputs = 2^n, #outputs = n; one active input.
Types & Boolean expressions:
(1) 4-to-2: A1 = Y3 + Y2 ; A0 = Y3 + Y1.
(2) 8-to-3: A2 = Y7+Y6+Y5+Y4 ; A1 = Y7+Y6+Y3+Y2 ; A0 = Y7+Y5+Y3+Y1.
(3) Decimal-to-BCD (10-in, 4-out):
    A3 = Y9+Y8 ; A2 = Y7+Y6+Y5+Y4 ; A1 = Y7+Y6+Y3+Y2 ;
    A0 = Y9+Y7+Y5+Y3+Y1.
(4) Priority encoder: Y3 highest priority; adds validity bit V (V=1 if any
    input active); resolves ambiguity of simple encoders.

Ambiguity problem: all-zero output could mean input-0 active or no input;
multiple active inputs → unpredictable code ⇒ priority encoders.

Related DE sub-topics (cross-linked): Number systems & base conversions,
1's & 2's complement, BCD, parity-bit; minimization (K-map up to 5 variables,
Quine-McCluskey, implicants, don't-care conditions); combinational circuits
(half/full adder & subtractor, MUX, demux, decoder, magnitude comparator,
Gray-code conversion); sequential (latches, SR/JK/D/T flip-flops & conversions);
registers & counters (ripple, ring, shift), RAM/ROM.

============================================================
(7) COMPUTER ORGANIZATION & ARCHITECTURE  (source: /computer-organization-and-architecture-tutorials/)
============================================================
DEFINITION: Computer architecture defines how components communicate via
electronic signals for input/processing/output; covers CPU, memory, storage,
I/O design; components interact via buses, control signals, data pathways.

TOPICS COVERED:
* Basic: Von Neumann vs Harvard, Flynn's Taxonomy (SISD/SIMD/MISD/MIMD)
* Number system & data representation: base conversions, character rep,
  error detection/correction codes, fixed- & floating-point
* Digital logic & circuits: gates, Boolean algebra, combinational/sequential
* Register transfer & micro-operations: RTL, bus/memory transfers,
  arithmetic & shift micro-ops
* Control unit: hardwired vs microprogrammed
* ISA & addressing: instruction formats, addressing modes, RISC vs CISC
* Computer arithmetic: ALU & data path, 1's vs 2's complement, restoring &
  non-restoring division, Booth's algorithm, overflow
* Memory organization: paging, segmentation, virtual memory, page
  replacement, TLB, NUMA vs UMA, interleaving, byte vs word addressable
* I/O organization: interrupts, DMA (modes & 8257), memory-mapped vs
  isolated I/O, 8255 PPI, async/sync I/O, I/O processor, bus systems,
  bus arbitration
* Pipelining & hazards: stages & throughput, data/control/structural
  hazards, ILP, VLIW, branch prediction, Amdahl's law

GATE-CRITICAL FORMULAS / FACTS:
- Range n-bit signed: 2's complement = [−2^(n−1), 2^(n−1)−1];
  1's complement = [−(2^(n−1)−1), +(2^(n−1)−1)].
- Booth's algorithm: signed 2's-complement multiplication with −1/0/+1 recoding.
- Restoring division: subtract divisor; restore if negative (q bit 0) else 1.
- Memory hierarchy: registers → cache (L1/L2/L3) → main memory → SSD/HDD → tape.
- Cache AMAT = h·t_c + (1−h)·(t_c + t_m).
- Cache mapping: direct (block mod #lines), set-associative (block mod #sets),
  fully associative.
- TLB EAT = h·(t+m) + (1−h)·(t + (page-table-levels+1)·m).
- Pipeline speedup S = n·k / (k + n − 1) (k stages, n instructions, ideal).
- Amdahl's law: Speedup = 1 / ((1−p) + p/s).
- I/O: programmed, interrupt-driven, DMA (burst & cycle stealing).
- Flynn: SISD (scalar), SIMD (vector/GPU), MISD (rare), MIMD (multiprocessor).

============================================================
(8) THEORY OF COMPUTATION  (source: /theory-of-computation-automata-tutorials/)
============================================================
DEFINITION: TOC studies which problems computers can solve, how, and how
efficiently; studies abstract machines; foundation for compilers/language
processors; identifies solvable/unsolvable problems.

Chomsky Hierarchy: Type 3 (Regular/FA) ⊂ Type 2 (CFL/CFG+PDA) ⊂ Type 1 (CSL/LBA)
⊂ Type 0 (r.e./TM).

TOPICS COVERED:
* Finite Automata: DFA, NFA, minimization, NFA→DFA subset construction,
  operations on DFA
* Regular expr/grammar/language: regex↔FA (Arden, Kleene), star height,
  Mealy vs Moore, regular-language tests
* CFG: grammar↔language, simplifying CFG, closure of CFL, Chomsky & Greibach
  Normal Forms, Pumping Lemma, ambiguity, context-sensitive grammars
* Pushdown Automata: stack-based; acceptance by final state/empty stack;
  NPDA constructions for many languages
* Turing Machine: model, halting problem, TM as comparator, add/sub/mul/copy,
  recursive vs r.e. languages
* Decidability: decidable/undecidable, reducibility, NP-completeness,
  Hamiltonian Path & Vertex Cover NP-complete, computable vs non-computable

GATE-CRITICAL FORMULAS / FACTS & WORKED LANGUAGE CONSTRUCTIONS:
- Subset construction (NFA→DFA): states = subsets of NFA states; size ≤ 2^n.
- Arden's theorem: R = Q + RP (P lacks ε) ⇒ R = QP*.  (DFA→regex.)
- Pumping Lemma (regular): ∃p, ∀w∈L, |w|≥p, w=xyz, |xy|≤p, |y|>0 ⇒
  ∀i≥0 xy^i z ∈ L.  Used to prove non-regularity.
- Pumping Lemma (CFL): w=uvxyz, |vxy|≤p, |vy|>0 ⇒ uv^i x y^i z ∈ L.
- Closure: Regular∩Regular=Regular; CFL∩Regular=CFL; CFL∩CFL≠CFL (not closed
  under intersection/complement).
- Decidability: Halting undecidable; CFL emptiness/finiteness decidable;
  CFG ambiguity & equivalence undecidable; regular-language equivalence decidable.

NPDA/TM language constructions (sample, GATE-relevant):
  L = { a^n b^n | n≥1 }                  (NPDA)
  L = { a^n b^n c^m | m,n≥1 }            (NPDA)
  L = { a^m b^{2m} | m≥1 }               (NPDA)
  L = {0^n 1^m 2^m 3^n | m,n≥0}         (NPDA)
  L = {0^n 1^m 2^{n+m} | m,n≥0}         (NPDA)
  L = {ww^r | w∈{0,1}}                  (NPDA / TM)
  L = {ww | w∈{0,1}}                    (TM, not CFL)
  L = {0^n 1^n 2^n | n≥1}              (TM, context-sensitive)
  TM for: addition, subtraction, multiplication, copying, 1's/2's complement.

============================================================
(9) ENGINEERING MATHEMATICS  (source: /engineering-mathematics-tutorials/)
============================================================
TOPICS COVERED:
* Propositional & First-Order Logic: PDNF/PCNF, predicates, quantifiers,
  rules of inference (modus ponens, etc.)
* Set Theory & Algebra: power set, inclusion-exclusion, relations (matrix/
  graph), closures, partial orders & lattices, Hasse diagrams, equivalence
  relations, classes of functions, generating functions, groups/rings/fields
* Combinatorics: PnC, binomial coeffs, generalized PnC, pigeonhole, recurrence
* Probability: conditional, Bayes, random variables, distributions (binomial,
  Poisson, uniform, exponential, normal, hypergeometric), covariance/correlation
* Graph Theory: walks/trails/paths/cycles, isomorphism, Euler & Hamiltonian,
  planar graphs & coloring, matching, betweenness centrality
* Linear Algebra: matrices, system of linear equations, LU/Doolittle
  decomposition, eigenvalues & eigenvectors
* Calculus: limits/continuity/differentiability, Rolle's, Lagrange's (LMVT),
  Cauchy's (CMVT), Taylor series, maxima/minima, integrals
* Statistics & Numerical Methods: mean/variance/SD, covariance/correlation,
  Newton's divided-difference interpolation

GATE-CRITICAL FORMULAS / FACTS:
- Power set size = 2^|S|.
- |A∪B| = |A|+|B|−|A∩B|;
  |A∪B∪C| = Σ|A| − Σ|A∩| + |A∩B∩C|.
- #functions A(m)→B(n) = n^m; #one-to-one (m≤n) = n!/(n−m)!;
  #onto (n≤m) via inclusion-exclusion = Σ (−1)^k C(n,k)(n−k)^m.
- #relations on n-element set = 2^(n^2); #equivalence relations = Bell number B_n.
- #labeled trees (Cayley) = n^(n−2); #binary trees on n nodes (Catalan)
  C_n = (1/(n+1))·C(2n,n); #undirected labeled graphs = 2^(n(n−1)/2).
- P(A|B)=P(A∩B)/P(B); Bayes P(A|B)=[P(B|A)P(A)]/P(B);
  total probability P(B)=Σ P(B|A_i)P(A_i).
- Euler: connected graph has Euler circuit iff all vertices even degree;
  Euler path iff 0 or 2 odd-degree vertices.
- Planar: V−E+F=2; K_5 and K_{3,3} non-planar (Kuratowski).
- Modus ponens: from P and P→Q infer Q.
- Variance σ²=Σ(x−μ)²·P(x); SD = √variance.

============================================================
(10) DATA STRUCTURES & ALGORITHMS  (source: /data-structures/)
============================================================
DEFINITION: DSA = Data Structures (how data is stored/accessed) + Algorithms
(how data is processed). Examples: Array, Linked List, Tree, Heap; Binary
Search, Quick Sort, Merge Sort.

TOPICS COVERED (page lists ~1000 named problems per topic):
* Fundamentals: I/O, conditionals, loops, functions; Complexity analysis
  (Big-O, Theta, Omega, time/space); Recursion
* Arrays & Strings: rotate, subarrays, Kadane's (max subarray sum), next
  permutation, atoi, matrix spiral
* Searching: Linear & Binary search (lower/upper bound, peak, search-on-answer:
  book allocation, aggressive cows, koko eating banana, median of row-sorted)
* Sorting: merge, quick, cycle sort, inversion count, merge intervals,
  minimum platforms
* Bit manipulation: kth set bit, power of two, count set bits, Gray code,
  Hamming distance, subset XOR sum
* Hashing: probing, separate chaining, 2-sum, frequency, longest consecutive
  subsequence, anagrams
* Two-pointer & Sliding window: 3-sum, container with most water, max sum
  subarray of size K, longest substring with K distinct, trapping rain water
* Prefix sum & difference arrays: range queries, equilibrium index, subarray
  with 0 sum, subarray sum divisible by k
* Backtracking: permutations, N-Queen, Sudoku, word search, rat-in-maze,
  knight's tour, M-coloring
* Linked list: reversal, fast & slow pointer (cycle, middle, palindrome),
  merge K sorted, LRU/LFU cache, clone with random pointer
* Stack: balanced parentheses, postfix/infix eval, monotonic stack (next
  greater element, largest rectangle in histogram)
* Queue & Deque: circular queue, sliding window maximum, k queues in array
* Binary trees: traversals, size, depth, diameter, LCA, views, serialize
* BST: search/insert/delete, ceil/floor, kth smallest, validate/recover BST
* Heap: heap sort, kth largest, connect n ropes, median in a stream, merge k
  sorted lists, skyline
* Graphs: BFS/DFS, cycle, bipartite, topological sort, shortest paths
  (Dijkstra, Bellman-Ford, Floyd-Warshall), MST (Prim, Kruskal, DSU)
* Greedy: fractional knapsack, activity selection, Huffman, job sequencing
* DP: 1-D (climbing stairs, coin change, house robber, word break); 2-D
  (LCS, edit distance, unique paths, 0/1 knapsack); LIS; matrix chain
  multiplication, egg drop, boolean parenthesization, palindrome partitioning
* Number theory: nCr, Euler's totient, Sieve, modular exponentiation
* Trie; String matching: Rabin-Karp, KMP (LPS), Z-algorithm, Manacher
* Advanced: Segment tree, lazy propagation, Fenwick tree (BIT), sqrt
  decomposition, red-black tree

GATE-CRITICAL FORMULAS / FACTS (time complexity):
- Binary search = O(log n); Merge sort = O(n log n) stable;
  Quick sort = O(n²) worst, O(n log n) avg, in-place, unstable;
  Heap sort = O(n log n), in-place, unstable;
  BST balanced = O(log n), worst O(n);
  BFS/DFS = O(V+E); Dijkstra (binary heap) = O((V+E) log V);
  Bellman-Ford = O(V·E); Floyd-Warshall = O(V³);
  Prim = O(E log V); Kruskal = O(E log E); KMP = O(n+m); MCM DP = O(n³).
- Max nodes in binary tree of height h = 2^(h+1) − 1; min height for n
  nodes = ⌊log2 n⌋; max nodes at level l = 2^l.
- AVL: |BF| ≤ 1; rotations LL/RR/LR/RL.
- #binary trees on n nodes (Catalan) = (1/(n+1))·C(2n,n).
- Hashing load factor α = n/m; chaining successful ≈ 1+α/2, unsuccessful ≈ 1+α;
  open addressing successful ≈ (1/α)·ln(1/(1−α)), unsuccessful ≈ 1/(1−α).
- Stack LIFO O(1) push/pop; circular queue front=(front+1)%cap, rear=(rear+1)%cap.
- MST edges = V−1; #edges in K_n = n(n−1)/2.
- 0/1 knapsack DP = O(n·W) pseudo-polynomial.
- Topological sort iff DAG; via DFS post-order or Kahn's (BFS on indegree-0).

============================================================
END OF CONSOLIDATED CONTENT
============================================================
