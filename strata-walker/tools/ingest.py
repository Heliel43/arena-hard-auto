#!/usr/bin/env python3
"""
ingest.py — clean a fanfiction export and split it into chapters.

Accepts:
  - a single .txt / .md / .html / .xhtml file
  - a .epub (best-effort: unzip, pull XHTML, strip tags)
  - a directory (all of the above, concatenated in sorted order)

Output: data/chapters.jsonl  (one JSON object per line: {idx,title,text})

Run:  python3 tools/ingest.py <input> [--out data/chapters.jsonl]
"""
import sys, os, re, json, argparse, zipfile, html

CHAPTER_RE = re.compile(
    r'(?im)^\s*(?:#{1,6}\s*)?'
    r'(chapter\s+[\dIVXLC]+|interlude\s+[\dIVXLC]+|omake[^\n]*|prologue|epilogue|part\s+[\dIVXLC]+)'
    r'(?:[:\s-][^\n]*)?$'
)

def clean_text(s: str) -> str:
    s = re.sub(r'_\d+_', ' ', s)            # Webnovel paragraph markers
    s = re.sub(r'<[^>]+>', ' ', s)          # strip html tags
    s = re.sub(r'&[a-zA-Z#0-9]+;', ' ', s)  # entities
    s = s.replace('\r', '\n')
    s = re.sub(r'[ \t]+', ' ', s)
    s = re.sub(r'\n{3,}', '\n\n', s)
    return s.strip()

def read_file(path: str) -> str:
    ext = path.lower().rsplit('.', 1)[-1]
    if ext == 'epub':
        texts = []
        with zipfile.ZipFile(path) as z:
            for n in sorted(z.namelist()):
                if n.lower().endswith(('.xhtml', '.html', '.htm')):
                    try:
                        texts.append(z.read(n).decode('utf-8', 'ignore'))
                    except Exception:
                        pass
        return clean_text('\n'.join(texts))
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        return clean_text(f.read())

def split_chapters(text: str):
    lines = text.split('\n')
    chapters = []
    cur_title = 'Preamble'
    cur = []
    for line in lines:
        m = CHAPTER_RE.match(line.strip())
        if m:
            if cur:
                chapters.append((cur_title, '\n'.join(cur).strip()))
            cur_title = line.strip()
            cur = []
        else:
            cur.append(line)
    if cur:
        chapters.append((cur_title, '\n'.join(cur).strip()))
    # drop empty
    chapters = [(t, b) for t, b in chapters if b.strip()]
    return chapters

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('input')
    ap.add_argument('--out', default='data/chapters.jsonl')
    args = ap.parse_args()

    paths = []
    if os.path.isdir(args.input):
        for fn in sorted(os.listdir(args.input)):
            if fn.lower().endswith(('.txt', '.md', '.html', '.xhtml', '.epub')):
                paths.append(os.path.join(args.input, fn))
    else:
        paths.append(args.input)

    all_chapters = []
    for p in paths:
        txt = read_file(p)
        for title, body in split_chapters(txt):
            all_chapters.append((title, body))

    os.makedirs(os.path.dirname(args.out) or '.', exist_ok=True)
    with open(args.out, 'w', encoding='utf-8') as f:
        for i, (title, body) in enumerate(all_chapters):
            f.write(json.dumps({'idx': i, 'title': title, 'text': body}, ensure_ascii=False) + '\n')

    total_words = sum(len(c[1].split()) for c in all_chapters)
    print(f"Ingested {len(paths)} file(s) -> {len(all_chapters)} chapters, {total_words:,} words -> {args.out}")

if __name__ == '__main__':
    main()
