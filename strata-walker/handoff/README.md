# Strata Walker App Handoff

This folder is for a developer or app-building agent replacing the temporary Twine preview
with a production-quality reading application.

## What the current MVP is
The current MVP is deliberately small and dependency-free:

- `story/twine/StrataWalker.tw` — canonical pilot story in Twee / Harlowe 3.3.7 syntax.
- `tools/build.js` — parses passages and embeds them in one HTML file.
- `tools/runtime.js` — a browser runtime for only the Harlowe subset currently used.
- `story/twine/StrataWalker.html` — generated self-contained playable build.

From the `strata-walker/` directory:

```bash
node tools/build.js
```

The build performs smoke tests and broken-link validation. No npm packages are required.

## Current runtime capabilities
- passage navigation through `[[label->Passage]]` and `[[label|Passage]]`;
- `(set:)`, `(print:)`, `(text:)`;
- `(if:)`, `(elseif:)`, `(else:)`;
- `(goto:)`;
- arrays through `(a:)`;
- datamaps through `(dm:)`;
- integer arithmetic and simple comparisons;
- in-memory stats, relationships, flags, and relics;
- generated sticky status bar;
- self-contained static HTML.

## Intentional limitations
The MVP is not a full Harlowe implementation and should not become the production engine by
accumulating parser patches. It currently lacks:

- persistent saves;
- save slots and checkpoints;
- back/history support;
- settings and accessibility controls;
- codex, relic, and relationship screens;
- mature-content preferences;
- a versioned story-data format;
- save migrations;
- robust content validation and automated route traversal;
- a mobile app shell or installable PWA;
- author-facing debug tools.

## Production direction
The preferred replacement is a data-driven, mobile-first TypeScript web app/PWA. Story
content must remain separate from rendering and persistence. Do not hard-code passages or
choice consequences in React components.

`story-format.schema.json` defines the proposed engine-neutral contract. It uses declarative
conditions and effects—never JavaScript `eval`. The new app may either:

1. convert the supplied Act 0 Twee into the JSON format once and make JSON the production
   source of truth; or
2. provide a tested importer from the limited Twee subset.

The first option is simpler and preferred as long as the original `.tw` snapshot remains in
the handoff for comparison.

## Canonical game state
Core parameters are integers displayed as ranks:

| Value | Rank |
|-------|------|
| 1 | E |
| 2 | D |
| 3 | C |
| 4 | B |
| 5 | A |

Parameters:
- Strength
- Endurance
- Agility
- Mana
- Luck

Relationships range from `-3` to `+5` and are separate from parameters. The production
schema uses character names as keys, while the old Twee variables use legacy role keys.

Other state:
- typed flags;
- relic inventory;
- current node;
- visited-node history;
- latest safe checkpoint;
- mature-content preference;
- story content version and save schema version.

## Story and choice philosophy
The application must support the story-first model in `design/07-branching-production.md`:

- most choices reconverge but receive a visible reaction or state consequence;
- some choices set delayed flags and alter later passages;
- about one hinge per act materially changes world state;
- ordinary failed checks fail forward;
- clearly risky choices can lead to game over and checkpoint restore;
- mature branches are optional, adult-only, and excluded unless enabled;
- high relationship means trust, not blind obedience.

## Files to give the app builder
The generated handoff archive contains:

```text
README.md
APP_BUILDER_PROMPT.md
story-format.schema.json
story-format.example.json
design/03-state-model.md
design/07-branching-production.md
design/08-canon-locks.md
story/outline/00-master-spine.md
story/twine/StrataWalker.tw
story/twine/StrataWalker.html
tools/build.js
tools/runtime.js
```

It deliberately excludes the private fanfiction source and all source-derived prose.

## Required return package
Ask the app builder to return:
- complete source code;
- setup and build instructions;
- production build configuration for static hosting;
- converted Act 0 content;
- story schema and validator;
- automated tests;
- a short architecture document;
- any migration/import script;
- no copyrighted source-bank file.
