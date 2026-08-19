<!-- @layer docs @kind doc -->
# Cheats

The **Cheats widget** is a built-in panel for giving items, editing stats, and tweaking combat. It's handy for testing, practice, and exploring. Open it from the title bar or Menu → Widgets.

## Tabs

| Tab | What you can do |
|-----|-----------------|
| **Items** | Give any item by id. Delivery is queued and only fires when it's safe, meaning you're in gameplay rather than mid-menu or mid-animation, so it won't corrupt your save. |
| **Stats** | Set current health, max hearts, rupees, bombs, and arrows, or refill magic. |
| **Mechanics** | Adjust the outgoing damage multiplier and extra armor (damage-reduction %) to make Link hit harder or take less. |
| **Bottles** | Set the contents of each of the four bottle slots, such as potions, a fairy, or a bee. |

## Safe item delivery

Giving items does more than poke memory. It runs through a delivery queue that checks
`WasmCanReceiveItem` each frame and only delivers when Link can safely receive: the right module is
active, no menu is open, and he isn't already mid-receipt. Cheated items play the normal receipt
animation, but they leave every check unmarked.

> Values are clamped to safe ranges, for example item id 0–75, hearts 1–20, and rupees up to 999. For
> the full behavior and ranges, see [Cheats & Commands](../hooks/cheats-commands.md). For widget
> specifics, see the [Cheats widget](../widgets/cheats.md).
