# Copy/Paste Prompt — Build the Strata Walker Reading App

You are a senior product engineer and interaction designer. Build a production-quality,
mobile-first reading application for **The Strata Walker**, a branching text RPG. You are
being given a small working engine, one playable Act 0 pilot, a proposed story-data schema,
and narrative design documents.

Read every attached file before changing anything. Do not invent a second story, rewrite the
supplied prose, or expand Act I. This task is the application shell and choice engine only.
The narrative team is developing the full story separately.

## Product goal
Create a polished app in which a reader can:
- read passage-based prose comfortably on phone and desktop;
- choose dialogue, methods, relationships, risks, and major decisions;
- see five parameters as E–A ranks;
- carry relationships, flags, relics, injuries, and history through the story;
- save, load, restore a checkpoint after game over, and continue after refreshing;
- inspect a codex and character/relic information only after discovery;
- control typography, motion, theme, and mature-content preferences;
- play fully offline after first load.

The experience should feel like a serious interactive novel, not a generic admin dashboard,
chatbot, visual novel imitation, or combat-heavy RPG.

## Supplied legacy MVP
The archive includes:
- `story/twine/StrataWalker.tw` — the complete current Act 0 pilot;
- `story/twine/StrataWalker.html` — its generated playable version;
- `tools/build.js` and `tools/runtime.js` — the temporary dependency-free engine;
- `story-format.schema.json` — proposed production content contract;
- `story-format.example.json` — minimal schema example;
- state, branching, canon, and story-outline documents.

The legacy runtime implements only a small Harlowe-like subset. Study it to preserve current
behavior, but **do not turn it into the production architecture by adding parser patches**.

## Preferred technical architecture
Use:
- React with TypeScript;
- Vite or an equivalently simple static build tool;
- a local-first architecture with no required server or account;
- a pure, deterministic story-state reducer;
- JSON story content validated against the supplied schema;
- sanitized Markdown for passage bodies;
- IndexedDB for saves, with a localStorage fallback if IndexedDB is unavailable;
- a service worker / web app manifest for installable offline PWA behavior;
- Vitest for engine unit tests and Playwright for critical user flows.

If you select a different stack, explain the concrete benefit. Do not add a backend, database
service, authentication provider, analytics tracker, ad SDK, or paid dependency.

The dev server must bind to `0.0.0.0`, accept proxied preview hosts, use relative browser
URLs, and not require browser access to localhost-only APIs.

## Repository placement
Place the new app under a self-contained directory such as:

```text
strata-walker/app/
  package.json
  vite.config.ts
  src/
    engine/
    components/
    screens/
    storage/
    styles/
  content/
    act0.json
  scripts/
    import-twee.ts
    validate-story.ts
  public/
  tests/
  README.md
```

Keep the legacy `.tw`, `build.js`, `runtime.js`, and compiled HTML for comparison until the
new app passes parity tests. The production app should not import executable code from the
legacy runtime.

## Content migration
Convert all current Act 0 passages and choices from `StrataWalker.tw` into declarative JSON.
The supplied prose should appear unchanged except for correcting an indisputable formatting
error. Preserve:
- all current routes;
- parameter increases;
- Vey and Madsen relationship changes;
- flags and the brass transit token;
- success and cost versions of all five rescue methods;
- containment-first consequences;
- the Closed Life early ending;
- the voluntary crossing and Sundered Court teaser.

Either provide a tested one-time Twee importer or manually produce `content/act0.json` and
write parity tests. JSON becomes the production source of truth. Do not leave Harlowe macros
inside rendered story text.

Never include or request the private fanfiction source. The app contains only the original
Act 0 pilot and approved design documents.

## Engine contract
Use the supplied schema as the starting contract. Improve it only when implementation
reveals a real need; document every change and update its example and validator.

### Persistent state
At minimum:

```ts
type GameState = {
  parameters: {
    strength: number;
    endurance: number;
    agility: number;
    mana: number;
    luck: number;
  };
  relationships: Record<string, number>;
  flags: Record<string, boolean | number | string | null>;
  relics: Relic[];
  currentNodeId: string;
  visitedNodeIds: string[];
  history: HistoryEntry[];
  checkpoint: Checkpoint | null;
  preferences: Preferences;
  storyContentVersion: string;
  saveSchemaVersion: number;
};
```

