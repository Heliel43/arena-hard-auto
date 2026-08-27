# Drop the full story here

Place your complete export in this folder (or anywhere), then run:

```
python3 tools/ingest.py <path-or-folder> --out data/chapters.jsonl
python3 tools/scan_entities.py
python3 tools/strip.py
```

Supported inputs: `.txt`, `.md`, `.html`, `.xhtml`, `.epub`, or a folder of any of those.

If you have it as one giant file, that's fine — `ingest.py` will split it into chapters
by heading (`Chapter N`, `Interlude N`, `Omake ...`). If the headings in your export
differ, tell me and I'll adjust the splitter.

Nothing here is committed to git. This folder is for local processing only.
