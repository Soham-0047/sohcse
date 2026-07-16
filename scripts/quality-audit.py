#!/usr/bin/env python3
"""Comprehensive quality audit of PYQ data."""
import json
from collections import defaultdict, Counter

with open('/home/z/my-project/download/gate_cse_questions.json') as f:
    data = json.load(f)

print("=" * 80)
print("COMPREHENSIVE PYQ DATA QUALITY AUDIT")
print("=" * 80)

# Issue 1: Find broken questions
print("\n1. BROKEN QUESTIONS CHECK")
print("-" * 60)

broken = {
    'no_question_text': 0,
    'empty_question_text': 0,
    'mcq_no_options': 0,
    'mcq_less_than_2_options': 0,
    'mcq_no_correct_options': 0,
    'msq_no_correct_options': 0,
    'nat_no_answer': 0,
    'nat_invalid_answer': 0,
    'no_year': 0,
    'no_subject': 0,
    'no_chapter': 0,
    'invalid_marks': 0,
    'very_old_year': 0,
    'is_bonus': 0,
    'is_out_of_syllabus': 0,
}

broken_examples = {k: [] for k in broken}

for subj in data['subjects']:
    for chap in subj['chapters']:
        for q in chap['questions']:
            qid = q.get('question_id', 'unknown')
            qtype = q.get('normalized_type', 'mcq')
            qtext = q.get('question_text', '')
            opts = q.get('options', [])
            correct = q.get('correct_options', [])
            answer = q.get('answer')

            # Check question text
            if not qtext:
                broken['no_question_text'] += 1
                if len(broken_examples['no_question_text']) < 3:
                    broken_examples['no_question_text'].append(qid)
            elif len(qtext.strip()) < 10:
                broken['empty_question_text'] += 1
                if len(broken_examples['empty_question_text']) < 3:
                    broken_examples['empty_question_text'].append({'qid': qid, 'text': qtext[:50]})

            # Check MCQ/MSQ options
            if qtype in ('mcq', 'msq'):
                if not opts:
                    broken['mcq_no_options'] += 1
                    if len(broken_examples['mcq_no_options']) < 3:
                        broken_examples['mcq_no_options'].append(qid)
                elif len(opts) < 2:
                    broken['mcq_less_than_2_options'] += 1
                    if len(broken_examples['mcq_less_than_2_options']) < 3:
                        broken_examples['mcq_less_than_2_options'].append(qid)
                if not correct and qtype == 'mcq':
                    broken['mcq_no_correct_options'] += 1
                    if len(broken_examples['mcq_no_correct_options']) < 3:
                        broken_examples['mcq_no_correct_options'].append(qid)
                if not correct and qtype == 'msq':
                    broken['msq_no_correct_options'] += 1
                    if len(broken_examples['msq_no_correct_options']) < 3:
                        broken_examples['msq_no_correct_options'].append(qid)

            # Check NAT answer
            if qtype == 'nat':
                if not answer and not q.get('has_answer'):
                    broken['nat_no_answer'] += 1
                    if len(broken_examples['nat_no_answer']) < 3:
                        broken_examples['nat_no_answer'].append(qid)

            # Check metadata
            if not q.get('year'):
                broken['no_year'] += 1
            if not q.get('subject'):
                broken['no_subject'] += 1
            if not q.get('chapter'):
                broken['no_chapter'] += 1
            marks = q.get('marks')
            if marks not in (1, 2):
                broken['invalid_marks'] += 1
                if len(broken_examples['invalid_marks']) < 3:
                    broken_examples['invalid_marks'].append({'qid': qid, 'marks': marks})
            if q.get('year', 2025) < 1990:
                broken['very_old_year'] += 1
            if q.get('is_bonus'):
                broken['is_bonus'] += 1
            if q.get('is_out_of_syllabus'):
                broken['is_out_of_syllabus'] += 1

print(f"  No question text:                {broken['no_question_text']}")
print(f"  Empty question text (<10 chars): {broken['empty_question_text']}")
print(f"  MCQ/MSQ with no options:         {broken['mcq_no_options']}")
print(f"  MCQ/MSQ with <2 options:         {broken['mcq_less_than_2_options']}")
print(f"  MCQ with no correct option:      {broken['mcq_no_correct_options']}")
print(f"  MSQ with no correct options:     {broken['msq_no_correct_options']}")
print(f"  NAT with no answer:              {broken['nat_no_answer']}")
print(f"  No year:                         {broken['no_year']}")
print(f"  Invalid marks (not 1 or 2):      {broken['invalid_marks']}")
print(f"  Very old (pre-1990):             {broken['very_old_year']}")
print(f"  Is bonus:                        {broken['is_bonus']}")
print(f"  Is out of syllabus:              {broken['is_out_of_syllabus']}")

if broken_examples['invalid_marks']:
    print(f"\n  Invalid marks examples: {broken_examples['invalid_marks']}")

# Issue 2: Check syllabus coverage
print("\n2. SYLLABUS COVERAGE CHECK")
print("-" * 60)

