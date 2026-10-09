<!-- @layer docs @kind doc -->
# Code notes: apps/web/src/lib

Facts about the renderer library that the code cannot say on its own. Each heading names
the source file (or folder) the note belongs to, relative to `apps/web/src/lib`.

## assets/public-asset.ts

The packaged renderer loads over `file://`, where a root-absolute path such as
`/buttons/x.svg` points at the filesystem root and fails. Vite's `BASE_URL` is `/` in dev
and `./` in the packaged build, so callers pass a root-relative path.

## crash-dump.ts

When the core crashes, the log buffer is written to `debug/crash-<stamp>.log` in the user's
data folder, so a crash report is a file to attach. Writing the dump is best effort: a
failed dump never makes a crash worse, and the in-app log still has everything.

## crossing-sections

A crossing that is not placed carries a placeholder tile: the exit table names a
destination without saying where its door is, so it belongs in a list but on no map.
Indoors a fall hole crossing is the tile the player lands on and gets its own section.
Outdoors it is the pit itself and belongs with the other ways off the screen. A map marks
crossings that are placed, available now, and not a landing.

## diagnostics

What the renderer itself can see: the graphics stack WebGL exposes, the audio device the
mixer lands on, the display the window sits on, and the attached input devices. It works on
every host, including web and mobile where there is no main process to ask; there the host
sections (system, hardware, every attached display) drop out and the renderer sections still
carry the report.

- `build-report-subject.ts`: the prefilled report subject is the version and, while a game
  runs, the screen it is on, then a colon for the person to finish the sentence.
- `collect-save-states.ts`: a debug report packages every quick slot, the 5 newest normal
  saves, the 2 newest auto saves, and one fresh live capture. The live capture writes to a
  scratch WASM slot and unlinks it at once, so packaging a report never creates a save the
  player did not ask for.
- `collect-renderer.ts`: the refresh rate probe is the only slow one (it watches real
  frames), so it runs alongside the audio probe.
- `probe-audio.ts`: the mixer runs inside the wasm module, so the probe opens a short lived
  `AudioContext` and reads what the output device imposes on any context: the sample rate the
  resampler must hit and the buffer latency behind crackle reports. Output latency reads 0
  until the graph has run, so 0 is reported as unknown.
- `probe-device.ts`: `deviceMemory` and `performance.memory` are Chromium extensions with no
  DOM typings. SDL3 claims every controller directly (the Gamepad API path is gone). The probe
  reads the device snapshot from the controller layer, not the input manager's cache (which
  exists only after the manager started) and not the reported input set (SDL emits state only
  on change, so an untouched pad would be missing). Names come from the session's
  `controller:added` cache, then the snapshot's fields. Device ids carry the vendor and
  product pair a controller mapping report needs.
- `probe-display.ts`: scale factor and colour capability decide how the pixel art scaler
  behaves, so they matter for blurry or mis-sized output reports.
- `probe-refresh-rate.ts`: measures the compositor's real frame cadence, the rate the
  emulator is paced against, which can differ from the monitor's mode (a 144 Hz panel driven
  at 60, a variable refresh panel in between). It takes the median so one hitch cannot skew
  it, ignores gaps of 100 ms or more (a throttled tab or a stalled compositor), and gives up
  after 2.5 s so a background window does not hold the copy button hostage.
- `probe-webgl.ts`: prefers WebGL2 so the limits match the game canvas, and unmasks the real
  adapter through the debug renderer extension. Browsers cap live WebGL contexts and the game
  canvas needs one, so the probe context is released at once.
- `format/`: the block is built as titled sections so a formatter can drop an empty line or
  section without the caller knowing which parts are optional. Units are compact with no
  locale separators, since the text is pasted into reports and diffed by eye. Every attached
  display is listed and then the one the window is on as the renderer measures it, because a
  mismatch between them is itself the bug in a multi monitor or mixed DPI report. Chromium
  wraps the colour space in braces, which are dropped. Chromium reports several shades of
  enabled for GPU features; only the disabled ones are listed. Host adapter facts and the
  WebGL view share the graphics section because they answer the same question from two sides.
- `session-log/`: the tap subscribes to the log bus at emit time, so lines the ring later
  evicts still reach disk, and streams them in batches to the main process sink
  `Data/debug/session.log`. It is installed once at renderer boot on every launch. A batch
  goes out after a second of quiet or at 200 lines, so logging never costs one IPC round per
  line, and a failed send drops the batch, never the app. The `core` channel carries the game
  core's stdout and stderr, so its lines are tagged `[wasm]` in the file. The lookup of
  `appendSessionLog` is guarded: a non Electron host's shim makes it a no op, and a preload
  without the channel leaves the tap uninstalled. A last flush runs on `pagehide`.
- `useAllowDebugLogging.ts`: settings are not a reactive store during gameplay, so this polls
  the live snapshot the WASM bridge keeps primed, once a second like the navigation widget.
- `useDebugText.ts`: the text is collected when the caller mounts, not on click, so no await
  sits between the user's gesture and the moment the text is ready.
- `useDebugTextBuilder.ts`: one builder backs the About page's copy button and the bug report
  form's debug block, sourced from the platform facade. `__CAP_VERSION__` is injected at
  build time for the Capacitor build only, so it is always read through `typeof`. Host
  hardware exists only behind a main process.
- `useReportContext.ts`: the running flag lives in the app lifecycle hook, not a store, so
  the game UI store's mode stands in: `title` and `loading` are what it holds before a game
  runs and while one boots. A palace index of `0xFF` means the room is not in a palace.

## dialog-texture

- Twinkle gives every cell its own period and phase from a seeded hash, never
  `Math.random`, so the flicker is stable across frames. Most of each cycle is dark and the
  cell shows for a short window, like a light coming on.
- Cells are addressed by their index in an endless grid and placed at index times pitch
  plus the slide, so a sliding field never wraps: a cell keeps its seat, scatter and phase.
