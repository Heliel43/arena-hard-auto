#!/usr/bin/env python3
"""
strip.py — mechanical name-replacement pass + risk report.

Replaces glossary terms using:
  - any manual overrides in data/replacements.json (term -> replacement)
  - otherwise the glossary 'suggested' field (skips '[re-skin needed]' / '[DROP]')

Then flags every sentence that still contains a glossary term (these need human
re-skinning of the EXPRESSIVE content, not just the label).

Output:
  data/stripped/<chapter>.txt     — mechanically stripped chapters
  data/risk_report.json           — sentences still needing re-skin

Run:  python3 tools/strip.py [--chapters data/chapters.jsonl] [--text FILE]
"""
import sys, os, re, json, argparse

SKIP_MARKERS = ('[re-skin needed]', '[DROP]')

def load_replacements(glossary_path, manual_path):
    rep = {}
    with open(glossary_path, encoding='utf-8') as f:
        g = json.load(f)
    for t in g['terms']:
        sug = t.get('suggested', '')
        if sug and sug not in SKIP_MARKERS:
            rep[t['term']] = sug
    if os.path.exists(manual_path):
        with open(manual_path, encoding='utf-8') as f:
            rep.update(json.load(f))
    # sort by length desc so longer phrases win
    ordered = sorted(rep.items(), key=lambda x: -len(x[0]))
    return ordered

def apply_replacements(text, ordered):
    for term, rep in ordered:
        if ' ' in term:
            text = re.sub(re.escape(term), rep, text, flags=re.IGNORECASE)
        else:
            text = re.sub(r'(?<![\w])' + re.escape(term) + r'(?![\w])', rep, text, flags=re.IGNORECASE)
    return text

def load_glossary_terms(glossary_path):
    with open(glossary_path, encoding='utf-8') as f:
        g = json.load(f)
    return [t['term'] for t in g['terms']]

def sentences(text):
    return re.split(r'(?<=[.!?])\s+', text)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--chapters', default='data/chapters.jsonl')
    ap.add_argument('--text', default=None)
    ap.add_argument('--glossary', default='data/glossary.json')
    ap.add_argument('--manual', default='data/replacements.json')
    ap.add_argument('--outdir', default='data/stripped')
    args = ap.parse_args()

    ordered = load_replacements(args.glossary, args.manual)
    gterms = load_glossary_terms(args.glossary)

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

    os.makedirs(args.outdir, exist_ok=True)
    risk = []
    for ch in chapters:
        stripped = apply_replacements(ch['text'], ordered)
        fname = re.sub(r'[^A-Za-z0-9_-]+', '_', ch['title'])[:80] + '.txt'
        with open(os.path.join(args.outdir, fname), 'w', encoding='utf-8') as f:
            f.write(stripped)
        # risk: sentences still containing a glossary term
        flagged = []
        for s in sentences(ch['text']):
            low = s.lower()
            hit = [t for t in gterms if t.lower() in low]
            if hit:
                flagged.append({'sentence': s.strip()[:300], 'terms': hit})
        if flagged:
            risk.append({'chapter': ch['title'], 'flagged_count': len(flagged), 'samples': flagged[:5]})

    with open('data/risk_report.json', 'w', encoding='utf-8') as f:
        json.dump(risk, f, ensure_ascii=False, indent=2)

    total_flag = sum(r['flagged_count'] for r in risk)
    print(f"Stripped {len(chapters)} chapters -> {args.outdir}/")
    print(f"Risk report: {len(risk)} chapters with {total_flag} sentences still containing copyrighted terms (need human re-skin).")

if __name__ == '__main__':
    main()