Parameter values are clamped from 1 to 5 and displayed as:
- 1 = E
- 2 = D
- 3 = C
- 4 = B
- 5 = A

Relationships are clamped from -3 to +5. Do not present them as obedience or romance
scores. The default UI may describe them qualitatively; a setting can reveal exact values
for players who prefer mechanical transparency.

### Conditions
Conditions must be declarative and recursively composable:
- comparison by safe state path;
- all;
- any;
- not;
- relic possession.

Do not use `eval`, `new Function`, dynamic imports from story data, or arbitrary expression
execution.

### Effects
Effects must be allowlisted and deterministic:
- set a state value;
- increment a clamped parameter or relationship;
- add/remove a relic;
- create a checkpoint.

If additional effects are needed, add explicit typed variants and tests.

### Choice resolution order
Use one documented order everywhere:
1. confirm the selected choice is visible and enabled;
2. save a checkpoint first when `checkpointBefore` is true;
3. append a history entry containing the pre-choice state summary;
4. apply effects atomically;
5. navigate to the target node;
6. apply target `onEnter` effects once;
7. autosave;
8. show non-spoiler feedback allowed by player preferences.

Prevent double clicks from applying effects twice.

### Choice presentation
Support these types without making each look like a different game:
- voice/personality;
- parameter/method;
- relationship;
- exploration;
- tactical branch;
- act hinge;
- risk/trap;
- ending lock.

Most choices reconverge. The UI should still acknowledge them through changed prose,
feedback, or state. Major choices may receive stronger visual weight, but do not announce
future spoilers.

Hidden conditions should omit a choice. Disabled conditions may show a choice with a
requirement hint only when the story says Will can assess the requirement. Preserve the
ability to make unknown checks.

### Failure and game over
Ordinary failed checks should usually navigate to authored cost passages. Do not generate
“you failed” text in the engine.

For game-over nodes:
- show the authored ending text first;
- offer **Restore checkpoint**, **Load save**, and **Restart**;
- never erase saves automatically;
- make the checkpoint behavior obvious before a deliberately lethal gamble.

The engine must not infer success or morality from choice labels. It follows authored
conditions and targets.

## Saving and versioning
Implement:
- autosave after every completed transition;
- at least three named manual save slots;
- latest safe checkpoint;
- export save to a human-downloadable JSON file;
- import with schema validation and a confirmation preview;
- explicit new-game reset;
- content-version and save-schema-version fields;
- a migration registry with at least one tested example migration, even if it is trivial.

A corrupted or future-version save must produce a helpful error and leave existing saves
untouched.

## Mature-content handling
The game is rated Mature, but explicit branches are optional and adult-only.

Implement:
- first-run age/rating notice;
- preference with `off` as the safe default;
- mature nodes and choices excluded when off, not merely blurred;
- no route may become impossible solely because mature content is off;
- changing the preference must not corrupt current state;
- no explicit sample content is required for this MVP.

## UI direction
Prioritize reading comfort and restraint. The story deliberately uses ordinary names and
human-scale scenes alongside magic; the interface should not make every screen look like a
royal prophecy.

### Visual character
- dark default theme inspired by charcoal, ink, old station tile, and restrained silver;
- optional light theme with warm paper rather than pure white;
- one modest amber accent for important actions;
- clear type hierarchy, but minimal fantasy ornament;
- subtle transitions that respect reduced-motion settings;
- no mandatory background art, autoplay audio, particle field, parallax, or constant glow;
- no faux-medieval fonts for body text.

### Reading screen
- body column around 42–52rem maximum width;
- comfortable serif or highly readable humanist body-font option;
- passage title/act context that can be hidden;
- choices shown after the passage with large touch targets;
- selected-choice lockout during transition;
- optional consequence feedback such as `Mana increased: E → D`;
- compact status summary that can collapse on phones;
- progress expressed by act/chapter, never a fake percentage through a branching story.

### Navigation drawer or sheets
Provide:
- Continue / current chapter;
- Parameters;
- Relationships;
- Relics;
- Codex;
- History or journal;
- Save / Load;
- Settings;
- Restart.