- Density (0 to 100, where 100 is the pattern's natural pitch) sets the pitch, scale sets
  the cell size, and scatter (0 to 100) nudges each cell off its seat and varies its size.
  At full scatter the grid is gone. The canvas is sized in device pixels and drawn in game
  pixels.
- A row pattern spans the whole width, so the walk skips columns and scatter moves rows.

## entrance-icons

A crossing's glyph follows the detector that produced it. A crossing to the surface shows
where it comes out, a crossing into another room shows what that room is. Stair links use
the exit door icon in gold, palace toggle walk boundaries use the secret door in purple,
and a door to a header travel slot uses the portal.

## hub/hub-session.ts

The Electron adapter keeps the device token in the OS keychain through IPC. A host with no
main process (web, mobile) always answers signed out. The choice is made once, on whether
`window.api` carries the hub channels.

## hub/hub-session.type.ts

`signIn` resolves once the browser confirmed, denied, or the code expired. The confirm page
opens on `site`, or on the Sanctuary when it is omitted. The account and the token are the
same either way. `subscribeDeviceCode` delivers the user code to confirm while `signIn` is
pending.

## hud/active-profile

Which profile the HUD stores read and write. The answer is tried in this order:

1. The profile the settings screen says it is editing. It is the one place that knows for
   certain, and it clears the value when it lets go.
2. The running game's profile. The bridge only knows it while a game runs, and the layout
   editor works without one.
3. The profile a launch is pinned to (`--profile`, the named instance flag), matched by id
   and then by name the way `useStartup` matches it. It comes before the app state because a
   pinned launch does not write `app.json`, so the app state names some other profile.
   Reading that one would load one profile's layouts while the screen edits another's.
4. The app state's last selected profile.

## hud/custom-glyph-store

A custom glyph pack is an override, never a replacement. It holds only the positions the
player imported and names a built-in `fallbackPack`, so a pack with four face buttons still
draws shoulders, triggers and the d-pad through the chain in `resolve-glyph.ts`. Images are
stored like user sprites: raw bytes in the platform FileStore under the profile's folder,
with a JSON manifest beside them. A stored file has no URL of its own on either host, so the
bytes are read once into an object URL and cached; `customGlyphUrl` is the synchronous
lookup a render pass needs. Files are flat, one per pack and position, so the file name is
the key.

## hud/layout-document-io

Player layouts use the same document format and the same loader (`loadLayout`) as the
built-ins in `shared/hud/layouts/built-in/`. They differ only by the `builtIn` flag. A
stored document that does not validate is refused, never repaired: it is dropped from the
list and its reasons are kept in `problems`, so a screen can say which layout is broken.
Layouts are validated on the way out too, because the editor's draft is not a document until
it passes. The store file is `hud-documents.json`, not the old flat format's
`hud-layouts.json`; nothing shipped in that format, so there is nothing to migrate. Saving
upserts by id. A fork gets a new id and records `basedOn`, which the editor's start from
list reads. An unknown id resolves to the shipped default, since a stale id in a settings
file is far likelier than a request for no interface.

## hud/slot-content.ts

Three facts meet here and nowhere else: where a control sits (the device's slot list), what
it fires (the per save assignment table), and whether the save holds that thing (the live
inventory). It is one pure function because the live HUD, the pause menu and the layout
editor (which runs with no game) all need the same answer; an earlier editor copy drifted.

- Glyphs are binding first: a slot rebound to a key draws that key's cap. The synthetic
  `DPAD` position stands for a whole control and resolves through the renderer's own table
  in `HudNodeRenderer.constants.ts`.
- Item art comes from `buildItemCells`, as in the pause grid, which covers all 24 HUD item
  ids including the two cells that share a save slot and the four bottles.
- The action button is contextual (talk, lift, open, dash), so it wears no sprite. Only the
  sword names a fixed piece of gear, drawn at the tier the save holds and always as owned.
- `items` are the 20 inventory bytes and `bottles` the 4 bottle bytes, as the core reports
  them. `packId` is the document's pack or `auto` to follow the device family.
- `filledSlots` feeds the engine's `dimWhenEmpty`, which dims a whole group at once.
- `signature` changes only when an assignment moves (swapping two items counts) or a
  different pad is plugged in, the two events the on change reveal exists for.

## input/axis-press-threshold

The single place where a raw axis reading becomes pressed, shared by live play (the SNES
bitmask, function hotkeys) and by binding capture (the raw input dispatcher). A trigger axis
(SDL's fixed `LEFT_TRIGGER` and `RIGHT_TRIGGER` indices) uses the family overridable
threshold the calibration screen shows (`shared/input/family/live-control-state.ts`,
`resolveTriggerPressThreshold`), never a second number. Any other axis, such as a stick
standing in for a direction, uses a plain deflection of 0.5. Device keys are `vid:pid` in
hex; a device whose SDL type was not recorded this session uses the generic threshold.

## input/binding-display

One source of truth for a binding's label and icon, shared by the controls editor rows, the
save state hints, `InputGlyph` and the controller overlays. A bound control always draws a
glyph: one row of bare text beside rows with art reads as broken. Device art is preferred
and comes through `icon`, but it is missing when the pad is unplugged or its family has no
picture for that control, and an axis never stored an icon because its glyph depends on which
end of the stick is meant. So the generic fallbacks are keyed off the binding's own shape,
and only `none` draws nothing.

## input/controller-card-info.ts

Name and family come from the SDL driven resolver (`resolve-device.ts`), never from a hand
written database. `sdlType` is carried for the controls screen's apply console defaults drag
and drop, which resolves the defaults through the family layer.

## input/controller-device-groups.ts

Groups the snapshot by vendor and product id, so an adapter that presents one entry per port
renders as one group with a port list. The main process suffixes `#N` to the device key of the
second and later devices sharing a vid:pid (`sdl3-device-key.ts`); that is read back to number
ports. Unclaimed listed devices sharing a vid:pid never get a suffix (only SDL claimed devices
go through the assigner), so arrival order is the fallback. A blank product name falls back to
the first group member that has one.

## input/controller-devices-store

Thin wrappers for the SDL3 device list IPC: the ready and unavailable snapshot, rescan, and
the user mapping database. They sit beside `controllers-store` (the cross platform
`ControllerHost` port) because this surface is desktop only and has no port yet.
`window.api` is always present (the real preload, or a generated no op shim). `listHidDevices`
is the raw HID enumeration, independent of SDL claim state.

## input/controller-family-cache

The SDL gamepad type of every controller seen this session, seeded from the snapshot and kept
live by `controller:devices` and `controller:added` (`seed-device-cache.ts`). Family display
metadata (icons, labels, console defaults) is keyed by this type, so this is the only way to
resolve it for a saved binding or a drag payload whose device is unplugged. Recording starts
once at module load and is never torn down; the cache outlives any screen.

## input/controller-hold-store

Drops SDL's exclusive claim so a raw HID open can succeed (the diagnostics byte capture), and
restores it afterwards so normal joystick input comes back. Desktop only.

## input/controller-input-store.ts

Holds each pad's button and axis state, calibration and the diagnostic log the InputTester
reads. Decoding belongs to the SDL3 native transport.

- `getDevicesThatHaveReported` is not the connected set: SDL emits state only on change, so an
  untouched connected pad never appears. Connection state is the device snapshot
  (`InputManager.hidDeviceCache`, status `ready`).
- `handleRawReport` takes one HID report while a diagnostic raw capture is open
  (`native-capture-store.ts`). Only one capture runs at a time, keyed by vendor and product,
  so the `vid:pid` device key is rebuilt here.
- `rawSticks` are the raw 12 bit stick values `[lx, ly, rx, ry]` before calibration, for the
  calibration UI; `rawBytes` are the report bytes for the debug UI.
- The store is exposed as `window.__controllerInputStore`.

## input/controller-name-cache

Names for every controller seen this session, seeded from the snapshot and kept live by
`controller:added`. An event only listener never learns the name of a device connected before
it subscribed, since that device announces itself once. The OS product string is no
substitute: devices reached over a raw USB interface report it empty, which is how a pad
shows as "Unknown Controller". Names are keyed by device key and by vendor and product, since
a caller with a raw device list has ids but no device key. Blank names are ignored so a later
real one is not shadowed. Recording starts at module load and only listens.

## input/controllers-store

The facade for haptics and decoded controller state (the `ControllerHost` port) and for
calibration (FileStore). Raw HID enumerate, read and write have no desktop implementation any
more, because SDL3 claims every controller.

## input/device-detector

SDL3 is the only controller transport on every platform (the Gamepad API path is gone), so a
device is an SDL entry or the keyboard, and there is no activation step. The keyboard's
`sdlType` of `keyboard` is not a real SDL type but a stable sentinel, so the apply defaults
drag can tell it from a gamepad. Mice, trackpads and touchpads are filtered out by name.

## input/device-scoped-map

A binding lookup keyed by the device that created it, then by the binding key (a button
index, or `axisIndex:direction`), so a binding recorded on one pad never fires from another
pad with the same index. A binding with no source device (console default presets never stamp
one) is filed under `ANY_DEVICE` (`*`) and matches every gamepad.

## input/frame-router.ts

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
   an item the save actually has, the equipped item register is written first. The core reads
   the register on the frame Y is pressed, so writing it after the mask would fire the
   previous item once on every switch. An active item of 0 means leave the core's own item
   alone; it is not an item id.
3. Classic, menu closed. The console mappings become a bitmask that still goes through the
   strategy table, because `mapOnSelect` is a real setting and its swap lives there.

The fallback lens is the profile's core verbs alone, which every profile carries (contract
section 5). Its slots are empty, since under classic a slot is not something the player can
fire.

## input/function-actions.ts

Shortcut and cheat bindings fire callbacks on rising edges from keyboard and gamepad. Saved
mappings are merged with the defaults so a newly added action always has a binding. Gamepad
maps are scoped by owning device. `clearHeld` releases every held action, so a hold style
action (turbo) is let go even when its release is lost while input is suppressed mid hold.

## input/haptic-bridge

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

## input/input-manager

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

## input/item-ownership

Does the live save hold this item? The scheme layer is pure and has no inventory, and
assignments are stored per profile, not per save, so a fresh file inherits buttons pointing at
items it never found. Pressing one used to park the equipped item register on an item the
save does not have, while the pause menu refused that same cell. The answer is
`buildItemCells`' own `owned` flag, the same function the pause grid and `planAssignment` use,
so the press and the menu cannot drift. It lives in the input layer because the router is the
only place holding both the pressed slot and the live state. The UI store publishes a new
inventory object on most frames, so identity is useless as a memo key; the 24 bytes are
compared instead and the cells rebuilt only when the inventory moved. Item ids are 1 to 24.

## input/migrate-profiles

The door every stored input profile comes through, and the only place a slot list written
before contract section 19 (position derived ids such as `slot:NORTH`) becomes numbered
slots. Profiles are read as `unknown` and cast; without the migration a stale list would pass
as the new shape with every `index` undefined. It fails loudly: a shape it cannot read throws,
and the profile is dropped from the session, not half loaded, so nothing overwrites the file
and the assignments can still be recovered. An empty list would look like "never made any",
which is the silent loss the rule prevents. One unreadable profile does not cost the others.

## input/native-capture-store

Wrappers for the SDL3 diagnostic capture IPC: raw HID bytes and joystick level button, axis
and hat samples, keyed to whichever capture the gamepad diagnostics wizard has open. Desktop
only.

## input/pause-manager.ts

Pause state for a controller disconnect or a manual toggle. It only emits events; audio is
handled by subscribers. `connectedKeys` is passed in, not read from the device cache, which
lags a disconnect by a refresh cycle. A disconnect pause resumes only once every mapped device
is back, so an unrelated controller cannot dismiss the overlay, and a manual pause is never
touched by presence checks.

## input/polling-engine.ts

Computes the SNES bitmask each frame from keyboard state and HID state. Keyboard keys count
only when the active profile binds the keyboard, and only devices in the profile's map
contribute.

## input/process-controller-state.ts

SDL3 controller intake. The native addon already decodes and factory calibrates reports into
normalized values, so the old per device HID parser is bypassed. Trigger calibration applies
here, on the normalized 0 to 1 range of the trigger axes (from `LEFT_TRIGGER` on); sticks
arrive normalized to -1 to 1.

## input/profile-devices

The whitelist the input engine gates on: a keyboard when the map has keyboard bindings, and
gamepads whose vid:pid appears in the map or as the assigned device. A connected but
unmapped controller contributes nothing. Keys are lowercase, four hex digits each.

## input/profile-utils

`resolveIconByVidPid` resolves a saved binding's icon through the family layer. The device
need not be connected, only its SDL type from this session's family cache; a live SDL type
fills in when the cache has no record (a device that connected before the cache listened). It
builds the synthetic profile that assumes every position is present, so a binding index always
lands on the same slot whatever a live unit has. A trigger axis shows its own glyph; a stick
axis shares one base key between X and Y, so the binding's axis and direction pick one of the
four pushed glyphs.

## input/raw-input-dispatcher.ts

Rising edge events for any key, button or axis on any device, for the rebinding UI and the
input tester. Keyboard presses call `emit` directly.

## input/resolve-bindings

A profile resolved into the two lenses the router reads. The modern lens maps physical
controls to assignable slots and only the modern scheme uses it; a pad profile whose pad is not
connected and has no stored record resolves to null, so a disconnect means no slots, not
phantom ones. The core lens is the ten verbs, four of them the menu's, and it exists under both
schemes (contract section 5), because the pause menu can be open under classic and its verbs
are the only way out. The modern lens is built on the core lens, so a core and a slot list can
never disagree about who owns the d-pad. Core resolution order: `profile.core` (where a core
rebind lands), then the modern block's copy, then the device defaults. The slot list is the
player's, stored on the profile (contract section 19); `effectiveModernBindings` falls back to
the device prefill only for a profile never edited.

## input/resolve-device.ts

The single resolver both the calibration cards and the controls screen use. SDL's own
`hasButton`, `hasAxis` and `buttonLabels` decide what exists; the family layer only decides
labels and icons. No preset and no device database is consulted, so the screens cannot
disagree. An unavailable entry was never opened by SDL and resolves to an empty control list.

## input/resolved-axis-groups.ts

Pairs stick axes by position name (`LEFT_X` with `LEFT_Y`), not array order, so a device
reporting one axis of a pair does not misalign the rest. `basePrefix` is the icon key both
axes share; feed it with the live x and y to `resolveStickDirectionIcon`.

## input/scheme-runtime

Everything the per frame router needs about the active scheme, in one mutable object. The
scheme, the bindings and the per save assignments change at different times (profile,
settings, pause menu), but polling runs sixty times a second and must not ask any of them, so
they are pushed here.

- `menuSink` is the routing switch: while open, the pause menu owns input and receives rising
  edges; the store that owns the menu opens and closes it.
- `core` holds the ten core verbs under either scheme, which is what makes the menu answerable
  to a classic profile or to a modern one whose pad is missing. `mapOnSelect` is classic only
  (the map opens on Select instead of X) and is carried so the remap is called uniformly.
- Edge baseline: normally last frame's read, but after a handover (menu open or close, a scheme
  change, a rebuild of the bindings) it is seeded from the current read, never cleared. A
  cleared mask claims everything was up, so the button still held would rise as a fresh press:
  the press that opened the menu would close it again, and leaving the menu would hand the game
  a phantom press. Clearing made a normal press on pause a soft lock.
- `onSchemeBindings` fires at once with the current value, because bindings resolve at boot,
  before the modules that care are loaded. The renderer draws the button cluster from the
  resolved bindings, not the profile, since a profile never opened in the controls screen has
  no `modern` block.
- Resolutions are compared by serialized value: the device snapshot is re-taken on a timer and
  every resolution is a fresh object, so identity would reset the edge source under a held
  button and redraw the cluster each second. The core lens is compared on its own, since it can
  move while the modern lens does not.
- The input sample includes only allowed devices, like the classic path. The trigger threshold
  is the first allowed pad's, since a mixed pad session shares one reading.

## input/seed-device-cache.ts

Seeds a per device cache from the controller snapshot, then keeps it live with
`controller:devices` and `controller:added`. Three caches once listened to
`controller:added` alone and never recorded a device connected before they subscribed. Snapshot
entries and added events both satisfy `DeviceSnapshotFields`; `remember` decides whether an
entry carries enough to record.

## input/snes-button-glyph.ts

The picture and name of whatever input a SNES button is bound to: keycaps for a keyboard
profile, the pad's own face buttons for a controller profile, resolved like the Controls
screen's rows. An unbound button falls back to the SNES button's own picture.

## input/useControllerDevices.ts

Device list state for both input diagnostic screens. A rescan stays pending until the next
snapshot arrives or three seconds pass, so a rescan click never looks like it did nothing.
There is no loading flag: the main process serves `controller:list` from a cache it keeps
current (`sdl3-source.ts`), so the first fetch resolves in well under a millisecond.

## input/vibration

A transport free vibration call. SDL3 batches frame writes through the main process worker for
every gamepad; the Gamepad API vibration path is gone. Default intensity is 0.7.

## instance

The renderer's view of the named instance flags (`--instance`, `--profile`), forwarded by the
preload as `api.instance`. A named instance is an automated launch running beside the user's
own app: it is marked on screen and boots into its own profile, and it must not write files
every launch shares (see `setLastProfile` in `storage/profile-store.ts`). Values are read at
call time, never cached; `window.api` is installed before render. `isAutomationLaunch` is
true for any automated launch, named or not. Such a run must not change which profile opens
by default (`app.json`) or where the window sits, and gating on it means a run that forgot
`--instance` still cannot damage the user's setup.

## log-bus

- The ring keeps 1000 entries, enough for a whole randomizer session start burst (a full
  plan application logs about 500 entries).
- A listener that throws is skipped so it cannot break the bus.
- Every entry is mirrored to the native console, unconditionally, so the main process file
  logger (`apps/desktop/electron/lib/dev-file-logger.ts`) captures the channels. It used to
  depend on `import.meta.env.DEV`, which is fixed at build time, while the file logger
  attaches on `is.dev` at run time; an unpackaged run of a production bundle then wrote no
  channel lines, the one case a crash log is for.
- WebAssembly `RuntimeError`s are left to the lifecycle crash handler and never logged by the
  global handler: they would flood during the game loop.
- `window.__logEntries` and `window.__logSubscribe` are exposed for Playwright and devtools.
  A burst safe capture needs a listener, since the ring drops old entries.

## msu/build-channels

Turns a pack manifest into the four channels the engine drives. Music comes from `tracks`,
the other three from `sounds`; a pack with no sounds gets three empty channels. Music and the
ambient bed follow the music volume and the effect channels follow SFX; the bed has its own
group so a storm can sit under quiet music. Each channel keeps 48 decoded programs: music
tracks are minutes of PCM, so a handful covers area churn, while effects are short and a
channel may cycle through dozens in a fight, so keeping more beats decoding a bonk per hit.
Effects have no per trigger callback, since logging every trigger would bury every other
diagnostic; the channel's `report()` is how the studio watches them. Music restarts on a
repeat: the game's own repeats are filtered before they arrive, and the one that does arrive
follows a fade to zero and is meant to bring the music back.

## msu/channel

One replaceable sound chip channel, in the two behaviours the game needs. Music and the
ambient bed are stateful (a new id replaces the old and has a position worth resuming); the
two effect channels are additive (a new id layers over what is sounding, nothing resumes).
The engine holds four channels and never asks which is which.

## msu/channels/active-layers

Builds, reads and tears down the layers of one sounding program: a gain at the layer's
volume, a scheduler for its play mode, and a voice factory bound to that gain.

- `chance` absent or at least 100 always sounds (every layer authored before the field
  existed). Every roll goes to the debug bus, because a lost roll starts nothing and the bus
  is its only record. A thinned layer is skipped outright, not started silent, so it holds no
  voice or timer and never shows as sounding.
- The chain is volume, then the layer's effects, then the channel. Effects sit on the layer
  because the chain is where one recording becomes its indoor or distant version.
- The loop start applies only to a single file layer; a pool restarts every file from its
  top. The exporter follows the same rule, so a pack sounds the same either way.
- The resume callback gives a music layer its resume snapshot and an additive layer the file
  picked for this trigger; the file count is what decoded, possibly fewer than authored.
- A set is finished when nothing is audible and nothing is scheduled. A random or interval
  layer between events reports a countdown, so it is never swept mid cycle.

## msu/channels/additive-channel.ts

Every trigger layers over what is already sounding, as the two effect channels do: each
trigger gets its own voices and gain path, so ten hits in a row are ten overlapping sounds.
Reusing the stateful behaviour would make rapid effects clip each other mid sample. Nothing is
resumable; a save has no half a bonk to return to.

- At most 16 trigger sets sound at once per channel. The sound chip had eight voices for
  everything, so a real pack never comes close; the cap is for a long file authored onto a
  rapid fire id, which would otherwise stack a set every frame. Over the cap the oldest set
  goes, since the newest is the one the player just caused.
- The game's pan bits arrive on the channel write: `0x80` left, `0x40` right, anything else
  centred. Only additive channels honour pan; a bed re-panned mid loop would need its graph
  rebuilt. A centred trigger feeds the channel gain directly.
- Only a stop bumps the generation, so a decode still in flight cannot spawn after teardown.
- Finished sets are swept before counting, so the cap counts what is audible. The report
  describes the newest set, the sound that just landed.

## msu/channels/channel.type.ts

- `fadeNode` is the gain the game's own volume transitions act on. Only music is ever sent
  one; the others hold it at full so every channel has the same three stage gain chain.
- `restartOnRepeat`: off, selecting the id already playing is a no op (the chip's behaviour
  for a port rewritten with its own value, which the ambient bed needs); on, it restarts,
  which music needs after a fade to zero.
- `resumeEnabled` is read per selection, so a mid session toggle applies at once.
- Programs sharing a `group` hand playback across on a switch (`MsuSoundDef.syncGroup`).

## msu/channels/stateful-channel.ts

A new id replaces what is playing (music, the ambient bed). A generation guard stops a slow
decode from resurrecting a superseded id. The position is captured on the way out, so leaving
an area remembers where its audio was, and the gain returns to full the moment something
starts. Id 0, or an unauthored id, means silence.

- A repeat of the playing id is a no op unless `restartOnRepeat`: the game rewrites the ambient
  id on every screen transition, so otherwise the rain would restart at every edge. Music's
  only repeat follows a fade to zero, and only a fresh start brings its gain back. A repeat of
  the id still decoding is absorbed the same way, since the game writes ambient ids in bursts
  and a second write would supersede the first start and the position it carried.
- When the outgoing and incoming ids share a sync group, layers are matched by what they play
  (files and mode), not by id, and a matched layer continues from its exact position, pending
  timer included, so a storm crossing a doorway keeps its rain and its next thunder. This
  continuity outranks the resume setting.
- Positions are always recorded; the resume setting only decides whether re-entry uses them.
  `forget` clears them without touching what is sounding.
- The studio polls `report` so a random scheduler's wait shows as a wait, not an unexplained
  silence.

## msu/channels/trigger-pool.ts

Which file each layer of an additive channel uses for this trigger. A sword swing authored
with four recordings should sound like four recordings. The variation belongs to the trigger,
not the play mode, so it is chosen here and handed to the scheduler as the starting file; the
continuous modes already draw from their own pool. A file is drawn from every file except the
one the layer just used, since the same sample twice reads as broken variation. It is
deliberately unseeded; only the exporter, which must produce the same bytes twice, needs a
seed.

## msu/debug-bus

The engine's own diagnostic feed for decisions no live report can show. A channel report
says what is sounding and the core's sound trace says what the game raised; the chance roll
sits between them, and a layer that lost its roll appears in neither. Without this feed a 10%
thunder looks like a broken one. It lives outside React and is always on: publishing to
nobody costs nothing, and a bad listener never breaks playback. A roll event names the
channel, the program (track number or sound id), the layer and its odds (1 to 100).

## msu/decode

- `decode-audio-file`: three paths, picked from the file's leading bytes, not its name.
  MSU-1 `.pcm` is raw samples converted here (with a loop point in its header); `.opuz` is
  Opus in the decompilation's own container, repackaged as Ogg so the browser can decode it
  (with a loop point too); everything else goes to the browser's decoder (wav, mp3, ogg,
  flac, opus). An AudioBuffer keeps its own sample rate and the graph resamples to the
  device rate, so the C player's bug of 48 kHz audio playing fast cannot happen here.
  `decodeAudioData` detaches the buffer it gets, so it is handed a copy; the caller's bytes
  may be a view into an array we do not own. `loopSample` is in samples at the buffer's rate.
