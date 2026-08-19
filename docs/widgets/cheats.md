<!-- @layer docs @kind doc -->
# Cheats Widget

Edit game state on the fly. Changes take effect immediately in the running game.

## Tabs

- **Items** — give any item by id. Items are queued so they're delivered safely.
- **Stats** — set current and max health, rupees, bombs, and arrows, and refill magic.
- **Mechanics** — adjust the outgoing damage multiplier and extra-armor reduction.
- **Bottles** — set the contents of each bottle slot.

Item delivery is gated by `WasmCanReceiveItem`, so it won't corrupt state, and cheated items don't mark
checks complete. Values are clamped to safe ranges.

> Full behavior, ranges, and the underlying functions: [Cheats & Commands hooks](../hooks/cheats-commands.md)
> and the user-guide [Cheats](../user-guide/cheats.md) page. Bridge: `lib/game/cheats.ts`,
> `lib/game/delivery-queue.ts`.