Do not expose undiscovered characters, relics, worlds, or codex entries.

### Settings
At minimum:
- dark/light/system theme;
- font size;
- line height;
- body font choice;
- reduced motion;
- high contrast;
- exact versus qualitative relationship display;
- consequence feedback visibility;
- mature content;
- reset settings.

## Accessibility
Meet WCAG 2.2 AA where applicable:
- complete keyboard operation;
- visible focus states;
- semantic headings, landmarks, and buttons;
- screen-reader announcement of passage changes and optional stat feedback;
- sufficient contrast in both themes;
- minimum practical touch target size;
- no information conveyed by color alone;
- reduced-motion behavior;
- zoom to 200% without losing controls;
- focus moved to the passage heading after navigation, not left on a removed choice.

## Authoring and debug tools
Production players should not see debug controls. In development mode provide:
- current node and state inspector;
- ability to modify a parameter, relationship, flag, or relic;
- jump-to-node search;
- reset to initial state;
- copy current state JSON;
- route history;
- visible indication of why a conditional choice is hidden or disabled.

Provide a validator that fails CI/build on:
- duplicate node or choice IDs;
- missing start node;
- broken targets;
- unreachable nodes unless tagged as intentionally external/debug;
- invalid state paths;
- unsupported conditions or effects;
- values outside parameter/relationship bounds;
- mature choice targeting a non-mature route in a way that blocks the story when disabled;
- game-over risk nodes without a checkpoint route;
- malformed Markdown or unsafe HTML.

Warnings, rather than hard failures, may cover nodes with no incoming edge, choices with no
state/reaction distinction, and unusually long passages.

## Security and privacy
- No arbitrary code execution from story JSON.
- Sanitize rendered Markdown and disallow unsafe inline HTML by default.
- No network requirement after installation.
- No telemetry or analytics by default.
- Never send story state, reading history, or mature-content preference to a server.
- Treat imported saves as untrusted input.

## Tests
At minimum, automate:

### Engine unit tests
- E–A rank mapping and clamping;
- relationship clamping;
- condition combinations;
- atomic effect application;
- relic add/remove idempotence;
- one-time `onEnter` behavior per transition;
- no double-application on repeated click;
- checkpoint creation and restore;
- save migration and corrupt-save rejection;
- mature-content filtering;
- broken-target validation.

### Act 0 parity tests
- confronting Vey raises her relationship once;
- each investigation raises the intended parameter to D;
- trained rescue routes reach their success passage;
- untrained rescue routes reach authored cost passages;
- the brass token is acquired only through the mother's case route;
- containment and rescue set different persistent state;
- the Closed Life ending can restore/restart;
- crossing reaches the Act I teaser with prior flags intact.

### End-to-end tests
- new game through one complete Act 0 route;
- refresh and continue from autosave;
- manual save, diverge, and load;
- export, reset, and import;
- keyboard-only passage navigation;
- narrow phone viewport and desktop viewport;
- mature setting off does not block completion.

## Performance
- fast first passage on a mid-range phone;
- no large UI framework merely for buttons and drawers;
- lazy-load optional screens and future act content when useful;
- avoid re-rendering full history on every state change;
- static production build deployable under a non-root base path;
- all asset and content URLs relative to the app base.

## Non-goals for this MVP
Do not build:
- combat animation;
- procedural prose;
- AI-generated choices;
- multiplayer or cloud accounts;
- a marketplace;
- gacha, currency, ads, or monetization;
- a full visual story editor;
- Act I story content;
- elaborate achievements;
- real-time 3D or mandatory artwork.

A clean JSON authoring workflow, validator, and development state inspector are enough.

## Definition of done
The work is complete when:
1. a new developer can run the app from documented commands;
2. production build and all tests pass;
3. all 37 current Act 0 passages are represented in production story data;
4. every current route is playable with state parity;
5. autosave, manual saves, import/export, checkpoint restore, and restart work;
6. the app is comfortable and accessible on phone and desktop;
7. it works offline after first load;
8. story data contains no executable expressions;
9. no private fanfiction source is included;
10. architecture and migration decisions are documented.

Return the complete app source, not screenshots or a design-only mockup. Include a concise
summary of decisions, commands run, tests passed, known limitations, and the exact files you
changed.