- `decode-opuz.ts`: `.opuz` is played by repackaging, not by decoding ourselves. Its payload
  is ordinary Opus and Chromium has a decoder that only lacks this container, so each range's
  packets are wrapped in an in memory Ogg stream. Each range is its own stream because a range
  is a seek, and the decoder must start clean, as the C player reset its decoder before every
  seek. Dropped samples are trimmed here, not declared as pre-skip, so trimming happens once.
  Ranges are laid end to end into one buffer, which turns the container's jump back into a
  plain loop point. Decoding uses a private 48 kHz context so no resampling shifts sample
  counts.
- `ogg-crc32.ts`: Ogg's CRC-32 shares only the polynomial (`0x04c11db7`) with the zip and PNG
  CRC: it reflects neither input nor result, starts from zero and applies no final xor. A
  stock CRC gives a number a demuxer silently rejects, and the stream decodes to nothing. The
  checksum covers the whole page with its own four bytes set to zero.
- `ogg-opus.ts`: wraps bare Opus packets in an Ogg stream so the browser can decode them, with
  no codec, library or wasm. The layout follows RFC 7845: `OpusHead` alone on the first page,
  `OpusTags` alone on the second, then audio. A page states its length as lacing bytes (255
  per full 255 bytes, then the remainder, so an exact multiple needs a trailing zero) and
  holds at most 255 of them. Packets are at most 1276 bytes and never split across pages.
  Granule positions count 48 kHz samples from the start, and the last page must be flagged end
  of stream or a demuxer keeps waiting. The head uses output gain 0 and channel mapping family
  0 (mono or plain stereo); the tags packet has no user comments.
