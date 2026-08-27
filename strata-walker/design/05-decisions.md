# 05 — Locked Decisions & Workflow

## Creative decisions — locked
- **Home:** Present-day Earth, centered on fictional Aurel, Pennsylvania, USA.
- **School:** Cinderhall Academy is outwardly ordinary, not a public magical school.
- **Protagonist:** Eighteen at the opening; observant, dry, and quietly defiant.
- **Structure:** Earth recurs between world arcs and changes in response to crossings.
- **Agency:** The first crossing is voluntary and follows an investigation choice.
- **Source use:** The fanfiction is a private source bank, never the game's chronology or
  identity.
- **Core parameters:** Strength, Endurance, Agility, Mana, and Luck, displayed E through A.
- **Relationships:** Individual companion meters represent trust, not obedience.
- **Rating:** Mature. Explicit material, if written, is adult-only, optional, separated from
  the critical route, and marked with a `mature` flag.

## Terminology policy — locked
Universal words are allowed: magic, mana, god, demon, angel, witch, spirit, soul, curse,
ritual, relic, heaven, hell, monster, dragon, and similar shared vocabulary.

Replace or remove:
- copyrighted proper nouns;
- franchise-specific organizations, species taxonomies, classes, and power-system labels;
- signature abilities and artifacts;
- distinctive maps, histories, relationships, scenes, dialogue, or visual combinations;
- a generic term when it is carrying copied franchise-specific lore.

*Fate*, *High School DxD*, *Skyrim*, and other real works may be mentioned sparingly as
fiction on Earth. They are comparisons the protagonist can get wrong, never real Strata or
sources of usable canon knowledge. Do not quote them or reproduce their characters.

## Available source
The supplied GitHub file has been fetched locally to:
`data/incoming/A_Nascent_Kaleidoscope.txt`

It is a UTF-8 AO3 export of approximately 388,000 words through Chapter 157. The source is
ignored by Git and must never be committed. It is enough for a substantial game even though
it is not the later multi-million-word version.

## Processing workflow
Work by named arc or dramatic need rather than trying to convert every chapter:
1. Identify candidate source chapters locally.
2. Run entity/risk tools only on the selected working slice when useful.
3. Decompose scenes into abstract beats using `story/beats/README.md`.
4. Recombine beats under `design/04-recombination.md`.
5. Write wholly original second-person passages.
6. Add choices with parameter, relationship, relic, or flag consequences.
7. Rebuild and run the runtime self-test.
8. Review the playable slice before mining another arc.

## Automation boundary
- **Mechanical assistance:** chapter indexing, term detection, local search, consistency
  checks, broken-link checks, and state-variable tests.
- **Creative work:** character substance, magical rules, factions, dialogue, prose,
  choreography, branching consequences, and all shipped expression.

Mechanical renaming is never treated as a finished conversion.

## Immediate production order
1. Keep the revised Act 0 as a playable prototype; do not expand the engine yet.
2. Lock original cast identities, magical rules, sponsor motive, and ending costs.
3. Write a 35–45 chapter master spine covering the complete general story.
4. Overlay companion arcs and setup/payoff dependencies.
5. Review and approve the spine.
6. Draft the common Act I trunk, then add classified choices under
   `design/07-branching-production.md`.
7. Return to engine and interface work only when the story requires specific support.
