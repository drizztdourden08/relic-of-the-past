<!-- @layer docs @kind doc -->
# Cheats Widget

Modify game state in real time. Changes take effect immediately in the running game.

## Tabs

- **Items** — give any item by id (queued for safe delivery).
- **Stats** — set current/max health, rupees, bombs, arrows; refill magic.
- **Combat** — outgoing damage multiplier and extra-armor reduction.
- **Bottles** — set the contents of each bottle slot.

Item delivery is gated by `WasmCanReceiveItem` so it never corrupts state, and cheated items don't mark
checks complete. Values are clamped to safe ranges.

> Full behavior, ranges, and the underlying functions: [Cheats & Commands hooks](../hooks/cheats-commands.md)
> and the user-guide [Cheats](../user-guide/cheats.md) page. Bridge: `lib/game/cheats.ts`,
> `lib/game/delivery-queue.ts`.
