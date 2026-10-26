<!-- @layer docs @kind doc -->
# Code notes: packages/input-mapping

Facts about `packages/input-mapping` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

The device families (Xbox, PlayStation, Nintendo, GameCube, generic), the SDL capability tables, the display resolvers, the device profile builders, the live control state and the controller caches moved into `@drizztdourden08/brock-input`. This package imports them from there and keeps the SNES side: console defaults, bindings, the scheme and the runtime that turns input into a frame mask.

## packages/input-mapping/src/axis-end-label.ts

- The axis label names the whole axis, so the two ends would read the same without the sign. The minus is U+2212, the same "label sign" shape the saved-binding icon lookup produces.

## packages/input-mapping/src/build-console-defaults.ts

- The drag-and-drop "apply this device" flow takes its defaults only from here. Only an sdlType is known, never a live device, so every position the family has a default for gets a binding whether the physical unit has it or not.
- Movement comes out on both the left stick and the d-pad. One SNES button may carry several mappings: the renderer files button bindings by index and axis bindings by "axisIndex:direction" in two separate maps, and computeBitmask ORs every hit into the frame mask, so two mappings for one SNES button both press it.
- The stick mappings are emitted first. The controls screen shows one row per SNES button and picks the first mapping that names it, so the row reads "Left Stick Y -" and not "D-Pad Up".
- Axis mappings carry no stored icon. A family declares one base key per stick, shared by X and Y, so a stored key could only be the neutral pose. With the icon null, the controls screen resolves the glyph from the binding's axis and direction at render time (resolveIconByVidPid, then resolveStickDirectionIcon). A binding with no source device falls back to directional generic art (AXIS_FALLBACK in apps/desktop/src/input/binding-display).
- Button labels ride on the binding; without one, a binding falls back to "Button 3".

## packages/input-mapping/src/console-defaults/

Which SNES button each controller position maps to by default, per device family. The families themselves (`XBOX_FAMILY`, `NINTENDO_FAMILY` and the rest) come from `@drizztdourden08/brock-input`; this folder only holds the SNES table keyed by them (`SNES_CONSOLE_DEFAULTS`). A family without an entry falls back to `GENERIC_DEFAULTS`, which also carries the left stick as the d-pad. The Nintendo family files its bottom button under SNES B and its right button under A (and X/Y likewise), matching the layout of the SNES pad. Both resolvers take a `DisplayContext`, so they answer for the physical pad's family and never for a hardcoded one.

## packages/input-mapping/src/controls/devices/devices.type.ts

