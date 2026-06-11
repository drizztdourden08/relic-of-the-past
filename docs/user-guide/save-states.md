<!-- @layer docs @kind doc -->
<!-- @wiki-title: Save States -->
# Save States

A save state, also called a quick save, is a full snapshot of the machine state. It's separate from the game's own in-game battery save. With a save state you can checkpoint anywhere and jump back instantly, without opening a menu.

## Slots

- There are 8 slots, numbered 0 to 7.
- Each slot stores a screenshot thumbnail, a timestamp, and the file size.
- Slots belong to the active profile and are saved to disk.

## Saving and loading

The save-state overlay is a grid of all 8 slots that you toggle from the title bar or a hotkey:

- To save, press and hold a slot until the progress ring fills, then the snapshot and screenshot are written. The default is holding the Select button, and the hold duration is configurable so you don't save by accident mid-game.
- To load, give a populated slot a quick tap and it restores immediately.
- Press Esc to cancel.

Every save captures a screenshot at the moment it's written, so you can tell slots apart at a glance instead of reading timestamps.

## Auto-save

The game can also save itself on a timer:

- Set the interval, for example every 60 seconds.
- Turn on save-on-quit and it saves when you close the app or stop the game.
- Auto-save uses its own dedicated slot, so it stays out of the way of your manual save states.

You'll find these options under the profile's Gameplay settings.

## Storage

Save data lives per profile in the app's data directory. Delete a profile and its saves go with it; nothing is shared between profiles.

## Under the hood

The overlay drives the bridge primitives `WasmSaveState(slot)` and `WasmLoadState(slot)`. The Electron layer writes the slot blob and screenshot to the profile's directory. See [Save / Load / I-O](../hooks/save-load-io.md).
