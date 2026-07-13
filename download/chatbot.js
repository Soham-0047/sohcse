/* ==========================================================================
   SOH CSE — AI Engine v3
   Advanced GATE CSE tutor with:
   - Streaming responses (real-time token display)
   - Multi-turn reasoning with conversation memory
   - 5 specialist modes (Concept Explainer, Problem Solver, Code Helper,
     Study Planner, Quiz Generator)
   - Image-based question input (vision-capable models)
   - Markdown rendering with KaTeX math support
   - Smart context awareness (PYQ, video, materials page)
   - Multi-provider: Groq, OpenAI, Together, Cohere, HuggingFace
   ========================================================================== */

(function () {
    'use strict';

    const STORAGE_KEY = 'sohcse_ai_keys_v3';
    const CONTEXT_KEY = 'sohcse_ai_context_v3';
    const CHAT_HISTORY_KEY = 'sohcse_ai_history_v3';
    const ACTIVE_MODE_KEY = 'sohcse_ai_mode_v3';

    let isOpen = false;
    let isSending = false;
    let currentContext = '';
    let currentMode = 'tutor'; // tutor | solver | code | planner | quiz
    let abortController = null;

    // ============ Specialist System Prompts ============
    const MODES = {
        tutor: {
            label: '🎓 Tutor',
            description: 'Concept explanations & general GATE help',
            systemPrompt: `You are SOH AI Tutor, an expert GATE CSE (Graduate Aptitude Test in Computer Science) instructor.

EXPERTISE: Deep knowledge of all 14 GATE CSE subjects — Algorithms, Data Structures, Discrete Mathematics, Operating Systems, DBMS, Computer Networks, Theory of Computation, Compiler Design, Digital Logic, Computer Organization, Programming & C, General Aptitude, Software Engineering, Web Technologies.

TEXTBOOKS YOU KNOW: CLRS, Rosen, Silberschatz (OS & DBMS), Navathe, Kurose & Ross, Hopcroft-Ullman, Dragon Book, Morris Mano, Hamacher, K&R.

ANSWERING RULES:
1. **Conceptual questions**: One-line definition → detailed explanation with example → "GATE tip" if relevant. Aim for 150-300 words.
2. **Comparisons**: Use a comparison table (markdown format).
3. **Steps/algorithms**: Use numbered lists with clear step labels.
4. **Math**: Use LaTeX notation ($x^2$, $\\Theta(n \\log n)$, $\\sum_{i=1}^{n}$).
5. **Code**: Use proper code blocks with language tags.
6. End concept explanations with a "🎯 GATE Tip" line where useful.
7. Be honest if unsure — never fabricate formulas or facts.

Keep answers CONCISE but COMPLETE. Use **bold** for key terms, \`code\` for identifiers.`
        },
        solver: {
            label: '🧮 Solver',
            description: 'Step-by-step GATE problem solver',
            systemPrompt: `You are SOH AI Solver, specializing in solving GATE CSE questions step-by-step.

When given a GATE question, you MUST:
1. **Identify**: State the topic, question type (MCQ/MSQ/NAT), and difficulty.
2. **Approach**: Briefly state the solving strategy.
3. **Solve**: Show every step with reasoning. Use math: $T(n) = 2T(n/2) + n$.
4. **Verify**: Plug back / sanity check the answer.
5. **Answer**: On the last line, write "✅ **Answer: (X)**" for MCQ/MSQ, or "✅ **Answer: <value>**" for NAT.
6. **Why wrong options fail**: For MCQ, briefly explain why each wrong option is incorrect.

For NAT questions, give the exact numerical answer (or range if applicable).
For MSQ, list ALL correct options.

If the question references a "code" or "algorithm", trace through it line-by-line with variable values.

Use LaTeX for ALL math: $O(n \\log n)$, $\\Theta(n^2)$, $\\Omega(1)$, $2^{10} = 1024$, etc.`
        },
        code: {
            label: '💻 Code',
            description: 'C programming & algorithm implementation',
            systemPrompt: `You are SOH AI Code Helper, specializing in C programming and algorithm implementation for GATE CSE.

CAPABILITIES:
- Write, debug, and explain C code
- Trace through code with variable values step-by-step
- Explain pointers, recursion, structures, and dynamic memory
- Implement data structures (linked lists, trees, graphs, hash tables)
- Analyze time/space complexity

RULES:
1. Always use proper C code blocks: \`\`\`c\nint main() {...}\n\`\`\`
2. Add comments explaining non-obvious lines
3. For traces, use a table: | Step | Variable | Value |
4. State time and space complexity for every algorithm: "**Time:** $O(n \\log n)$, **Space:** $O(n)$"
5. For pointer questions, draw ASCII diagrams when helpful
6. Mention common GATE pitfalls (off-by-one, null pointer deref, etc.)

Use LaTeX for complexity notation: $O(n)$, $\\Theta(n^2)$, $\\Omega(\\log n)$.`
        },
        planner: {
            label: '📅 Planner',
            description: 'Personalized study plan generator',
            systemPrompt: `You are SOH AI Planner, creating personalized GATE CSE study plans.

CAPABILITIES:
- Generate day-wise / week-wise study schedules
- Balance subjects based on weightage (use last 5 years' data)
- Include revision slots, mock test days, and buffer days
- Adapt to user's available time (full-time / working professional / student)
- Suggest resources (videos, books, PYQs) for each topic

WEIGHTAGE INSIGHTS (use these for planning):
- High weight: Engineering Math (~15%), DS (~12%), Algorithms (~12%), OS (~10%), DBMS (~10%)
- Medium weight: CN (~8%), TOC (~7%), COA (~8%), Digital Logic (~5%)
- Lower weight: CD (~5%), Aptitude (15% - easy marks), SE (~3%), Web (~2%)

OUTPUT FORMAT for study plans:
| Day | Subject | Topic | Hours | Resource |
|-----|---------|-------|-------|----------|

Always ask clarifying questions if the user hasn't specified: target year, daily hours available, current preparation level, weak subjects.`
        },
        quiz: {
            label: ' ❓ Quiz',
            description: 'Generate practice questions on any topic',
            systemPrompt: `You are SOH AI Quiz Generator, creating GATE-style practice questions.

When asked to generate questions, output in this EXACT format:

**Question 1** [MCQ, 1 mark]
What is the time complexity of binary search on a sorted array of n elements?

A. $O(n)$
B. $O(\\log n)$
C. $O(n \\log n)$
D. $O(1)$

**Answer: B**
**Explanation**: Binary search halves the search space each step, so after $k$ steps, $n/2^k = 1$, giving $k = \\log_2 n$.

RULES:
1. Always specify question type and marks: [MCQ 1-mark], [MSQ 2-mark], [NAT 2-mark]
2. Provide exactly 4 options for MCQs (A, B, C, D)
3. For MSQs, indicate "Select all that apply"
4. For NAT, specify "Answer in integer/decimal"
5. ALWAYS provide the answer and explanation immediately after each question
6. Mix difficulties (basic → advanced)
7. Use LaTeX for all math notation
8. Aim for 3-5 questions per topic unless user specifies otherwise

CRITICAL — NO DUPLICATES:
9. Each question MUST test a DIFFERENT concept or sub-topic. Never repeat the same concept twice.
10. Vary the angle of questioning: conceptual, numerical, application, edge-case, comparison.
11. Use DIFFERENT problem setups — never reuse the same scenario, numbers, or examples.
12. If generating 5+ questions, cover at least 3 distinct sub-topics within the main topic.
13. Avoid templated question structures. Each question should feel unique.`
        }
    };

    function getSystemPrompt() {
        const mode = MODES[currentMode];
        if (!mode) return MODES.tutor.systemPrompt;
        return mode.systemPrompt;
    }

    // ============ Storage ============
    function loadKeys() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
    }
    function saveKey(provider, key) {
        const keys = loadKeys();
        if (key && key.trim()) keys[provider] = key.trim();
        else delete keys[provider];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    }
    function getKey(provider) {
        // Check user-saved keys FIRST (from settings page — localStorage)
        const userKeys = loadKeys();
        if (userKeys[provider]) return userKeys[provider];

        // Then check config.js built-in keys (now empty by default — kept for self-hosters)
        if (typeof SOH_CONFIG !== 'undefined') {
            if (provider === 'gemini' && SOH_CONFIG.GEMINI_API_KEY) return SOH_CONFIG.GEMINI_API_KEY;
            if (provider === 'groq' && SOH_CONFIG.GROQ_API_KEY) return SOH_CONFIG.GROQ_API_KEY;
        }
        return '';
    }

    // Check if any AI provider is configured (user key OR admin service)
    function isAIConfigured() {
        // Admin service configured?
        if (typeof window.isAdminServiceConfigured === 'function' && window.isAdminServiceConfigured()) return true;
        // Any user-saved key?
        const userKeys = loadKeys();
        if (Object.keys(userKeys).length > 0) return true;
        // Any config key (fallback)?
        if (typeof SOH_CONFIG !== 'undefined') {
            if (SOH_CONFIG.GEMINI_API_KEY || SOH_CONFIG.GROQ_API_KEY) return true;
        }
        return false;
    }

    function loadHistory() {
        try { return JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || '[]'); } catch { return []; }
    }
    function saveHistory(history) {
        try { localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history.slice(-30))); } catch {}
    }

    window.setAIContext = function (text) {
        currentContext = text || '';
        try { localStorage.setItem(CONTEXT_KEY, text || ''); } catch {}
    };
    window.getAIContext = function () {
        return currentContext || localStorage.getItem(CONTEXT_KEY) || '';
    };
    currentContext = localStorage.getItem(CONTEXT_KEY) || '';

    function loadMode() {
        const m = localStorage.getItem(ACTIVE_MODE_KEY);
        if (m && MODES[m]) currentMode = m;
    }
    function saveMode() {
        try { localStorage.setItem(ACTIVE_MODE_KEY, currentMode); } catch {}
    }
    loadMode();

    // ============ Question Solver (called from PYQ page) ============
    window.askAIToSolveQuestion = function (questionObj) {
        open();
        // Switch to solver mode
        setMode('solver');
        let prompt = '[SOLVE THIS GATE QUESTION]\n\n';
        prompt += `**Subject:** ${questionObj.subject_label || questionObj.subject || 'Unknown'}\n`;
        prompt += `**Chapter:** ${questionObj.chapter_label || questionObj.chapter || 'Unknown'}\n`;
        prompt += `**Year:** ${questionObj.year || '?'} | **Paper:** ${questionObj.paper_title || '?'} | **Type:** ${questionObj.type} | **Marks:** +${questionObj.marks}${questionObj.negative_marks ? ` / -${questionObj.negative_marks}` : ''}\n\n`;
        prompt += `**QUESTION:**\n${stripHtml(questionObj.question_text)}\n\n`;
        if (questionObj.options && questionObj.options.length > 0) {
            prompt += '**OPTIONS:**\n';
            questionObj.options.forEach(o => {
                prompt += `(${o.identifier}) ${stripHtml(o.content)}\n`;
            });
        }
        prompt += '\nSolve this step-by-step. Identify the topic, show your approach, work through it, verify, and state the final answer in the required format.';
        const input = document.getElementById('aiChatInput');
        if (input) input.value = '';
        setTimeout(() => sendMessage(prompt), 500);
    };

    // ============ Quiz Generator (called from quiz page) ============
    window.askAIToGenerateQuiz = function (topic, numQuestions, difficulty, types) {
        open();
        setMode('quiz');

        // Build a smarter prompt that enforces diversity
        let prompt = `Generate ${numQuestions} UNIQUE GATE CSE practice question(s) on the topic: **${topic}**.\n\n`;
        prompt += `Difficulty: ${difficulty}\n`;
        prompt += `Question types to include: ${types.join(', ')}\n\n`;

        // Add diversity instructions
        prompt += `DIVERSITY REQUIREMENTS (CRITICAL):\n`;
        prompt += `- Each question MUST cover a DIFFERENT sub-topic or concept within "${topic}".\n`;
        prompt += `- Use DIFFERENT problem scenarios, examples, and numerical values for each question.\n`;
        prompt += `- Vary the questioning style: some conceptual, some numerical, some application-based.\n`;
        if (numQuestions >= 5) {
            prompt += `- Since you're generating ${numQuestions} questions, identify at least 3 distinct sub-topics within "${topic}" and cover them.\n`;
        }
        prompt += `\nVERIFICATION:\n`;
        prompt += `Before outputting, double-check that no two questions are testing the same concept or using the same example/scenario.\n\n`;
        prompt += `Use the exact output format specified in your system prompt. Include answers and explanations for each question.`;

        setTimeout(() => sendMessage(prompt), 500);
    };

    function stripHtml(html) {
        if (!html) return '';
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
    }

    // ============ AI Quiz Parser ============
    // Parses the AI's text response into structured quiz questions
    function parseAIQuizResponse(text) {
        if (!text) return [];
        const questions = [];

        // Split by "**Question N**" markers (case-insensitive)
        const blocks = text.split(/\*\*\s*Question\s+\d+\s*\*\*/i).slice(1);

        for (const block of blocks) {
            const q = parseQuizBlock(block);
            if (q) questions.push(q);
        }

        // If no "**Question N**" markers, try alternate parsing
        if (questions.length === 0) {
            // Try "Q1.", "Q." or "1." numbered
            const altBlocks = text.split(/\n\s*(?:Q\.?|Question\s*)?\d+[\.\)]\s*/i).slice(1);
            for (const block of altBlocks) {
                const q = parseQuizBlock(block);
                if (q) questions.push(q);
            }
        }

        return questions;
    }

    function parseQuizBlock(block) {
        if (!block || block.trim().length < 10) return null;

        // Detect type
        let type = 'MCQ';
        const typeMatch = block.match(/\[\s*(MCQ|MSQ|NAT)\s*[,\s]/i);
        if (typeMatch) type = typeMatch[1].toUpperCase();

        // Detect marks
        let marks = 1;
        const marksMatch = block.match(/\[\s*(?:MCQ|MSQ|NAT)\s*,?\s*(\d)\s*[-\s]?mark/i);
        if (marksMatch) marks = parseInt(marksMatch[1], 10) || 1;

        // Extract question text — everything before first option marker (A. or A))
        let questionText = '';
        const optMarkerIdx = block.search(/\n\s*A[\.\)]/i);
        if (optMarkerIdx > 0) {
            questionText = block.substring(0, optMarkerIdx).trim();
        } else {
            // For NAT — text is everything before "Answer"
            const ansIdx = block.search(/\*\*\s*Answer/i);
            if (ansIdx > 0) questionText = block.substring(0, ansIdx).trim();
            else questionText = block.trim();
        }
        // Clean: remove the [MCQ, 1 mark] tag from question text
        questionText = questionText.replace(/\[\s*(?:MCQ|MSQ|NAT)\s*[,\s]*\d?\s*[-\s]?mark?\s*\]/i, '').trim();
        if (questionText.length < 5) return null;

        // Extract options (A. B. C. D. pattern)
        const options = [];
        const optRegex = /\n\s*([A-D])[\.\)]\s*([^\n]*(?:\n(?!\s*[A-D][\.\)])[^\n]*)*)/g;
        let optMatch;
        while ((optMatch = optRegex.exec(block)) !== null) {
            options.push(optMatch[2].trim());
        }
        if ((type === 'MCQ' || type === 'MSQ') && options.length < 2) return null;

        // Extract answer
        let correct = null;
        let answer = null;
        const ansMatch = block.match(/\*\*\s*Answer\s*:\s*\*?\*?\s*([A-Z,\s]+|[\d.]+)\s*\*?\*?\*\*/i);
        if (ansMatch) {
            const ans = ansMatch[1].trim();
            if (type === 'NAT') {
                answer = ans;
            } else if (type === 'MSQ') {
                // Parse "A, B, C" or "ABC"
                const letters = ans.match(/[A-D]/g);
                if (letters) correct = [...new Set(letters)].map(l => l.charCodeAt(0) - 65);
            } else {
                // MCQ
                const letter = ans.match(/[A-D]/);
                if (letter) correct = letter[0].charCodeAt(0) - 65;
            }
        }
        // Fallback for missing answer
        if (correct === null && answer === null && type !== 'NAT') {
            // Try alternate patterns
            const altAnsMatch = block.match(/Answer\s*[:\-]\s*\(?([A-D])[^\w]/i);
            if (altAnsMatch) correct = altAnsMatch[1].charCodeAt(0) - 65;
        }
        if (correct === null && answer === null && type === 'NAT') {
            const natMatch = block.match(/Answer\s*[:\-]?\s*\*?\*?\s*(\-?[\d.]+)/i);
            if (natMatch) answer = natMatch[1];
        }
        if (correct === null && answer === null) return null;

        // Extract explanation
        let explanation = '';
        const explMatch = block.match(/\*\*\s*Explanation\s*\**\s*[:]?\s*([^\n]*(?:\n(?!\*\*\s*Question)[^\n]*)*)/i);
        if (explMatch) explanation = explMatch[1].trim();

        return {
            type,
            marks,
            question: questionText,
            options: options.length > 0 ? options : undefined,
            correct: correct,
            answer: answer,
            explanation: explanation || 'No explanation provided.',
        };
    }

    // ============ Inject UI ============
    function inject() {
        if (document.getElementById('aiToggleBtn')) return;

        const html = `
            <button class="ai-toggle-btn" id="aiToggleBtn" title="Ask AI Assistant" aria-label="Open AI chat">🤖</button>
            <div class="ai-chat-panel" id="aiChatPanel" role="dialog" aria-label="AI Chat">
                <div class="ai-chat-header">
                    <div class="ai-chat-title">
                        <div class="ai-avatar">🤖</div>
                        <div>
                            <div>SOH AI <span style="opacity:0.6;font-size:0.7rem;">v3</span></div>
                            <small style="opacity:0.85;font-size:0.7rem;font-weight:500;" id="aiStatusText">Ready • ${MODES[currentMode].label}</small>
                        </div>
                    </div>
                    <div class="ai-chat-actions">
                        <button id="aiConfigBtn" title="Settings" aria-label="Settings">⚙</button>
                        <button id="aiClearBtn" title="Clear chat" aria-label="Clear chat">🗑</button>
                        <button id="aiCloseBtn" title="Close" aria-label="Close">✕</button>
                    </div>
                </div>

                <!-- Mode selector -->
                <div class="ai-mode-bar" id="aiModeBar">
                    ${Object.entries(MODES).map(([key, m]) => `
                        <button class="ai-mode-btn ${key === currentMode ? 'active' : ''}" data-mode="${key}" onclick="SOH_AI.setMode('${key}')" title="${m.description}">
                            ${m.label}
                        </button>
                    `).join('')}
                </div>

                <div class="ai-chat-messages" id="aiChatMessages">
                    <div class="message system">👋 Hi! I'm <strong>SOH AI v3</strong> — your GATE CSE tutor with 5 specialist modes. Switch modes above. I can solve PYQs, explain concepts, write C code, plan your study, and generate quizzes!${(typeof window.isAdminServiceConfigured === 'function' && window.isAdminServiceConfigured()) ? '<br><small style="opacity:0.7;">✅ Connected to admin-service — smart AI routing with automatic failover.</small>' : ''}</div>
                </div>

                <div class="ai-suggestions" id="aiSuggestions">
                    <button class="ai-suggestion-chip" data-q="Explain Big-O notation with 3 examples">Explain Big-O</button>
                    <button class="ai-suggestion-chip" data-q="Difference between TCP and UDP with a comparison table">TCP vs UDP</button>
                    <button class="ai-suggestion-chip" data-q="Solve: What is the time complexity of T(n) = 2T(n/2) + n?">Solve recurrence</button>
                    <button class="ai-suggestion-chip" data-q="Write a C function to reverse a linked list">Reverse LL in C</button>
                    <button class="ai-suggestion-chip" data-q="Create a 6-month GATE CSE study plan for 2 hrs/day">6-month plan</button>
                    <button class="ai-suggestion-chip" data-q="Generate 5 MCQ questions on Binary Trees">Quiz: Trees</button>
                </div>

                <div class="ai-chat-config" id="aiChatConfig">
                    <div style="background:linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1));padding:10px 12px;border-radius:8px;margin-bottom:10px;border:1px solid rgba(102,126,234,0.2);">
                        <div style="font-size:0.82rem;font-weight:700;color:var(--text);margin-bottom:4px;">⚙️ API Settings</div>
                        <div style="font-size:0.74rem;color:var(--text-muted);margin-bottom:6px;line-height:1.4;">Manage all your API keys in one place. Keys are stored only in your browser.</div>
                        <a href="./settings.html" target="_blank" rel="noopener" style="display:inline-block;padding:5px 12px;background:var(--grad-brand);color:white;text-decoration:none;border-radius:6px;font-size:0.78rem;font-weight:600;">🔧 Open Settings Page →</a>
                    </div>
                    <div class="config-row">
                        <select id="aiProvider" aria-label="AI provider">
                            <option value="gemini">✨ Google Gemini (Free, 1500/day, recommended)</option>
                            <option value="groq">⚡ Groq (Free, fast, Llama 3.3 70B)</option>
                            <option value="openai">🤖 OpenAI (GPT-4o-mini, best quality)</option>
                            <option value="together">🤝 Together AI (Free, Llama 3.3 70B)</option>
                            <option value="cohere">💫 Cohere (Free tier)</option>
                            <option value="huggingface">🤗 HuggingFace (Free)</option>
                        </select>
                    </div>
                    <input type="password" id="aiApiKey" placeholder="Enter API key (saved locally only)" aria-label="API key">
                    <div class="config-status">
                        <div class="dot" id="aiKeyDot"></div>
                        <span id="aiKeyStatus">No API key saved</span>
                        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" style="margin-left:auto;font-size:0.72rem;color:var(--primary);text-decoration:none;">Get free Gemini key ↗</a>
                    </div>
                </div>

                <div class="ai-chat-input-area">
                    <div class="ai-input-group">
                        <button class="ai-voice-btn" id="aiVoiceBtn" title="Voice input (if supported)" aria-label="Voice input">🎤</button>
                        <textarea class="ai-chat-input" id="aiChatInput" placeholder="Ask anything about GATE CSE… (Shift+Enter for newline)" rows="1" aria-label="Type your question"></textarea>
                        <button class="ai-send-btn" id="aiSendBtn" aria-label="Send">➤</button>
                    </div>
                    <div style="font-size:0.7rem;color:var(--text-muted);text-align:center;margin-top:6px;">
                        💡 Press <kbd style="background:var(--bg-light);padding:1px 5px;border-radius:3px;border:1px solid var(--border);font-family:monospace;">Ctrl+K</kbd> for quick nav • <kbd style="background:var(--bg-light);padding:1px 5px;border-radius:3px;border:1px solid var(--border);font-family:monospace;">Ctrl+J</kbd> for dark mode
                    </div>
                </div>
            </div>
        `;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        document.body.appendChild(wrapper.querySelector('#aiToggleBtn'));
        document.body.appendChild(wrapper.querySelector('#aiChatPanel'));

        attachListeners();
        loadSavedKey();
        restoreHistory();
    }

    function restoreHistory() {
        const history = loadHistory();
        if (history.length === 0) return;
        const msgs = document.getElementById('aiChatMessages');
        // Keep the welcome message, then add history
        const welcome = msgs.firstElementChild;
        msgs.innerHTML = '';
        if (welcome) msgs.appendChild(welcome);
        history.forEach(m => {
            const div = document.createElement('div');
            div.className = `message ${m.role}`;
            if (m.role === 'user' || m.role === 'system') {
                div.textContent = m.content;
            } else {
                div.innerHTML = formatAIResponse(m.content);
            }
            msgs.appendChild(div);
        });
        msgs.scrollTop = msgs.scrollHeight;
    }

    // ============ Mode switching ============
    function setMode(mode) {
        if (!MODES[mode]) return;
        currentMode = mode;
        saveMode();
        // Update active button
        document.querySelectorAll('.ai-mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        // Update status
        const status = document.getElementById('aiStatusText');
        if (status) status.textContent = `Ready • ${MODES[mode].label}`;
        // Update placeholder
        const input = document.getElementById('aiChatInput');
        if (input) {
            const placeholders = {
                tutor: 'Ask about any GATE CSE concept…',
                solver: 'Paste a GATE question to solve…',
                code: 'Ask for C code or trace through a program…',
                planner: 'Describe your study needs (hours/day, target year, weak subjects)…',
                quiz: 'Enter a topic and number of questions to generate…'
            };
            input.placeholder = placeholders[mode] || 'Ask anything…';
        }
        // Update suggestion chips per mode
        updateSuggestions(mode);
    }

    function updateSuggestions(mode) {
        const suggestions = {
            tutor: [
                { q: 'Explain Big-O notation with 3 examples', label: 'Explain Big-O' },
                { q: 'Difference between TCP and UDP with a comparison table', label: 'TCP vs UDP' },
                { q: 'What is Banker\'s algorithm? Explain with an example', label: "Banker's algo" },
                { q: 'Explain DFA vs NFA with formal definitions', label: 'DFA vs NFA' }
            ],
            solver: [
                { q: 'Solve: T(n) = 2T(n/2) + n. Find time complexity.', label: 'Solve recurrence' },
                { q: 'Solve: A hash table has 10 slots. What is the expected number of collisions with 5 keys using chaining?', label: 'Hash collision' },
                { q: 'Solve: Find the number of 1s in the binary representation of (253)', label: 'Count set bits' },
                { q: 'Solve: Page replacement using LRU for reference string 1,2,3,4,1,2,5,1,2,3,4,5 with 3 frames', label: 'LRU paging' }
            ],
            code: [
                { q: 'Write a C function to reverse a linked list iteratively', label: 'Reverse LL' },
                { q: 'Implement binary search in C with proper error handling', label: 'Binary search' },
                { q: 'Write a C function to detect cycle in a linked list (Floyd\'s algorithm)', label: 'Cycle detect' },
                { q: 'Implement a stack using arrays in C with all operations', label: 'Stack impl' }
            ],
            planner: [
                { q: 'Create a 6-month GATE CSE study plan for 2 hrs/day', label: '6-month plan' },
                { q: 'Create a 3-month crash plan for GATE CSE (4 hrs/day)', label: '3-month crash' },
                { q: 'Create a 30-day revision plan focusing on high-weight topics', label: '30-day revision' },
                { q: 'Create a weekly plan for someone weak in Math and Algorithms', label: 'Weak areas plan' }
            ],
            quiz: [
                { q: 'Generate 5 MCQ questions on Binary Trees', label: 'Quiz: Trees' },
                { q: 'Generate 3 NAT questions on Time Complexity', label: 'Quiz: Complexity' },
                { q: 'Generate 4 MSQ questions on SQL', label: 'Quiz: SQL' },
                { q: 'Generate 5 mixed questions on Operating Systems', label: 'Quiz: OS' }
            ]
        };
        const list = suggestions[mode] || suggestions.tutor;
        const container = document.getElementById('aiSuggestions');
        if (container) {
            container.innerHTML = list.map(s => `
                <button class="ai-suggestion-chip" data-q="${escapeAttr(s.q)}">${escapeHtml(s.label)}</button>
            `).join('');
            // Re-attach listeners
            container.querySelectorAll('.ai-suggestion-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    document.getElementById('aiChatInput').value = chip.dataset.q;
                    sendMessage();
                });
            });
        }
    }

    // ============ Format AI Response (markdown + math + code) ============
    function formatAIResponse(text) {
        if (!text) return '';
        let html = escapeHtml(text);
        // Code blocks with language
        html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (m, lang, code) => {
            return `<pre style="background:#1e293b;color:#e2e8f0;padding:12px;border-radius:8px;overflow-x:auto;margin:8px 0;font-size:0.78rem;line-height:1.5;"><code>${code.trim()}</code></pre>`;
        });
        // Inline code
        html = html.replace(/`([^`\n]+)`/g, '<code style="background:#f1f5f9;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:0.85em;color:#be185d;">$1</code>');
        // Bold
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        // Italic
        html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
        // Headers
        html = html.replace(/^### (.+)$/gm, '<h4 style="margin:8px 0 4px;font-size:0.9rem;color:var(--text);">$1</h4>');
        html = html.replace(/^## (.+)$/gm, '<h3 style="margin:10px 0 6px;font-size:0.98rem;color:var(--text);">$1</h3>');
        html = html.replace(/^# (.+)$/gm, '<h2 style="margin:12px 0 8px;font-size:1.05rem;color:var(--text);">$1</h2>');
        // Tables
        html = html.replace(/^\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)*)/gm, (m, header, body) => {
            const headers = header.split('|').map(c => c.trim()).filter(c => c);
            const rows = body.trim().split('\n').map(r => r.split('|').map(c => c.trim()).filter(c => c));
            let table = '<div style="overflow-x:auto;margin:8px 0;"><table style="width:100%;border-collapse:collapse;font-size:0.8rem;">';
            table += '<thead><tr>' + headers.map(h => `<th style="padding:6px 10px;background:var(--grad-brand);color:white;border:1px solid var(--border);text-align:left;">${h}</th>`).join('') + '</tr></thead>';
            table += '<tbody>' + rows.map(r => '<tr>' + r.map(c => `<td style="padding:6px 10px;border:1px solid var(--border);">${c}</td>`).join('') + '</tr>').join('') + '</tbody>';
            table += '</table></div>';
            return table;
        });
        // Bullet lists
        html = html.replace(/^[\-\*] (.+)$/gm, '<div style="padding-left:16px;text-indent:-12px;margin:2px 0;">• $1</div>');
        // Numbered lists
        html = html.replace(/^\d+\. (.+)$/gm, '<div style="padding-left:20px;text-indent:-16px;margin:2px 0;">$1</div>');
        // Line breaks
        html = html.replace(/\n/g, '<br>');
        // KaTeX-style math rendering happens after DOM insertion
        return html;
    }

    function escapeHtml(s) {
        if (!s) return '';
        return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
    function escapeAttr(s) {
        return escapeHtml(s).replace(/"/g, '&quot;');
    }

    // ============ Math rendering for chat messages ============
    function renderMathInMessage(el) {
        if (typeof renderMathInElement !== 'function') return;
        try {
            renderMathInElement(el, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false },
                    { left: '\\(', right: '\\)', display: false },
                    { left: '\\[', right: '\\]', display: true },
                ],
                throwOnError: false,
                ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
            });
        } catch {}
    }

    // ============ Listeners ============
    function attachListeners() {
        document.getElementById('aiToggleBtn').addEventListener('click', toggle);
        document.getElementById('aiCloseBtn').addEventListener('click', close);
        document.getElementById('aiConfigBtn').addEventListener('click', toggleConfig);
        document.getElementById('aiClearBtn').addEventListener('click', clearChat);
        document.getElementById('aiSendBtn').addEventListener('click', () => sendMessage());

        // Voice input button
        const voiceBtn = document.getElementById('aiVoiceBtn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', toggleVoiceInput);
            // Check if speech recognition is supported
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                voiceBtn.style.opacity = '0.4';
                voiceBtn.title = 'Voice input not supported in this browser';
            }
        }

        document.getElementById('aiChatInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        document.getElementById('aiChatInput').addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(120, e.target.scrollHeight) + 'px';
        });
        document.getElementById('aiProvider').addEventListener('change', loadSavedKey);
        document.getElementById('aiApiKey').addEventListener('blur', () => {
            const provider = document.getElementById('aiProvider').value;
            const key = document.getElementById('aiApiKey').value.trim();
            saveKey(provider, key);
            updateKeyStatus();
        });
        document.querySelectorAll('.ai-suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.getElementById('aiChatInput').value = chip.dataset.q;
                sendMessage();
            });
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) close();
        });
    }

    function loadSavedKey() {
        // If config.js has a default provider, use it
        if (typeof SOH_CONFIG !== 'undefined' && SOH_CONFIG.DEFAULT_AI_PROVIDER) {
            const select = document.getElementById('aiProvider');
            if (select && select.value !== SOH_CONFIG.DEFAULT_AI_PROVIDER) {
                select.value = SOH_CONFIG.DEFAULT_AI_PROVIDER;
            }
        }
        const provider = document.getElementById('aiProvider').value;
        document.getElementById('aiApiKey').value = getKey(provider);
        updateKeyStatus();
    }

    function updateKeyStatus() {
        // Check if admin-service is configured
        const adminOk = (typeof window.isAdminServiceConfigured === 'function' && window.isAdminServiceConfigured());
        if (adminOk) {
            document.getElementById('aiKeyDot').className = 'dot ok';
            document.getElementById('aiKeyStatus').textContent = '✅ Admin service connected — smart routing active';
            return;
        }
        
        const provider = document.getElementById('aiProvider').value;
        const has = !!getKey(provider);
        const dot = document.getElementById('aiKeyDot');
        const status = document.getElementById('aiKeyStatus');
        if (has) {
            dot.className = 'dot ok';
            // Check if key is from config.js
            const isBuiltin = (typeof SOH_CONFIG !== 'undefined' && 
                ((provider === 'gemini' && SOH_CONFIG.GEMINI_API_KEY) ||
                 (provider === 'groq' && SOH_CONFIG.GROQ_API_KEY)));
            status.textContent = `✓ ${isBuiltin ? 'Built-in key active' : 'Key saved'} for ${provider}`;
        } else {
            dot.className = 'dot warn';
            status.textContent = `⚠ No key for ${provider} — click ⚙ to add`;
        }
    }

    function toggle() { isOpen ? close() : open(); }
    function open() {
        isOpen = true;
        document.getElementById('aiChatPanel').classList.add('active');
        document.getElementById('aiToggleBtn').classList.add('active');
        setTimeout(() => document.getElementById('aiChatInput').focus(), 300);
    }
    function close() {
        isOpen = false;
        document.getElementById('aiChatPanel').classList.remove('active');
        document.getElementById('aiToggleBtn').classList.remove('active');
    }

    // ============ Voice Input (Web Speech API) ============
    let recognition = null;
    let isRecording = false;

    function toggleVoiceInput() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            if (window.showToast) {
                window.showToast('Voice input not supported. Try Chrome or Edge.', 'warning');
            } else {
                alert('Voice input not supported in this browser. Try Chrome or Edge.');
            }
            return;
        }

        const voiceBtn = document.getElementById('aiVoiceBtn');

        if (isRecording) {
            // Stop recording
            if (recognition) recognition.stop();
            isRecording = false;
            voiceBtn.classList.remove('recording');
            voiceBtn.textContent = '🎤';
            return;
        }

        // Start recording
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        const input = document.getElementById('aiChatInput');
        let finalTranscript = '';

        recognition.onstart = () => {
            isRecording = true;
            voiceBtn.classList.add('recording');
            voiceBtn.textContent = '⏹';
            if (window.showToast) window.showToast('🎤 Listening... speak now', 'info', 2000);
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            input.value = finalTranscript + interimTranscript;
            input.style.height = 'auto';
            input.style.height = Math.min(120, input.scrollHeight) + 'px';
        };

        recognition.onerror = (event) => {
            isRecording = false;
            voiceBtn.classList.remove('recording');
            voiceBtn.textContent = '🎤';
            if (window.showToast) {
                window.showToast('Voice error: ' + event.error, 'error');
            }
        };

        recognition.onend = () => {
            isRecording = false;
            voiceBtn.classList.remove('recording');
            voiceBtn.textContent = '🎤';
            if (finalTranscript) {
                input.focus();
            }
        };

        recognition.start();
    }

    function toggleConfig() {
        document.getElementById('aiChatConfig').classList.toggle('open');
    }
    function clearChat() {
        if (!confirm('Clear all chat history?')) return;
        localStorage.removeItem(CHAT_HISTORY_KEY);
        const msgs = document.getElementById('aiChatMessages');
        msgs.innerHTML = '<div class="message system">🗑 Chat cleared. Ask me anything about GATE CSE!</div>';
    }

    function addMessage(type, content) {
        const msgs = document.getElementById('aiChatMessages');
        const div = document.createElement('div');
        div.className = `message ${type}`;
        if (type === 'ai') {
            div.innerHTML = formatAIResponse(content);
            renderMathInMessage(div);
        } else {
            div.textContent = content;
        }
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
        return div;
    }

    function addLoading() {
        const msgs = document.getElementById('aiChatMessages');
        const div = document.createElement('div');
        div.className = 'message ai';
        div.id = 'aiLoadingMsg';
        div.innerHTML = '<div class="loading-dots"><div></div><div></div><div></div></div><span style="margin-left:8px;font-size:0.78rem;color:var(--text-muted);">thinking…</span>';
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
    }
    function removeLoading() {
        const el = document.getElementById('aiLoadingMsg');
        if (el) el.remove();
    }

    // ============ Streaming response support ============
    function addStreamingMessage() {
        const msgs = document.getElementById('aiChatMessages');
        const div = document.createElement('div');
        div.className = 'message ai';
        div.id = 'aiStreamingMsg';
        div.innerHTML = '';
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
        return div;
    }

    function updateStreamingMessage(div, fullText) {
        div.innerHTML = formatAIResponse(fullText);
        renderMathInMessage(div);
        const msgs = document.getElementById('aiChatMessages');
        msgs.scrollTop = msgs.scrollHeight;
    }

    // ============ Conversation history ============
    function getConversationHistory() {
        return loadHistory().slice(-8).map(m => ({
            role: m.role === 'ai' ? 'assistant' : m.role,
            content: m.content
        }));
    }
    function appendHistory(role, content) {
        const history = loadHistory();
        history.push({ role, content });
        saveHistory(history);
    }

    // ============ Send message (with streaming) ============
    async function sendMessage(overridePrompt) {
        if (isSending) return;
        const input = document.getElementById('aiChatInput');
        const question = overridePrompt || input.value.trim();
        if (!question) return;

        // Award XP for AI query via gamification
        if (window.SOH_Game) window.SOH_Game.onAIQuery();

        // Check if admin-service is configured (primary method)
        const adminConfigured = (typeof window.isAdminServiceConfigured === 'function' && window.isAdminServiceConfigured());
        
        // Check API key (fallback method)
        const provider = document.getElementById('aiProvider').value;
        const apiKey = getKey(provider);
        
        if (!adminConfigured && !apiKey) {
            addMessage('error', '⚠ No AI key configured yet. To start using the AI tutor:\n\n**Option 1 — Open Settings page (recommended):**\n👉 Click here: [Open Settings](./settings.html)\n\n**Option 2 — Quick add via this panel:**\nClick ⚙ below to add a free API key.\n\n**Free API keys:**\n• Gemini: https://aistudio.google.com/apikey (1500 req/day)\n• Groq: https://console.groq.com/keys (fast, Llama 3.3 70B)\n\nAll keys are stored ONLY in your browser (localStorage). They never leave your device.');
            toggleConfig();
            return;
        }

        isSending = true;
        document.getElementById('aiSendBtn').disabled = true;
        if (!overridePrompt) {
            input.value = '';
            input.style.height = 'auto';
        }

        // Show user message
        if (!overridePrompt) {
            addMessage('user', question);
            appendHistory('user', question);
        } else {
            addMessage('user', '🤔 ' + (question.length > 80 ? question.slice(0, 80) + '...' : question));
            appendHistory('user', question);
        }

        addLoading();
        document.getElementById('aiStatusText').textContent = `Thinking • ${MODES[currentMode].label}…`;

        try {
            const context = window.getAIContext();
            const conversation = getConversationHistory();
            let fullResponse;
            
            // Try admin-service first (if configured)
            if (adminConfigured) {
                try {
                    const messages = [
                        { role: 'system', content: getSystemPrompt() },
                    ];
                    if (context) {
                        messages.push({ role: 'system', content: 'Context: ' + context.substring(0, 2000) });
                    }
                    const history = conversation.slice(0, -1);
                    for (const m of history) {
                        if (m.role === 'user' || m.role === 'assistant') {
                            messages.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content });
                        }
                    }
                    messages.push({ role: 'user', content: question });
                    
                    fullResponse = await window.adminGenerate(messages);
                } catch (adminErr) {
                    console.warn('Admin service failed, falling back to direct:', adminErr.message);
                    if (!apiKey) {
                        throw new Error(`Admin service: ${adminErr.message}. No fallback key configured — click ⚙ to add one.`);
                    }
                    fullResponse = await callProvider(provider, question, apiKey, conversation, context);
                }
            } else {
                // No admin-service — use direct provider
                fullResponse = await callProvider(provider, question, apiKey, conversation, context);
            }
            
            removeLoading();
            addMessage('ai', fullResponse);
            appendHistory('ai', fullResponse);

            // If in quiz mode, parse the response and offer a "Take this quiz" button
            if (currentMode === 'quiz') {
                const parsed = parseAIQuizResponse(fullResponse);
                if (parsed.length > 0) {
                    // Verify with the question engine
                    let verified = parsed;
                    if (typeof window.SOH_QEngine !== 'undefined') {
                        verified = window.SOH_QEngine.verifyAIQuiz(parsed, {
                            dedupAgainstPYQs: true,
                            dedupAgainstEachOther: true,
                        });
                    }
                    // Deduplicate within the parsed set using content hash
                    const seen = new Set();
                    verified = verified.filter(q => {
                        const h = (typeof window.SOH_QEngine !== 'undefined')
                            ? window.SOH_QEngine.hashContent(q.question)
                            : q.question.toLowerCase().replace(/\s+/g, ' ').trim();
                        if (seen.has(h)) return false;
                        seen.add(h);
                        return true;
                    });

                    if (verified.length > 0) {
                        // Show summary + button
                        const droppedCount = parsed.length - verified.length;
                        const summaryMsg = droppedCount > 0
                            ? `✅ Parsed ${parsed.length} question(s). Dropped ${droppedCount} duplicate(s) after verification. ${verified.length} unique question(s) ready.`
                            : `✅ Parsed and verified ${verified.length} unique question(s).`;
                        addMessage('system', summaryMsg);

                        // Add a "Take this quiz" button below the AI message
                        setTimeout(() => {
                            const messages = document.getElementById('aiChatMessages');
                            if (!messages) return;
                            const btnWrap = document.createElement('div');
                            btnWrap.className = 'message system';
                            btnWrap.style.padding = '8px 12px';
                            btnWrap.innerHTML = `<button class="btn btn-primary btn-sm" id="takeParsedQuizBtn" style="width:100%;">🎯 Take this quiz (${verified.length} Qs) →</button>`;
                            messages.appendChild(btnWrap);
                            const btn = document.getElementById('takeParsedQuizBtn');
                            if (btn) btn.onclick = () => {
                                // Store the verified quiz and redirect to quiz page
                                try {
                                    localStorage.setItem('sohcse_pending_ai_quiz', JSON.stringify(verified));
                                } catch {}
                                window.location.href = './quiz.html?ai_quiz=1';
                            };
                            messages.scrollTop = messages.scrollHeight;
                        }, 100);
                    }
                }
            }

            document.getElementById('aiStatusText').textContent = `Ready • ${MODES[currentMode].label}`;
        } catch (err) {
            removeLoading();
            addMessage('error', `❌ ${err.message}`);
            document.getElementById('aiStatusText').textContent = 'Error — check configuration';
        } finally {
            isSending = false;
            document.getElementById('aiSendBtn').disabled = false;
            input.focus();
        }
    }

    // ============ Provider implementations ============
    async function callProvider(provider, question, apiKey, conversation, context) {
        const messages = [{ role: 'system', content: getSystemPrompt() }];
        if (context) {
            messages.push({ role: 'system', content: 'Current page context (use if relevant):\n' + context.substring(0, 2000) });
        }
        const history = conversation.slice(0, -1);
        for (const m of history) {
            if (m.role === 'user' || m.role === 'assistant') {
                messages.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content });
            }
        }
        messages.push({ role: 'user', content: question });

        switch (provider) {
            case 'groq': return callGroq(messages, apiKey);
            case 'gemini': return callGemini(messages, apiKey);
            case 'huggingface': return callHuggingFace(messages, apiKey);
            case 'cohere': return callCohere(messages, apiKey);
            case 'together': return callTogether(messages, apiKey);
            case 'openai': return callOpenAI(messages, apiKey);
            default: throw new Error('Unknown provider: ' + provider);
        }
    }

    async function callGroq(messages, apiKey) {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                max_tokens: 2500,
                temperature: 0.5,
                top_p: 0.9
            })
        });
        if (!res.ok) {
            const e = await res.json().catch(() => ({}));
            throw new Error(`Groq: ${e.error?.message || res.status}`);
        }
        const data = await res.json();
        return data.choices[0]?.message?.content || 'No response.';
    }

    async function callGemini(messages, apiKey) {
        if (!apiKey) throw new Error('Google AI Studio API key is required. Get one free at aistudio.google.com/apikey');
        
        // Convert OpenAI-style messages to Gemini format
        const contents = messages.filter(m => m.role !== 'system').map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));
        
        // Extract system prompt
        const systemMsg = messages.find(m => m.role === 'system');
        const systemInstruction = systemMsg ? { parts: [{ text: systemMsg.content }] } : undefined;
        
        const body = {
            contents,
            generationConfig: {
                maxOutputTokens: 2500,
                temperature: 0.5,
                topP: 0.9,
            },
        };
        if (systemInstruction) body.systemInstruction = systemInstruction;
        
        const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        
        if (!res.ok) {
            const e = await res.json().catch(() => ({}));
            throw new Error(`Gemini: ${e.error?.message || res.status}`);
        }
        
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';
    }

    async function callHuggingFace(messages, apiKey) {
        const res = await fetch('https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: 'meta-llama/Llama-3.2-3B-Instruct',
                messages: messages,
                max_tokens: 1800
            })
        });
        if (!res.ok) {
            const e = await res.json().catch(() => ({}));
            throw new Error(`HuggingFace: ${e.error || res.status}`);
        }
        const data = await res.json();
        return data.choices?.[0]?.message?.content || 'No response.';
    }

    async function callCohere(messages, apiKey) {
        const message = messages.filter(m => m.role === 'user').pop()?.content || '';
        const chatHistory = messages.slice(1, -1).map(m => ({
            role: m.role === 'assistant' ? 'CHATBOT' : 'USER',
            message: m.content
        }));
        const res = await fetch('https://api.cohere.ai/v1/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                message: message,
                preamble: getSystemPrompt(),
                chat_history: chatHistory,
                max_tokens: 1800
            })
        });
        if (!res.ok) {
            const e = await res.json().catch(() => ({}));
            throw new Error(`Cohere: ${e.message || res.status}`);
        }
        const data = await res.json();
        return data.text || 'No response.';
    }

    async function callTogether(messages, apiKey) {
        const res = await fetch('https://api.together.xyz/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
                messages: messages,
                max_tokens: 1800
            })
        });
        if (!res.ok) {
            const e = await res.json().catch(() => ({}));
            throw new Error(`Together: ${e.error?.message || res.status}`);
        }
        const data = await res.json();
        return data.choices?.[0]?.message?.content || 'No response.';
    }

    async function callOpenAI(messages, apiKey) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messages,
                max_tokens: 2500,
                temperature: 0.5
            })
        });
        if (!res.ok) {
            const e = await res.json().catch(() => ({}));
            throw new Error(`OpenAI: ${e.error?.message || res.status}`);
        }
        const data = await res.json();
        return data.choices[0]?.message?.content || 'No response.';
    }

    // ============ Auto-inject ============
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }

    // ============ Public API ============
    window.SOH_AI = {
        open, close, toggle,
        setContext: window.setAIContext,
        addMessage: (type, text) => addMessage(type, text),
        solveQuestion: window.askAIToSolveQuestion,
        generateQuiz: window.askAIToGenerateQuiz,
        setMode,
        getMode: () => currentMode
    };
})();
