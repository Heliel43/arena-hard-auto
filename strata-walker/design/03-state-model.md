# 03 — State Model (Harlowe implementation)

> The player's run is tracked in Twine/Harlowe variables. Defined once in `Start`.

## Core stats (raised by choices; gate certain scenes)
| Var | Name | Governs |
|-----|------|---------|
| `$insight` | Insight | Strata-sight, perception, puzzle beats |
| `$resolve` | Resolve | Willpower, defiance, survival checks |
| `$guile` | Guile | Social, theft, trickery, negotiation |
| `$bond` | Bond | Aggregate companion affinity (unlocks group scenes) |

Initialize all core stats at `1`. Soft caps per act (e.g., act-1 max ~5).

## Companion meters
`$c_oath, $c_mistress, $c_arcanist, $c_spirit, $c_trick, $c_lantern, $c_forge,
$c_caretaker, $c_president`
Range -3 … +5. Thresholds:
- `>= 3` → personal scene / loyalty check
- `>= 5` → sworn bond / companion ending branch
- `<= -2` → hostile route / possible loss

## Flags (datamap `$flags`)
`(set: $flags to (dm:))` then merge: `$flags + (dm: "key", true)`.
Used for: world visited, key events, moral forks, "the sponsor revealed", etc.

## Inventory — Relics (`$relics`, an array)
`(set: $relics to (a:))`; add with `$relics + (a: "Name")`.
Relics are earned from arcs and can gate later beats (e.g., a Strata-key relic).

## Harlowe snippets
```harlowe
(set: $insight to 1)(set: $resolve to 1)(set: $guile to 1)(set: $bond to 0)
(set: $flags to (dm:))
(set: $relics to (a:))
(set: $c_oath to 0)(set: $c_mistress to 0)(set: $c_arcanist to 0)
(set: $c_spirit to 0)(set: $c_trick to 0)(set: $c_lantern to 0)
(set: $c_forge to 0)(set: $c_caretaker to 0)(set: $c_president to 0)
```
Status line (drop into any passage):
```harlowe
Insight: (print: $insight) · Resolve: (print: $resolve) · Guile: (print: $guile) · Bond: (print: $bond)
```

## Save/load
Harlowe has built-in `(savegame:)` / `(loadgame:)` and the Twine UI "Save" bar. No custom
code needed for v1.
