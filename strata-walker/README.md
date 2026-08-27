# The Strata Walker

> A choice-based, Earth-anchored world-hopping interactive fiction. A private fanfiction
> export is used only as a source bank of abstract beats and relationship dynamics—not as
> text to rename or chronology to reproduce. Every story-active character, magical system,
> faction, artifact, and other world is original.

## Premise
An eighteen-year-old American discovers that reality is made of overlapping worlds. He can
cross between them, but every crossing changes the Earth he returns to. As Aurel,
Pennsylvania fractures, the player must decide whether saving Earth is worth sacrificing
other realities.

## IP-safe creative rule
- Keep genre-level engines and useful scene functions.
- Replace franchise-specific characters, worlds, lore, backstories, powers, artifacts,
  relationships, dialogue, and expressive details.
- Recombine beats outside source reading order under a new causal plot.
- Never treat mechanical renaming as finished creative work.
- Universal vocabulary—magic, mana, god, demon, angel, witch, soul, relic, dragon, and
  similar terms—may be used normally.
- Existing franchises may be mentioned sparingly as fiction on Earth. They never become
  real destinations or sources of canon knowledge.

## Production loop
1. Select a dramatic need or named source arc from the local private export.
2. Decompose useful scenes into abstract tagged beats with `story/beats/README.md`.
3. Discard source-specific expression and invent new characters, causality, and context.
4. Place the new beat into `design/04-recombination.md`, not source chronology.
5. Write consequential choices using the state model in `design/03-state-model.md`.
6. Add original passages to `story/twine/StrataWalker.tw`.
7. Run `node tools/build.js` and play the compiled HTML.

## Project layout
```
strata-walker/
  README.md
  design/
    00-premise.md           # Earth setting, tone, terminology, meta-plot
    01-companions.md        # narrative roles -> original character concepts
    02-worlds.md            # Earth + original Strata
    03-state-model.md       # five ranked parameters, relationships, flags, relics
    04-recombination.md     # method + act map decoupled from source order
    05-decisions.md         # locked creative and workflow decisions
    06-plot-outline.md      # mysteries, acts, interludes, endings
    07-branching-production.md # story-first workflow and branch budget
  data/
    incoming/               # local-only source; ignored by Git
  story/
    beats/                  # abstract beat sheets, one named arc per file
    twine/
      StrataWalker.tw       # canonical Twee / Harlowe 3.3.7 source
      StrataWalker.html     # self-contained playable build
  tools/                    # local ingestion, scanning, runtime, and build tools
```

## Build and preview
Compile and run the runtime self-test:
```bash
node tools/build.js
```

Then open `story/twine/StrataWalker.html`, or serve the project directory:
```bash
python3 -m http.server 8000 --bind 0.0.0.0
```

## Current production target
Treat the playable Act 0 as a prototype and pause engine expansion. Following
`design/07-branching-production.md`, the next deliverable is a 35–45 chapter master story
spine from the opening through all ending routes. Approve that general story before drafting
Act I branches or adding more gameplay systems.
