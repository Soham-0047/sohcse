"""
Multi-source GATE CSE data fetcher.
Fetches questions from multiple free, legally accessible sources and merges them.

Sources:
1. ExamSIDE.com (existing - 2,736 PYQs, already in gate_cse_data.js)
2. Mockers.in (free GATE CSE mock tests + PYQs, scrapable)
3. GeeksforGeeks (topic-wise GATE PYQ quizzes)

This script runs in GitHub Actions daily to keep data fresh.
"""

import json
import os
import sys
import time
import hashlib
import re
from urllib.request import urlopen, Request

SOURCES = {
    'examside': 'https://questions.examside.com/past-years/gate/gate-cse',
    'mockers': 'https://mockers.in/exam/gate-mock-test-2027-cse',
    'geeksforgeeks': 'https://www.geeksforgeeks.org/gate-cse-previous-year-questions-with-solutions/',
}

def fetch_url(url, timeout=15):
    """Fetch URL with proper headers."""
    req = Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
    })
    try:
        resp = urlopen(req, timeout=timeout)
        return resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"  WARNING: Failed to fetch {url}: {e}")
        return None

def hash_question(text):
    """Create content hash for deduplication."""
    clean = re.sub(r'<[^>]+>', '', text or '')
    clean = re.sub(r'\s+', ' ', clean).strip().lower()
    return hashlib.md5(clean[:500].encode()).hexdigest()

def load_existing():
    """Load existing question data."""
    try:
        with open('gate_cse_questions.json', 'r') as f:
            data = json.load(f)
        existing_ids = set()
        existing_hashes = set()
        for subj in data.get('subjects', []):
            for chap in subj.get('chapters', []):
                for q in chap.get('questions', []):
                    existing_ids.add(q.get('question_id'))
                    existing_hashes.add(hash_question(q.get('question_text', '')))
        return data, existing_ids, existing_hashes
    except:
        return {'subjects': [], 'total_questions': 0}, set(), set()

def fetch_mockers_questions():
    """Fetch free GATE CSE mock test questions from Mockers.in."""
    questions = []
    html = fetch_url(SOURCES['mockers'])
    if not html:
        return questions

    # Look for question patterns in HTML
    question_blocks = re.findall(r'<div class="question-text[^"]*"[^>]*>(.*?)</div>', html, re.DOTALL)
    for block in question_blocks[:50]:
        clean = re.sub(r'<[^>]+>', '', block).strip()
        if len(clean) > 20:
            questions.append({
                'question_text': clean,
                'source': 'mockers',
                'type': 'mcq',
                'year': 2025,
            })

    print(f"  Mockers.in: fetched {len(questions)} questions")
    return questions

def fetch_geeksforgeeks_questions():
    """Fetch GATE CSE PYQ quizzes from GeeksforGeeks."""
    questions = []
    html = fetch_url(SOURCES['geeksforgeeks'])
    if not html:
        return questions

    # Look for question patterns
    q_matches = re.findall(r'<div class="[^"]*question[^"]*"[^>]*>(.*?)</div>', html, re.DOTALL | re.IGNORECASE)
    for match in q_matches[:50]:
        clean = re.sub(r'<[^>]+>', '', match).strip()
        if len(clean) > 20:
            questions.append({
                'question_text': clean,
                'source': 'geeksforgeeks',
                'type': 'mcq',
                'year': 2025,
            })

    print(f"  GeeksforGeeks: fetched {len(questions)} questions")
    return questions

def merge_questions(existing_data, existing_ids, existing_hashes, new_questions):
    """Merge new questions into existing data, avoiding duplicates."""
    new_count = 0
    for q in new_questions:
        qhash = hash_question(q.get('question_text', ''))
        qid = q.get('question_id') or f"ext_{qhash[:12]}"

        if qid in existing_ids or qhash in existing_hashes:
            continue

        q['question_id'] = qid
        q['source'] = q.get('source', 'external')

        subj_name = q.get('subject', 'general')
        subj = next((s for s in existing_data['subjects'] if s['subject'] == subj_name), None)
        if not subj:
            subj = {'subject': subj_name, 'subject_label': subj_name, 'chapters': []}
            existing_data['subjects'].append(subj)

        chap_name = q.get('chapter', 'miscellaneous')
        chap = next((c for c in subj['chapters'] if c['chapter'] == chap_name), None)
        if not chap:
            chap = {'chapter': chap_name, 'chapter_label': chap_name, 'questions': []}
            subj['chapters'].append(chap)

        chap['questions'].append(q)
        existing_ids.add(qid)
        existing_hashes.add(qhash)
        new_count += 1

    return new_count

def main():
    print("=" * 60)
    print("GATE CSE Multi-Source Data Fetcher")
    print("=" * 60)

    existing_data, existing_ids, existing_hashes = load_existing()
    print(f"Existing questions: {len(existing_ids)} (IDs), {len(existing_hashes)} (hashes)")

    all_new = []

    print("\n1. Fetching from Mockers.in...")
    mockers_qs = fetch_mockers_questions()
    all_new.extend(mockers_qs)

    print("\n2. Fetching from GeeksforGeeks...")
    gfg_qs = fetch_geeksforgeeks_questions()
    all_new.extend(gfg_qs)

    print(f"\nTotal new questions fetched: {len(all_new)}")

    new_count = merge_questions(existing_data, existing_ids, existing_hashes, all_new)
    print(f"New questions added (after dedup): {new_count}")

    total_qs = sum(len(c.get('questions', [])) for s in existing_data.get('subjects', []) for c in s.get('chapters', []))
    existing_data['total_questions'] = total_qs
    existing_data['last_updated'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    existing_data['sources'] = ['examside', 'mockers', 'geeksforgeeks']

    print(f"Total questions in dataset: {total_qs}")

    if new_count > 0:
        with open('gate_cse_questions.json', 'w') as f:
            json.dump(existing_data, f, indent=2)
        print(f"\nUpdated gate_cse_questions.json with {new_count} new questions!")
        return True
    else:
        print("\nNo new questions found. Data is up to date.")
        return False

if __name__ == '__main__':
    main()
