<!-- @layer docs @kind doc -->
# Save States (F1–F8)

Save states are full machine-state snapshots — separate from the in-game battery save ([Save
System](save-system.md)). They let you checkpoint anywhere and jump back instantly.

## Slots

- **8 slots** (0–7), bound to **F1–F8** for quick access.
- Each slot stores a **screenshot thumbnail**, a **timestamp**, and file size.
- Slots are **per-profile** and persisted to disk.

## Saving & loading

The save-state overlay is a modal 8-slot grid (toggle from the title bar or a hotkey):

- **Hold to save** — press and hold; a progress ring fills, then the snapshot + screenshot are written.
  The hold duration is configurable.
- **Tap to load** — a quick tap on a populated slot restores it immediately.
- **Esc** cancels.

## Auto-save

Optionally auto-save on profile unload, and a per-session auto-state slot, so you can pick up where you
left off. Configure under the profile's settings.

## Under the hood

The overlay drives the bridge primitives `WasmSaveState(slot)` / `WasmLoadState(slot)`; the Electron
layer persists the slot blob and screenshot to the profile's directory. See
[Save / Load / I-O](../hooks/save-load-io.md).