# Official GATE CSE 2027 syllabus topics
official_topics = {
    'Digital Logic': ['boolean-algebra', 'combinational-circuits', 'sequential-circuits', 'minimization', 'number-systems', 'k-maps'],
    'COA': ['machine-instructions-and-addressing-modes', 'alu-data-path-and-control-unit', 'pipelining', 'memory-interfacing', 'io-interface', 'secondary-memory'],
    'Programming & DS': ['basic-of-programming-language', 'function-and-recursion', 'pointer-and-structure-in-c', 'array', 'linked-list', 'stacks-and-queues', 'trees', 'hashing', 'graphs'],
    'Algorithms': ['complexity-analysis-and-asymptotic-notations', 'searching-and-sorting', 'greedy-method', 'dynamic-programming', 'divide-and-conquer-method'],
    'TOC': ['finite-automata-and-regular-language', 'push-down-automata-and-context-free-language', 'recursively-enumerable-language-and-turing-machine'],
    'Compiler Design': ['lexical-analysis', 'parsing', 'syntax-directed-translation', 'code-generation-and-optimization'],
    'OS': ['process-concepts-and-cpu-scheduling', 'synchronization-and-concurrency', 'deadlocks', 'memory-management', 'file-system-io-and-protection'],
    'DBMS': ['er-model', 'relational-algebra', 'structured-query-language', 'functional-dependencies-and-normalization', 'file-structures-and-indexing', 'transactions-and-concurrency'],
    'CN': ['concepts-of-layering', 'data-link-layer-and-switching', 'network-layer', 'ip-addressing-and-subnetting', 'tcp-udp-sockets-and-congestion-control', 'application-layer-protocol'],
    'Discrete Math': ['propositional-logic-and-first-order-logic', 'set-theory-and-algebra', 'linear-algebra', 'calculus', 'probability', 'graph-theory', 'combinatorics'],
    'GA': ['numerical-ability', 'verbal-ability', 'logical-reasoning'],
}

# Get all chapters in data
data_chapters = set()
for subj in data['subjects']:
    for chap in subj['chapters']:
        data_chapters.add(chap['chapter'])

print(f"Total unique chapters in data: {len(data_chapters)}")
for section, topics in official_topics.items():
    missing = [t for t in topics if t not in data_chapters]
    present = [t for t in topics if t in data_chapters]
    print(f"  {section}: {len(present)}/{len(topics)} topics covered")
    if missing:
        print(f"    Missing: {missing}")

# Issue 3: Question count per subject per year (2021-2026)
print("\n3. QUESTION COUNT PER SUBJECT (2021-2026)")
print("-" * 60)
subj_year = defaultdict(lambda: defaultdict(int))
for subj in data['subjects']:
    for chap in subj['chapters']:
        for q in chap['questions']:
            year = q.get('year', 0)
            if year >= 2021:
                subj_year[subj['subject']][year] += 1

print(f"{'Subject':40s} {'2021':>5s} {'2022':>5s} {'2023':>5s} {'2024':>5s} {'2025':>5s} {'2026':>5s} {'Tot':>5s}")
for subj in sorted(subj_year.keys()):
    years = subj_year[subj]
    total = sum(years.values())
    print(f"{subj:40s} {years.get(2021,0):5d} {years.get(2022,0):5d} {years.get(2023,0):5d} {years.get(2024,0):5d} {years.get(2025,0):5d} {years.get(2026,0):5d} {total:5d}")

# Issue 4: Check for duplicate questions (same content hash)
print("\n4. DUPLICATE QUESTIONS CHECK")
print("-" * 60)
import re
def strip_html(text):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', text or '')).strip().lower()

content_map = defaultdict(list)
for subj in data['subjects']:
    for chap in subj['chapters']:
        for q in chap['questions']:
            clean = strip_html(q.get('question_text', ''))
            if len(clean) > 20:
                content_map[clean[:200]].append(q.get('question_id'))

dupes = {k: v for k, v in content_map.items() if len(v) > 1}
print(f"  Duplicate content groups: {len(dupes)}")
print(f"  Total duplicate questions: {sum(len(v) for v in dupes.values())}")
if dupes:
    print(f"  Example duplicate (first 3):")
    for k, v in list(dupes.items())[:3]:
        print(f"    IDs: {v[:3]} | Text: {k[:80]}...")

# Issue 5: Check explanation quality
print("\n5. EXPLANATION QUALITY CHECK")
print("-" * 60)
no_expl = 0
short_expl = 0
good_expl = 0
for subj in data['subjects']:
    for chap in subj['chapters']:
        for q in chap['questions']:
            expl = q.get('explanation', '')
            if not expl:
                no_expl += 1
            elif len(expl) < 50:
                short_expl += 1
            else:
                good_expl += 1
total = no_expl + short_expl + good_expl
print(f"  No explanation:       {no_expl} ({no_expl/total*100:.1f}%)")
print(f"  Short explanation (<50 chars): {short_expl} ({short_expl/total*100:.1f}%)")
print(f"  Good explanation (≥50 chars):  {good_expl} ({good_expl/total*100:.1f}%)")

# Issue 6: Check for very short questions (might be incomplete)
print("\n6. QUESTION LENGTH DISTRIBUTION")
print("-" * 60)
length_buckets = Counter()
for subj in data['subjects']:
    for chap in subj['chapters']:
        for q in chap['questions']:
            text = strip_html(q.get('question_text', ''))
            length = len(text)
            if length < 20:
                length_buckets['<20 (suspicious)'] += 1
            elif length < 50:
                length_buckets['20-50'] += 1
            elif length < 100:
                length_buckets['50-100'] += 1
            elif length < 300:
                length_buckets['100-300'] += 1
            elif length < 600:
                length_buckets['300-600'] += 1
            else:
                length_buckets['>600'] += 1

for bucket, count in sorted(length_buckets.items()):
    pct = count / sum(length_buckets.values()) * 100
    print(f"  {bucket:20s}: {count:5d} ({pct:5.1f}%)")

print("\n" + "=" * 80)
print("AUDIT COMPLETE")
print("=" * 80)
