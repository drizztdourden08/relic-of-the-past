<!-- @layer docs @kind doc -->
# Save System

Relic of the Past has two kinds of save, and both work per profile: auto-save and quick save states.

---

## Auto-Save

The game saves itself on a timer you set.

- Set the interval, say every 60 seconds.
- Turn on save-on-quit and it saves when you close the app or stop the game.
- Auto-saves use their own dedicated slot, so they stay out of the way of your quick save states.

---

## Quick Save States

A quick save state is a full machine-state snapshot you can drop and restore anywhere, without opening
a menu. For the full picture, see [Save States](save-states.md).

### Saving

Hold the configured button, Select by default, for the configured duration. A slide-down overlay
appears showing all the slots. The hold duration is there to keep you from saving by accident mid-game,
and it's adjustable.

### Loading

Open the same overlay and tap a populated slot to load it. Each slot shows:

- A screenshot from the moment you saved
- A timestamp
- The in-game location

### Slots

There are several slots, and the overlay lays them all out at once so you can pick which to overwrite or
load.

---

## Save Screenshots

Every save, whether auto or quick, grabs a screenshot at the moment it's written. Those screenshots show
up as previews in the slot overlay, so you can tell saves apart at a glance without squinting at
timestamps.

---

## Storage

Save data lives per profile in the app's data directory. Delete a profile and its saves go with it.
Nothing is shared between profiles.
