#!/usr/bin/env python3
"""
run_all.py — one command to process the full export.

Usage:
  python3 tools/run_all.py                 # auto-picks the file in data/incoming/
  python3 tools/run_all.py <path/to/file>  # explicit input

Steps:  ingest -> scan_entities -> strip
Outputs: data/chapters.jsonl, data/entities.json/.csv, data/stripped/, data/risk_report.json
"""
import sys, os, glob, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def find_input(explicit):
    if explicit:
        return explicit
    inc = os.path.join(ROOT, 'data', 'incoming')
    files = [f for f in glob.glob(os.path.join(inc, '*'))
             if os.path.isfile(f) and not f.endswith('README.md')]
    if not files:
        print("No input found in data/incoming/. Drop your export there, or pass a path.")
        sys.exit(1)
    if len(files) > 1:
        print("Multiple files in data/incoming/. Pass the one you want explicitly:")
        for f in files:
            print("  ", f)
        sys.exit(1)
    return files[0]

def main():
    inp = find_input(sys.argv[1] if len(sys.argv) > 1 else None)
    print("Input:", inp)
    chapters = os.path.join(ROOT, 'data', 'chapters.jsonl')

    print("\n[1/3] ingest")
    subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'ingest.py'), inp,
                   '--out', chapters], check=True)

    print("\n[2/3] scan_entities")
    subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'scan_entities.py'),
                   '--chapters', chapters], check=True)

    print("\n[3/3] strip")
    subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'strip.py'),
                   '--chapters', chapters], check=True)

    print("\nDone. Review:")
    print("  data/entities.csv     — master inventory (replace vs keep vs review)")
    print("  data/risk_report.json — passages still needing human re-skin")
    print("  data/stripped/        — mechanically name-stripped chapters")

if __name__ == '__main__':
    main()
