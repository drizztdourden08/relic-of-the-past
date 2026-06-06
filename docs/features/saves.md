<!-- @layer docs @kind doc -->
# Save System

Relic of the Past provides three save mechanisms, all operating independently and per-profile.

---

## Auto-Save

The game automatically saves at a configurable interval.

- **Timer** — set the auto-save frequency (e.g., every 60 seconds)
- **Save on quit** — automatically saves when you close the app or stop the game
- Auto-saves use a dedicated slot and do not interfere with quick saves or named saves

---

## Quick Saves

Quick saves provide fast, controller-friendly save/load without opening any menu.

### Saving

Hold the configured button (default: `Select`) for the configured duration. A slide-down overlay appears showing all quick save slots. The hold duration is configurable to prevent accidental saves during gameplay.

### Loading

Access quick save slots from the save state overlay. Each slot shows:
- A **screenshot** captured at the moment of saving
- Timestamp
- In-game location

### Slots

Multiple quick save slots are available. The overlay shows all slots at once so you can choose which to overwrite or load.

---

## Named Saves

Named saves are manual saves with a custom label. They differ from quick saves in that:

- They require explicit user action (not a hold shortcut)
- They have a user-defined name for easy identification
- They cannot be accidentally overwritten by the quick save shortcut

Best for: milestone saves, before boss fights, or any point you want to reliably return to.

---

## Save State Screenshots

Every save (auto, quick, and named) captures a screenshot of the game at the moment of saving. These screenshots appear in the save slot overlay as visual previews, making it easy to identify which save is which without reading timestamps.

---

## Storage

All save data is stored per-profile in the app's data directory. Deleting a profile deletes its saves. Saves are not shared between profiles.
