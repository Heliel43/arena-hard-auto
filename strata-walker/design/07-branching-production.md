# 07 — Story-First Production & Branching Model

## Production rule
Write and approve the **general story spine before building more engine features or dense
Twine branches**. The current Act 0 build is a prototype that proves tone, state, and choice
handling; it is not permission to improvise the rest passage by passage.

The order is:
1. canon and cast;
2. master story spine;
3. act and character outlines;
4. branch-neutral trunk draft;
5. choice map;
6. branch prose;
7. engine/UI polish;
8. continuity and playthrough testing.

## Stage 1 — Lock canon and cast
Before drafting the full spine, answer the facts that later twists depend on:
- protagonist's public life, private wound, initial desire, and reason to keep returning;
- sponsor's identity, severance plan, limits, and sincere moral argument;
- what happened to the protagonist's mother and what she changed in the First Door;
- Vey and Madsen's knowledge, loyalties, lies, and possible break points;
- each companion's actual name, culture, goal, fear, false belief, and ending philosophy;
- each world's one-sentence magical rule and political conflict;
- what a crossing changes, what it cannot do, and what it costs;
- the exact requirements and costs of the five ending philosophies.

Role labels such as Oathkeeper are development functions until the character has a complete
original identity.

## Stage 2 — Build the master spine
Create a beginning-to-ending outline of roughly 35–45 story chapters across seven acts.
This is not the source chapter order. Each chapter entry records:
- point-of-view goal;
- immediate obstacle;
- important character conflict;
- revelation or reversal;
- required setup/payoff;
- ending pressure that leads to the next chapter.

At this stage, record only the major act decisions. Do not write every dialogue choice.
The spine must read as a coherent linear fantasy novel even when all branch annotations are
hidden.

## Stage 3 — Overlay character arcs
For every major companion, mark:
1. introduction;
2. first useful cooperation;
3. ideological friction;
4. personal disclosure;
5. loyalty test;
6. possible break or departure;
7. contribution to each compatible ending.

Trust is not obedience. A companion at +5 may oppose a plan more honestly and effectively
than a companion at 0.

## Stage 4 — Draft the trunk
Write the common critical-path prose act by act. Mark **choice seams** but do not immediately
multiply the manuscript. A seam is a moment where the player has a meaningful attitude,
method, risk, relationship response, or moral decision.

Finish and review one act's trunk before writing its optional branches. This protects voice,
pacing, clue order, and causality.

## Stage 5 — Classify choices
Every choice gets one primary type.

### A. Voice / personality
Changes what the protagonist says or how the scene feels. Usually reconverges immediately.
It may set a recurring personality flag for later callbacks.

Examples: sincere, defiant, cautious, dry joke, deliberate silence.

### B. Parameter / method
Selects Strength, Endurance, Agility, Mana, or Luck as the approach. Success can change the
cost or available information without creating a new plot for every parameter.

### C. Relationship
Changes one or more companion meters and produces a reaction. The plot usually continues,
but accumulated trust changes later disclosures, help, departures, and endings.

### D. Information / exploration
Trades time or safety for a clue, alternate perspective, relic, or future option. It may
rejoin quickly while setting a delayed flag.

### E. Tactical branch
Creates a different scene or short sequence, then reconverges at a credible external event.
Different routes should carry distinct injuries, witnesses, resources, or relationships.

### F. Act hinge
Changes a world's political or magical state. Usually one major hinge appears near an act's
climax. Later acts share a broad spine but react materially to the stored outcome.

### G. Risk / trap / game over
Allows reckless, comic, suspicious, or knowingly dangerous actions. A lethal result is fair
only when danger was signaled or the choice is an intentional gamble. Place a checkpoint
before it and make the resulting scene worth reading.

### H. Ending lock
Commits the player to Seal, Weave, Shatter, Sponsor, or the hidden path late in the game.
Ending availability depends on accumulated world state, companions, relics, and parameters.

## Branching budget
Avoid exponential branch growth with a **trunk-and-diamond** structure:
- **65–75% local choices:** immediate reaction, parameter, joke, clue, or relationship
  change; reconverge inside the scene.
- **20–30% delayed/state choices:** share the next main chapter but alter later text,
  resources, injuries, allies, or available methods.
- **5–10% major hinges:** create substantial alternate sequences or world outcomes.

Use approximately one act-level hinge per act. It may have three or four outcomes, but those
outcomes should feed into a shared Earth interlude or next-act inciting event. The state is
not erased when the prose reconverges.

Permanent route separation should happen late, primarily in Acts V–VI. Companion-specific
and mature scenes are side branches that return to the main timeline unless a departure or
ending makes separation dramatically necessary.

## The Telltale/Magium principle
Most choices do not need to create another game. They do need to create a response.

A convergent choice must provide at least one of:
- immediate changed dialogue or narration;
- a parameter or relationship change;
- a clue, relic, injury, debt, or resource;
- a delayed callback;
- a distinct joke or character beat;
- a clearly signaled risk with a possible game over.

Do not use fake choices that receive identical wording and state. The branch can be short,
but the game should acknowledge what the player chose.

## Reconvergence rules
Branches reconverge because of a believable event: an alarm, deadline, attack, vote,
crossing, evacuation, or mutual destination. Never reconverge by pretending the branch did
not happen.

On reconvergence, carry at least one scar:
- flag;
- relationship delta;
- parameter consequence;
- injury;
- missing or acquired relic;
- changed witness;
- changed Earth detail.

## Parameter-check rules
- High rank gives another method, not the morally correct answer.
- Ordinary failures should fail forward through cost, injury, debt, or lost information.
- Game over is reserved for clearly dangerous gambles and major failures where continuation
  would be less interesting.
- Luck opens improbable but prepared possibilities; it is not random number generation.
- Display requirements only when the protagonist can reasonably estimate them. Unknown
  checks may be used for genuine mysteries, not arbitrary punishment.

## Planning notation
Use this in trunk drafts:

```markdown
[CHOICE C2.3 — relationship / local]
- Answer honestly -> $c_oath +1; reveal fear
- Deflect with a joke -> voice_dry flag; immediate reaction
- Refuse -> $c_oath -1; preserve secret
[CONVERGE: scene 2.4]
```

For a major hinge:

```markdown
[HINGE H1 — Axis Crown]
- Centralize -> court_state=centralized
- Distribute -> court_state=federated
- Destroy -> court_state=severed
- Steal core -> court_state=core_stolen; relic gained
[RECONVERGE: Earth Interlude I, with distinct Aurel changes]
```

## Quality gates before engine expansion
Do not add major UI systems until:
- the master spine has an ending and no missing causal bridge;
- all main companions have complete arcs;
- every reveal has earlier setup;
- every act hinge changes at least one later scene and one Earth detail;
- all five endings have requirements, costs, and thematic arguments;
- the expected critical-path length and branch budget are known.

Afterward, engine work can focus on supporting a known story instead of dictating one.

## Current status and next deliverable
The Act 0 Twine build is frozen as the gameplay prototype. Draft 1 of the 44-chapter
beginning-to-ending story now exists in `story/outline/00-master-spine.md`, with only act
hinges marked.

Next review that spine for premise, pacing, revelations, and ending logic. Once approved,
create the character-arc overlay before drafting Act I or adding gameplay systems.
