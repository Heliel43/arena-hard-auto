# Beat Bank — how to decompose a pasted arc

When you paste an arc (or I pull one from a file), I break it into **beats**: the smallest
reusable unit of story (a scene, a confrontation, a reveal, a quiet character moment).

## Beat template (copy per beat into a new file `beats/<arc>-beats.md`)
```markdown
## Beat: <short id>            # e.g. opening-council, relic-tourney, beast-court-pact
- source_arc: <which fanfic arc/chapters>
- world:      <W0..W7 from design/02-worlds.md>
- roles:      <C1..C10 / OX from design/01-companions.md>
- theme:      <war | school | intrigue | romance | mystery | combat | quiet>
- target_act: <0..6 from design/04-recombination.md>
- original:   <yes | partial | rewrite-needed>
- summary:    <2-3 sentences of what happens, in original terms>
- re-skin notes: <what must change to be safe & original>
```

## Example
```markdown
## Beat: council-denial
- source_arc: Ch.1 (student council, trip revoked by guardian)
- world: W0 Cinderhall
- roles: C9 (President), C10 (Sponsor), C8 (Caretaker, referenced)
- theme: mystery / school
- target_act: 0
- original: yes (already re-skinned in Awakening passage)
- summary: Protagonist is pulled from class, told a sealed sponsor revoked a trip;
  comes home to an empty house and the first Bleed vision.
- re-skin notes: red-moon/vampire imagery -> silver tide + burning moon;
  specific names -> Vey / Madsen / Greywater.
```

## Rules
- One beat = one scene. Don't batch a whole chapter.
- Tag `target_act` even if unsure; we can move beats later.
- Mark `original: rewrite-needed` for any beat that too closely echoes a source character
  or place — those get a full re-skin before entering the game.
