# 05 — Locked Decisions & Workflow

## Decisions (locked)
- **Delivery:** User uploads the full export (`.epub`/`.txt`/`.md`) into `data/incoming/`. All processing is local; source text is never echoed back into chat.
- **Content rating:** **Mature** — explicit content is allowed but only as *optional, separated* branches off the main path (not on the critical route). Tracked by a `mature` flag per branch.
- **Re-skin start point:** Decided **after** the full entity inventory is built. User picks the starting slice from the inventory.

## The pipeline (one command)
```
python3 tools/run_all.py            # auto-picks file in data/incoming/
```
Does: `ingest.py` → `scan_entities.py` → `strip.py`.

## What each stage produces
- `data/chapters.jsonl` — cleaned, split chapters.
- `data/entities.json` / `.csv` — master inventory: glossary (copyrighted) hits + unknown proper nouns (your OCs / missed canon) needing a keep/replace/review decision.
- `data/stripped/` — mechanically name-replaced chapters (known terms swapped; `[DROP]`/`[re-skin needed]` left in place).
- `data/risk_report.json` — every sentence still containing a copyrighted term → the queue of passages needing creative re-skin.

## The 20/80 rule (remember this)
- **20% (automatable):** mechanical name replacement (`strip.py`).
- **80% (creative, you + me):** reinventing each companion's backstory/powers, each world's lore, and rewriting the risk-flagged prose so it's *original expression*, not a renamed derivative. This is where the game is actually built, in slices.

## Next
1. User uploads export → I run `run_all.py`.
2. We review `entities.csv`: confirm glossary hits, decide keep/replace on unknowns (e.g. protagonist = keep).
3. User picks starting slice from the inventory.
4. We re-skin that slice into original prose + Twine choice structure; extend glossary as new canon names surface.
