<!-- @layer docs @kind doc -->
# Save States

A save state, also called a quick save, is a full snapshot of the machine state. It's separate from the
in-game battery save ([Save System](save-system.md)). With one you can checkpoint anywhere and jump
back instantly.

## Slots

- There are 8 slots, numbered 0 to 7.
- Each slot stores a screenshot thumbnail, a timestamp, and the file size.
- Slots belong to the active profile and are saved to disk.

## Saving & loading

The save-state overlay is a modal grid of all 8 slots, which you toggle from the title bar or a hotkey:

- To save, press and hold a slot. A progress ring fills, then the snapshot and screenshot are written. The default action is holding the Select button, and the hold duration is configurable.
- To load, give a populated slot a quick tap and it restores immediately.
- Press Esc to cancel.

## Auto-save

You can also auto-save when a profile unloads, and there's a per-session auto-state slot, so you can
pick up where you left off. Both are set under the profile's settings.

## Under the hood

The overlay drives the bridge primitives `WasmSaveState(slot)` and `WasmLoadState(slot)`. The Electron
layer writes the slot blob and screenshot to the profile's directory. See
[Save / Load / I-O](../hooks/save-load-io.md).