- `opus-packets.ts`: a packet's length comes from its TOC byte: mode and bandwidth in the top
  five bits, frame count in the bottom two (code 3 puts the count in the next byte). Frame
  sizes are 10, 20, 40, 60 ms for speech configs (0 to 11), 10 and 20 ms for hybrid (12 to
  15), and 2.5, 5, 10, 20 ms for music configs, all in 48 kHz samples.
- `parse-msu1`: the MSU-1 `.pcm` container is the 4 byte "MSU1" magic, a 32 bit little endian
  loop point in samples, then interleaved signed 16 bit little endian stereo at 44100 Hz. Every
  MSU-1 emulator and flash cart reads it, so it is what we parse on import and write on
  export. A loop point past the end resets to 0.
- `parse-opuz`: the upstream `.opuz` container, built so a player can seek to the loop point
  without decoding from the top. All fields are little endian. `+0` u32 magic "OPUZ"; `+4` u32
  unused here (the sibling `.pcm` keeps its loop point there); from `+8` a range table of ten
  byte records: u32 file offset of the range's packet stream, u32 samples to play, u16 flags
  (bits 0 to 13 samples to drop first, bit 14 looping restarts here, bit 15 after this range
  jump back to the bit 14 range). A record without bit 15 continues at the next record; an
  offset of zero ends playback. Ranges may overlap, because the loop range starts a little
  ahead of the loop point and its drop covers the difference, which lets the decoder resume
  without a seam. A packet stream is u16 framing (bits 0 to 14 length, at most 1275; bit 15
  means the first byte was left out and is `0xFC`) then the packet. `0xFC` is fullband stereo
  in 20 ms frames, which nearly every music packet uses. Audio is always 48 kHz stereo.

