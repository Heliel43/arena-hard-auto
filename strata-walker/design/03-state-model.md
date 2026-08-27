# 03 — State Model (Harlowe implementation)

> The player's run is tracked in Twine/Harlowe variables. Defined once in `Start`.

## Core parameters — five only

The game uses a compact, familiar five-parameter structure with **letter ranks**. The
mechanic is generic; all presentation and setting-specific meaning remain original to
*The Strata Walker*. We do not use franchise-specific class labels or terminology.

| Var | Parameter | Governs |
|-----|-----------|---------|
| `$strength` | Strength | Physical force, lifting, breaking, heavy-weapon checks |
| `$endurance` | Endurance | Injury, exhaustion, hostile environments, sustained will |
| `$agility` | Agility | Speed, reflexes, balance, stealth, precision work |
| `$mana` | Mana | Magical capacity, Prism-sight, crossings, relic control |
| `$luck` | Luck | Anomalies, narrow escapes, risky opportunities, coincidence |

There is deliberately **no sixth core parameter**:
- Social outcomes use the player's actual dialogue choice, relevant flags, and the
  individual companion meter—not a universal Charisma stat.
- Learned knowledge is recorded in `$flags`; supernatural perception uses Mana.
- Relics are inventory/abilities, not a disguised extra parameter.

## Rank scale

Core parameters are stored as integers so checks stay simple, but shown to the player as
letters:

| Stored value | Display rank | Meaning at the current scale |
|--------------|--------------|------------------------------|
| `1` | E | Latent / untrained |
| `2` | D | Trained |
| `3` | C | Exceptional |
| `4` | B | Superhuman |
| `5` | A | Strata-class |

A `+` or `−` is a **temporary situational modifier**, usually supplied by a relic,
companion, injury, or world rule. It does not create another permanent value. Anything
that cannot be measured is shown as **Unrated**, not as a higher secret rank.

Initialize all five at `1` (E). Choices and major training beats may raise them, with a
soft cap by act. Luck increases only at rare turning points; it is not random dice rolling.
Checks are deterministic so readers can understand why a route opened or failed.

Suggested soft caps: Act 0 → D, Acts 1–2 → C, Acts 3–4 → B, Acts 5–6 → A.

## Companion meters
`$c_oath, $c_mistress, $c_arcanist, $c_spirit, $c_trick, $c_lantern, $c_forge,
$c_caretaker, $c_president`

Range -3 … +5. These are relationship state, **not core parameters**. Thresholds:
- `>= 3` → personal scene / loyalty check
- `>= 5` → sworn bond / companion ending branch
- `<= -2` → hostile route / possible loss

## Flags (datamap `$flags`)
`(set: $flags to (dm:))` then merge: `$flags + (dm: "key", true)`.
Used for: worlds visited, learned lore, key events, moral forks, injuries, temporary rank
modifiers, the sponsor reveal, and optional mature branches.

## Inventory — Relics (`$relics`, an array)
`(set: $relics to (a:))`; add with `$relics + (a: "Name")`.
Relics can grant a temporary `+`, provide a unique action, or gate a later beat. They are
never represented by a franchise-specific special-attack parameter.

## Harlowe initialization
```harlowe
(set: $strength to 1)(set: $endurance to 1)(set: $agility to 1)
(set: $mana to 1)(set: $luck to 1)
(set: $flags to (dm:))
(set: $relics to (a:))
(set: $c_oath to 0)(set: $c_mistress to 0)(set: $c_arcanist to 0)
(set: $c_spirit to 0)(set: $c_trick to 0)(set: $c_lantern to 0)
(set: $c_forge to 0)(set: $c_caretaker to 0)(set: $c_president to 0)
```

Example check:
```harlowe
(if: $agility >= 3)[You cross the falling bridge before the second cable parts.]
(else:)[You need another route—or a companion willing to catch you.]
```

## Save/load
Harlowe has built-in `(savegame:)` / `(loadgame:)` and the Twine UI Save bar. No custom
code is needed for v1.
