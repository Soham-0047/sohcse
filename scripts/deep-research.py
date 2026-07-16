#!/usr/bin/env python3
"""Deep research analysis of GATE CSE PYQ data to understand real paper patterns."""

import json
from collections import defaultdict, Counter

with open('/home/z/my-project/download/gate_cse_questions.json') as f:
    data = json.load(f)

# ============================================================
# ANALYSIS 1: Per-paper structure (last 5 years, all sets)
# ============================================================
print("=" * 80)
print("ANALYSIS 1: Per-Paper Structure (2021-2026)")
print("=" * 80)

papers = {}
for subj in data['subjects']:
    for chap in subj['chapters']:
        for q in chap['questions']:
            year = q.get('year', 0)
            paper_id = q.get('paper_id', '')
            if year >= 2021 and paper_id:
                key = (year, paper_id)
                if key not in papers:
                    papers[key] = {
                        'questions': [], 'marks': 0, 'count': 0,
                        'ga': [], 'tech_1m': [], 'tech_2m': []
                    }
                papers[key]['questions'].append(q)
                papers[key]['marks'] += q.get('marks', 1)
                papers[key]['count'] += 1

# For each paper, analyze the GA/1m/2m structure
print(f"\n{'Year':6s} {'Paper':30s} {'GA':4s} {'1m':4s} {'2m':4s} {'Tot':4s} {'Mrk':5s}")
print("-" * 65)
for (year, paper_id), p in sorted(papers.items(), reverse=True)[:10]:
    ga = sum(1 for q in p['questions'] if q.get('subject') == 'general-aptitude')
    one_m = sum(1 for q in p['questions'] if q.get('marks') == 1 and q.get('subject') != 'general-aptitude')
    two_m = sum(1 for q in p['questions'] if q.get('marks') == 2 and q.get('subject') != 'general-aptitude')
    print(f"{year:<6d} {paper_id[-28:]:30s} {ga:4d} {one_m:4d} {two_m:4d} {p['count']:4d} {p['marks']:5d}")

# ============================================================
# ANALYSIS 2: Topic-level frequency per subject (2021-2026)
# ============================================================
print("\n" + "=" * 80)
print("ANALYSIS 2: Topic-Level Frequency (2021-2026)")
print("=" * 80)

subj_topic_freq = defaultdict(lambda: defaultdict(int))
for subj in data['subjects']:
    for chap in subj['chapters']:
        for q in chap['questions']:
            if q.get('year', 0) >= 2021 and not q.get('is_out_of_syllabus'):
                subj_topic_freq[subj['subject']][chap['chapter']] += 1

# For each subject, show top 3 chapters
for subj, topics in sorted(subj_topic_freq.items()):
    total = sum(topics.values())
    if total == 0:
        continue
    print(f"\n{subj} ({total} Qs):")
    for chap, count in sorted(topics.items(), key=lambda x: -x[1])[:5]:
        pct = (count / total) * 100
        bar = '█' * int(pct / 5)
        print(f"  {count:3d} ({pct:4.1f}%) {bar:20s} {chap}")

# ============================================================
# ANALYSIS 3: Question type preference per subject
# ============================================================
print("\n" + "=" * 80)
print("ANALYSIS 3: Type Preference Per Subject (2021-2026)")
print("=" * 80)

subj_type = defaultdict(lambda: defaultdict(int))
for subj in data['subjects']:
    for chap in subj['chapters']:
        for q in chap['questions']:
            if q.get('year', 0) >= 2021 and not q.get('is_out_of_syllabus'):
                qtype = q.get('normalized_type', 'mcq')
                subj_type[subj['subject']][qtype] += 1

print(f"\n{'Subject':40s} {'MCQ':>6s} {'MSQ':>6s} {'NAT':>6s} {'Total':>6s} {'NAT%':>6s}")
print("-" * 75)
for subj, types in sorted(subj_type.items(), key=lambda x: -sum(x[1].values())):
    total = sum(types.values())
    if total == 0:
        continue
    nat_pct = (types.get('nat', 0) / total) * 100
    print(f"{subj:40s} {types.get('mcq', 0):6d} {types.get('msq', 0):6d} {types.get('nat', 0):6d} {total:6d} {nat_pct:5.1f}%")

# ============================================================
# ANALYSIS 4: Marks distribution per subject
# ============================================================
print("\n" + "=" * 80)
print("ANALYSIS 4: Marks Distribution Per Subject (2021-2026)")
print("=" * 80)

subj_marks = defaultdict(lambda: defaultdict(int))
for subj in data['subjects']:
    for chap in subj['chapters']:
        for q in chap['questions']:
            if q.get('year', 0) >= 2021 and not q.get('is_out_of_syllabus'):
                m = q.get('marks', 1)
                subj_marks[subj['subject']][m] += 1