## msu/engine.ts

The single entry point for replacement audio; nothing above it touches an audio node. The
gain chain, innermost first: per layer volume, the game's own fades, the volume group (music
and ambient follow the music slider, effects the SFX one), then the shared output. The stages
are separate so a fade cannot clobber a user setting and the reverse.

- The ambient bed has its own volume group: it is neither music nor a one shot, and the
  setting exists to hold a storm under a quiet piece.
- The game's music control byte: below `0xF0` selects a track (0 is silence), `0xF1` to `0xF3`
  are volume transitions, and the rest of `0xF0` and up only concerns the sound chip.
- A track faded to silence is still active in the graph, but reporting it as playing would make
  the game skip the re-select that brings the sound back, so a faded track answers not playing.
- The title reset runs before the select, so the track this event starts begins fresh.
- Track ids are remapped (deluxe packs) before comparing, so two areas sharing one vanilla
  byte compare as different music where the pack differs.
- Game sounds arrive on channel index 0 (ambient), 1 (sfx1) or 2 (sfx2); only claimed ids
  arrive.
- A save's audio snapshot holds music plus the bed; effects have no position. On restore an
  `ambient` of `undefined` comes from a snapshot taken before beds were resumable and leaves
  the bed alone, while `null` means the save had none.

## msu/export

