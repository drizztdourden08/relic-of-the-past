<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/input

Facts about `apps/desktop/src/input/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/input/binding-display/

One source of truth for a binding's label and icon, shared by the controls editor rows, the
save state hints, `InputGlyph` and the controller overlays. A bound control always draws a
glyph: one row of bare text beside rows with art reads as broken. Device art is preferred
and comes through `icon`, but it is missing when the pad is unplugged or its family has no
picture for that control, and an axis never stored an icon because its glyph depends on which
end of the stick is meant. So the generic fallbacks are keyed off the binding's own shape,
and only `none` draws nothing.

## apps/desktop/src/input/controller-family-cache/

The SDL gamepad type of every controller seen this session, seeded from the snapshot and kept
live by the input module's `onDevices` and `onAdded` (`seed-device-cache.ts`). Family display
metadata (icons, labels, console defaults) is keyed by this type, so this is the only way to
resolve it for a saved binding or a drag payload whose device is unplugged. Recording starts
once at module load and is never torn down; the cache outlives any screen.

## apps/desktop/src/input/controller-input-store.ts

Holds each pad's button and axis state and the diagnostic log the Controller Diagnostics page
reads. Decoding and calibration storage belong to the Brock input module.

- `getDevicesThatHaveReported` is not the connected set: SDL emits state only on change, so an
  untouched connected pad never appears. Connection state is the device snapshot
  (`InputManager.hidDeviceCache`, status `ready`).
- `handleRawReport` takes one HID report while a diagnostic raw capture is open
  (the input module's `capture.startRaw`). Only one capture runs at a time, keyed by vendor and product,
  so the `vid:pid` device key is rebuilt here.
- `rawSticks` are the raw 12 bit stick values `[lx, ly, rx, ry]` before calibration, for the
  calibration UI; `rawBytes` are the report bytes for the debug UI.
- The store is exposed as `window.__controllerInputStore`.

## apps/desktop/src/input/controller-name-cache/

Names for every controller seen this session, seeded from the snapshot and kept live by
the input module's `onAdded`. An event only listener never learns the name of a device connected before
it subscribed, since that device announces itself once. The OS product string is no
substitute: devices reached over a raw USB interface report it empty, which is how a pad
shows as "Unknown Controller". Names are keyed by device key and by vendor and product, since
a caller with a raw device list has ids but no device key. Blank names are ignored so a later
real one is not shadowed. Recording starts at module load and only listens.

## apps/desktop/src/input/frame-router.ts

Where one frame of input goes. The first question is whether the host owns the pause menu,
not which scheme is active: while it does, the native Start branch that would close the menu
lives inside the function the host's hold returns from, so only a menu verb read here can
close it. Routing on the scheme first made Classic plus Enhanced a soft lock. Routes, in
order:

1. Menu open, any scheme. The frame is read as functions, turned into rising edge events for
   the menu, and the core gets a zero mask: the core keeps the last mask it was handed, so not
   calling would leave the player walking under the menu. Contract section 11 shares a button
   between a menu verb and a gameplay slot, so slots parked under a verb the menu consumes are
   named and their edges dropped; otherwise changing screen would also assign what the cursor
   is on. With no lens at all (an unassigned profile) the core is still zeroed. The edge
   baseline is last frame's read, except on the frame after a handover (`edgeBaseline`), so a
   button held from the press that opened the menu does not rise again. The shadowed slots are
   recomputed per menu frame; caching would add one more thing to invalidate on a rebind.
2. Modern, menu closed. The frame is remapped to a console mask, and if a pressed slot holds
   an item the save has, the equipped item register is written first. The core reads
   the register on the frame Y is pressed, so writing it after the mask would fire the
   previous item once on every switch. An active item of 0 means leave the core's own item
   alone; it is not an item id.
3. Classic, menu closed. The console mappings become a bitmask that still goes through the
   strategy table, because `mapOnSelect` is a real setting and its swap lives there.

The fallback lens is the profile's core verbs alone, which every profile carries (contract
section 5). Its slots are empty, since under classic a slot is not something the player can
fire.

## apps/desktop/src/input/haptic-bridge/

Connects the game core's haptic events (`window.__onHapticEvent`) to controller vibration.
Overlapping events are coalesced into one active envelope so the HID worker (a synchronous
open, write and close per request) is not flooded: with the motor off the event is sent at
once, a stronger event interrupts, and a same or weaker one is dropped while the motor runs.
About 20 ms is added for the worker's own overhead.

- One switch per profile (`GameSettings.hapticsEnabled`). When on, targeting narrows to the
  profile's own mapped devices, read fresh on every send so a profile switch or rebind
  applies at once.
- Connection comes from the device snapshot, because SDL emits state only on change. Sending
  is deliberately not gated on `hasRumble`: SDL can under report it, and a silent native no
  op is safer than a false flag silencing the feature.
- The family strength curve, the user amplification override and a minimum duration floor
  are resolved from the SDL type recorded at connect, and combined in
  `vibration-shaping.ts`.
- `previewHapticPattern` fires one pattern at one device, bypassing the mixer, cooldown and
  targeting (a calibration screen test must always fire), with the same scaling and shaping
  as gameplay so the felt strength matches.
- The platform's device vibrate buzzes a phone; it does nothing on desktop.
- In dev builds a once a second console line counts core hooks, events, dispatches and
  merges.

## apps/desktop/src/input/input-manager/

The renderer input engine. Its fields are public so the helper files can operate on the
instance. Lifecycle: create, `start`, `stop`, `start` again.

- `profiles` holds every saved input profile so the profile cycle shortcut can switch the
  active one during play. `allowed` lists the devices the active profile's map references;
  the input gate lets only those through.
- Input is eligible while the window has focus. An automated launch never shows its window,
  so `hasFocus` stays false and synthesized input would go nowhere; there is no person to
  protect, so the gate does not apply there.
- Connected pads come from the device snapshot, not from reported input: SDL emits state only
  on change, so an untouched pad would be invisible and could hold a disconnect pause open.
- Escape is never game or function input; the app level menu toggle owns it. Ctrl and Cmd
  chords (copy, paste, select all) are never game input either, so copying selected log text
  works; the modifier key's own keydown still routes in case it is mapped.
- On start, a mapped pad that sends data again resumes a disconnect pause. A device poll every
  two seconds is the safety net for a reconnect that fired no event; it only resumes, never
  re-pauses, so a manual resume of an absent pad stays resumed.
- Raw HID bytes flow only while a raw capture is open (the calibration wizard), so staying
  subscribed is harmless. Controller names and SDL types are announced once at connect, so
  their caches start here, not in whichever screen imports them.
- The scheme bindings are rebuilt when the snapshot arrives, because it comes after the
  profile is set; otherwise a pad profile keeps the null bindings it had on the frame it was
  applied and the modern scheme never engages.
- Cycling the active profile changes the mapped device set, so presence is re-evaluated:
  pause if the new profile's pad is absent, resume if present.
- `cheat-health` heals to the capacity the player has earned: the core clamps the request to
  the heart capacity, so asking for the ceiling (160, twenty hearts) never raises it.
  `cheat-max-health` is the separate action that also raises the capacity.
  `cheat-ignore-collision` toggles and shares its state with the Cheats widget switch.
  Every `cheat-*` action is rebindable under Settings, Controls, Cheats (issue 130).
- Debug capture is an ordinary rebindable function action, never a hard coded key.
- Turbo is a hold: the rising edge engages it, the falling edge lets go. The setting is checked
  on press, and the core also refuses to leave real time while its speed is 100. A hold can
  lose its release (input suppressed under a menu, focus lost mid hold), so both paths release
  turbo explicitly.
- The manager is exposed as `window.__inputManager`.

## apps/desktop/src/input/item-ownership/

Does the live save hold this item? The scheme layer is pure and has no inventory, and
assignments are stored per profile, not per save, so a fresh file inherits buttons pointing at
items it never found. Pressing one used to park the equipped item register on an item the
save does not have, while the pause menu refused that same cell. The answer is
`buildItemCells`' own `owned` flag, the same function the pause grid and `planAssignment` use,
so the press and the menu cannot drift. It lives in the input layer because the router is the
only place holding both the pressed slot and the live state. The UI store publishes a new
inventory object on most frames, so identity is useless as a memo key; the 24 bytes are
compared instead and the cells rebuilt only when the inventory moved. Item ids are 1 to 24.

## apps/desktop/src/input/process-controller-state.ts

SDL3 controller intake. The native addon already decodes and factory calibrates reports into
normalized values, so the old per device HID parser is bypassed. Trigger calibration applies
here, on the normalized 0 to 1 range of the trigger axes (from `LEFT_TRIGGER` on), read live
from the input module's `useCalibrationStore` so a calibration saved on the Controllers screen
applies at once; sticks arrive normalized to -1 to 1.

## apps/desktop/src/input/seed-device-cache.ts

Seeds a per device cache from the controller snapshot, then keeps it live with the input
module's `onDevices` and `onAdded`. Three caches once listened to the added event alone and never recorded a device connected before they subscribed. Snapshot
entries and added events both satisfy `DeviceSnapshotFields`; `remember` decides whether an
entry carries enough to record.

## apps/desktop/src/input/snes-button-glyph.ts

The picture and name of whatever input a SNES button is bound to: keycaps for a keyboard
profile, the pad's own face buttons for a controller profile, resolved like the Controls
screen's rows. An unbound button falls back to the SNES button's own picture.
