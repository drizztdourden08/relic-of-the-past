<!-- @layer docs @kind doc -->
# Cheats

A built-in cheat panel (the **Cheats widget**) for giving items, editing stats, and tweaking combat —
handy for testing, practice, and exploring. Open it from the title bar or Menu → Widgets.

## Tabs

| Tab | What you can do |
|-----|-----------------|
| **Items** | Give any item by id. Delivery is queued and only fires when it's safe (in gameplay, not mid-menu/animation), so it never corrupts state. |
| **Stats** | Set current health, max hearts, rupees, bombs, arrows; refill magic. |
| **Combat** | Outgoing damage multiplier and extra armor (damage-reduction %) — make Link hit harder or take less. |
| **Bottles** | Set the contents of each of the four bottle slots (potions, fairy, bee…). |

## Safe item delivery

Giving items doesn't just poke memory — it runs through a **delivery queue** that checks
`WasmCanReceiveItem` each frame and only delivers when Link can safely receive (correct module, no
open menu, not already mid-receipt). Cheated items play the normal receipt animation but **don't** mark
any check complete.

> Values are clamped to safe ranges (e.g. item id 0–75, hearts 1–20, rupees ≤ 999). Full behavior and
> ranges: [Cheats & Commands](../hooks/cheats-commands.md). Widget specifics:
> [Cheats widget](../widgets/cheats.md).