- `dedupe-files.ts`: packs collect byte identical duplicates (a `wind.flac` copied per area, a
  silent stub under a dozen names); storing one copy is free and on a gigabyte pack decides
  whether it can be shared at all. The map covers every referenced name, so a manifest rewrite
  maps each reference unconditionally. A missing file aborts the export with its name, rather
  than producing a pack that fails on import.
- `export-msu1`: a plain MSU-1 set for other players, named per the SD2SNES convention
  (`<base>.msu` plus `<base>-<track>.pcm`), which snes9x 1.55 and up, bsnes and higan, the
  FXPak and MiSTer all look for. The `.msu` file is an empty marker. Layers cannot survive (MSU-1
  is one stream), so every track is flattened first. A track whose files are all missing is
  skipped, since a header only `.pcm` would play silence. Entries are stored, not deflated: PCM
  barely compresses and a set is gigabytes. The stem becomes a filename, so path characters are
  removed. One decode per distinct filename per track.
- `export-msul`: `.msul` is our own container and the only format that keeps a pack whole
  (layers, play modes, volumes, loop points, metadata). It is a plain ZIP under another
  extension, so a user can rename it and read `pack.json`. `pack.json` is the first entry (a
  reader identifies a pack from the head of the file) and the only deflated one; audio is
  stored. Every file in the pack folder is stored, wired or not, since an export that followed
  references alone once left an unwired bed behind. Referenced names come first so dedupe keeps
  a wired file under its own name and drops the unwired copy. The manifest is serialized by hand
  so `modifiedAt` is not restamped; export must be reproducible. The rewritten manifest's
  `files` is the archive's own inventory. A later pass may transcode per layer Opus presets
  between dedupe and entry building; dedupe has to stay ahead of it so identical sources encode
  once.
- `fade-envelope`: the same envelope `voice.ts` gives a live voice, duplicated on purpose because
  the two run on different clocks (live starts at `currentTime`, offline at a computed time). Any
  change to the voice envelope must be mirrored here or an export stops sounding like its
  preview. A fade out never starts before the rise finishes. No fade means no gain node.
- `flatten-track`: MSU-1 is one stream on one track register, so export mixes the layers
  offline at 44100 Hz; layering survives only in `.msul`. Every random choice comes from a PRNG
  seeded by the track number, so two exports of the same pack are byte identical. The loop
  point is normally 0: the render window is one pass of the loop layer. The exception is a track
  whose body is a single file with its own loop point (every classic pack track): that layer
  renders as one pass and its loop point goes into the header, so the player does the
  intro then loop natively. Other layers in the intro region are heard only on the first pass,
  which suits a sting and thins an ambient layer. A crossfaded loop layer exports with loop point
  0, since live crossfading restarts each pass from the top by hand; every crossfade inside the
  cycle is reproduced and the wrap from the last frame to frame 0 is a hard cut, the same seam a
  zero crossfade pack has. Fading the ends would dip at every loop, and folding the tail into
  the head only works for a sequential pool.
- `layer-window`: the loop layer's pass is the loop period; other modes are placed inside it. A
  track with no loop layer uses the longest span any layer occupies. The render is capped at
  ten minutes because a manifest is user authored. Crossfades are floored at zero and otherwise
  taken as written (the editor's ceiling is not re-applied, or a render would stop matching its
  preview), and clamped per file to half its length like the live scheduler. A crossfaded cycle
  is shorter than the sum of its files by one window per file. The dominant loop layer is the
  longest one, the only one whose loop point can survive the flatten.
- `place-source`: the primitive every export mode schedules through. A fading source gets its
  own gain node, like a live voice. At most 4096 sources per layer, so a zero gap cannot spin
  forever. `singlePass` plays the pool once for the layer whose loop point is carried into the
  header.
- `prng`: mulberry32, because `Math.random` cannot be used on the export path. One stream per
  layer is derived from the track seed, so adding a layer or changing a file count does not
  shift the choices of the layers beside it.
- `remap-manifest`: the half of dedupe that is easy to get wrong. There are exactly two
  reference sites, a layer's `files` and the cover image. Layers live in both the music slots
  and the sound channels, so the walk goes through `mapLayers`; an export that listed only the
  tracks once shipped a bed naming a file that was never written. An unmapped name keeps itself.
- `schedule-layer.ts`: unrolls each live scheduler's rules into start calls. `random` waits a
  gap before its first event, like the live one; the gap is drawn either way so
  `waitForCompletion` changes only spacing, not the sequence of choices; waiting for completion
  measures the gap from the end of the sound. `interval` walks its offsets as a cycle as long as
  the last offset, each offset using the file at its position; offsets all at zero fire once.