- `InputProfile` is persisted per profile. `isDefault` marks a factory preset (not deletable) as opposed to a user created one.
- `InputProfile.modern` holds the modern scheme bindings (core verbs plus one slot per remaining control). It is absent on a profile that predates the modern scheme; build one with defaultModernBindings (packages/input-mapping/src/scheme/default-modern-bindings).
- `InputProfile.core` holds the ten never assignable verbs, on a classic profile too, because the enhanced pause menu is driven by them under both schemes. On a modern profile it mirrors `modern.core`.
- `DetectedDevice` is a device seen at runtime and is not persisted. `id` is a unique runtime id such as `gamepad-0` or `keyboard-0`. `rawId` is the `Gamepad.id` string or `Standard Keyboard`. `displayName` is the resolved name, such as `Xbox Series X|S Controller`.
- `DetectedDevice.sdlType` is SDL's own gamepad type (SdlGamepadType in packages/game-data/src/sdl-buttons), kept a plain string so this file does not depend on the input mapping package. The keyboard entry uses the sentinel `keyboard`, never null.
- `connected` is HID level presence. `activated` means the Web Gamepad API is active (a button was pressed at least once). `inputApi` is the API this controller uses for input reading.
- `hasRumble` and `hasGyro` are real capabilities reported by SDL3 (the input module's `onAdded`); false, not unknown, when the device was not detected through that surface.
- `AssignedDevice` is persisted with the profile. `DevicePreset` ships with the app; its `vendorIds` and `productIds` are lowercase hex strings it matches, and `buttonIcons` is the icon set for the device family.

## packages/input-mapping/src/data/haptics/build-segments.ts

- Intensity guide: 0.10 to 0.20 very faint (ambient), 0.20 to 0.35 faint (footsteps, small clicks), 0.35 to 0.55 medium (sword swing, item use), 0.55 to 0.75 strong (damage, hammer, explosions), 0.75 to 1.00 heavy (death, boss defeat, quake).
- The global intensity slider scales every value.

## packages/input-mapping/src/data/haptics/combat-patterns.constants.ts

- dashStep has no cooldown because the polling interval paces it, and it is exempt from the minimum-duration floor because it fires about 8 times a second.

## packages/input-mapping/src/data/haptics/haptic-pattern.type.ts

- gapMs is the gap between segments (default 0). delayMs is a delay before the pattern starts, for animation or sound sync (default 0). cooldownMs is the minimum time between repeats (0 means no limit).

## packages/input-mapping/src/glyphs/built-in-packs/built-in-pack-art.constants.ts

- GENERIC_PACK_ART is about artwork, not the device. An unrecognized pad can stack four controls on one side (bumper, trigger, two paddles) and the generic family names them with two keys, which a labelled binding row can live with and a bare cluster chip cannot. Same silhouette down a side, solid then filled then outline for depth, and paddles take a third silhouette so a grip never reads as a trigger.

## packages/input-mapping/src/glyphs/built-in-packs/index.ts

- A pack is a family's own icon table with keys resolved to asset paths, so it cannot drift from the family. The generic pack is the one exception (GENERIC_PACK_ART).
- 'snes' draws the console's own art, placed through generic's console defaults. 'keyboard' places the keyboard preset's keys on the positions their console button occupies. Both are keyed by SDL position like every other pack.
- Icon keys with no artwork on disk are dropped so the fallback chain answers for them.

## packages/input-mapping/src/glyphs/glyph-asset-paths/glyph-files.constants.ts

- Paths are root-relative ('buttons/xbox/...') and never go through the renderer's publicAsset helper, because this layer is shared with the Node side, which has no import.meta.env. The renderer prefixes them.
- A key with no artwork is absent; the generic pack covers every position.
- 'ps-share' points at the Create art because the current PlayStation pad prints its Share button as "Create".
- Generic triggers come in three silhouettes with solid, filled and outline variants for the glyph pack (see built-in-pack-art.constants.ts).

## packages/input-mapping/src/glyphs/keyboard-glyph-path.ts

- Letters, digits and function keys map mechanically (KeyW is keyboard_w.svg); only named keys need the table. An unmapped code returns null and the caller falls back to text.

## packages/input-mapping/src/glyphs/resolve-glyph.ts

- Chain, first answer wins: the chosen pack, then the fallbacks it names (cycle safe), then the device family's pack, then the generic pack.
- Pack id 'auto' means the device's own family and is the default. Choosing a pack is an override, so a custom pack that draws only four face buttons still shows correct shoulders from the family pack.
- Null at the end means no artwork anywhere; the caller falls back to the control's label.

## packages/input-mapping/src/glyphs/slot-glyph.ts

- A slot's binding is asked before its position: a slot at EAST bound to a key draws the key cap, not pad art for a button that does nothing.
- The keyboard branch matters: a cluster skips a chip with no glyph, so without it a keyboard player sees an empty corner.

## packages/input-mapping/src/haptic-events/get-item-pattern-id.ts

- The boomerang returns no pattern because its catch has its own event (BOOMERANG_CATCH). The mirror returns none because its warp is an environmental event.

## packages/input-mapping/src/haptic-events/haptic-events.constants.ts

- HapticEventType must match the C enum in haptic_events.c.
- EnvironmentalEvent values are the param when the event type is ENVIRONMENTAL.
- HapticItemId values come from the game's item switch in player.c.

## packages/input-mapping/src/haptics/index.ts

- Maps game events to vibration patterns and handles dispatch, cooldowns, delays and settings gating.
- getHapticIntensityScale exists so a preview of an authored pattern plays exactly as a live game event would (previewHapticPattern in the haptic bridge).
- DASH_PULSE_INTERVAL_MS (125) is about 8 Hz.

## packages/input-mapping/src/keyboard-default.ts

- SDL never enumerates a keyboard, so the keyboard default is hand-authored and is not derived from the family layer.
- `apps/desktop/tests/e2e/isolated-app/keyboard-input-profile.ts` seeds the end to end profile from this file, so it must stay free of runtime imports.

## packages/input-mapping/src/primary-modifier/is-primary-modifier.ts

Every desktop convention the app borrows spells the primary modifier two ways: `Ctrl` on Windows and Linux, `Cmd` on macOS. The old inline idiom `(e.ctrlKey || e.metaKey)` worked on both but could not say which key it meant, and a gesture that asks per frame whether the primary modifier is held (the HUD editor's reparent and nudge split) needs one predicate.

It is a predicate over an event, not a hook or a store read, so the same answer serves a React `onKeyDown`, a `document` listener and a `pointermove` inside a drag. `os` comes from `Platform.info.os`, which the facade resolves once at start up; there is no second detection.

Unknown is not Windows. The web host reports `os: 'unknown'` (a browser has no `process.platform`), and guessing `Ctrl` there would break the app in Safari on a Mac. With no OS known, either key counts, which matches the old inline idiom.

Not for game input. The input code, `BindingListener` and the shadow editor overlay read raw keys on purpose: a rebind screen must capture the left Control key as itself, and normalising modifiers there would make two physical keys indistinguishable.

`ModifierFlags` is structural (a `KeyboardEvent`, `PointerEvent`, `MouseEvent` or a React wrapper of one), so nothing has to import a DOM lib type. `USES_META` lists the Apple platforms, where `Cmd` is primary and `Ctrl` means something else (historically a right click). `primaryModifierLabel` makes the same decision for the printed label, so a hint never disagrees with the key that works.

## packages/input-mapping/src/public-api/

Each folder is one concept of the package's public surface, and the package `index.ts` only star re-exports them. The split exists to keep the entry barrel under the barrel line cap, so a name moves between folders without changing what the package exports. Add a new export to the folder of its concept, and add a folder when a concept has none. The folders are `devices`, `glyphs`, `haptics`, `input-runtime` and `scheme`.

## packages/input-mapping/src/runtime/axis-press-threshold/

The single place where a raw axis reading becomes pressed, shared by live play (the SNES
bitmask, function hotkeys) and by binding capture (the raw input dispatcher). A trigger axis
(SDL's fixed `LEFT_TRIGGER` and `RIGHT_TRIGGER` indices) uses the family overridable
threshold the Controllers screen of `@drizztdourden08/brock-input` shows (`resolveTriggerPressThreshold`), never a second number. Any other axis, such as a stick
standing in for a direction, uses a plain deflection of 0.5. Device keys are `vid:pid` in
hex; a device whose SDL type was not recorded this session uses the generic threshold.

## packages/input-mapping/src/runtime/device-detector/

SDL3 is the only controller transport on every platform (the Gamepad API path is gone), so a
device is an SDL entry or the keyboard, and there is no activation step. The keyboard's
`sdlType` of `keyboard` is not a real SDL type but a stable sentinel, so the apply defaults
drag can tell it from a gamepad. Mice, trackpads and touchpads are filtered out by name.

## packages/input-mapping/src/runtime/device-scoped-map/

A binding lookup keyed by the device that created it, then by the binding key (a button
index, or `axisIndex:direction`), so a binding recorded on one pad never fires from another
pad with the same index. A binding with no source device (console default presets never stamp
one) is filed under `ANY_DEVICE` (`*`) and matches every gamepad.

## packages/input-mapping/src/runtime/function-actions.ts

Shortcut and cheat bindings fire callbacks on rising edges from keyboard and gamepad. Saved
mappings are merged with the defaults so a newly added action always has a binding. Gamepad
maps are scoped by owning device. `clearHeld` releases every held action, so a hold style
action (turbo) is let go even when its release is lost while input is suppressed mid hold.

## packages/input-mapping/src/runtime/pause-manager.ts

Pause state for a controller disconnect or a manual toggle. It only emits events; audio is
handled by subscribers. `connectedKeys` is passed in, not read from the device cache, which
lags a disconnect by a refresh cycle. A disconnect pause resumes only once every mapped device
is back, so an unrelated controller cannot dismiss the overlay, and a manual pause is never
touched by presence checks.

## packages/input-mapping/src/runtime/polling-engine.ts

Computes the SNES bitmask each frame from keyboard state and HID state. Keyboard keys count
only when the active profile binds the keyboard, and only devices in the profile's map
contribute.

## packages/input-mapping/src/runtime/profile-devices/allowed-devices.ts

The whitelist the input engine gates on: a keyboard when the map has keyboard bindings, and
gamepads whose vid:pid appears in the map or as the assigned device. A connected but
unmapped controller contributes nothing. Keys are lowercase, four hex digits each.

## packages/input-mapping/src/runtime/profile-utils/

`resolveIconByVidPid` resolves a saved binding's icon through the family layer. The device
need not be connected, only its SDL type from this session's family cache; a live SDL type
fills in when the cache has no record (a device that connected before the cache listened). It
builds the synthetic profile that assumes every position is present, so a binding index always
lands on the same slot whatever a live unit has. A trigger axis shows its own glyph; a stick
axis shares one base key between X and Y, so the binding's axis and direction pick one of the
four pushed glyphs.

## packages/input-mapping/src/runtime/raw-input-dispatcher.ts

Rising edge events for any key, button or axis on any device, for the rebinding UI and the
input tester. Keyboard presses call `emit` directly.

## packages/input-mapping/src/runtime/resolve-bindings/

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

## packages/input-mapping/src/runtime/scheme-runtime/

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

## packages/input-mapping/src/scheme/binding-pressed.ts

- The pure half of the renderer's per-frame polling: raw state is a parameter, so the scheme layer stays testable and free of app imports. The caller passes only the pads the active profile allows; a binding is down when any of them has it down.
- Thresholds mirror the renderer's axis-press rules: a trigger axis counts only near the end of its travel, any other axis at plain deflection.

## packages/input-mapping/src/scheme/core-positions/core-positions.ts

- Only the six gameplay verbs (movement, pause, map) claim a position, because they are live during play. The four menu verbs claim nothing: they answer only while the pause menu is open and the menu owns input then, so confirm can share the action's button. menu-shadowed-slots keeps a menu press from also firing the slot underneath.
- Prev and next screen default to the shoulders, which are not slot candidates; confirm and cancel default to EAST and SOUTH, shared with slots.

## packages/input-mapping/src/scheme/core-positions/position-of-binding.ts

- A gamepad button binding claims its position. A gamepad axis binding claims one only when the axis is a trigger, because a trigger is one physical control whether read as axis or button. A stick axis claims nothing, which is how moving on the stick frees all four d-pad buttons for slots. Keyboard and unbound verbs claim nothing.

## packages/input-mapping/src/scheme/default-modern-bindings/binding-for-position.ts

- The `kind` check on both branches keeps a device whose family describes a position as the other shape from producing a binding the poll loop would read off the wrong array.

## packages/input-mapping/src/scheme/default-modern-bindings/index.ts

- Gamepad: movement on the left stick, pause on START, map on BACK, menu verbs where a system menu puts them. A verb whose position the pad does not report stays unbound. Everything left becomes a slot.
- Movement is on the stick only, unlike the classic defaults (stick and d-pad). Under modern, the prefill skips whatever a gameplay verb answers to, so binding the d-pad too would spend four slots. The stick claims no position, which leaves the d-pad in the list.
- Prev and next screen sit on the shoulders. Confirm and cancel stay on EAST and SOUTH, sharing two prefilled slots while the menu is open.
- Keyboard: each core verb takes the key bound to the console button it corresponds to (KEYBOARD_CORE_SOURCE), and every remaining preset key becomes a slot.
- SDL's Y axis points down, so '-' is up and '+' is down.

## packages/input-mapping/src/scheme/default-modern-bindings/keyboard-slots.ts

- Keyboard slots carry no SDL position, so the cluster draws them from their binding (a key cap).
- Every free preset key becomes a slot; there is no cap and no category filter, since a keyboard has no face buttons to count. Only the six gameplay verbs take a key out; the four menu verbs share.

## packages/input-mapping/src/scheme/derive-slots/default-slot-list.ts

- The prefill written once when a controller is dropped on a scheme. Afterwards the list is the player's own (see slot-list) and nothing re-derives it.
- No cap and no category filter: every pressable control can back a slot.
- Two subtractions remain, for the prefill only: the gameplay verbs' positions, and 'system' buttons (Start, Back, Guide, Touchpad, MISC), which belong to the host. Both are defaults; a player can still add a slot on Start.

## packages/input-mapping/src/scheme/derive-slots/slot-for-control.ts

- A trigger reported as an axis backs a slot as a '+' deflection of that axis.

## packages/input-mapping/src/scheme/effective-slots/effective-modern-bindings.ts

- layoutId is passed through, not defaulted: "this scheme names no layout" is a real answer, and the shipped default is the HUD's business.

## packages/input-mapping/src/scheme/effective-slots/effective-slots.ts

- The stored list is the truth: prefilled once from the device and read back as written, so added slots survive and removed ones stay removed.
- Order of answers: stored slots renumbered; the keyboard preset for an unedited keyboard profile; the live control list for an unedited gamepad profile; otherwise nothing, since inventing controls for a gamepad profile with no stored list and no pad would be wrong.
- Binding a gameplay verb onto a slot's control no longer hides the slot; both fire and both rows show, so the player sees the clash.
- Renumbering on read is idempotent for a contiguous list and repairs a list written by an older build or edited by hand.

## packages/input-mapping/src/scheme/function-mask/read-function-mask.ts

- Reads one frame as functions, one step before the SNES bitmask: directions stay directions, menu verbs stay themselves, and every non-core control is reported as the slot number that is down. Turning that into a mask is the remap step, which differs per scheme.
- `dpad` holds SNES direction bits ready to OR into a mask; `slots` lists slot numbers in slot order.

## packages/input-mapping/src/scheme/menu-edges.ts

- Rising edges only: a held button is one event.
- Emission order is fixed (move, confirm, cancel, prevScreen, nextScreen, pause, slot) so the cursor moves before what lands on it is confirmed, and pause, which can close the menu, comes after verbs that assume it is open.
- Shadowed slots are dropped: a button the menu consumes as a verb would otherwise also rise as a slot and reassign items while the player navigates the menu.

## packages/input-mapping/src/scheme/menu-shadowed-slots.ts

- The shadowed set depends on the bindings, not the frame; a FunctionMask cannot tell that confirm and slot 4 are one key.
- Shadowing verbs are every verb the open menu consumes: the four directions, pause and the four menu verbs. Map is excluded because nothing in the menu reads it.

## packages/input-mapping/src/scheme/prefill-order/in-prefill-order.ts

- The canonical slot order: north, west, east, south face buttons, then d-pad up, left, right, down. Layouts and schemes join only by slot number, so any other order draws the right shape with the wrong letters.
- Used by the prefill, because driver report order is not guaranteed. Unranked positions keep their reported order after the ranked ones.

## packages/input-mapping/src/scheme/remap-classic.ts

- Classic passes the mask the profile's own SNES mappings produced straight through and never drives the equipped-item register (activeItem stays 0).
- mapOnSelect swaps the X and Select bits: Select opens the map and X the save prompt. It is a swap, not a copy, because leaving both on X would make the save prompt unreachable.

## packages/input-mapping/src/scheme/remap-for-scheme.ts

- Strategy table: adding a scheme is a new STRATEGIES entry. Both inputs are always supplied because the active scheme can change between frames: classicMask from the polling engine, pressed from the function read.

## packages/input-mapping/src/scheme/remap-modern.ts

- Movement maps to the direction bits, pause to Start, map to X (the modern scheme never uses the secondary-slot map variant), a 'sword' slot to B, an 'action' slot to A, an 'item' slot to Y plus its HUD item id as activeItem.
- The core has one equipped-item register, so the host sets it to the pressed slot's item and presses Y; any number of item slots work with no new console buttons.
- When several item slots are down, the first owned one in slot order wins; Y is pressed once.
- An item the save does not hold is inert (no register write and no Y). Assignments are per profile, so a fresh save inherits buttons for items it has never found. Ownership is a predicate because this file has no inventory; frame-router.ts holds the live save.

## packages/input-mapping/src/scheme/same-control.ts

- Sameness matches isBindingDown: a key by code (modifiers ignored), a pad button by index, an axis by index and direction.

## packages/input-mapping/src/scheme/slot-list/index.ts

- A slot is a number. The list is ordered, open-ended and built by the player; nothing here consults the device.
- An empty slot is still a slot: clearing a binding keeps the number, and only removeSlot takes one out.
- Removing closes the gap, so every edit returns a renumber map. The assignment table is keyed by number and must move through remapAssignments, or every item below the gap re-points one button up. A number absent from the map was removed along with its assignment.
- Slot numbers are 1-based because they are shown to the player as "Slot 1". slotName is the one spelling for the controls screen, the layout editor and absent-assignment notices.

## packages/input-mapping/src/scheme/slot-list/set-slot-binding.ts

- Rebinding keeps the slot number, so the slot's item and HUD place stay put. Position and icon move with the binding when known and are cleared otherwise, so old pad art never stays on a slot that now reads a key.

## packages/input-mapping/src/types/glyph-pack/glyph-pack.type.ts

- A glyph pack maps SDL's positional control names to the artwork drawn for them. Keying by position (never by a printed letter) lets one pack serve every device family without claiming a control exists.

## packages/input-mapping/src/vibration-segment.type.ts

- `intensity` runs from 0.0 to 1.0.

## packages/input-mapping/tests/haptic-gates.keep.test.ts

Two gate layers must both pass for an in game event to rumble. The C master gate is
`kFeatures0_Haptics` (bit value 1048576, matching `features.h` and
`packages/game-core/src/live-settings-flags`), reached through the boot INI `Haptics` key and the live push.
Then seven fine-grained gates in the haptic service, one per event category. Spin attack
release shares the sword swing toggle, death shares damage taken, and the mirror warp
polling path shares environmental effects.

The suite advances `performance.now` by a large step on every read, so the per pattern
cooldowns (module state that persists across cases) never block a fire. It asserts gating,
not debounce timing.

## packages/input-mapping/tests/primary-modifier.keep.test.ts

On macOS and iOS the primary modifier is Cmd alone; a bare Ctrl means something else there.
An unknown OS accepts either key, because the web host reports `os: 'unknown'` and guessing
Ctrl would break Safari on a Mac.

## packages/input-mapping/tests/slot-list.keep.test.ts

Slot numbers are contiguous, so removing slot 2 makes the old slot 3 the new slot 2. The
assignment table is keyed by number, so `remapAssignments` must move each assignment with
its slot, or an item lands one button up without warning.

## packages/input-mapping/tests/slot-prefill-order.keep.test.ts

A HUD layout and a control scheme are joined only by the slot number. The built in HUD
documents put slot 1 on the north face button through slot 8 on d-pad right. SDL reports
its buttons from SOUTH, with the d-pad before the face cross is finished, so prefilling in
device order would draw every shipped layout with the controls permuted.

## packages/input-mapping/tests/vibration-shaping.keep.test.ts

Shaping compensates for how each pad's rumble feels and only touches magnitude, never
duration. Xbox dual rumble is linear and soft at low magnitudes, so it boosts onto a floor
(0.3 plus 0.85 times the magnitude, clamped at 1). Switch HD rumble already feels strong, so
it stays unchanged.
