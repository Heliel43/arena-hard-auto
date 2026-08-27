#!/usr/bin/env python3
"""
scan_entities.py — build the master entity inventory.

1. Matches the curated glossary (data/glossary.json) across the corpus.
2. Extracts UNKNOWN proper nouns (capitalized sequences, honorific names) for review.

Output:
  data/entities.json   — structured inventory
  data/entities.csv    — flat, sortable review sheet

Run:  python3 tools/scan_entities.py [--chapters data/chapters.jsonl] [--text FILE]
"""
import sys, os, re, json, argparse, csv

STOPWORDS = set("""I He She They We You It His Her Their My Your Our The A An And Or But If Then Else When While Of To In On At By For With From Into Onto As Is Are Was Were Be Been Being Do Does Did Has Have Had Will Would Can Could Should May Might Must Not No Yes This That These Those He Him His She Her They The Them Us Me My Mine Yours Our Ours Theirs Its Chapter Interlude Omake Prologue Epilogue Part One Two Three Four Five Six Seven Eight Nine Ten First Second Third Fourth Fifth Sixth Seventh Eighth Ninth Tenth New York Tokyo London Paris Japan China America England France Germany Italy Spain Korea Kyoto Tokyo""".split())

def load_glossary(path):
    with open(path, encoding='utf-8') as f:
        g = json.load(f)
    terms = []
    for t in g['terms']:
        term = t['term']
        terms.append({
            'term': term,
            'lower': term.lower(),
            'multi': ' ' in term,
            'franchise': t.get('franchise', ''),
            'role': t.get('role', ''),
            'action': t.get('action', 'replace'),
            'suggested': t.get('suggested', ''),
            'note': t.get('note', ''),
        })
    return terms

def count_term(term_lower, multi, text_lower):
    if multi:
        return len(re.findall(re.escape(term_lower), text_lower))
    # single token: word boundary
    return len(re.findall(r'(?<![\w])' + re.escape(term_lower) + r'(?![\w])', text_lower))

def extract_unknown(text):
    # capitalized sequences of 1-3 words, also honorific names like "X-san"
    candidates = re.findall(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b", text)
    honorific = re.findall(r"\b([A-Za-z][\w'-]*)-(san|kun|chan|sama|sensei)\b", text)
    out = {}
    for c in candidates:
        if c in STOPWORDS:
            continue
        out[c] = out.get(c, 0) + 1
    for h in honorific:
        name = h[0]
        if name in STOPWORDS:
            continue
        out[name] = out.get(name, 0) + 1
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--chapters', default='data/chapters.jsonl')
    ap.add_argument('--text', default=None, help='single raw text file (demo mode)')
    ap.add_argument('--glossary', default='data/glossary.json')
    ap.add_argument('--min-unknown', type=int, default=3, help='ignore unknown proper nouns rarer than this')
    args = ap.parse_args()

    terms = load_glossary(args.glossary)
    glossary_set = {t['lower'] for t in terms}

    if args.text:
        with open(args.text, encoding='utf-8', errors='ignore') as f:
            raw = f.read()
        chapters = [{'idx': 0, 'title': os.path.basename(args.text), 'text': raw}]
    else:
        chapters = []
        with open(args.chapters, encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    chapters.append(json.loads(line))

    # glossary hits
    hits = {t['term']: {'meta': t, 'total': 0, 'chapters': []} for t in terms}
    # unknown proper nouns
    unknowns = {}

    for ch in chapters:
        tlower = ch['text'].lower()
        for t in terms:
            c = count_term(t['lower'], t['multi'], tlower)
            if c:
                hits[t['term']]['total'] += c
                hits[t['term']]['chapters'].append(ch['idx'])
        for name, n in extract_unknown(ch['text']).items():
            unknowns[name] = unknowns.get(name, 0) + n

    # build inventory
    inventory = []
    for term, h in hits.items():
        if h['total'] == 0:
            continue
        m = h['meta']
        inventory.append({
            'term': term, 'type': 'glossary', 'franchise': m['franchise'],
            'role': m['role'], 'action': m['action'], 'suggested': m['suggested'],
            'count': h['total'], 'first_chapter': min(h['chapters']), 'chapters': sorted(set(h['chapters'])),
        })
    for name, n in sorted(unknowns.items(), key=lambda x: -x[1]):
        if name.lower() in glossary_set:
            continue  # already covered by glossary
        if n < args.min_unknown:
            continue  # too rare to be a real character/place
        inventory.append({
            'term': name, 'type': 'unknown', 'franchise': '', 'role': '',
            'action': 'review', 'suggested': '', 'count': n, 'first_chapter': -1, 'chapters': [],
        })

    os.makedirs('data', exist_ok=True)
    with open('data/entities.json', 'w', encoding='utf-8') as f:
        json.dump(inventory, f, ensure_ascii=False, indent=2)

    with open('data/entities.csv', 'w', encoding='utf-8', newline='') as f:
        w = csv.writer(f, lineterminator='\n')
        w.writerow(['term', 'type', 'franchise', 'role', 'action', 'suggested', 'count', 'first_chapter'])
        for e in inventory:
            w.writerow([e['term'], e['type'], e['franchise'], e['role'], e['action'], e['suggested'], e['count'], e['first_chapter']])

    g_loss = sum(1 for e in inventory if e['type'] == 'glossary')
    unk = sum(1 for e in inventory if e['type'] == 'unknown')
    print(f"Entity inventory: {g_loss} glossary hits, {unk} unknown proper nouns -> data/entities.json / data/entities.csv")
    print("\nTop glossary hits:")
    for e in inventory[:12]:
        if e['type'] == 'glossary':
            print(f"  {e['count']:>5}  {e['term']:<22} [{e['franchise']}] -> {e['suggested']}")

if __name__ == '__main__':
    main()