print(f"\n{'Subject':40s} {'1m':>6s} {'2m':>6s} {'Ratio':>8s} {'TotMrk':>8s}")
print("-" * 75)
for subj, marks in sorted(subj_marks.items(), key=lambda x: -(x[1][1] * 2 + x[1][0])):
    total_marks = marks[1] * 2 + marks[0]
    ratio = f"{marks[0]}:{marks[1]}"
    print(f"{subj:40s} {marks[0]:6d} {marks[1]:6d} {ratio:>8s} {total_marks:8d}")

# ============================================================
# ANALYSIS 5: Year-over-year subject weightage trends
# ============================================================
print("\n" + "=" * 80)
print("ANALYSIS 5: Year-Over-Year Subject Marks (2021-2026)")
print("=" * 80)

year_subj_marks = defaultdict(lambda: defaultdict(int))
for subj in data['subjects']:
    for chap in subj['chapters']:
        for q in chap['questions']:
            year = q.get('year', 0)
            if year >= 2021 and not q.get('is_out_of_syllabus'):
                year_subj_marks[year][subj['subject']] += q.get('marks', 1)

years = sorted(year_subj_marks.keys(), reverse=True)
print(f"\n{'Subject':40s}", end='')
for y in years:
    print(f" {y:>5d}", end='')
print("  Trend")
print("-" * 80)

for subj in sorted(year_subj_marks[years[0]].keys(), key=lambda s: -year_subj_marks[years[0]][s]):
    print(f"{subj:40s}", end='')
    vals = []
    for y in years:
        v = year_subj_marks[y][subj]
        vals.append(v)
        print(f" {v:5d}", end='')
    # Compute trend
    if len(vals) >= 2:
        recent_avg = sum(vals[:3]) / min(3, len(vals))
        older_avg = sum(vals[3:]) / max(1, len(vals[3:]))
        if older_avg > 0:
            trend_pct = ((recent_avg - older_avg) / older_avg) * 100
            if trend_pct > 15:
                trend = f"📈 +{trend_pct:.0f}%"
            elif trend_pct < -15:
                trend = f"📉 {trend_pct:.0f}%"
            else:
                trend = f"➡️ {trend_pct:+.0f}%"
        else:
            trend = "➡️ new"
    else:
        trend = "?"
    print(f"  {trend}")

# ============================================================
# ANALYSIS 6: Common question keywords (for concept clustering)
# ============================================================
print("\n" + "=" * 80)
print("ANALYSIS 6: Top Question Keywords (concept identification)")
print("=" * 80)

import re
keyword_freq = Counter()
for subj in data['subjects']:
    for chap in subj['chapters']:
        for q in chap['questions']:
            if q.get('year', 0) >= 2021:
                text = q.get('question_text', '')
                # Extract key terms (nouns, technical terms)
                text = re.sub(r'<[^>]+>', '', text)
                text = re.sub(r'\$[^$]+\$', 'MATH', text)
                words = re.findall(r'\b[A-Z][a-z]+(?:[A-Z][a-z]+)*\b', text)
                for w in words:
                    if len(w) > 3 and w not in ['Which', 'What', 'Consider', 'Following', 'Given', 'Note', 'Assume']:
                        keyword_freq[w] += 1

print("\nTop 30 technical keywords in GATE questions (2021-2026):")
for kw, count in keyword_freq.most_common(30):
    print(f"  {count:4d}  {kw}")

# ============================================================
# ANALYSIS 7: Difficulty indicators (question length, marks, type)
# ============================================================
print("\n" + "=" * 80)
print("ANALYSIS 7: Question Length Distribution (difficulty proxy)")
print("=" * 80)

length_buckets = {'<100': 0, '100-300': 0, '300-600': 0, '600-1000': 0, '>1000': 0}
for subj in data['subjects']:
    for chap in subj['chapters']:
        for q in chap['questions']:
            if q.get('year', 0) >= 2021:
                text = q.get('question_text', '')
                # Strip HTML for length
                import re as re2
                clean = re2.sub(r'<[^>]+>', '', text)
                clean = re2.sub(r'\$[^$]+\$', 'X', clean)
                length = len(clean)
                if length < 100:
                    length_buckets['<100'] += 1
                elif length < 300:
                    length_buckets['100-300'] += 1
                elif length < 600:
                    length_buckets['300-600'] += 1
                elif length < 1000:
                    length_buckets['600-1000'] += 1
                else:
                    length_buckets['>1000'] += 1

total_q = sum(length_buckets.values())
print(f"\nQuestion text length distribution ({total_q} questions):")
for bucket, count in length_buckets.items():
    pct = (count / total_q) * 100
    bar = '█' * int(pct / 2)
    print(f"  {bucket:>10s}: {count:4d} ({pct:5.1f}%) {bar}")

print("\n" + "=" * 80)
print("RESEARCH COMPLETE - Use these findings to upgrade the engine")
print("=" * 80)