- `schedule-loop`: without a crossfade, passes butt together and a single file repeats from its
  own loop point (a manifest loop point is in 44100 Hz samples whatever the file's rate); a
  pool restarts each file from its top. With a crossfade, a pass starts one window before the
  previous ends and rises while that one falls; the outgoing fade lasts the outgoing file's
  window and the rise the incoming file's; every pass starts at the top of its file; the opening
  pass does not rise. Random order never repeats a file twice running.
- `write-pcm`: the inverse of `parse-msu1`. The loop point is in frames (a left and right pair),
  not bytes. Always stereo (mono is duplicated, wider keeps the first two) and always 44100 Hz.
  Samples are clamped before scaling by 32768, since a hot mix would otherwise wrap into the
  opposite polarity as a click. A loop point past the end is clamped.

## msu/fade

The game asks for volume transitions with three control bytes, not a level: `0xF1` fades out,
`0xF2` ducks to a low level, `0xF3` returns to full. Each has its own speed, a per frame step
out of 256 at 60 frames a second, converted to a ramp duration so a fade takes the same wall
time as on hardware. A starting track returns to full at the fastest step (24).

## msu/layer-effects

Every effect is one or more biquad filters, the whole vocabulary the manifest allows, so it
plays the same everywhere and can be flattened into an export. The three band EQ is a low shelf
at 250 Hz, a peak at 1 kHz (Q 0.7, about an octave and a half) and a high shelf at 4 kHz. An
empty chain is no nodes at all.

## msu/schedulers

The strategy seam for layer playback: each play mode is one scheduler, and `create-scheduler`
is the one place modes map to behaviour.

- `once`: plays one file and stops; a finished one shot resumes from the start, not its tail.
- `loop`: one file loops on itself; several play in order or shuffled, never the same file twice
  running. `single` ignores any crossfade. With a crossfade the passes are chained by hand
  (each fades out over its last window while the next rises), giving up gapless native looping,
  so a zero crossfade keeps the simpler path. Repeats start at the loop point, since the intro
  plays once. The position readout follows the newest voice, and the reported loop point is the
  scheduler's own, since a crossfaded buffer does not loop.
- `random`: fire, wait a random gap, fire again. The gap is measured from the start of a sound by
  default (long sounds overlap) or from its end with `waitForCompletion`. Resume keeps only the
  remaining gap, so the next event is not bunched against the previous one. While waiting for a
  sound to finish there is no countdown to show.
- `interval`: fires at fixed offsets from the track start (a thunderclap eight seconds in),
  repeating as a cycle once the last offset passes; wrapping gives a gap of cycle minus previous
  plus next. The offsets are sorted and deduplicated because order is meaning. With one file per
  offset each offset gets its own sound. Resume re-enters the cycle at the same point.
- `LayerContext.loopSeconds` is where each repeat starts, from the manifest or the file, and is
  zero unless the layer has exactly one file, matching the exporter.

## msu/sound-claim

Which sound ids a pack claims on a channel, as the 64 bit mask the core wants. The core reports
only a sound whose bit is set, so the mask decides whether the app replaces an effect or the
chip plays it. It travels as two unsigned 32 bit halves because that is what a `ccall` can
carry; bit 31 makes a JS int negative, so each half is converted to uint32. Ids outside 0 to 63
are dropped, never wrapped, so a typo claims nothing. Channels are in the core's index order:
ambient, sfx1, sfx2. Only sounds that author at least one layer are claimed.

## msu/title-reset

Replacement audio goes back to nothing at the title. Resume positions carried across runs would
start the opening in the middle of itself. The game ends a run by reloading the sound chip's
song bank, which stops the chip's ambience without raising the no bed id, so a storm would keep
raining over the title. Reaching a title module is the one unambiguous signal that no run is in
progress, and save and quit, a game over and a hard reset all arrive there. The modules are the
core's own dispatch order (`kMainRouting`), the same set `game/ui-bridge-parser.ts` reads as the
title UI mode: intro (0), file select (1), copy file (2), kill file (3), name file (4) and the
attract demo (20). Music is not silenced: every path to the title fades it out first
(`Death_Func31` and `FadeMusicAndResetSRAMMirror` write the fade byte the same frame), so a cut
would replace that fade with a click. Silencing happens once on the way in; forgetting
positions happens on every title event, since the title loops into its demo and back.

## msu/track-loader.ts

Audio is decoded per id, on demand: a real pack is over a gigabyte of PCM and only a few ids
sound at a time. Decoded audio is cached so re-entering an area or repeating an effect does not
decode twice, capped so a long session cannot grow without bound. One loader per channel, so a
busy effect channel cannot evict the music. A layer whose files all failed is dropped rather
than left to play silence.

## msu/voice.ts

One sounding buffer that can report its position, which Web Audio does not expose; that read is
what makes resume possible. A voice asked to fade gets its own gain node, so two passes of a
loop can move in opposite directions without touching the layer's volume. The manifest's loop
point overrides the file's: it is what gives a `.wav` or `.mp3` the intro then loop structure
only an MSU-1 header can carry. It is in seconds, because a manifest loop point is defined at
44100 Hz while a `.pcm` header's is in the file's rate; the caller converts. An MSU-1 loop point
is normally not zero (an intro plays once, a body repeats), so the position jumping back there is
the file working as authored.

## randomizer-placement-io

Typed wrapper around `profiles/<id>/randomizer.json`. The placement is written under a schema
stamp and read back only under that same stamp; a file under any other stamp reads as
absent, so the caller generates a fresh seed. There is no migration and no key map: the
stamp is bumped whenever the placement's shape or its location keys change.

## sanctuary/github-handle.ts

The linked GitHub login is the one identity a filed issue mentions.

## sprites/apply-sprites-for-rom.ts

The enhanced HUD reads sprites from the shared base, so the base must always track the ROM
in use. A set that was already available and is rewritten moves the revision, because the
extraction clears the folder before writing it again and every URL on screen fails for the
duration. Only the ROM still active gets its flag refreshed, so a profile switch during an
extraction cannot let the old ROM's result overwrite the new one. One log line per run names
the base, the verdict and the file count, so a listing stuck on placeholders can be
diagnosed from `session.log`.

## sprites/ensure-sprites-extracted.ts

Extraction runs at most once per ROM per session. Concurrent callers (startup, profile
select, boot) share the in-flight promise, and a finished run, successful or not, is not
repeated on the next profile switch. The manual buttons keep their own path.

## sprites/sprite-rom.ts

With no active profile (a first run, a missing pinned profile, the profile creation form), a
ROM that is ready to play stands in, so views that draw item art do not show placeholders
over a set that is on disk.

## sprites/useSpriteRevision.ts

Sprite URLs carry the revision. A view that memoizes them recomputes when the revision moves,
or it keeps serving the URLs that failed while the folder was being written.

## storage

Each store binds a library in `shared/storage/` to the platform FileStore and mirrors the
old `window.api` method names, so call sites swap one for one and persistence runs per OS
through the platform layer.

## storage/assets-store

The `.dat` is checked and loaded over FileStore and extracted in a Web Worker: ROMs and
language sets are read here, the worker bakes them, and the base blob plus one sidecar per
optional cartridge are written back. The base and each supplement are separate files, so
rebuilding the base never destroys a supplement; they are joined only when loading, because
the core expects a single buffer. The bake pulls in the whole dialogue compression path,
which belongs off the UI thread.

- A missing blob is not stale. The missing file path already recompiles; staleness only
  concerns a blob that exists but predates the current bake format (`bake-version.ts`).
- A supplement whose cartridge is gone must not linger as a stale sidecar.
- After a bake, anything already running booted with the previous blob and is now behind,
  so the game assets store is told.
- `recompileAll` rebuilds every ROM that already has a cached `.dat`, after a language set
  changes.

## storage/audio-probe.ts

ffprobe is a native process and only runs in the main process. On a host without that IPC
surface (mobile, browser) the probe resolves null, which callers already treat as nothing
knowable, so no caller needs a host check.

## storage/extraction-client.ts

One Web Worker per job.

## storage/import-progress-bus

Import runs in the renderer over FileStore, so progress is published on this bus, never as a
main process IPC event. `useImportProgress` subscribes to it.

## storage/languages-store

- Saving, creating and duplicating a set all rebake every blob, which is expensive, so
  callers debounce edits.
- `getLanguageSetFont` returns the set's glyph tiles plus its per glyph advance table and
  never rebakes, so a preview can ask freely. `exportLanguageSet` packs the set folder as
  `.rlang` and never rebakes either.

## storage/link-sprites-store

Validation is per container: a ZSPR by its magic, a sprite pack by being a readable zip with a
manifest, so a mislabelled file is rejected on import, not at boot. `writeLinkSprite`
overwrites in place for the studio's save and skips the rename that import applies.

## storage/menu-text-store.ts

The menu, credits and closing caption bodies are decoded on demand from the player's own
ROM. They are not in a language pack (the extractor copies their bytes undecoded) and are
game derived text, so they may never be committed. Results are cached per language because
reaching them means reading a whole ROM. The set's own language is preferred, but another
region's ROM still shows a translator what each slot holds, and the answering language
travels with the result. A ROM the pipeline cannot read is skipped. No matching ROM is an
ordinary state, not a failure.

## storage/msu-store

- `listMsuPackEntries` lists every file in the pack folder except the manifest; this is what
  an export stores.
- The audio probe is passed to the metadata read unconditionally. It answers null when no
  decoder is installed, so the encoded rows stay unfilled.
- `canTrashMsuPack` is true when a deleted pack goes to the system recycle bin and false when
  it is removed for good.
- The import result type comes from `msu-contract`, so the renderer cannot fall behind what
  an import reports.

## storage/profile-store

`app.json` decides which profile opens by default and is shared by every launch. Loading a
profile for play writes it on each run, so `setLastProfile` does nothing on any automated
launch, named instance or not; otherwise the user's next normal launch would resume an
automated run's profile. The gate sits at this single seam so no call site can forget it.
`updateActiveInputProfileId` merges the active input profile id into the config without
clobbering other settings, for the profile cycle shortcut outside the settings screen.

## storage/roms-store

Import runs in the renderer (pick or download, unzip or raw, then FileStore) and reports on
the import progress bus. Every import names its kind. The base cartridge boots the game; a
supplement only adds to one, is digest checked before it is written, and never replaces a
file already there.

## storage/saves-store

Every save state leaves through one of the four writers (quick state, normal save, its
overwrite, auto save), so the version and format stamp is applied there and not at each call
site. SRAM is excluded: it is the game's own save file and has nothing to do with snapshot
layout. Screenshots come back as base64 strings.

## storage/sprites-store

The sprite base URL comes from the platform (`app-sprite://` or `convertFileSrc`). A build
without sprite definitions extracts nothing and can never call a set stale. The staleness
rule itself lives in the shared store (`sprites.isStale`); this side only supplies what this
build emits. The capacity, gear, quiver, pool and shop price symbol reads return the binary
from the ROM's extracted set, or null before it exists.

## storage/ui-views

The single boundary for durable view state, keyed and app level, not per profile (see
`shared/ipc/ui-views-contract.ts`). Nothing else touches `window.api.uiViews`; a composite
that wants persistence goes through `useViewState`. The whole map loads once and is cached,
every mutation rewrites the whole map, and writes are fire and forget: a failed write logs and
is dropped. Rapid saves collapse into one write about 400 ms later. A save before the map has
loaded waits for the load first, because writing early would clobber every other
collection's saved layout with a file holding only this key. Entries that are not well formed
snapshots are dropped on load.

## storage/widget-prefs

What a widget's content remembers (tab, filter, view mode), as opposed to its frame. Values
are `unknown` on purpose: each widget owns its keys and shapes, and the bargain is that a
value survives a JSON round trip. Prefs come from untrusted JSON, so a wrong shaped file is
dropped, a version mismatch fails by design (bump the version to discard stale prefs, never
migrate), and one malformed widget entry is dropped without taking its neighbours. Known
keys: `tab` (cheats, live data inspector), `viewMode` (checks, inventory), `grouping` and
`filter` (checks), `mode` (navigation). Widget ids match `WIDGET_DEFINITIONS`.

## storage/widget-state

The single boundary for a profile's widgets: the layout the Widget composite writes and the
per widget prefs. Both live in `profiles/<id>/tracker.json`, so one cache and one debounced
write serve both and neither clobbers the other. The blob loads once per profile, every
mutation rewrites the cached whole, and rapid writes coalesce. `flushWidgetBlob` exists
because a debounce nobody forces drops whatever the user did just before the window closed.
Loading a second profile flushes the first one's pending write first. A patch before the file
is known reads first, or it would write a blob holding only that key. Before this existed a
drag wrote the whole file on every mouse move and overlapping read modify writes lost data.

## store/store-site

The Hookshop origin is a placeholder until the store's domain exists. The main process names
the same origin for the store API in `electron/hub/endpoints.ts`. The media bucket is
private: store-api signs every picture it returns and puts the link in `url`, valid for two
hours. Without one the tab draws the kind's icon.

## tracker-state-io

Typed wrapper around the per profile tracker state IPC, so presentational tiers never touch
`window.api` directly.
