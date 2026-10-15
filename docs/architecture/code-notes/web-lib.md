<!-- @layer docs @kind doc -->
# Code notes: renderer library

Facts about the renderer library that the code cannot say on its own. Each heading names
the source file (or folder) the note belongs to, by its full path from the repository root.
The library once sat in one `lib` folder; its modules now live in the game, navigation,
randomizer and storage folders of the apps and packages.

## apps/desktop/src/public-asset/public-asset.ts

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
  on change, so an untouched pad would be missing). Names come from the controller name
  cache (fed by the input module's `onAdded`), then the snapshot's fields. Device ids carry the vendor and
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

## apps/desktop/src/game/active-rom-file.ts

- The ROM of the profile last selected wins. Without one, the first profile that has a ROM answers, so a fresh install with one profile reports its ROM before anything is played.
- Null when no profile has a ROM or the profile store cannot be read.

## packages/game-core/src/active-states/active-states.ts

- Several game states hold at once (a follower, keys in hand), so this is a registry of rules: a new state is one new rule.
- Every value is read from live game memory (state_queries.c), never from what the simulator recorded, so a hand-loaded save state reports the truth.
- `follower` is follower_indicator: the tagalong id, 0 means nobody.
- Tagalong names come from the decompiled routine that sets each id (`follower_indicator = N`). An id with no confirmed source is reported by number.
- SLOT is the progress_buf slot map from state_queries.c.
- `link_num_keys` reads 0xFF after leaving a dungeon (overworld.c:429). That means no key count here, not 255 keys.
- Progress tier 0 is where every save starts, so it is not reported as a state.
- A follower is gating because it can open a gate (the throne room push wall).
- What the player is doing (asleep, dashing, swimming) and the named progress bits come from live player state bytes in packages/game-core/src/player-state-rules, merged by `liveGameStates`.
- `hint` is tooltip-only provenance (a raw flag mask), kept out of the chip so labels stay readable. `detail` is secondary text beside the label.

## packages/randomizer/src/ap-received-index

- The multiworld received-item index lives in the save (2 bytes), so it travels with save states and SRAM.
- A core built before the export existed answers null, and the caller falls back to a value of its own.

## packages/randomizer/src/ap-room-hash

- The multiworld room a file belongs to lives in the save (4 bytes, ap_room_hash.c), so it travels with save states and SRAM.
- A core built before the export existed reads 0 (no room yet) and ignores a write.

## packages/game-core/src/aspect-ratio

- The bounds mirror core/zelda3, so the render buffer can always supply the columns a ratio needs.
- PPU_EXTRA_LEFT_RIGHT is kPpuExtraLeftRight. 256 plus 2 times 384 is 1024 px, the full width of a big overworld area (about 4.0:1 at 240 rows, 4.3:1 at 224), which covers 32:9. The linear world fetch renders past the 512 px tilemap with no-wrap clamping; beyond the area the edge mirror fills it.
- PPU_EXTRA_TOP_BOTTOM is kPpuExtraTopBottom: 224 plus 2 times 128 gives 480 render rows. The world fetch clamps vertically too.
- EXTEND_Y_HEIGHT (240) is the extendY height, the worst case for how many columns a ratio needs.
- A ratio wider than 256:224 gets horizontal extra columns, a narrower one gets vertical extra rows. MIN_ASPECT (256/480, about 0.53) is the tallest the buffer allows; MAX_ASPECT (about 4.27) is the widescreen cap.
- Callers pass a landscape-normalized pair (ratio at least 1), so only the wide ceiling normally bites in clampAndReduce; the tall floor covers a portrait pair. Ratios inside the bounds (5:4, square, mildly tall) pass unclamped and the engine fills them.
- `--sai-left` and `--sai-right` are the camera cutout safe-area insets the native shell injects. With renderIntoNotch false the long edge drops them, so the viewport ratio adapts to the notch.
- COMMON_RATIOS are the ratios real screens use, plus 32:15 (512/240). Snapping to the nearest avoids meaningless reduced pairs like 29:13 (2.226 reads as 20:9).
- A custom ratio of 0/0 is a sentinel for the detected screen ratio.
- parseRatioString returns 0 for 'match' and malformed values; the caller treats 0 as full width.
- A readout's `detected` is the measured ratio, uncapped; `used` is what the engine renders; `capped` means detected exceeded the engine limit.

## packages/game-core/src/audio-volume

- Master volume is a Web Audio GainNode inserted between SDL2's ScriptProcessorNode and the AudioContext destination.
- Mobile WebViews and browsers create the AudioContext suspended (autoplay policy). The game start tap's user activation has expired by the time the context exists, so the next real interaction resumes it, and the listeners remove themselves once the context runs.
- Arming the gesture listeners again is harmless: duplicate listeners are de-duplicated by identity.
- lastRequestedVolume is kept so a gain node created on demand starts at the last volume anyone asked for.
- getMasterAudioTarget creates the master gain when missing instead of handing out the raw destination. A caller connected to the destination stayed connected to it, so replacement audio attached early escaped the master volume slider for the whole session. It is null only while SDL2 has not created its audio context, and the caller retries after boot.

## apps/desktop/src/game/auto-save

- Auto-saves use MEMFS slot 99, a dedicated slot that is never user visible, so they never collide with the user's quick saves.
- The dialog state is read before the screenshot awaits: the game keeps running, and the message box hook state must be the one from the frame the core saved (apps/desktop/src/game/state-dialog).
- Change listeners are told after the prune, so a list that reloads sees the final set of auto-saves.
- Removing the MEMFS temp file and pruning old auto-saves are best effort.

## packages/game-core/src/bridge/announce-music.ts

- Asks the core to report again the music and ambient bed it is playing. It mirrors restore-music.
- The core writes its control port only when the music changes, so an engine that attaches after a selection (behind a boot-time state load, or a late audio context) has missed it and waits in silence for the next one.
- Call it once the handlers are registered and the gate is armed: the core checks both.

## packages/game-core/src/bridge/combat-tables

- Both buffers open with a status byte: 1 when the row that follows was filled, 0 when the developer tools gate is off or the query was out of range. A zero row is a legitimate answer, so that byte is the only thing telling the two apart.
- Sprite row layout: status, initial health, initial flags4, then 16 damage-by-class entries already reduced through the game's own two-step lookup.
- Shared tables: ancilla (projectile) type to damage class (57 bytes), then tile attribute to projectile collision behaviour (256 bytes): 0 pass, 1 block, 2 sloped, 3 layer-dependent, 4 priority flip.

## packages/game-core/src/bridge/commands.ts

- `wasmSetPaused` pauses or resumes the game at the C level.

## packages/game-core/src/bridge/deluxe-entrances.ts

- Tells the core which entrances the extended pack gives a track of their own.
- The remap tables belong to the renderer and the core keeps no copy. The core only needs to know, per entrance, whether a dedicated track exists, so it can hand the game a selectable indoor song for entrances whose own byte never selects one (a duck, or an overworld song carried indoors).
- Pushed as a bitmask of 32 entrances per word, every time a session starts. The mask is armed for an extended pack and cleared for any other.

## packages/game-core/src/bridge/dialog

- C side: core/game-hooks/dialog_*.c.
- The mirror snapshot is null when the module is not running or the HUD override gate is closed.
- Pacing is in quarter units (4 means 1x, 0 means instant), plus the hold-A and B-fill switches.
- Hidden means the native box stays off VRAM because the host draws its own.
- `wasmGetDialogFont(0)` is the active language's glyph sheet, `(1)` its width table, as a view into the loaded asset blob. Null when the render-queries gate is closed.
- The palette is the four SNES colour words the text box draws with this frame.
- Mark stale after a state load: the native box shows until the next message starts.
- Hook state is copied out of the core's frozen buffer: two length bytes, then the blob. Null with no message up, a stale mirror or a closed gate. It takes the module itself because saves and loads run wherever the core does, not only while the game is running.
- Restore returns false when the core refused the blob and restored nothing.

## packages/game-core/src/bridge/host-gates

- Host-only gate control over g_host_gates[0] (core/game-hooks/host_gates.h). These bits gate behaviour the core never observes, so they need no Vanilla Safe handling.
- The core only exposes a whole-word setter, so the bits are mirrored here and the full word is rewritten on every change.
- Bit values mirror the kHostGate_* enum in host_gates.h.
- Simulator support arms the 9 WasmSim* mutators and the fallback in TriggerGrantAllowed (game_hooks_internal.h). On right before a run, off as soon as it ends (abort and crash included) so it never lingers against a live session.
- External music: the core reports every music control write through GameHook_MusicCtrl and keeps its own music channel silent. Off restores sound-chip music.
- External ambient: claimed ids (WasmSetSoundClaim) are reported instead of played; unclaimed ones stay on the chip.
- Both effect channels share one bit: a pack claims ids per channel, so the two are never armed separately and the claim masks decide which sounds the host takes.
- Sound trace is diagnostics only: it reports every sound the game raises, claimed or not, and never moves a sound off the chip. Never on in normal play.
- A fresh core starts with every gate clear, so reset drops the mirror to keep it from going stale.
- Reassert pushes the mirror as it is. A bit set before the module existed (a debugger opened ahead of the game) was mirrored but never delivered, and the dedupe in the bit setter would treat later armings as done. Call it once the module is installed.

## packages/game-core/src/bridge/host-menu

- The only place in the app that spells the six WasmHost* export names. Everything above goes through `packages/game-core/src/host-menu`, which adds the wanted-state and re-assert rules; nothing here holds state.
- Both gates are checked on the C side at every call (core/game-hooks/host_menu.c), so these stay plain fire-and-forget commands. See docs/hooks/host-menu.md.
- Takeover records the host's standing request; the C side defers it, like WasmSetHudHidden.
- Close is the "continue" exit and hands the menu state machine back where the vanilla branch does.
- Save and quit rebuilds the HUD, then hands off to the save-and-quit module.
- Set active item writes the core's single equipped-item register; `hudItem` is a new-style id, 1 to 24.
- Is holding answers 1 while the takeover is in force and the gate allows it.
- Set gear `kind`: 0 blade (tiers 0 to 4), 1 guard (0 to 3), 2 armour (0 to 2), 3 arrow type (0 to 1). It repaints and re-derives in one call; the arrow write keeps the register's ammunition half.

## packages/game-core/src/bridge/nav-tables

- Exit screen map: indoor room to overworld screen index.
- Area heads: the 64-entry table that groups screens into big areas.
- Entrance spawns carry playerX, playerY and startingBg; the starting layer is the high nibble of the fifth byte.

## packages/game-core/src/bridge/player-state.ts

- Live player-state bytes for the widget's state chips (WasmGetPlayerStateInfo). Byte layout mirrors state_queries.c.
- Kept apart from the flag snapshot on purpose: the simulator diffs that buffer to detect checks, and these values change every frame, so folding them in would fabricate check events.
- `handlerState` is a kPlayerState_* value: what the player handler is doing right now.
- `sleepStep` is the step inside the sleeping handler, 0 while asleep.
- `isRunning` means dashing with the Pegasus boots.
- `progressFlags` is sram_progress_flags, which holds the named story bits.
- `incapacitated` is nonzero while stunned or recoiling.

## packages/game-core/src/bridge/progress

- `packages/game-data/src/logic/queries/progress-tier` says what each progress indicator value means. A tier with no row in the dataset is reported as itself, never renamed here.
- The progress indicator reads from WRAM and works indoors or outdoors; null only when the game is not running.
- `screenEventFlags` is save_ow_event_info for the current screen. Bit 0x20 says the event overlay has been applied.

## apps/desktop/src/views/GameLayer/sub-components/ShadowEditorOverlay/behavior/render.ts

- Viewport info feeds the edge-glow shader. Null when the module is not running or the export does not exist.
- Main module values: 7 dungeon, 9 overworld, 14 menu, 0 and 1 intro and title. The location module is the physical location, unaffected by text and menu overlays; active gameplay is location module 7 or 9.
- Location type: 0 overworld or other, 1 house or cave, 2 dungeon.
- `extraLeftRight` is the most extra pixels per side the config allows; the left, right and current extras are uint16 because very wide ratios exceed 255.
- The current extras are valid map content beyond the base 256 width or 224 height. Black edge = budget minus actual extra.
- `extraTopBottom` is the tall budget per side, 0 when the view is not tall. Without it the legacy extend_y mode adds 16 lines at the bottom only (a 240-line picture).
- Camera X and Y are the BG2 scroll. The camera lock shift is signed: the rendered view sits at camera minus shift; 0 means no lock.
- `inDoorway` is nonzero while the player occupies a doorway (its orientation, not a flag). `doorAnimStep` is 0 when no door animates.
- The clean frame is rendered without HUD or BG3 into WASM memory as RGBA.

## packages/game-core/src/bridge/restore-music.ts

- Hands music back to the emulated sound chip.
- While the host plays music the core keeps its music port paused. Clearing the gate does not undo that: the port is written only when the music changes, and the core has tracked the current track all along, so it thinks its track is already playing and writes nothing. Without this call the chip can stay silent indefinitely.
- The custom player sprite and the HUD override each have their own restore for the same reason.
- Call it while the external-music gate is still armed, since the core checks the gate.

## packages/game-core/src/bridge/room-doors

- The room header stores a staircase destination as one byte, written with `BYTE(dungeon_room_index) = ...` (dungeon.c:4339). The room's high byte carries over, so a staircase never leaves its bank of 256 rooms. Reading the byte as the whole index once sent every 0x1xx cave stair to a dungeon room (0x119 read as 0x19).
- The stair layer is the attr page the stair tile sits on (0 BG2, 1 BG1); taking the stair lands the player on that layer.
- The room-addressable variants work for any room, not only the loaded one, and rebuild that room's attr table and header as a side effect.
- Walk boundaries are inter-room walk-throughs (palace toggles such as castle to sewer).
- Travel destinations are the 5 bytes from the room header. Tag bytes (tag1, tag2) drive scripted room effects.

## packages/game-core/src/bridge/room-grids

- Indoor collision comes from dung_bg2_attr_table: a 0x2000-byte table, 64 by 64 per layer, BG2 (upper, the main walkable floor) at offset 0 and BG1 (lower) at 0x1000. Live reads return raw data.
- Attr 0x1C is a filler and stair-detection value. Raw 0x1C on the lower layer marks an upper-floor stair, recorded before normalising; then 0x1C is replaced by the other layer's value.
- The dual-layer decode returns null when the layers are identical (no meaningful dual-layer collision).
- Castle basements and other split-level rooms keep their walkable floor on BG1, so a BG2-only flood renders them as solid wall.
- The layer0 grid always returns layer 0 when indoors, even when the layers match.
- Player layer: 0 upper, 1 lower.
- Room collision type: 0 none, 1 one, 2 moving, 3 horizontal, 4 swimming; -1 outdoors.
- Staircase type (layer change gate): 0 intra-room, 1 layer stairs, 2 blocked; -1 outdoors.
- Toggle floor positions (dung_toggle_floor_pos) are filled by WasmBuildRoomAttrGrid; a debug read.
- Replacement tile state: 16 slots referenced by attrs 0x70 to 0x7F (low nibble is the slot). `value & 0xf0f0` identifies pot 0x1010, large block 0x2020, bombable floor 0x3030, hammer peg 0x4040. All zero outdoors.
- Chest locations: 6 slots referenced by attrs 0x58 to 0x5D (slot = attr minus 0x58). A value of 0x8000 or more means locked. All zero outdoors.

## packages/game-core/src/bridge/room-layout

- Quadrant fullsize X or Y of 0 means that axis is not merged by a blast wall.
- `intraEdges` lists which edges of the current quadrant are intra-room boundaries, not room-to-room.
- `intraEdges` only carries an edge when the room's quadrant flags say the axis is not merged, so an east or west entry means the room is split in X and a north or south entry means split in Y, whichever quadrant the player is in. The player's section comes straight from the live quadrant read, not from a pixel position.
- Floor raw: 0 is 1F, 1 is 2F; negative floors are stored unsigned, 0xFF is B1, 0xFE is B2.
- Effective width and height are the bounding box in map cells of every cell containing the room.

## packages/game-core/src/bridge/second-cartridge

- C side: core/game-hooks/gba_alttp.c.
- Two separate questions, deliberately kept apart. Available: the supplement container is in the asset blob. Enabled: the player asked for the extra content.
- Both must hold before anything appears in the world, so owning the cartridge with the option off still gives an untouched overworld. The core defaults to disabled, so a host that never calls the setter behaves like the base game.

## packages/game-core/src/bridge/sim-queries

- Room-addressable interactable queries for the simulator, gated on developer mode (core/game-hooks/sim_queries.c). Null means the gate is closed, distinct from an empty array (nothing in the room).
- The flag snapshot copies three raw SRAM buffers the simulator diffs (see shared FlagSnapshot): save_dung_info is uint16[320] indexed by room id, save_ow_event_info is uint8[0x82] indexed by overworld screen, g_progress_buf is the progress buffer (state_queries.c). Independent copies, never live views.
- Sprite flag byte: bit 1 floor, bit 2 drops a small key on death (0xe4/0xfe die-action marker in room data), bit 4 drops the big key (0xe4/0xfd marker).
- Door layer 0 is the upper BG2 door, 1 the lower BG1 one (door position slots 6 to 11).
- Kill drop "virtually kills" a room's meaningful enemy: it marks the room's drop-taken (0x400) or enemies-cleared (0x800, itemId 0xff) SRAM bit and grants the drop through the normal receive path.
- Unlock door opens a door's SRAM and live bit as a small key would. consume=false opens the counterpart record without spending another key.
- Cell locks are the big-key plates (room object 0x18); opened once the bit is set. Opening one sets the slot's chest-open bit, as the game does.
- Follower attach: the princess becomes the follower (her cell's TransitionToTagalong state). Follower rescue: the Sanctuary priest scene, progress indicator to 2.
- Receive count and site are diagnostic tallies of Link_ReceiveItem calls (SimCountReceive in C).
- Push mantle: the throne room shelf sliding aside, checkpoint 4, the run's proof it pushed.
- Mark map icons: the first sage finishing his errand, which puts the map markers up.
- Close door clears a door's open bit (a trap shutter slamming shut behind the player).
- Trigger overworld check sets a standing overworld item's event bit and grants its item in game.

## packages/msu/src/bridge/sound-claim

- Tells the core which sound ids the app has taken over, per channel. The gate bits (host-gates) say the host handles a channel; these masks say which ids on it. Without a mask an armed gate claims nothing, and without the gate a mask is never consulted.
- voidCall swallows a missing export, so an older core with no WasmSetSoundClaim never claims anything and the renderer stays up.
- Clearing every channel is the state a session must leave the core in.

## packages/game-core/src/bridge/sound-preview

- Renders what the sound chip would play for one sound id, for A/B against a replacement. The core uses a private second chip (emscripten_sound_preview.c), so nothing disturbs the playing music or a save's state. Needs a core with parsed assets; see preview-core.
- Music is a preview target but not a SoundChannel; it is written to a port like the rest. Ports match SOUND_CHANNEL_PORTS in the sound catalogue.
- The chip runs one frame per video frame; the core counts a duration in frames.
- Bank -1 lets the core find the bank holding the sound. Music ids are spread across banks (overworld songs in the base one, dungeon songs in the bank layered over it) and effects sit in the base bank, so the search answers both without a table here.
- Null when the core cannot render; digital silence when the id has no sound. Callers report the two differently.
- Samples are interleaved stereo 16-bit signed, copied out because the core reuses the buffer for the next render and a growing heap can detach the view.
- The bank in the result only matters for diagnosing a silent id.

## packages/game-core/src/bridge/sprites-blockers

- Uncle blockers are active Uncle sprite blocker coordinates for the indoor early-game variants.
- Navigation blockers are live dynamic blockers used by the navigation flood fill.
- Guard spawns are the static overworld tutorial guard spawns (sprite 0x3F and 0x40) for the current area, independent of camera proximity loading.

## packages/game-core/src/bridge/title

- C side: core/game-hooks/title_mirror.c and title_override.c. The frame decode follows the struct in title_mirror.c field by field.
- int16 piece_x[3] is aligned to the next even byte after the fade byte, so it starts at 18; piece_y follows at 24.
- The poly block is the poly thread's 4bpp tiles; the view is taken every frame because the heap can grow.
- The palette is the eight SNES colour words the triangles draw with.
- Title frame is null when the game is not running or the gate is closed.
- Hidden is in force only when the gate is open, the request was made and the title is on screen.

## packages/game-core/src/bridge/ui-state

- The UI state buffer is returned as the heap and a pointer.
- The overlay mode bitmask controls native rendering suppression.
- Menu state: 0 gameplay, 1 opening, 2 open, 3 closing. Used to sync the enhanced HUD overlay with the native pause animation.

## packages/game-core/src/bridge/view-origin/view-origin.ts

- The rendered frame is not the camera: a wide view draws `extraLeftRight` pixels before the camera column, a tall view draws `extraTopBottom` rows before its first row, and the camera lock shifts the picture so its edge can rest on the map boundary. Anything drawn over the game (navigation overlay, shadow editor, tile tooltip) must start from this origin or it sits off what it marks.
- Consumers once derived this inline; some carried the lock shift and some did not, and none carried the rows a tall view adds on top.
- Lines above the picture: a tall view adds the same budget above and below; the 240-line view adds its 16 lines below only, so a surplus of exactly 16 means nothing on top. Anything that marks a spot in the picture (the message box, on a scanline the game names) starts below these lines. Frame furniture (enhanced HUD, pause menu) is placed against the rendered frame and reaches the top in every shape.

## packages/game-core/src/bridge/wasm-call

- Shared call helpers: module guard, try and catch, count-prefixed array decode, so each bridge query is a short declaration of its packed layout.
- `callWhenRunning` runs only when the module is loaded and the game is running; any throw returns the fallback.
- Table layout: `countBytes` is the count header size (1 is u8, 2 is little-endian u16); `dataStart` is where the first row begins; `maxCount` is a defensive clamp, because several C tables cap their length.
- Gated tables: byte 0 is a status flag, 0 when the export's gate was closed or the argument out of range, 1 when the count-prefixed table at byte 1 was filled. A closed gate returns null, not an empty array, so "not allowed" and "nothing here" stay distinct. C side: WasmGetRoomChests and friends (sim_queries.c).

## packages/game-core/src/canvas-context.ts

- A stopped game loses its canvas WebGL context to free the GPU (apps/desktop/src/game/lifecycle stopGame). The canvas hands that same lost context back on the next getContext, SDL's renderer then fails to initialise on it, falls through to a 2d context the canvas can no longer give, and the core dies on "createImageData of null". So a restart first asks the canvas to restore the context and waits for the restored event (or a timeout).

## apps/desktop/src/game/capacity-bonus

- Arms the per-family bonus table the core's upgrade resolvers read (core/game-hooks/upgrade_bonus.c) and gate word 5 (features.h kFeatures5_CapacityBonus). That bit says a borrowed receipt pays the profile's bonus, not its native goods.
- CAPACITY_BONUS_BIT must stay in lockstep with kFeatures5_CapacityBonus in features.h.
- Word 5 is shared with the story gates, so the bit goes through the word's composer (apps/desktop/src/game/gate-word-5, setCapacityHalf) and never clears the other half.
- Table writes only record. Clearing the table and the bit is a complete disarm: every payout seam is back on its vendored expression, byte for byte.

## packages/randomizer/src/receipt-text/capacity-fixed-lines.ts

- Arms the (family, starting rung, jump) to receipt-line table the core's fixed-jump resolvers read (core/game-hooks/capacity_fixed_lines.c). When a fixed item lands, the core looks up the line pre-rendered for the rung it climbed from and shows it in place of the location's jump-only line.
- Writes only record, the same contract as the plan and the wallet table. The read side answers to the grant seams and kFeatures3_ReceiptMessages.
- `messageId` is the pre-rendered line's message id in the session dialogue.
- The session layer composes the entries from the family plans; this module is the ccall surface only.

## apps/desktop/src/game/capacity-plan

- Arms the per-family jump sequence the core's progressive climb reads (core/game-hooks/capacity_progressive.c). Entry k is the k-th pickup's jump in rungs and, when the session pre-rendered one, the message id of its receipt line.
- NO_MESSAGE (-1) means no pre-rendered line: the core falls back to the family's class message. Missing message ids fall back the same way.
- The ladder is bounded by the family's rung count, so a longer sequence is refused here instead of being truncated in C.
- Writes only record. The read side answers to kFeatures3_CapacityProfile inside the gated grant seams.

## packages/randomizer/src/capacity-profile/capacity-profile.constants.ts

- The TS half of the capacity profile contract with core/game-hooks/capacity_profile.c and wallet_grants.c. Moved to packages/randomizer/src/capacity-profile/capacity-profile.constants.ts.
- CAPACITY_FAMILY_INDEX is the index WasmSetCapacityProfile addresses each family by (the core's enum order).
- CAPACITY_FAMILY_LAST_TIER is the last rung per family: the eighth pond level, the bat's quarter setting, the wallet ladder top.
- The ladders and the wallet's virtual id range are owned by the shared model (capacity-ladders.constants.ts, packages/game-data/src/data/upgrade-receive-id, packages/game-data/src/data/wallet-jump-table) and only re-exported, so the bridge cannot drift from the pool, the names and the receipt export.
- WALLET_JUMP_SLOTS is sixteen slots, virtual ids 0x67 to 0x76.
- The unused helpers walletReceiveIdOfSlot (WALLET_VIRT_FIRST plus slot) and walletCapOfIndex (ladder index i gives cap 0, then 100 times i minus 1, clamped) were removed; isWalletReceiveId is still in packages/game-data/src/data.

## apps/desktop/src/game/capacity-profile

- Arms the in-core capacity profile (capacity_profile.c: starting rungs for a new file, the rung a family may reach, the wallet ladder cap) and the wallet jump table (wallet_grants.c: slot to ladder rungs).
- Rung 0 is the empty tier below the native grid. The wallet's rungs are its ladder index 0 to 100.
- `custom` false keeps the family on its native grid (vanilla or vanilla-in-pool); the tiers are then ignored.
- Same contract as the override bridges: every write only records, the gate bit is requested alongside it, and it stays open only while a profile is armed.
- openCapacityGate alone changes nothing in the core: every profile seam keeps its native answer until a family is armed, so a session whose families all stay native can still raise it for the hold-up icons (apps/desktop/src/game/upgrade-icons).
- The gate is requested with the record-only write so it has latched into WRAM (SyncGateWords, next frame) long before a new file or a grant reads it.
- In the wallet jump table, rungsBySlot[s] is the ladder climb a grant of virtual id 0x67 plus s performs. A rung count past the ladder top is clamped in C.
- Clearing empties the profile and the table, then closes the gate: the same double lock as the override tables.

## packages/game-core/src/capture-frame

- Game frame capture for save state screenshots.
- Reading the game's WebGL canvas asynchronously is unreliable: the backbuffer can be cleared after present, and toBlob on a hidden WebGL canvas returns blank in some WebViews (Android's). So capture piggybacks on the FX render loop: a save requests a capture, and the loop, right after it draws the visible FX canvas, encodes that frame. Reading in the same turn as the draw sidesteps every async, visibility and preserveDrawingBuffer quirk.
- fulfillFrameCapture is called by the FX loop right after it renders the visible canvas.
- The frame is copied into a 2D canvas first because toBlob is dependable on a 2D canvas, and drawImage reads the source canvas's freshly rendered contents.
- A newer capture request supersedes an unfulfilled one, which resolves null. A request with no frame in time (the game is not running) also resolves null.

## apps/desktop/src/game/cheat-check-grant

- This is what the cheat console's "From Check" button hands over, and how.
- A check's vanilla contents are right only on a file with no seed. On a randomized file, granting the vanilla item clears the check off the tracker while handing over an item the seed never placed, which puts the run out of logic with no way back short of an old save.
- So the grant is resolved from the active session's placement and split in two: the item goes through the receipt delivery (the path a real randomized pickup takes), because a placed item is often a virtual id (a progressive family, a counter upgrade, a wallet rung, a dungeon-flavoured key) that only a substitution or receipt seam can resolve; the completion is written when that delivery finishes, by packages/randomizer/src/cheat-check-mark.
- Both halves ride one queue entry. A second entry used to carry the completion, which read to the player as two things handed over; the delivery's completion callback gives the same ordering with one notification.
- The location is taken out of the poller's reporting first: the console already handed the item over, so a poll that saw the flag flip would make the session deliver a second copy.
- An online session is refused: it holds no placement here, its items are scouted one at a time, and in a multiworld the item at a location may belong to another player.
- FALLBACK_VANILLA_ID (0x17, a heart piece) is the receive id for a check with no resolvable vanilla item.
- The plain game still runs the old one-call trigger (it writes the flag and hands the item over together), so its plan answers to what that trigger can do, not to the completion writer.
- planCheckGrant is pure: the widget calls it to label and enable the button, and grantFromCheck runs the same plan.
- The completion rides the delivery's own callback, so a refused or still-retrying grant leaves the check standing. The queue also fires that callback for a dropped entry (clear(), on a session stop), so the session is compared with the one the grant started under. The suppression is repeated in the callback because a save state loaded in between re-baselines the poller from live memory, which would put the location back in play.

## packages/randomizer/src/cheat-check-mark

- Records a check as collected without handing anything over.
- The write is chosen from the check's own detection, never from its grant coordinates. For several checks these are not even the same byte: a wish pond carries flagType 2 and flagMask 0 for its grant, while the tracker and the poller read its substitution completion bit in the progress buffer. Marking the grant side wrote a zero mask into a byte nothing observes, so the item went out and the check stayed open. Deriving the write from detectionOf, which the tracker reads through, keeps both surfaces on one fact.
- A check whose completion cannot be written honestly is refused, never approximated. That covers every threshold detection (key counts, capacity tiers, pond throws): those are counters the game reads for more than this one check, and faking one corrupts the file.
- NO_ITEM_SENTINEL (0xFF) is the core's "no item" argument for a trigger export: record the flag, hand nothing over.
- SUBSTITUTION_BUFFER_INDEXES are the progress buffer bytes [21], [22] and [25] that hold the substitution completion bits (state_queries_progress.c; npc_overrides.c allocates them). A check detected through one of them is recorded by its substitution key, the vanilla receive id its giver's own script grants.
- BUFFER_INDEX_OF_FLAG_TYPE maps the npc trigger's flagType to its progress buffer index. The numberings disagree (check_triggers.c takes flagType 0 as sram_progress_flags, which the buffer publishes at [1]), so a mark that assumed they matched would write the wrong byte.
- A chest mark writes the room word plus, in the loaded room, the open chest tile, through the chest trigger.
- A substitution mark sets the one bit that says a possession-gated giver's check was taken.
- An overworld mark goes through the trigger export that already honours the no-item sentinel.
- An npc flag mark writes the giver flag byte and also records the giver's own post-grant state. Only a non-zero mask writes anything, and the flag it names has to be the byte the detection reads.
- markPlanOf is pure, so the widget can call it to decide whether the Grant button is live. A refusal is the reason the row shows instead of a button that does nothing.

## packages/game-core/src/cheat-rules-memory

- The Rules tab's standing choices (walls, lit rooms, damage dealt and taken) are kept between sessions. The core holds them in plain memory that a fresh boot clears, so they are remembered on every change and put back once the game runs.
- The core refuses a cheat until its gate word has landed, a frame or so after boot, so the restore is tried twice (RESTORE_DELAYS_MS).
- A category the profile turns off still refuses them; nothing here overrides a gate.
- localStorage is a convenience: a failed write is ignored.
- onCheatRulesRestored tells a panel that reads the rules by getter to draw them again.

## packages/game-core/src/cheats

- `window.__trace(frames)` is a dev console helper that starts a core trace (WasmCheatStartTrace); output is logged with a [TRACE] prefix.
- BottleContents are the values stored in link_bottle_info[0..3]. None means no bottle in the slot.
- Gate word 3 holds the cheat gates: bit 1 is the master switch, the other bits one category each. It mirrors kFeatures3_* in core/zelda3/src/features.h.
- The gate is read from the word in effect on the core's WRAM (WasmGetEffectiveGateWord), not the last request (WasmGetGateWord), which disagrees once Vanilla Safe masks bits off. Before the first simulated frame it reads 0, which refuses everything, as it should. An older core without the export also reads 0, so nothing undeliverable is queued.
- A gated-off grant is refused here, not queued: the queue would accept work the core silently drops.
- Item giving is routed through the delivery queue.
- Capacity setters take a wanted count, not the tier index the core stores. The core snaps it to the nearest legal upgrade tier, so a percentage of MAGIC_FULL or BOMB_CAPACITY_MAX is a valid argument.
- The wallet has no native tiers: the core lands the wanted ceiling on the nearest rung of the hook-owned ladder (0, 99, 199 up to 9999), and refuses when no Custom wallet is armed, since the native ceiling is a feature setting, not a cheat.
- A bottle write accepts any contents byte, None included: the core keeps the bottle index in step with what is held.
- CheatSlot mirrors cheat_inventory.h: slots 0 to 19 are the pause menu's save order (15 is the bottle index), then the passives, the gear tiers and the three progress bytes.
- cheatSetInventorySlot is the remove, downgrade and "exactly this tier" path (cheat_inventory.c). A give uses deliverItem.
- The core refuses a small key count outside a dungeon.
- DUNGEON_ITEM_KIND is the core's kind order for the three dungeon item bit families. `palaceIndexX2` is the doubled palace index the UI store carries.
- CAPACITY_KIND is the core's family order (cheat_capacity.c). The wallet ladder is the longest: rung 100 is the 9999 ceiling. A ladder lists every rung the current mode offers: the native grid on a vanilla file, the profile's ladder on a randomized file under a capacity profile, nothing outside the gate. The rung reads -1 outside the gate. Setting a rung trims what the family holds to the new cap.
- A rung's `cap` for the meter is a level code: 0 none, 1 full, 2 half, 3 quarter.
- The rule toggles (no walls, lit rooms, damage dealt and taken) are tracked locally, not read back from WASM: the Cheats widget's toggle and the cheat-ignore-collision keybind agree on the state without polling the module every render, the widget reads them back after a remount, and the core keeps no read export for them. Lit rooms apply on the next frame boundary, not at the call.
- cheatUnblockLink force-clears a stuck immobilize, handler or submodule state (WasmCheatUnblockLink in cheats.c).

## packages/game-core/src/config.constants.ts

- Moved to config.constants.ts. DEFAULT_ZELDA3_INI is the default INI for WASM builds, used when no profile INI is passed.

## packages/game-core/src/core-ready

- The one honest answer to "can the core take a command right now?": a live module and a running core. Either missing and the ccall goes nowhere.
- The renderer has a looser "running": the game view has its asset blob (useGameLifecycle's isRunning). The Emscripten module appears roughly two seconds later, and everything gated on the loose flag (the save state overlay, its shortcuts, the Home tab's load buttons) is live for that gap. A command issued in it used to find a null module and be dropped. Anything that reaches into the core orders itself against this check instead.
- A request made mid-boot is early, not a mistake: waiting it out makes "load slot 3" mean the same thing whether the core came up a second ago or is a second away. whenCoreReady resolves false on a crash and on the timeout, so no caller waits forever.
- The 30 s default timeout is generous: it covers a boot that has to extract assets first, and nothing should ever reach it.
- `settle` is assigned synchronously before any listener can run: subscribeGameState replays the current state on a microtask, never during the call.

## packages/navigation/src/crossings/availability

- An approach to an entrance asks for what its transition asks plus the gate of its tile.
- An entrance asks for what its CHEAPEST approach asks. An entrance is usable as soon as ONE of its transitions is (`isEntranceUsable` is a `.some`), so a plain floor approach beside a glove gated one asks for nothing. Taking the union of every approach would demand the player hold all of them at once and report a walkable entrance as blocked.
- A crossing is available when it is within reach of the flood AND asks for nothing the player lacks. A flood that was never run cannot judge reach, so the crossing reads available on its requirements alone.

## packages/navigation/src/crossings/collect-crossings.ts

- `collectCrossings` is THE producer of every way on or off one screen. Nothing is filtered out for being unusable: a crossing the player cannot take is emitted with `available: false` and the requirements it asks for.
- A caller holding the widget's own connections passes them. That is the only way intra room scrolls arrive, because deriving them needs the room's scroll boundary, which the flood result does not carry.
- Crossings are kept one per id: a door read from two tables is still one door.

## packages/navigation/src/crossings/crossings.type.ts

- CrossingScope is the screen a caller wants the crossings of. `roomIndex` is used indoors; `owScreenIndex` outdoors, in the unified 0x00 to 0x7F numbering.
- `connections` are the border connections of `flood`, derived from it when omitted. `items` are the traversal tokens the player holds, taken from the flood when omitted.
- CrossingPass is the scope plus everything derived from the flood once per pass. `dist` is walk steps per tile from the flood's start, the same measure the simulator orders exits by.
- CrossingParts is what a detector knows about a crossing before the pass fills the rest. `edgeSig` is the simulator's own signature for the crossing, which names the arrival.
- `screenWide` means the crossing describes the whole screen, not a spot on it: its tile is a placeholder and reachability says nothing about it.

## packages/navigation/src/crossings/layer-toggle.ts

- A TogglePosition is a tile whose door record is kDoorType_PlayerBgChange, in room grid coordinates.
- The toggle table holds the tiles a room loads for door type 22 (kDoorType_PlayerBgChange), which flip `link_is_on_lower_level` when walked over.
- A toggle counts for a boundary when it sits against that wall (within EDGE_THRESHOLD tiles) AND lands on the run of tiles the boundary occupies (within POSITION_SPREAD tiles along the wall). Crossing such a boundary flips the floor the player stands on.
- The run along a wall is measured in columns for north and south, rows for east and west.

## packages/navigation/src/crossings/make-crossing.ts

- Assembles one ScreenCrossing from what a detector found plus what the pass knows, so the walk distance, the arrival words and the availability verdict are derived the same way for a door, a stair, a hole and a border scroll.

## packages/navigation/src/crossings/place-tile

- A Landing's `inward` is tiles toward the room's middle (negative is behind or outside the wall); `lateral` is tiles along the wall, either way. INWARD points toward the room's middle, away from the wall the door sits in.
- DOOR_REACH_RADIUS (14) is how far from a door record a walkable tile is still that door's landing. It matches `exitDoorAt`, which scans 14 deep, because notch depth and the record's own lateral offset vary that much between rooms.
- ASSUMED_DEPTH is how deep inside the wall a door's landing sits when the flood cannot say. The assumed landing goes straight inward from the record, so an unmeasurable door is never placed in the wall.
- `spawnCrossingTile` returns null when the spawn record itself lies outside the room. A spawn stores the sprite's TOP LEFT, so the tile under the feet is one column right and two rows down. That shift is clamped, never allowed to reject: a spawn on the last rows of the grid would otherwise lose its whole crossing.
- Landing ranking: a tile on the door's inward side beats one beside or behind the wall however much closer that lies, because otherwise a flooded padding tile one step the wrong way wins over the real floor four steps in. Within a side the tile nearest the door wins, then the one drifting least along the wall.
- `measuredLanding` ranks the WHOLE radius at once and is null when the flood touched nothing within reach.
- `matchDoorsToSpawns` scores every pair, then claims closest first, so no door and no spawn is used twice and the order the spawns arrive in cannot change the answer.

## packages/navigation/src/crossings/resolve-target

- A room target carries the palace index because two rooms can share a number.
- An overworld screen index is ALREADY the unified 0x00 to 0x7F numbering: the game tests bit 0x40 of `overworld_screen_index` to decide which world it is in (core/zelda3/src/overworld.c:479) and masks it off only when it wants the position inside one world (:862). So there is no world argument and no offset.
- `noTarget` is a crossing that leads nowhere the dataset can name, such as a respawn point.

## packages/navigation/src/crossings/sources/edges.ts

- A room's internal scroll boundary runs between rows and columns 31 and 32 (INTRA_NEAR, INTRA_FAR).
- A span is the run of tiles the scroll occupies, and what each of them asks for.
- An intra room scroll physically sits on the quadrant boundary, not the screen border: `getConnections` derives one from the reachable pair at 31 and 32. Placing it at row 0 or 63 would put the marker about 31 tiles from the scroll the player stands on and read it as out of reach.
- Toggle floor tiles apply to rooms only; the surface has one floor.

## packages/navigation/src/crossings/sources/exit-table.ts

- Touched door spots are distinct PHYSICAL doors back outside that the flood TOUCHED. Several entrance ids can share one door, and an id whose transition never fired, or never passed the item gate, is not a way out the room has demonstrated.
- The exit table's own answer: every room it lists HAS a way back outside, even when the flood never touched a door. Room 0xe2's spawn sits at row 59 and its floor ends at row 55, so nothing else emits its way out and it would read as a dead end.
- The table names the destination without saying where the door is, so the crossing carries a placeholder tile and is screen wide (exempt from the reach test).

## packages/navigation/src/crossings/sources/indoor-doors

- WARP_DOOR (0x46) is kDoorType_WarpRoomDoor: crossing it teleports to a header travel slot. A west warp door reads slot 3, an east one slot 4.
- A direction the bridge could not decode arrives as `north`, which no warp door is, so THAT door emits both slots instead of silently none, while the other doors in the room still resolve normally.
- FOLLOWER_DOOR (0x14) is kDoorType_ThroneRoom, a push wall that opens only with the follower in tow.
- A DoorwayCandidate's `nativeType` decides whether crossing it is gated.
- Own doorways are outer wall doorway records on this room's own table. Neighbour doorways are records held by a NEIGHBOUR, facing back into this room.
- The neighbour's own way out to the overworld shares the doorway encoding; mirroring one would invent a room to room link into solid wall, so those are skipped.
- One doorway per edge per neighbour REGION. Dropping the region qualifier collapses two north doorways into the same room at columns 10 and 50 into one, which is the ledge the sanctuary grounds lose when a wall's separate crossings are treated as interchangeable.
- Doorway crossings go through the outer walls and are validated against the destination.

## packages/navigation/src/crossings/sources/indoor-spawns.ts

- A SpawnRow's `layer` is the floor the row puts the player on: 0 upper, 1 lower. `doorArea` is the overworld area the row's door sits on, when it is a door at all; `holeArea` is the area a fall hole drops from, when the row is a hole.
- Spawn areas are the overworld sub screens each entrance row's door or pit physically stands on. A 2x2 area records its entrances on the HEAD screen, so the raw tables name the head for all four quarters. The enriched list resolves each row to the quarter it sits on, the same read the traversal graph makes, so both name one screen for one door.
- Spawn rows are entrance rows whose destination is this room, placed on their spawn tile.
- Exit door records are readable only for the room the game currently holds.
- Only the door rows compete for an exit door record, so a respawn never takes the door's tile.

## packages/navigation/src/crossings/sources/indoor-tables.ts

- THRONE_DOOR (0x14) is kDoorType_ThroneRoom, whose walk through boundary needs the follower in tow. A room whose door table carries it is gated while no follower is active.
- FOLLOWER_REQ is a token an ungated crossing never carries, so the gate reads as a need.

## packages/navigation/src/crossings/sources/outdoor-entrances.ts

- The doors into interiors and the pits that drop into a room both come off the same enriched table the flood seeds itself with.

## apps/desktop/src/game/currency-symbols

- The shop price symbols are a 576 B binary the sprite extraction emits beside the PNGs (currency-symbols.4bpp, one 16x8 strip per currency a shelf may charge, reduced to one sprite palette row).
- It is handed to the core when a randomizer session arms: written to MEMFS and applied with WasmApplyCurrencySymbolsFile, the quiver picture pattern.
- The core draws the strip beside a randomized shelf's price under the shop override gate (kFeatures3_ShopOverrides, armed by the session); no gate of its own is flipped here.
- A sprite set extracted before the binary existed, or no running module, leaves the price as bare digits.

## packages/game-core/src/dark-room-lights.ts

- The dark room lights are the share of gate word 4 (features.h kFeatures4_*) that says which carried items light an unlit room. DARK_ROOM_LIGHT_BIT must stay in lockstep with that enum.
- Three bits, not four: the lamp lights a room in the unmodified game and is never taken away, so it carries no bit. A seed that unticks it only tells the fill not to count on it; a file that finds one anyway is better off than the rules assumed, which can never make a seed unbeatable. A word of zero leaves the lamp as the only light.
- Ticking a light is possession and nothing else: the core hooks the game's own "is a light carried" seam, so a ticked item lights a room for free at any meter, exactly as the lamp does (core/game-hooks/dark_room_lights.c). That is why there is no cost, mode or amount to arm, only the set.
- "Dark rooms need a light" is not read here. It is read by the seed logic alone: it tells the fill whether a dark room needs a light, and turning it off never puts out a ticked light. Only the ticks decide the bits.
- The word itself is written by apps/desktop/src/game/item-power, which owns word 4 outright; the two halves are OR'd there so a session makes one write.

## packages/game-core/src/data-revision/data-revision.ts

- Counts the dataset record writes landed in this session, as an external store (subscribe plus snapshot) so a consumer can be woken by one.
- The record registry (`packages/game-data/src/data`) is replaced wholesale on every write and carries no version, so nothing downstream can tell "the same screen" from "the same screen, edited". Anything that memoises or debounces on a content signature folds this counter in.
- The subscription is the load-bearing half. A bare counter is only sampled during a render, so with the emulator paused an edit would sit unnoticed until something else re-rendered. Waking subscribers directly removes that dependency on game frames.
- Contract: every landed create, edit and delete bumps it once, at each write family's shared tail: settle-created-record.ts for creates (the connection pair settles once), apps/desktop/src/data-inspector/record-writers `settle` for edits, and delete-record.ts `recordDeleterFor` for removals. Accepting a recommendation goes through those three, so it needs no bump of its own.

## apps/desktop/src/game/delivery-api

- The non-cheat entry points for the delivery queue, used by the randomizer, networking and other systems that give items.
- A virtual upgrade id has no record: its label is the jump it performs (receiptJumpText).
- The core's grant tables hold 76 entries. An id past them is silently dropped (or reads out of bounds), so a delivery carrying one is refused.
- `onComplete` runs once the core has finished handing the item over, for work that must follow the pickup without a second visible queue entry. The queue also fires it for an entry it drops (clear() on a session stop), so a caller that must tell the two apart checks something of its own.
- `onGranted` runs only when the core confirmed the grant, never for a refused attempt or a dropped entry.
- A `messageId` given as a function is asked for the id when the entry reaches the front of the queue, never at enqueue.
- Sessions arm the receipt gates at start (apps/desktop/src/game/receipt-grants). Arming again at enqueue covers grants fired outside a session, and the WRAM latch (next frame) still lands before the queue's readiness poll can execute: the arm-with-the-write pattern.
- Quiet receipts: a randomizer rupee, bomb or arrow skips its hold-up and message.
- An npc check delivery is `assigned`: its itemId is the session's final answer for the check, never the giver's vanilla item, so the npc override seam must not substitute it again.
- The readiness check is isCoreReady (core-ready): a live module and a running core.

## packages/randomizer/src/delivery-execute

- The one place a queued delivery reaches the core. It was split from delivery-queue.ts so the execute and refuse contract has a single home.
- Outcomes: 'done' means the action fired (for a receipt grant, the core confirmed it). 'refused' means the receipt export reported status 0 and nothing was granted (gate not latched yet, or the player cannot receive despite the readiness probe); the queue must retry such an entry, never complete it. 'settled' means granted with nothing left to show (a quiet receipt), so the entry completes at once instead of waiting for a pickup the game never runs.
- A receipt-flow grant is the only action the core can refuse synchronously.
- WasmGrantQuietReceipt answers 1 granted, 0 not now (retried), 2 not quiet here (the ordinary receipt runs in its place).
- Randomizer deliveries (receiptExport) run the native receipt flow: hold-up, message and inventory, gated by kFeatures3_ReceiptExport. The cheats UI and the simulator keep the cheat export (WasmCheatGiveItem) and its cheat and sim gates.
- The one-shot receipt message is armed at execute time, not at enqueue: the queue may hold several entries and the slot is consumed by whichever receipt finishes next. Re-arming on a retry records the same id again, because the setter only records.
- WasmGrantItemWithReceipt returns 1 granted, 0 refused (receipt_grant.c). A pre-status WASM build returns undefined from the void export, which counts as the old fire-and-forget behaviour instead of retrying a grant that may have fired.
- A heart piece (0x17) skips the npc message arm: a non-wrapping piece never crosses the message seam, and the stale arm would leak into the next unrelated receipt.
- The Assigned npc trigger bypasses the core's npc override seam because the queued item is already the host's final answer. The plain form replays the giver's vanilla grant, which an armed npc override table may substitute.
- A bad onGranted listener never stalls the queue.

## apps/desktop/src/game/delivery-queue/delivery-queue.ts

- Manages item deliveries that must wait until the player can receive them. It polls WasmCanReceiveItem each frame and delivers the next item in FIFO order, firing callbacks so the UI can show pending and delivered state.
- An in-flight delivery completes only once the game was seen busy (WasmCanReceiveItem false) and then ready again, so an item still incoming cannot resolve on the frame it executed. Resolving there, not at execute time, is what makes the simulator's trigger() wait for the pickup and item-get dialog to finish.
- DELIVERY_COOLDOWN is 30 frames between deliveries (about 0.5 s at 60 fps). DELIVERY_TIMEOUT_FRAMES is about 10 s.
- On timeout a non-receipt action logs and completes, so a stuck delivery cannot hang a run. A receipt grant only occupies the in-flight slot once the core returned status 1, so the item is granted: it is never completed on a timer (that is how a never-finishing pickup used to be counted delivered); it logs and keeps waiting.
- The front entry is executed before it is dequeued: a refused receipt grant stays at the front and re-enters the readiness wait, never completes. Only a confirmed execution moves the entry into the in-flight slot, so the grant call fires once per actual grant. Refusals retry every 30 frames and every tenth refusal warns.
- A settled entry (quiet rupees) completes at once, since the game never goes busy for it.
- clear() fires onComplete for every dropped entry, so a dropped delivery cannot leave the simulator's trigger() promise hanging.

## packages/randomizer/src/delivery-queue/delivery-queue.type.ts

- Moved to packages/randomizer/src/delivery-queue/delivery-queue.type.ts.
- DeliveryEntry: `message` is the human-readable text in the queue indicator; `source` is 'cheat', 'randomizer', a player name and so on; `enqueuedAt` is the enqueue timestamp.
- `refusals` counts the times the core synchronously refused the entry's receipt grant (status 0 from WasmGrantItemWithReceipt). A refused entry stays at the front and retries; it is never dropped and never completed as delivered.
- `onComplete` fires once the game has fully consumed the delivery and is ready for the next item (WasmCanReceiveItem went false during the message or pickup, then back true), or on timeout. The simulator awaits it so trigger() paces the runner off real completion, not the synchronous flag write.
- `onGranted` fires once, the moment the core confirms the grant. Never for a refused attempt and never for an entry removed or cleared before it executed, so it counts exactly the items that reached the player.
- give_item `receiptExport` true routes the grant through WasmGrantItemWithReceipt (gated by kFeatures3_ReceiptExport), set by the randomizer path (apps/desktop/src/game/delivery-api). Absent or false keeps WasmCheatGiveItem: the cheats UI and the simulator run under the cheat and sim gates and must not silently move to a gate their sessions never arm.
- give_item `messageId` is an optional contextual receipt message id (RANDOMIZER_RECEIPT_MSG, or a raw dialogue message index) armed as a one-shot right before the grant. Omitted, the core derives a class default from the item id. Only meaningful with receiptExport.
- give_item `messageOf` answers the message id when the entry reaches the front, for a line composed only then (a received item's line, apps/desktop/src/game/randomizer-client/server-delivery). It is asked on every attempt, so a retry after a refusal gets the same id, and it wins over `messageId`.
- quiet_receipt: the rupees, bombs or arrows go straight to the wallet, bag or quiver (WasmGrantQuietReceipt), no hold-up and no message. When the core answers the receipt is not quiet (its option was turned off after queueing), `fallback`, the ordinary receipt, runs instead.
- trigger_npc_check `assigned` true marks itemId as the host's final answer (the randomizer path), bypassing the npc override seam. Absent or false replays the giver's vanilla grant (the cheats UI passes the dataset's native item), which an armed npc override table may substitute. Its `messageId` has the same contract as give_item's.

## packages/game-core/src/dialog

- `active-alphabet`: glyph ids to text for the modern font, in the active language's alphabet,
  read the way the core reads it (the `Language` key of `/zelda3.ini`, `us` by default).
  Picture glyphs keep their bracketed token name so a row renderer can draw them from the glyph
  sheet. Extra glyphs a session wrote into the font's spare slots read as their own characters
  (`packages/game-core/src/session-dialogue/extra-glyphs`).
- `dialog-bridge`: a per frame read of the dialog mirror from the UI bridge's animation frame
  loop; only a changed frame reaches the store. A closed gate reads as an inactive frame, so the
  host box stands down the moment the override is refused, and stopping the bridge does the same,
  or the last frame would stay painted over what comes next. After a load restores the mirror,
  the box reads closed for one poll so every per message latch lets go, and the next poll reports
  the restored frame even when it equals the last one.
- `glyph-atlas`: the active language's dialogue font as one offscreen canvas, drawn from the
  sheet the core renders from (`WasmGetDialogFont`, 0 the tiles, 1 the width table). Glyph `c`
  sits at column `c & 15`, row `c >> 4`, in 8 by 16 cells, painted with the live CGRAM palette so
  a colour line or another box palette shows as the game shows it. Palette entry 0 is the
  transparent ground and entry 2 a letter's body, which a highlight repaints
  (`dialog_highlight.c`). Built once per font and palette, keyed by the sheet's heap address and
  size (both change with the language) and the palette words; more than eight keys means the
  sheet or palette moved on and the cache is dropped.
- `parse-dialog-state`: decodes the dialog mirror (`core/game-hooks/dialog_mirror.c`). Header,
  20 bytes: 0 active; 1 flags (bit 0 bordered, bit 1 story, bit 2 native box withheld); 2 and 3
  the top left word address; 4 render state; 5 last command; 6 choice index; 7 scroll step; 8
  and 9 message id; 10 to 12 cells per row; 13 generation; 14 the message's widest row; 15 its
  most rows; 16 and 17, 18 and 19 the text layer's signed horizontal and vertical scroll. Then
  3 rows of 40 cells of glyph, x, and width with the highlight span in the high nibble.

## apps/desktop/src/game/drop-overrides

- Arms the in-core key drop substitution table (core/game-hooks/drop_overrides.c), with the npc table's contract (apps/desktop/src/game/npc-grant-overrides): the write only records, the gate bit is requested alongside it, and it stays open only while the table has entries.
- `messageId` is the pre-rendered contextual receipt line for this grant (session dialogue), or -1 to keep the core's item-class template. `fireId` is the host-assigned completion id reported when the entry substitutes, or -1 for none.
- The item id indexes the 76-entry native grant tables, so an out-of-range id would corrupt the receipt and is refused, like the other override setters.
- kFeatures3_DropOverrides is requested alongside the table write. The write itself is ungated (record only), but the gate must be requested then so it has latched into WRAM (SyncGateWords, next frame) by the time a drop applies the table.
- Clearing empties the table, then closes the gate: the same double lock as clearItemOverrides.

## apps/desktop/src/game/dungeon-item-grants

- The targeted dungeon item gate arms the in-core receipt seams (core/game-hooks/dungeon_item_grants.c), which redirect a key, big key, map or compass to the dungeon its assigned id names instead of the one the player stands in.
- It has no table of its own: the target travels in the receive id, so every substitution table and the delivery export already carry it. The bit only tells the core those ids are live, which licenses the two redirected writes inside the receipt.
- It is armed at session start and disarmed at stop, like the receipt gates and unlike the plan-scanned prize bit: an online session is handed an assigned item by the server at any moment, with no plan row behind it, so the seam must be open for the whole session.

## packages/game-core/src/edge-glow

A WebGL post process that fills the black bars around the game: a mirror pass reflects game
pixels into the bars, progressive Gaussian blur passes soften the reflection, and a composite
blends the sharp reflection near the edge into the blurred one further out, with animated
Voronoi noise modulating blur, saturation and opacity, plus a pixelation mask and an edge fade.
Fullscreen quads are drawn as two triangles (six vertices). Without WebGL a 2D fallback copies
the game canvas each frame and ignores every effect control, so the game still renders. A clean
frame, when given, is uploaded separately and mirrored with its blue and red channels swapped.

## packages/game-core/src/enhanced-fallback

- The app-drawn HUD styles (Enhanced and Modern) need a 16:9 or wider display. There are two ways to lose one: narrow the ratio in settings, or narrow the window.
- The settings screen owns the correction either way, because it alone holds the profile's settings and the toast queue. Both routes ask through this one event instead of each dropping the style and raising its own message: one rule, one wording, one toast id, so a player who trips it twice sees the notice replaced, not stacked.
- requestEnhancedFallback asks the settings owner to drop back to the Original style and say why.

## packages/game-data/src/events/events.constants.ts

The bridge for `window.__onTransitionSettled` (`GameHook_ModuleFrameEnd` in
`transition_events.c`). The core fires it once per frame on which a module or dungeon
submodule transition has just finished, gated on the Developer Tools setting; subscribing while
the setting is off is harmless, since the core never calls in. Kinds, from the dungeon
submodule that just finished (module 7 is the dungeon, 9 the overworld): `room` is an inter
room doorway (submodule 2), `quadrant` an intra room scroll (1), `doors` shutters, unlocks and
cracked walls (4, 5, 9), `stairs` inter or intra room stairs (6, 8, `0x0E`, `0x10` to `0x13`),
`entered` the player entering a gameplay module (submodule 0, in or out of a dungeon), and
`other` any remaining submodule returning to 0.

## apps/desktop/src/game/extract-assets-worker.ts

- Runs the pure TS extraction pipeline off the UI thread (Buffer, crypto and fs are polyfilled by vite-plugin-node-polyfills). It handles asset compilation and per-language extraction. Inputs and outputs are plain bytes; Buffers are built inside the worker.
- `failures` lists optional sources that failed. The base is still valid, and the UI surfaces them.
- runAssets is the renderer's compile, and the only one that builds the second cartridge's supplement. The Electron main process also rebuilds the base blob after a language or store change; that path writes only the base file, so the supplement beside it survives the rebuild.
- runMenuText reads the menu, credits and closing captions. The extractor copies these bodies into the blob without decoding them, so the studio reads them straight from the player's own file, off the UI thread because reaching them means parsing a whole ROM.
- They are decoded through the ROM's own alphabet, never a requested one: reading these glyphs against the wrong language yields nonsense, not nothing. The caller is told which language answered and decides what to do.

## packages/navigation/src/flood/annotate-screen.ts

- Derives ScreenAnnotations for one screen from the SAME game reads the simulator's discovery uses, so what the overlay draws is what the run acts on. Nothing here derives game facts again: doors (including cell locks), sprites with their key carrier markers, chests and room tags all arrive from the existing bridge queries.
- Ways on and off the screen are NOT annotations. Those are crossings (packages/navigation/src/crossings), with their own producer and renderer. This file only orchestrates; mapping per family lives in `annotate/`.
- Room header tags 0x01 to 0x13 are kill gates: the room's doors open when it is cleared (see sim kill triggers). The same range is KILL_GATE_TAG in packages/navigation/src/simulation/engine/discover.
- A chest is named by what it WILL yield: the vanilla duplicate rule swaps an already owned item for its alternate, so a save that owns the lamp must not be promised a Lamp when the run would deliver 5 Rupees. The item name IS the label, so the detail carries the slot instead (repeating the name renders "Lamp Lamp"); the slot tells two chests with the same item apart.
- A big chest is its own kind: it is gated on the big key, so it must not read as an ordinary available check.
- A big area's spawn table lists every screen's sprites, already resolved to their true screen, so one belonging to a neighbour is drawn when THAT screen is annotated.
- Reachability marking runs last: the flood decides what is touchable, so it must run after every family has contributed.
- Check progress is read off each annotation's own state. A second test once asked the completed set about the annotation's LABEL, which could never work: a chest's label is the item it yields, not a check's name. Whoever knows the check sets `state` (chests from the room's open bit, NPCs and standing items from the completed set by `checkId`), so the state is the whole answer.

## packages/navigation/src/flood/annotate/doors.ts

- One door record gives one annotation, for doors that are a LOCK or a GATE. A door that is a way through to somewhere else is a crossing instead, so it does not come through here.
- Doors that share a `kind` are told apart by their raw kDoorType (the throne push wall reads as 'normal'), and cell locks are not door table records at all.
- THRONE_DOOR (0x14) is kDoorType_ThroneRoom, the push wall that needs the follower in tow. `followerReady` means the follower is in tow, so it will open.
- `killGated` means the room's doors open by clearing it, so shutters there are the trap kind: they close behind the player and only reopen when the room is cleared.

## packages/navigation/src/flood/annotate/npc-checks.ts

- Names an NPC sprite as the CHECK it is. `npc 0x73` tells a reader nothing; the check's own name tells them what the run is standing next to. Sprite 0x73 spawns in two rooms and only one is a check, hence the room narrowing.
- `checkId` is the identity; `name` is for drawing only.
- It uses the SAME matcher the simulator triggers through. It once had its own copy of the rule, so when the simulator learned that a sprite type is not unique across the two worlds the widget would have gone on labelling the light world flute boy as the dark world stump, showing a check the run rightly refuses to take.

## packages/navigation/src/flood/annotate/reachability

- Marks an annotation `blocked` when the flood cannot walk to it. The Secret Passage forced this: the uncle stands in the corridor, the flood stops at him as it should, but the chest behind him was still listed as an available check.
- A feature's own tile is often solid (a chest IS a wall tile, a door IS the doorway), so reachability is judged over the tiles AROUND it: if any tile within TOUCH (2) is reachable, the player can interact.
- Screen wide facts (the kill trigger) carry a placeholder tile (0,0) because they describe the whole room, so reachability says nothing about them. Judging them would label every kill gate room unreachable because tile 0,0 is a wall.
- PHYSICAL kinds' state means lock or physical position, not check progress. They keep their open or shut state (a shut door being unreachable is already implied) and gain an "unreachable" detail; checks flip to 'blocked' so the tally and the panel agree.

## packages/navigation/src/flood/annotate/sprites.ts

- One sprite gives one annotation. Key carriers come first (a lock's key, not scenery). A pull switch says which shutters it serves; the shutter is the reason the run walks to it.
- Sprite_PullSwitch_bounce covers sprite types 0x04 to 0x07. PRINCESS_SPRITE (0x76) is the captive princess NPC; the throne gate waits on this follower.
- `shutterCount` is the shutter doors in this room; a pull switch here opens them.
- The source note (overworld or room spawn) is not cosmetic: a sprite type is not unique across the two worlds (0x2e is both the flute boy and the stump), and only the overworld table's index (the screen) settles which it is.
- A standing item is named by what it hands over, not 'item'; the simulator resolves the same id to decide the pickup, so both agree. A standing item IS a check, resolved from the same flag the pickup writes. Without its id the marker had no identity and always read as available, whatever the run had already collected.

## packages/navigation/src/flood/area-seeds.ts

- Seed bookkeeping for a multi screen flood. `propagateArea` used to flood each screen EXACTLY ONCE with whatever seeds it held at that moment, then discard every crossing later discovered into it. A screen whose real way in is only found once a NEIGHBOUR has been flooded therefore kept the small extent of its first, partial seed set. That is why the first castle's four exterior quadrants each stopped at the first wall instead of joining up.
- Seeds accumulate here instead, deduplicated by tile, so a screen can be run again with everything known about it so far. The caller decides whether a new seed is worth another run (the reachability test in `propagateArea`).
- `add` returns false when that exact tile was already known. `list` returns every seed the screen has been handed so far, in arrival order.

## packages/navigation/src/flood/blockers

- Solid sprite blockers are the sprites that stop the BFS: tutorial guards 0x3F, barriers 0x40, the uncle 0x73, and 0x57. Everything else is walked through. Each stamps a 3x3 footprint so it seals a narrow passage without a diagonal gap.
- 0x57 is the pair of statues flanking the sealed door in the south west desert. The ground under them reads as plain floor, so without them a sealed dungeon reads as open. Their removal (altar use, needs a later item) is NOT modelled yet, so they block for the whole run; revisit when the altar trigger exists.
- The castle soldier family (0x41 to 0x4B) is deliberately NOT a blocker: they patrol, so stamping a 3x3 block at a spawn they have left sealed both southern castle quadrants down to a quarter of their walkable area. A guard that blocks is a STATIONARY one (0x3F, health 255), caught by the live sprite pass.
- The addressable spawn table is the general source; live reads only describe the loaded screen and refine it.
- UNCLE_CHECK_ROOM (0x55) is the room the uncle's check lives in. Sprite 0x73 spawns in two rooms and only one is a check. The uncle vanishes once his check is collected. That is asked by SPRITE ID, never by name: the check table owns the name, and `npcCheckFor` is the same matcher the simulator triggers through.
- Overworld blockers come from the progress aware spawn table so remote screens work too. A multi screen area returns the WHOLE area's spawns measured from its head screen, so each spawn is resolved to the screen it stands on; clipping instead silently drops blockers.
- The occupied screen ALSO reads live sprite positions: the spawn table only says where a sprite STARTED, and a patrolling guard blocks where it stands now. This is additive, not a replacement, so a stationary guard is stamped twice (harmless) and the other sub screens of a big area keep their coverage.
- Indoors the uncle is stamped as wall into EVERY layer (the raw grid aliases layer 0, so a dual layer room would flood through him on layer 1). The loaded room uses his LIVE position (he walks); other rooms use his spawn.

## packages/navigation/src/flood/bombed-walls

- Walls the run has blown open. `Bomb_CheckForDestructibles` (dungeon.c:5170) is the ground truth: an interior attr of `0xF0 | j` marks "destructible door slot `j` is here", opened when that slot's type masks to 0x28, 0x2A or 0x2E. The attr appears on BOTH faces of the wall (the village well has 0xF0 at rows 37 to 38 and 0xF8 at rows 27 to 28, eight rows of wall between).
- A blast radius is the wrong model: it leaves the wall's interior solid. A blast PIERCES a corridor the marker's width straight through to the floor on the far side. The carve is conservative: plain wall and door markers only, one axis, the marker's width, and only if it reaches open floor within MAX_WALL_DEPTH (16); deeper is rock, not a wall, and a tunnel that never surfaces is discarded.
- WALL_ATTRS are the attrs a blast may consume: plain interior wall in its two flavours (0x01, 0x04), plus another marker.
- A marker sits on one face, so both ends of each axis are pierced. The marker patch is the contiguous 4 connected run of marker cells the blast landed on.
- This is simulator side state, not a game write: a real bomb's tilemap swap has no addressable equivalent. The widget reads the same registry so both agree. Bombs are permanent once obtained; no count is kept.
- Blast seeds are kept per room and carved at stamp time, because the carve needs the grids. Opened cells are kept so `isBombed` answers after the fact. Every recorded blast is opened in every layer on the way out of a grid build.
- The registry is cleared between runs so one run's blasts never leak into the next.

## apps/desktop/src/game/flood/flood-area

- THE flood, for every caller (widget and simulator), so the widget can be trusted to report what the simulator sees. `floodOneScreen` is the single screen unit; `propagateArea` chains it across a big screen's sub screens. The ONLY thing a caller varies is where the walk starts: same grids, same options, same numbers for the same seeds.
- `floodOneScreen` is null when the screen's grid cannot be built.
- ScreenFloodRequest: an omitted `startPos` lets the BFS pick. `extraSeeds` are crossings propagating in from an adjacent screen. `atPlayer` is true when startPos is the player's real position in the loaded screen. `entrances` are what is reported against: `findEntrancePositions` filters them to the screen itself, so passing the whole enriched list is the same as passing one screen's worth, and neither seeds the BFS. `intraEdges` are the intra room scroll boundaries of a 2x2 room (indoor only). AreaFloodRequest's `primaryScreenIndex` is the screen or room the walk starts in.
- `propagateArea` floods the primary sub screen from the player's position, then each neighbour its crossings reach, seeded with the landing tiles. Indoors it grows through stairs and walk through boundaries; each room's grid is rebuilt by address in getScreenGrids, never through the destructive Dungeon_LoadRoom.
- MAX_ITERATIONS (12): a screen is flooded again only when it gains a seed its last run could not already reach, so passes converge quickly. This is a runaway guard, not a real limit on how far seeds travel.
- MAX_INDOOR_ROOMS (8) bounds rooms discovered indoors: a dungeon's room graph runs far deeper than the local area a flood describes. Same order as a big screen group (1 to 4 screens), still covering a short chain like the first castle's entrance hall.
- Indoors the caller only computed the primary room's entrances; a newly discovered room needs its OWN list or propagation could only reach one room deep. These lists are cached per room.
- A landing tile is offered to the screen it lands on and queues another flood only when the tile is new AND the last flood could not already walk there, so passes converge instead of bouncing back and forth. The offer reads `dirty` at call time, which is the set for the NEXT pass.
- The primary starts at the player's position; every other screen starts on the first crossing that reached it. The REST of the accumulated seeds ride along either way. Only the screen the player stands in can claim the live position.
- Room stair and walk boundary ids (at or above STAIR_ID_BASE) name a room to grow into; anything below leaves the indoor graph and is reported as an exit, not propagated.

## packages/navigation/src/flood/flood-options.ts

- The one place FloodFillOptions gets assembled. Five call sites used to build it by hand and no two passed the same set. The engine's own flood omitted entrances, the exit screen map, blockers AND the start layer, while the offline dumper hard coded an interior context and an EMPTY inventory. Same core BFS, four different answers.
- Everything the BFS can use is filled in by default; a caller that wants less must say so in the FloodRequest, which makes an omission a visible decision.
- FloodRequest fields: `items` are the traversal tokens the player holds (lift.N, boots, flippers, hookshot, hammer). An omitted `startPos` lets the BFS pick a start. `atPlayer` is true when startPos is the player's real position in the loaded screen. `entrances: []` floods geometry only. `extraSeeds` are extra BFS seeds (propagating in from an adjacent screen, ledge landings). `quadrantBounds` restricts the BFS to a sub region (a 2x2 room's quadrant).
- `grids` must come from getScreenGrids so the blocker stamping and tile context are already correct.
- Indoor blockers are stamped into the grids themselves (packages/navigation/src/flood/blockers); outdoors they stay dynamic so the overlay can tell them apart.

## packages/navigation/src/flood/overworld-entrances

- THE overworld entrance list: every door and pit on the surface, each on the 64 by 64 tile grid of the sub screen it physically sits on.
- Merged fall hole ids start at FALL_HOLE_ID_BASE (200), so a hole never collides with a door id.
- A fall hole's recorded row is offset by minus 8 (FALL_HOLE_ROW_OFFSET), which is added back here.
- A 2x2 group records its entrances on the HEAD area, in 128 by 128 coordinates; SUB_SCREEN (64) splits those into the four quarters.

## packages/navigation/src/flood/room-entrances/room-entrances.ts

- THE indoor entrance list: every way into `roomId`, at the tile the player arrives on. The widget and the simulator each built this separately. The widget refined an overworld door entrance's tile to the real door opening but had no follower gate and could only read the LIVE room; the simulator gated on the follower and could address any room but placed those entrances on the raw spawn tile. Both halves live here now, so a seed list is the same list whoever asks.
- THRONE_DOOR (0x14) is kDoorType_ThroneRoom, whose walk through boundary needs the follower in tow. The throne room's push wall opens only with the follower, so rooms whose door table carries a ThroneRoom record gate their boundaries on the follower.
- STAIR_ID_BASE (1000) and BOUNDARY_ID_BASE (2000) are synthetic id bases, so a seed's origin is readable from its id.
- An exit door's walkable tile: the door RECORD sits in the wall and the player stands a few tiles inside it, how far depends on the wall (DOOR_LANDING_OFFSET).
- Each spawn claims the nearest unused exit door, so two spawns never claim one door.
- Exit door refinement only applies to the loaded room (the door table is a live read); other rooms fall back to the raw spawn tile. An entrance that leads back outside arrives at its door, not its spawn.
- Inter room stairs and walk through boundaries can be read for any room: the loaded room reads its live tables, any other room rebuilds its own.
- When the entrance spawn or room tables are unavailable the whole list is empty.

## packages/navigation/src/flood/screen-grids.ts

- THE grid source for every flood (widget, simulator, offline dumper). Acquisition varies by LOCATION, not by caller: the occupied room has live tables (runtime door state, staircase kind, tile context); any other room is rebuilt from ROM data by address.
- Blocker footprints are stamped here into every layer so no consumer can forget them (see packages/navigation/src/flood/blockers).
- The occupied room is READ from the live tables. A rebuild throws away runtime state (opened doorway transit tiles, a lifted pot, a pushed block), so the live room must never be rebuilt. Whether the room is live is settled before any read, because it picks where every grid comes from.
- Remote rooms build BOTH layers by address. Split level rooms (the castle basements) keep their walkable floor on BG1 and would flood as solid otherwise.
- The dual layer flood reads the layer grids, not rawAttrGrid, so every grid is stamped. Walls the run has already blown open read as floor from then on.

## packages/navigation/src/flood/screen-id.ts

- The canonical screen id for an OVERWORLD screen index, such as `lw-2c` or `dw-2c`.
- Overworld only, on purpose. An indoor screen id is not derivable from the room number (indoor ids are keyed by `palaceIndex:roomIndex` and look like `hc-0x80`), so a synthesized `room-080` matches nothing in SCREEN_BY_ID, which silently cost the widget every indoor exit. Indoor callers must use the DETECTED screen's own id.

## packages/navigation/src/flood/start-layer.ts

- Which background layer a flood starts on. This was derived in different ways: the widget and dumper trusted the live `wasmGetLinkLayer()`, the simulator ran a stair, door and floor heuristic, and the engine's own flood derived it not at all, silently falling back to layer 0. In a split level room that made the flood gating every chest, door and NPC target start on the wrong layer while the exit flood started on the right one.
- One rule, most authoritative signal first: (1) the live layer bit, when the flood starts where the player stands in the loaded room; (2) arrival ON an inter room stair, which deposits the player on their own layer; (3) arrival through a door, where position slots 6 to 11 are the lower page and the game keeps the player's level bit across a door transition; (4) only layer 1 has floor near the landing (a BG1 border strip).
- DOOR_NEAR (8) is how far from the start tile a door still counts as the one the player came through.

## packages/navigation/src/flood/world-origin

- Screen and room world pixel origins. Both formulas were derived again in eight places and disagreed in one: within a single widget run the grid origin came from the player's live position while the entrance origin came from the screen index, so they only matched while the game stood in the screen being flooded. Deriving both from the index makes them agree for remote screens too.
- The overworld has 8 screens per row, indoor rooms 16 per row, each 512 px square. Tiles are 8 px.
- A spawn records the player sprite's TOP LEFT, so the tile under his feet is one column right and two rows down (his hitbox is the bottom 2x2 of the 16x24 sprite). The widget applied this offset and the dumper did not, so the same fall hole was reported on two different tiles.
- `screenOriginFor` is the ONE place that decides "indoors, use the page the player stands on; outdoors, use the screen index". Five call sites used to derive this inline (the dumper, the sim run flag, the observation builder, the overlay draw context and the tile inspector). A drifted origin silently draws every marker on the wrong screen.

## packages/game-core/src/follower-state.ts

- Who follows the player, read from live game state. `follower_indicator` (RAM 0xF3CC) is the game's own tagalong id, mirrored into the flag snapshot's progress buffer (slot 13) by state_queries.c. It is what the game believes now, not a flag the simulator set when it triggered the rescue, so a run resumed from a save state, or a state walked into by hand, reports the truth.
- Centralised because two places gate on it (the throne room push wall's annotation and its walk-through boundary), and both had the buffer index and the id comparison inline.
- The game has many tagalong ids (old man, blind maiden, the frog). Only the rescued princess (id 1) gates traversal today, so only she is named. 0 is nobody following.
- isFollowerActive is true when the princess is in tow right now, which is the throne room gate.

## apps/desktop/src/game/foreign-icons

- The multiworld pool icons in the game itself: the binary the sprite extraction emits beside the PNGs (foreign-icons.4bpp, one 4bpp picture per pool icon, then the icons' own palette, which the core keeps in a private bank only the icons read).
- It is handed to the core when an online session arms its scouted placement, written to MEMFS and applied with WasmApplyForeignIconsFile, the upgrade-icons pattern.
- The core holds another player's item up with the icon of that player's game under kFeatures5_ApOnline. A set extracted before the binary existed, or a core without the export, leaves the plain sentinel and its jar in place.

## packages/randomizer/src/foreign-items/foreign-item-id.ts

- The core's foreign item sentinel (foreign_item.c) is the id an override arms at a location whose item belongs to another player in a multiworld.
- The plan carries the mirrored number (foreign-item-sentinel.ts); a setter asks the core itself, so a core that disagrees refuses the arm instead of taking an id it would read as something else. A core built before the export existed answers with the mirrored number.
- coreHasForeignIcons: a core built before the icon ids does not know them.
- An override setter may arm a native grant, the foreign sentinel, or one of its icon ids when the core knows them. The core refuses those itself unless kFeatures5_ApOnline is set, so outside an online session they reach exactly the code they reached before.
- coreHasForeignIcons is no longer exported (nothing imported it).

## packages/randomizer/src/foreign-items/foreign-item-sentinel.ts

- The foreign item sentinel as the core defines it (foreign_item.c FOREIGN_ITEM_ID), mirrored so a plan can carry it without a running core. apps/desktop/tests/randomizer/ap-online-core.keep.test.ts parses the C source and fails the moment the two disagree.
- The icon ids are the same item held up with a game icon: id FOREIGN_ICON_FIRST_ID plus n shows picture n of foreign-icons.4bpp (FOREIGN_ICON_FILES order). Mirrored from the core's FOREIGN_ICON_FIRST and FOREIGN_ICON_LAST the same way.
- isForeignIconId moved to is-foreign-icon-id.ts, so the data file holds data only.

## packages/game-core/src/fps.ts

- Reads the current frame rate from the running WASM module; 0 when there is none.

## apps/desktop/src/game/gate-word-5

- The one writer of gate word 5 (features.h kFeatures5_*). Four owners share the word: the capacity bonus (one bit, armed by a seed), the story fields (armed by the settings, or by a seed's own choices), the online bits (armed by a multiworld session for its lifetime) and the quiet receipt bits (the settings, pushed with the rest of the live settings). Each owner hands its part here and the word is written whole, so none can clear another's bits with a write of its own.
- AP_ONLINE_BIT is kFeatures5_ApOnline: the foreign item sentinel is a grant id.
- AP_DEATH_LINK_BIT is kFeatures5_ApDeathLink: a death is reported, and a room death can be armed.
- QUIET_RECEIPT_BITS are kFeatures5_QuietRupees, QuietBombs and QuietArrows: a delivered one skips its hold-up and message.
- The story half starts as the default every profile arms, so a word written before the first settings push (a state load, the capacity half) never lands with the ledger off.
- The write is guarded like every other gate word write: a core built before this word carried bits has no export to call.
- Online bits of 0 hand the word back to the other owners alone.
- The quiet receipt bits are written only when they change, since every settings push calls the setter.
- reassertGateWord5 pushes the word again after anything that clobbers WRAM (a save state load).
- gateWord5Now is what the composer would write now, for tests and the log.

## apps/desktop/src/game/gear-icons

- The in-game gear pictures: a 1024 B binary the sprite extraction emits beside the PNGs (gear-icons.4bpp, one 4bpp picture per affected receipt id).
- It is handed to the core when a randomizer session arms, written to MEMFS and applied with WasmApplyGearIconsFile, the upgrade-icons pattern.
- The core draws those tiles for a substituted world blade or shield under kFeatures3_GearArt, so a shelf shows the item it is selling instead of the gear the player carries. A set extracted before the binary existed, or no running module, leaves the vanilla art in place.

## apps/desktop/src/game/gear-ownership

- The highest gear tier ever seen, per profile and per save slot: the pause menu's high-water mark.
- The gear screen lets the player drop to a weaker blade for a challenge run and climb back, so what is selectable cannot be read off the live equipment (that only says what is worn now). It must be the maximum ever observed, and the save file has nowhere to keep it: every byte already means something, so writing there would corrupt a cartridge save. It lives in host storage beside the profile's other JSON, invisible to the core and lost only by deleting the profile.
- Observation only raises the record; nothing ever writes a tier back. The observer lives in apps/desktop/src/game/ui-bridge (the one place the equipment is decoded every frame) and the profile key is set from apps/desktop/src/game/lifecycle, where a profile is first known and where a teardown drops it. Both are explicit calls, not a module-level subscription: a record that silently depends on some view having imported the module is empty exactly when the menu asks for it.
- Known limitation: one mark per profile, not per in-game save file. The stored shape is keyed by save file, but the slot is pinned to '0' because the core exports no selected-file index (ui_state.c carries none, and neither does any Wasm* query). So two in-game files in one profile share one mark, and a fresh file beside a finished one can show its gear as already seen. That is a cosmetic over-count in one menu, never a save write, which is why it is accepted instead of guessed at. Lifting it means exporting the file index from the core first; the slot key is then the only line that changes.
- One mark per ladder. The sword, shield and mail marks keep their own tier; `bow` keeps the highest arrow type seen (0 plain, 1 silver) instead of the raw register, because the register's other half is ammunition on hand, which rises and falls with every shot.
- The whole UI state is read, not only its equipment block: three marks live there and the fourth is an inventory byte, which keeps the arrow mark on the same clock. It is recorded every frame the state moves, whether or not the pause menu was opened.
- Writes are serialized so two fast observations cannot interleave into a lost update. A dropped write costs one silhouette, never a save.
- Readings are filled out over the empty tiers because a stored record may predate a mark: a record written before the arrow mark existed has three keys, and a missing one would read as undefined where every caller expects a number.
- initGearOwnership is re-entrant: a repeated call for the loaded profile does nothing, so the boot path and the observer can both call it. Null (a teardown, or a run with no profile) drops the record, which stops one profile's mark being read or written under the next. A profile swap during the read wins; the stale answer is dropped.
- Observations that land before the stored record are held, not applied: writing while the record is still the empty placeholder would persist only what is worn this instant and erase a higher mark from an earlier session.

## packages/game-core/src/haptic-polling

- Frame-by-frame detection of game state changes for haptics. It runs inside the ui-bridge rAF loop and detects the dash (periodic pulses), state transitions (falling, landing, death), spin attack release, and health decreases as a backup if the C hook misses.
- PLAYER_STATE values are the player handler states from player.h.
- UI_STATE_OFFSET are byte offsets into the UI state buffer: 0 main module, 115 handler state, 116 is-running, 117 dash counter.
- The player is dashing when is-running is set and the dash counter is from 32 up to below 64 (charging complete).
- A landing is a move to the ground state from one of the ledge jump states.
- Main module 18 is game over.
- The unused write-only `prevIsRunning` field was dropped.

## packages/game-core/src/host-menu

- The app-facing facade over the six WasmHost* exports for the host-owned pause menu.
- The takeover is wanted state, not a command. Like WasmSetHudHidden, the request outlives the core: a fresh boot starts with it clear, and a save state load can run the C teardown and drop it. So it is remembered and re-asserted on the frame the module starts running, and whenever the core is seen to have let go.
- The wanted equipped item: the core has one register, and the native menu's own init walks the 21-entry grid before the host's hold matters, replacing any id that grid has no row for (a bottle, or the digging tool). Byte 132 of the state buffer is the register read back, so reconcileHostMenu can see that and write it again.
- The item write is deduped here, not at the call site: pollFrame calls it every frame an item slot is down, and the re-assert paths must be able to bypass the dedupe. One owner, two doors.
- GEAR_KIND_ARG is the `kind` argument of WasmHostSetGear, in the order host_menu_gear.c reads it.
- The takeover is on whenever the host owns the pause menu: the Enhanced HUD style and the modern control scheme (which implies it) both do. It is never a raw user toggle.
- setActiveItem takes new-style ids only; 0 means leave the core's register alone.
- reassertAfterSaveLoad re-arms after the core read a save back into WRAM (a save state load, or the player picking an in-game save file). The takeover usually survives both, so reconcile sees no drop. What does not survive is the side effect of arming: WasmHostMenuSetTakeover zeroes hud_cur_item_x/l/r (HostMenu_DropSecondaryItems), and a save written under the abandoned lane design carries those bytes back. DidPressButtonForMap reads hud_cur_item_x with no feature gate and moves the map to Select the moment it is non-zero, while the modern scheme still sends X, so the map button goes quiet until this runs. Re-sending the standing request is the whole fix: the C side clears the registers again on every arming call. lastHolding is dropped too, because the WRAM it mirrored was replaced.
- wantedActiveItem is what the host last asked the register to hold (0 if never). The pause menu reads this, not byte 132, to choose the opening cell: on the frame the menu appears, byte 132 may still show the value the native init just replaced.
- reconcileHostMenu chases two drifts and no others: the core letting go of a takeover still wanted (a save state load runs the teardown), and the register holding something other than the last write while the takeover is in force.
- setGear writes one ladder. `tier` is the ladder's own rung: a gear tier for the first three, the arrow type (0 plain, 1 silver) for the bow. The C side reads the launcher register's live value and puts the ammunition half back, the only place that half can be read without racing the frame.
- resetHostMenu is module private: a fresh core owns nothing, so the mirror is dropped across a profile swap. Only the boot subscription can know a swap happened, so exposing it would only offer a way to desync the mirror.
- On the frame the module starts running, the subscription does two jobs. A takeover armed from settings before the module existed is swallowed by the bridge's running guard (as an armed host gate once was, see packages/game-core/src/bridge/host-gates reassertHostGates), so the arming is replayed. A boot under a different profile is a different core, settings and save, so the previous profile's mirror is dropped first; otherwise its equipped item would be pushed into a core that never agreed to it. lifecycle sets the profile id before the status, so the id read is already the new one. Nothing re-arms by hand: control-scheme-store.refreshControlSettings calls setTakeover again with the new profile's answer.
- initHostMenu is called from lifecycle.startGame and deliberately not run on import. A module that subscribes because something imported it runs at whatever point the bundler evaluates it; through the wasm-bridge re-export cycle that was before subscribeGameState existed ("Cannot access 'subscribeGameState' before initialization", bundled builds only; native ESM in dev ordered the cycle the other way and hid it).
- It is re-entrant and stays installed for the renderer's life: subscribeGameState replays the current state a microtask later, so a call after the status is already 'running' still sees that boot, and the listener covers every later boot and teardown.

## apps/desktop/src/game/host-subscriptions

- The host-side records and subscriptions a running core feeds, started and stopped with it.
- Each is an explicit call, never a subscription at import time: host-menu used to subscribe on import, which the bundled build evaluated inside the wasm-bridge re-export cycle and threw on. They start after the module is set and the live flags are re-asserted, and before the UI bridge takes its first reading.
- Start keys the gear record to the profile (the ui-bridge observer re-checks the id on every reading, but the record must point at the right file before the first lands), installs the host menu's boot watcher (it replays the current state, so it still catches this boot), and attaches the music debugger to the core's sound and music traces.
- Stop drops the gear record, which is keyed by profile.

## packages/hud/src/hud-countdown-track

- Follows the game's HUD countdown across frames. The game exports the seconds left and the frames left inside the current second, never the countdown's length, so the first value seen when a countdown starts stands for the whole of it.
- The game spends 62 frames on one counted second.
- The game counts down on the overworld only; indoors the value is stale.
- framesLeftOf counts frames until the seconds reach zero, which is when the game acts on the countdown.
- A zero with no countdown before it is a cleared value, which the game turns off a frame later.
- A countdown starts when the value comes on, or when it rises while one is running.
- CountdownTrack: `total` is the seconds it started from, `totalFrames` the frames it had to run at the start, `remaining` the whole seconds left, `fractionLeft` the share still to run (1 down to 0).

## apps/desktop/src/game/index.ts

- The public API of apps/desktop/src/game, re-exporting from every game module.

## apps/desktop/src/game/item-power

- Item power arms gate word 4 (features.h kFeatures4_*), the word that says how helpful the items are. ITEM_POWER_BIT must stay in lockstep with that enum.
- Every bit is a divergence from the unmodified game: an all-clear word is the game as shipped, so clearing the word is a complete disarm.
- It is a WRAM gate word, not a host gate, because the game branches on every one of these bits. A host gate would be invisible to a save state and would desynchronise a replay.
- Nothing else in the app writes word 4, so a session owns it and writes the whole word, never a masked update.
- The dark-room lights live in the same word and are OR'd in here, because two writers of a whole word would each clear the other's half. Their bits are derived in dark-room-lights.ts; this module only writes.
- The wish ponds' plan bit (core/game-hooks/wish_pond_plan.c) sits in the same word. It is the only bit that is not a setting, so the last settings word is kept and re-written whenever the latch moves.
- apps/desktop/src/game/wish-pond-plan raises and drops the plan bit around its WasmArmWishPondPlan / WasmClearWishPondPlan calls (same contract as the word-3 session gates), so both waters consult a rung table only while one is loaded.
- The write is guarded like every gate-word write: a core built before word 4 carried bits has no export to call.

## apps/desktop/src/game/lifecycle

- A custom player sprite (.zspr) is staged for the next boot in MEMFS, where ApplyCustomLinkGraphics reads it.
- The auto-save config is set before game start and read again at stop (save on quit, pruning).
- Save on quit is best effort: a failure must never block shutdown.
- On reset the core's main loop is stopped first. The glue does not export _emscripten_cancel_main_loop on the module (it is a closure local), so the C side owns the cancel: WasmStop pauses and cancels in one call. Left running, the old core keeps emulating and keeps reporting music and sounds through the window hooks the next core takes over. A core built before WasmStop existed throws, which is ignored.
- Losing the GL context on reset is safe because the FX renderer guards with isContextLost(). The game canvas is WebGL1, so only 'webgl' is probed.
- A fresh core starts with every host gate clear. The bridge mirrors that word and skips pushing a value it believes is already set, so the mirror is dropped with the module or the next arming would be a silent no-op.
- The gear high-water record is keyed by profile, so host subscriptions stop with the module instead of leaving it for the next profile's pause menu.
- The re-entry guard in startGame must stay synchronous (no await before the 'loading' state). Otherwise React StrictMode's double invoke in dev passes the guard twice, loads WASM twice and crashes the renderer. getGameState is statically imported for that reason.
- The glue script is loaded lazily by the background warmup, which may not have finished when the game starts.
- The canvas context is created with preserveDrawingBuffer so the edge-glow renderer can cross-read the canvas on Linux (native GL clears the backbuffer after SDL_RenderPresent); Emscripten reuses the same-type context.
- That context MUST be 'webgl' (WebGL1) because SDL2's Emscripten renderer is GLES2/WebGL1. A 'webgl2' context makes SDL's getContext('webgl') null, then the software fallback's getContext('2d') is null too ("createImageData of null" on Android).
- A restart finds the context the previous stop lost, so it is restored before SDL asks for it.
- Host gate bits armed while no module existed (a debugger opened before the game) were mirrored but never delivered, so they are sent right after the module is set.
- window.__zelda3Module is a debug-only handle for devtools. The canonical module ref is wasm-bridge's current module. Never read the window handle in code.
- window.__oamSnapshot reads the sprite table as the PPU sees it, including the wide/tall high-coordinate side channels a screenshot cannot show. It is gated on the developer-tools setting in C and returns null when that is off.
- window.__oamRing drains the per-frame OAM ring the core fills after each frame's OAM is complete. Same developer-tools gate; unlike the live snapshot it has no sampling race against the game loop.
- A fresh module starts with every live flag at default, so the primed values are pushed right after boot, or the native HUD renders alongside the enhanced overlay.
- Host subscriptions (gear record, host pause menu watcher, music debugger) start before the UI bridge takes its first reading.
- The WASM crash guard arms 200 ms after boot, and only if no newer start began in the meantime.

## packages/game-core/src/live-game-states.ts

- Reads the live flag snapshot and hands it to the state registry. It is split from active-states.ts so the rules stay pure (unit-testable with a plain object) while the WASM read lives here.
- Two sources make one list: SRAM progress (follower, story beats, keys) and live player-state bytes (what the player is doing, named progress bits).

## apps/desktop/src/game/live-settings-dialog.ts

- The dialog half of a live settings push: pacing values, the native box hide, the two highlight colours of randomizer messages and the quiet receipt bits (gate word 5, which owns its own reassert after a load).
- All are host-side requests the core reconciles against its gates every frame, so they are pushed at boot, on every settings change and again after a save-state load, like the HUD hides.
- Each ccall is guarded on its own because a core not rebuilt yet lacks the export, and one missing export must not skip the others.
- After a state load the core itself keeps the native box up until the next message (WasmDialogMarkStale).

## packages/game-core/src/live-settings-feature-words.ts

- Builds the two extra bitmask words (features1/features2): the split bug-fix toggles from the generated registry plus the hand-authored features2 bits. Every id goes through the Vanilla Safe resolver first, so a parity-affecting bit is dropped before it is packed.
- The hand-authored features2 bits start at bit 24 (kFeatures2_WidescreenPlayArea, kFeatures2_WidescreenIdleAI, kFeatures2_TitleOverride, kFeatures2_HostMenu, kFeatures2_ModernControls, kFeatures2_AllowDiving = bits 24 to 29). The generated bug-fix catalog (BUNDLE_FIXES) owns features2 from bit 0 upward. Values must match features.h; bug-fix bits must match features_bugfixes.h.
- The JS key widescreenIdleEnemies is kFeatures2_WidescreenIdleAI in C ("AI" there means enemy behaviour).
- Each bug fix is on when its own toggle is set, falling back to the bundle master it was split from.
- The wide-view bits stay separate because they depend on aspectRatio, not on another feature id.
- The title hide is registered, so Vanilla Safe strips it through the same resolver.
- The modern control scheme may drive the item register. It IS the Modern HUD style, which is also the HUD that can show the bindings, so this is one condition and never two that disagree.
- The host may own the pause menu: both host-drawn HUD styles ask for it.
- Host menu and modern controls are never raw user toggles: both derive from the HUD style, and both are stripped by Vanilla Safe here and by the C-side kGateWordParityMask.
- modernControls implies hostMenu: the host writes hud_cur_item with a new-style item id (1 to 24), and the HostMenu gate is what makes Hud_LookupInventoryItem read the new-style table at all. Granting the bit only permits the takeover; the host still asks for it (WasmHostMenuSetTakeover).
- The extra dungeon's water room cannot be crossed as designed without the dive, so turning the dungeon on turns diving on. Neither answers to Vanilla Safe: added content is already a departure from the cartridge, and stripping the ability out from under it would leave the room unplayable.

## packages/game-core/src/live-settings-flags

- FEATURE_FLAGS values must match the features.h enum. The PPU render flags live in live-settings-ppu-flags.ts.
- Bits 2 (SwitchLR), 32768 (SwitchLRLimit) and 134217728 (InventoryReorder) are still defined in the core and left out on purpose: their settings were removed, so nothing can set them again, and listing them would invite a new driver.
- The JS key pauseOffscreenEnemies is the core's PauseOffscreenAI bit; the registered feature id stays 'pauseOffscreenAI' ("AI" there means enemy behaviour).
- The auto-skip-dialog override, when non-null, forces that bit regardless of the user's setting; null defers to the setting. The gameplay simulator uses it during its runs.
- The developer-tools override, when non-null, decides the developer-tools bit regardless of the user's setting. That gate only unlocks read-only instrumentation queries (sprite and combat tables and so on). It is the game's own data, not a gameplay change, so the simulator, itself a developer tool, may switch it on for a headless run.
- FEATURE_FLAGS_3 values must match kRam_Features3 in features.h.
- The four cheat category bits (CheatIgnoreCollision, CheatItemGrant, CheatStats, CheatCombat) are permissions: each only lets its cheat family run at all. The real per-cheat on/off lives elsewhere (ignore-collision's state is the WRAM byte at 0x37F, set by its own WasmCheat export), so granting all four with the master is safe and is the only way any cheat can activate.
- Vanilla Safe forces every cheat off regardless of cheatsEnabled. Cheats are the textbook divergence from stock behaviour, so they get no exemption.
- Session gates share one contract: the owning module flips the gate and re-pushes word 3 around its WasmSet*/WasmClear* calls, so the gate is open only while there is something to apply. A stale table from an earlier session can never silently start substituting items again because an unrelated setting changed (see the "leftover override table" note in core/game-hooks/item_overrides.c).
  - itemOverrides: randomizer.ts, around WasmSetChestSlotOverride / WasmClearItemOverrides. No user setting yet; the bit has no other honest driver.
  - npcOverrides: apps/desktop/src/game/npc-grant-overrides, around WasmSetNpcGrantOverride / WasmClearNpcGrantOverrides.
  - dropOverrides: apps/desktop/src/game/drop-overrides, key-drop substitution, around WasmSetDropOverride / WasmClearDropOverrides.
  - standingOverrides: apps/desktop/src/game/standing-overrides, standing-prize substitution.
  - scriptedGrants: apps/desktop/src/game/scripted-grant-overrides; the upgrade pond, the cave bat and the prize minigame slots (core/game-hooks/scripted_grants.c).
  - shopOverrides: apps/desktop/src/game/shop-overrides, shelf-slot substitution.
  - capacityProfile: starting tiers, tier caps and the wallet ladder (core/game-hooks/capacity_profile.c), open only while a profile is armed.
  - prizeShuffle: armed when the placement shuffles dungeon prizes (core/game-hooks/prize_grants.c), so the boss rooms consult the hook-owned "reward claimed" bit only while such a placement is live; the rising crystal banks an assigned crystal.
  - pondPlan: pond-plan.ts, the rupee pond's prices, throws and shown gems (core/game-hooks/pond_plan.c), around WasmSetPondThrow / WasmClearPondPlan.
  - gearArt: gear-icons.ts, extracted gear pictures (core/game-hooks/gear_icon.c), around WasmApplyGearIconsFile / WasmClearGearIcons, so the world draw seams repaint a blade or shield (in its own colours) only while a file is loaded.
  - dungeonItemGrants: another dungeon's key, big key, map or compass (core/game-hooks/dungeon_item_grants.c). Armed for the whole life of a session, not off the plan alone, because an online session receives an assigned item from the server at any moment with no plan row behind it.
  - retroBow: apps/desktop/src/game/retro-bow, the bow fed rupees instead of arrows (core/game-hooks/retro_bow.c), so the shot branch leaves its vendored expression only while costs are armed.
  - receiptGrants: randomizer sessions flip it on at start and off at stop (armReceiptGates / disarmReceiptGates in apps/desktop/src/game/receipt-grants), so a native chest-override receipt finds its message gate latched at the first chest. apps/desktop/src/game/delivery-api also flips it on when it enqueues a receipt-flow grant outside a session. The queue paces off WasmCanReceiveItem, so the gate has latched into WRAM (SyncGateWords, next frame) before the grant fires. The C side refuses every grant the instant Vanilla Safe strips the bit.
- Every substitution gate above is a parity-affecting divergence, stripped under Vanilla Safe here and by the C-side kGateWordParityMask in zelda_rtl.c. The JS strip is kept so this side stays honest instead of relying on the C mask alone.
- TrackerNotifications' host call never changes emulated state, but its call site (GameHook_NotifyItemReceived, from Link_ReceiveItem) is woven into vendored player.c, so it is in the C parity mask and is stripped here too. The tracker's item log and the simulator's onItemReceived observation depend on it and neither has a setting, so it is on whenever Vanilla Safe allows.
- The player sprite override follows whether a sprite is configured, the same as the INI's LinkGraphics key (packages/game-core/src/settings serializeToIni).
- The HUD override follows whether the enhanced overlay hides any native part (apps/desktop/src/game/live-settings computes the identical hideHud/hidePause conditions for WasmSetHudHidden / WasmSetPauseHidden). Stripping it under Vanilla Safe is what restores the native HUD and pause menu mid-session (HudOverride_Restore in core/game-hooks/hud_override.c, called the instant the bit clears in WRAM). The enhanced message box hides the native one through the same override, in either HUD mode.
- One gate (dialogControls) covers speed, hold-A and B-fill; the values ride WasmSetDialogPacing (live-settings-dialog.ts).
- Host-data gates feed host systems (tracker, navigation, renderer, overlay UI, delivery queue), not the game, so none is a parity concern and none is stripped by Vanilla Safe. They are still gated: a host feature reading emulated state answers to a switch, and an export nobody enabled returns nothing.
- Navigation data is dev-surface data, so it needs both the developer master and its own toggle. The two conditions resolve here instead of at 30-odd call sites.
- Delivery readiness matters only while something can deliver an item: a cheat grant, the override table, or a receipt-flow delivery. receiptGrants closes the gap where a pure-deliver session (online, zero chest overrides, cheats off) had no gate driver and the readiness probe answered 0.
- Receipt-flow grants and contextual receipt messages are parity divergences (a grant runs the vendored receipt path, a message substitution rewires the vendored message seam), so both strip under Vanilla Safe.
- Contextual messages also ride on an active override table: chest, npc, drop, standing, scripted, shop and pond tables arm their class message natively in C at grant time, with no delivery enqueued.
- Renderer and overlay reads have no meaningful off yet: the app cannot draw a frame or route its overlay without them, so a user toggle would only offer a way to break the window. They are declared and gate-checked so a future embedder or headless build can withhold them, and so the audit can prove they were classified.
- coloredRupees, itemSheen and archeryNeedsBow are registered ids, so they answer to the Vanilla Safe resolver and to the C parity mask. archeryNeedsBow (the archery host refusing a fee he cannot honour) has its own bit, not retroBow's, because its no-bow half is wanted in a plain seed too.
- Registered ids go through the resolver (packages/features/src/resolve-gates.ts): it strips every parity-affecting id under Vanilla Safe, then the requires fixpoint cascades that to every dependent, so a chain like extendedRendering to linearWorldTilemap to ultrawide and tallRender collapses without this module maintaining the tree.
- widescreenSprites and widescreenVisualFixes also need a view past the original picture, wider or taller, which is not part of the requires graph. It is what the view renders: a ratio of "auto" on a 4:3 display is not an extended view.
- Off-screen enemy behaviour is three-way: the pause bit answers to the 'paused' mode, 'idle' carries its own features2 bit (buildFeatureWords), and 'acting' sets neither.
- secondaryItemSlots is deliberately never armed. It belongs to the abandoned lane design: with it on, GetCurrentItemButtonIndex (hud.c) reports slot 1 whenever X is held and player.c fires hud_cur_item_x while faking a Y press, so under the modern scheme (whose map button is X) the map button fires an item. The lane-free design drives the single hud_cur_item register through WasmHostSetActiveItem. The C enum entry stays defined because an INI key still parses it.
- The unregistered quality-of-life flags (the snesrev set, see packages/features/src/feature-registry) are not FeatureDefs yet, so the resolver cannot reach them and they are gated inline. The C-side kGateWordParityMask covers every one of them regardless.
- Per-group volume is an explicit opt-in. Off, the DSP mix stays bit-exact to the original and the Music/SFX sliders are inert.
- Haptics and developer tools are not exempt from Vanilla Safe even though both only observe: the test is whether a feature touches vendored game code at all. Haptics has GameHook_Notify* call sites across ancilla.c, player.c, sprite.c and overworld.c; developer tools has GameHook_ModuleFrameEnd in misc.c. "Purely observational" was tried as the exemption test and left two features wrongly exempt.
- Bit 31 makes a JS bitwise OR negative, so the features word is handed over as an unsigned value. Word 3 is pushed as the signed result, as before.
- buildPpuFlags and buildFeatureWords are re-exported here because existing callers import them from this path.

## packages/game-core/src/live-settings-gate

- Vanilla Safe wiring for the live-settings bridge: raw GameSettings booleans map onto registered feature ids (packages/features/src/feature-registry), then resolveGates runs on them, so live-settings-flags only asks whether an id is effective and never re-derives the requires/vanillaSafe logic.
- RAW_FEATURE_KEYS are registered ids whose GameSettings field has the same name and is requested unconditionally. Any extra condition (for example "only when the ratio is wide") is applied by the caller on top of effectiveFeatureIds, since the resolver owns only the requires/vanillaSafe cascade.
- coloredRupees, itemSheen and archeryNeedsBow (world-item presentation and the archery host's refusal) have their bits in features3, not features0. The resolver cares only about ids, so they cascade and strip like the rest.
- Some ids have no boolean field of the same name: the three-way off-screen mode requests its 'idle' or 'paused' id, and the play-area toggle is optional on GameSettings. Without the derived ids the resolver never sees them and their bits are never sent.
- The widescreen corrections are one setting: the Display switch, on by default with extended rendering, covers the core bit and every fix split from that bundle. No per-fix override.
- Any other unset per-fix toggle inherits the bundle master it was split from, the same fallback buildFeatureWords relies on.

## packages/game-core/src/live-settings-keys.ts

- These are the settings keys that apply live while the game runs, without a restart. Anything absent from the set surfaces the restart toast.
- Feature flags are synced every frame via g_wanted_zelda_features; PPU flags (noSpriteLimits, newRenderer, enhancedMode7) are read every frame.
- extraDungeon is second-cartridge content: it gates the extra dungeon's overworld entrance.
- The extended-rendering bits listed (cameraLockToViewport, smoothTransitions, widescreenPlayArea, offscreenAI, widescreenSprites, widescreenVisualFixes) are pure per-frame flags with no buffer-geometry change. The geometry settings beside them (extendedRendering, aspectRatio, ultrawideRendering, tallRendering, extendY) are baked at init and are deliberately absent.
- Per-fix bug-fix toggles and the newer gameplay flags sync every frame via features1/features2. World-item presentation and the archery host's refusal sync via features3, the same path as cheatsEnabled.
- Dialog pacing values are pushed as plain values, gated by the DialogControls bit in features3. The dialog box look is a React overlay plus one hidden flag the core reads every frame. The highlight colours are the host box's colours and two words the core draws with.
- Title screen: React overlay plus the hide bit in features2 and one wanted flag the core reconciles.
- Window settings are managed by Electron. syncedRefreshRate is a host-side display switch, applied on the next fullscreen transition. pixelPerfect recomputes the canvas fit from a React prop.
- vsync is swapped via WasmSetVsync because the main loop's schedule can change mid-run. Turbo is pushed via WasmSetTurboSpeed, a plain pacing global read on every tick.
- Master volume is a Web Audio gain; music, sfx and ambient sub-volumes are WASM DSP-level. Ambience is app-mixed only (msuSyncVolume on every push) because the sound chip has no ambient split.
- displayPerfInTitle is toggled via WasmSetDisplayPerf. Enhanced save slot settings, controls, HUD settings and haptics are JS only.
- modernScheme (the per-slot assignment table) and mapOnSelect never leave the host. The scheme itself derives from hudStyle and reaches the core as the features2 HostMenu/ModernControls bits, pushed every frame.
- developerToolsEnabled syncs every frame via features0 (same path as haptics); cheatsEnabled via features3.
- vanillaSafe is deliberately absent: its gate-word masking is instant regardless (pushLiveSettings runs on every change), but flipping it also has to correct aspectRatio/extendY and MSU, which are restart-only. Leaving it out makes the toggle surface the restart toast.
- linkSprite is swapped in place via WasmApplyPlayerSpriteFile.
- resumeMSU and resetMSUAtTitle are read on every music event, not captured at session start, so a change applies to the very next one.
- Online notice toast keys are read as each notice arrives. Quiet receipt keys (added in live-settings.constants.ts) drive gate word 5 on every push, and each delivery reads them when queued.

## packages/game-core/src/live-settings-ppu-flags.ts

- PPU_FLAGS values must match ppu.h.
- None of the four PPU flags is a registered FeatureDef (they predate the registry and are not part of the snesrev quality-of-life follow-up), so Vanilla Safe cannot reach them through effectiveFeatureIds and each is hand-gated.
- newRenderer stays on under Vanilla Safe: per its settings copy it is a faster rewritten pixel processing unit, visually identical, a pure engine swap with no rendered-pixel difference. The other three visibly change the picture versus the cartridge (more or taller visible area, no OAM-driven sprite flicker or drop, smoothed Mode 7), so they are forced off like any affectsVanillaParity feature.
- Height240 (extend_y, 240 lines) must track the INI serializer, which emits it only when extendedRendering is on and never under Vanilla Safe (serializeToIni). The render-buffer height is baked at init from that INI value; setting the live flag without it would make the draw loop's botBudget disagree with the allocated texture (ppu.c PpuSetExtraSideSpace).

## apps/desktop/src/game/live-settings

- Live-pushable: feature flags (g_wanted_zelda_features) and PPU render flags (g_ppu_render_flags). Restart-only: aspect ratio and extend_y (texture size), audio (SDL device opened once), linear filtering and ignore aspect ratio (renderer init).
- Every pushed value is remembered so it can be re-asserted after a save-state load clobbers WRAM.
- The core boots on the timer frame-pacing schedule and has no INI key for vsync, so the startup re-assert is what applies the profile's choice, not only a post-load repair.
- WASM volumes are on a 0 to 128 scale; the settings are 0 to 100.
- The last full settings are kept so a live override (the simulator's auto-skip-dialog force, the randomizer arming a table) can recompute and re-push a word without the caller holding the settings object.
- liveSettingsNow is for long-lived closures that must follow the sliders. A snapshot captured at profile load reads boot-time values forever, which is how the replacement audio's volumes once ignored every slider.
- The story gates' settings half of word 5 is set before the module check: it is kept even when the core is not up yet, and the reassert after the next load writes it (apps/desktop/src/game/gate-word-5). It reads the event everywhere, or nothing under Vanilla Safe (apps/desktop/src/game/story-gates); a running seed's own word takes precedence.
- features1/features2 and the word-3 gate are guarded because older WASM lacks those exports. WasmSetFeatures and WasmSetPpuRenderFlags are not guarded: a failure there fails the whole push.
- Master volume goes both through the Web Audio GainNode and the WASM SDL mixer.
- Ambient is its own DSP group: the chip's bed voices are allocated by its effects engine, and without the third group they rode the SFX slider while the replacement bed rode the ambience one.
- Replacement music is mixed in the app, not the sound chip, so it needs the same volume push.
- Hide space beyond walls stays off under Vanilla Safe, like the renderer effects buildPpuFlags hand-gates; the core decides per frame where it applies.
- Turbo speed lives in the same pacing unit as vsync and has its own guard inside.
- The native gameplay HUD and pause menu are hidden when the enhanced overlay draws them.
- The extra dungeon export is guarded like its neighbours: an older WASM build has none, and the base game must not care. It reaches the core only through the live path, so without the reassert a boot that loads straight into a save state leaves the extra content off until a setting is touched.
- features1/features2 have no INI path (config.c parses features0 only), so they become non-zero only through a ccall. Priming cannot ccall (the module is not running yet), so without the reassert the per-fix words stayed zero all session, and a state load that skipped them left every feature in those words off.
- Without primed settings there is nothing truthful to send: rebuilding features0 from DEFAULT_SETTINGS would push a 4:3 non-extended word over the boot INI values.
- Gate word 3 is re-pushed before the hide reasserts: the C boot seed (emscripten_main.c) rebuilds word 3 from the INI (cheat bits only), landing after pushLiveSettings and dropping hudOverride, trackerNotifications and playerSpriteOverride. The hide requests must already be permitted when the core reconciles them.
- The turbo speed is a pacing global no boot file carries: without the reassert the key does nothing after a start until another setting change pushes the settings again.
- The remembered cheat rules are restored after a load, one more moment the core may have refused them.
- reassertFeatureFlags falls back to DEFAULT_SETTINGS when nothing was pushed or primed; buildFeatureFlags ORs the override in regardless.
- primeLiveSettings seeds the last settings so a live override can recompute and re-push before the user changes a setting. It does not seed the ambient volume.

## apps/desktop/src/game/msu-pack-loader

- Starts, stops and restarts the replacement-audio session for a profile. It lives in lib, not beside the other profile-load helpers, because it is not app-shell work: it reads storage and drives the engine with no React, and the Data Manager must re-run it when the pack changes on a profile that is already playing.
- The session owner is the profile the live session belongs to. A pack change for any other profile is a stored edit that applies the next time that profile loads, and must not disturb what is playing.
- Nothing is preloaded: the engine reads and decodes a track the first time the game asks for it, so assigning a multi-gigabyte pack costs nothing at boot.
- groupVolume: the slider when independent mix is on, full passthrough (100) when off. Music volume takes effect only with the independent-mix toggle on, matching the sound chip; otherwise replacement music would obey a slider the original music ignores. Effects and the bed follow the same terms.
- A pack with no manifest is a classic one: its numbered files become one layer each.
- In Auto, enableMSU and the audio device values are derived from the pack and written back into the settings so the boot INI, the settings UI and the audio device agree with what will play.
- Every session callback reads the settings as they are now, not as they were at profile load: the closures live for the whole session, and a captured snapshot would pin the sliders to boot values. The load-time object is only the fallback before the first live push.
- Vanilla Safe already stops the session from starting (resolveMsuPlayback), but the ambient and sfx replacement gates handed to the core are denied a second time anyway.
- reloadMsuForProfile re-runs the pack for a profile whose assignment just changed so the change is audible now. It is a no-op for any profile that is not the one playing.

## apps/desktop/src/game/msu-save-glue

- Music position for saves of every kind. The core's snapshot layout is fixed (growing it would invalidate every save), so the position rides in a sidecar file beside each save.
- saveMusicPosition always writes or clears, so an overwritten slot never keeps a stale position. A save must still succeed when only its music position could not be stored.
- restoreMusicPosition leaves a save with no stored position alone instead of silencing it: loading a snapshot already re-announces the track, and a stop here would load that save into silence.

## apps/desktop/src/game/msu-session

- One replacement-audio session per profile load. It owns lifetime, wiring and host gates only; the engine decides what to play.
- Replacement effects follow the SFX slider, not the music one. The ambient bed has its own slider, so a storm sits under quiet music without touching either.
- resetAtTitle: returning to the title forgets the resume positions, so the next run starts clean.
- replaceAmbient and replaceSfx are read once at session start (claim masks and gate bits are published then), so a flip takes effect on the next profile load, the same as the pack choice.
- window.__onGameSound channel is the core's own index (0 ambient, 1 sfx1, 2 sfx2); pan is the two pan bits. window.__msuIsPlaying is the core's synchronous "is this track, remapped, already playing" query.
- SDL2 creates its audio context during boot. If it is not up when the session starts, the attach is retried every 100 ms.
- The core music is announced only after the engine is attached: whatever the game selected before (at boot, or through a loaded state) was reported to nobody and the core will not repeat it. The announce must follow the external-music gate and the sound claims, because the core checks both.
- Stop order matters: the core holds its music port paused while the host owns music and rewrites it only when the music changes, which it will not, because the track it wants is the one it thinks is already playing. So the core music is re-announced while the gate is still on, then the gate is released.
- msuSnapshot is the live music position and ambient bed for a save's metadata, null when nothing plays. Effects are deliberately absent (nothing to resume).
- msuRestore with a null state stops music, matching a save with none.
- msuChannelReport is one channel's live state for the music debugger's meters, null when silent or with no session.

## packages/msu/src/msu-sound-claims

- What the core is told about replacement sounds when a session starts and stops.
- Two things travel together and must never disagree: the gate bit that hands a channel over, and the mask of ids taken over on it. A channel the settings switch off publishes an empty mask and a cleared gate, so the core cannot report it at all: the app never receives those events.
- A gate is armed only when the pack authors something on that channel. An armed gate with an empty mask would be a channel handed over with nothing to play it.
- SoundReplacement says whether each group of channels may be replaced at all; both are false under Vanilla Safe. ClaimedCounts is how many ids were claimed per channel, for the session's log line.
- withdrawSoundClaims hands every channel back to the sound chip.

## packages/msu/src/music-debug

- The music debugger's data: every sound event in one ordered feed, with running counts.
- Three sources: the core's sound trace reports every id the game raises, claimed or not, so the feed shows what the chip plays next to what the pack replaced. The core's music trace does the same for the music-control port, fades included, even when no pack owns music. The engine's debug bus adds what neither can see: chance rolls, where a layer decided not to sound.
- Owner is who produced or suppressed the sound: the pack's engine, the sound chip, or a lost roll. `at` is wall-clock ms for the feed's timestamps.
- MUSIC_CODES are the game's fade bytes (0xF0 to 0xF3), named the way the disassembly names them.
- window.__onSoundTrace is every raise on the three sound ports with its claim verdict; window.__onMusicTrace is every accepted music-control write and who owns music.
- The core-side trace gate costs host calls while armed, so it is armed only while a debugger watches; the engine's bus is free and stays attached for the whole run.
- The armed wish is kept here instead of trusting the gate mirror: every game boot starts from a cleared gate word (resetGame wipes the mirror, then the core comes up with nothing set), so an arming made before or across a boot is applied again once the new core is running.
- initMusicDebug runs from game start, never at import time. A module that subscribes because something imported it runs wherever the bundler orders it, which is how the same registration in packages/game-core/src/host-menu once ran before wasm-bridge had initialised and killed the bundled renderer at load. Nothing here can fire before a core exists, so installing at game start costs no event.
- Disarming keeps whatever the feed already collected.
- The events array and counters snapshot stay stable between notifications, so useSyncExternalStore sees one snapshot per change.

## apps/desktop/src/game/npc-grant-overrides

- JS-side arming for the in-core scripted-grant substitution table (core/game-hooks/npc_overrides.c). It mirrors the chest table's contract in randomizer.ts: the write only records, the gate bit is requested alongside it, and the gate stays open only while the table has entries.
- ROOM_ANY (-1) is the room key sent to the core for an entry that matches by item alone.
- Both item ids index the 76-entry native grant tables, so an out-of-range one would corrupt the receipt; it is refused here like the chest-table setter does.
- kFeatures3_NpcOverrides is armed alongside writing the table. The write itself is ungated (record only), but the gate must be requested here so it has latched into WRAM (SyncGateWords, next frame) by the time a giver's grant applies the table.
- messageId is the pre-rendered contextual receipt line for the grant (session dialogue), or -1 to keep the core's item-class template fallback. fireId is the host-assigned completion id reported when the entry substitutes, or -1 for none.
- The sprite-keyed entry is for a roomless giver whose vanilla item is shared with other roomless givers, told apart by the sprite executing at the grant seam (certified per sprite type by the decomp audit in npc-override-key.ts).
- Clearing empties the table, then closes the gate: the same double lock as clearItemOverrides.

## packages/game-core/src/oam-ring.ts

- The core captures each frame once, after its OAM is complete, into a ring buffer. Reading `oam_buf` live is unsound: the game clears every entry at the top of its loop and draws sprites after, so a read mid loop reports entries that were never missing from a rendered frame. Draining the ring gives every game frame in order, with no sampling race.
- Needs the developer tools setting on, matching the C gate. The ring head pointer is 0 when it is off, and the reader returns null.
- Frames come back in capture order, oldest first, and are consecutive game frames.
- `yHigh` is the tall Y marker: 0 means not tall encoded, 1 means the 9th bit is clear, 2 means it is set.
- `resolvedY` is the Y the PPU resolves: the 9 bit value, folded, then shifted. `resolvedX` is the X the PPU resolves in a tall only view: the 9 bit value folded at 256.
- `drawn` is true when the slot wrote pixels during that frame's rasterisation.
- `index` is the absolute capture index. The game's own frame counter is 8 bit and wraps, so a caller draining repeatedly keys on `index` to stitch overlapping reads together.
- `spriteBudgetHits` and `tileBudgetHits` count how often the per line sprite and tile budgets cut evaluation short in that frame.

## packages/game-core/src/oam-snapshot.ts

- Returns the sprite table as the PPU will read it, including the wide and tall side channels that hold the coordinate bits the stock 9 bit X and 8 bit Y cannot. A sprite whose game side position is right can still reach the PPU wrong when those disagree, which a screenshot cannot show and this read can.
- Needs the developer tools setting on, matching the C gate. The query returns pointer 0 when it is off, and the reader returns null.
- `xHigh` is signed: the X bits above the 9th. `resolvedX` is the low byte plus ext bit 8 plus signed `xHigh` pages of 512.
- `yHigh` is the tall Y marker: 0 means not tall encoded, 1 means the 9th bit is clear, 2 means it is set. `resolvedY` is the Y the PPU resolves in tall mode: the 9 bit value, folded, then shifted.
- `hide` records which terms of the player hide condition were true, and which branch ran.
- `sprites` is the per sprite slot AI gating state, 16 entries, stored after the 128 OAM slots.

## packages/game-core/src/observations

Every real transition leaving the current screen, taken from the crossings facade so one
producer serves the navigation widget, the simulator and the recommendations. `usableCrossings`
applies the span and plausibility filters, so a border bundle the simulator refuses is not
offered here either. Sources use the vocabulary the connection probes join on. A doorway
through an outer wall is enumerable, so a dataset without one has a gap worth proposing.
Outdoors only doors and pits are enumerable: a respawn leads nowhere, and a hole read from
indoors is where the player lands, not a way out. A screen edge scroll proves presence, never
absence, so it is graded apart (`flood`) and can back no removal. Presence only: `available` is
never consulted, since a crossing gated behind an item is still a crossing the dataset should
carry, and grading it on the loadout would make findings come and go with the inventory.

## apps/desktop/src/game/original-sound

- Plays the sound chip's own version of a sound, for A/B against a replacement. One buffer, no layers, no schedule, no volume shaping; one plays at a time.
- Short renders are cached because they are deterministic. Long ones are not: a minute of float32 stereo is about 15 MB per music slot, for a render that takes a tenth of a second. CACHEABLE_SECONDS is that limit.
- PREVIEW_SECONDS is how much of each target to render. A one shot is trimmed afterwards, so its figure only has to exceed the longest effect (the fanfares). Music and beds never end, so their figure is the preview length; pack tracks run about a minute, and an eight second preview cut off mid phrase.
- SILENCE_FLOOR: below this a sample counts as silence when trimming a one shot's tail. A one shot's window is mostly digital silence; trimming stops a half second bonk from holding "playing" for the whole window.
- CONTINUOUS targets play until told to stop. Their preview loops, because stopping at the render window's edge reads as the sound being cut off.
- `audible` is false when the chip produces nothing at all for an id. PlayOutcome `started` is false when there was nothing to play (no core, or a silent id); `silent` is set when the id renders but produces no sound, which is worth telling the user.
- A finished source clears `playing` only when it is still the current one: a newer press may already have replaced it.
- `playOriginalSound` is async only because the first call may have to load a core.
- PROBE_SECONDS is long enough to tell a sound from silence without paying for the full window; a scan runs it for every id on a channel. Most channels carry unused ids. A cached full render already answers the probe.
- `probeAudibleIds` returns an empty set when the core cannot render at all, which the caller tells apart with `canPreviewOriginals`.

## packages/game-core/src/override-fired

- The C to JS completion signal for physical overrides. When an in core substitution table (npc, drop, standing) applies an entry, the check that entry stands for is completed at that instant, and the core reports the host assigned fire id the arming call carried (GameHook_NotifyOverrideFired calls window.__onOverrideFired).
- Sessions use this for their physical rows instead of save flag or possession polling, because several giver checks have no reliable flag, and possession reads false fire when the vanilla item arrives from elsewhere.
- The core calls the hook synchronously from inside the wasm frame, so the handler is deferred to a microtask and never re enters the module mid execution.

## apps/desktop/src/game/play-quiet.ts

- Whether a toast may show now. Nothing the player did can happen outside a file in play, so the intro, the title, file select, naming and the attract demo stay quiet.
- The first moments after the save under the game changes (a file entered from file select, a return to the title, a state load) stay quiet too: what the tracker finds done then was done in that file, not just now.

## apps/desktop/src/game/player-sheet

- `draw-tiles`: everything the sprite studio draws reduces to a rectangular run of tiles taken
  from the 16 column sheet, looked up through a resolved 16 colour row, optionally flipped. The
  engine stores one copy of the art and sets flip bits in OAM, so a preview does the same.
  Palette index 0 is left untouched, not written as transparent black, so overlapping quads
  compose the way sprites do.
- `compose-frame.ts`: a pose atlas frame is up to two 16 by 16 halves, each a 2 by 2 block of
  tiles from its own sheet offset; the halves are not adjacent on the sheet, so they are
  composed. Quads are drawn in atlas order so the lower half lands over the upper, matching
  the OAM order the engine writes. The origin is passed in because quad offsets can be negative.
- `resolve-palette.ts`: builds the 16 colours the PPU would hold for an outfit and glove level,
  mirroring `PushBank` in `core/game-hooks/player_sprite.c`: entry 0 stays transparent, 1 to 15
  come from the outfit, and equipped gloves replace one entry. Each entry is packed little
  endian RGBA ready for ImageData.
- `flatten-palette`: the override layer is sparse (only edited outfits and the glove pair), so a
  colour is read from the override first and the original second. A ZSPR export and the boot
  flatten go through here. An empty override means Revert has nothing to undo; edits return a
  new override and never touch the original.
- `load-sheet`: one place picks the container from the extension. A ZSPR may take a stock
  palette for a sheet that ships tiles only; a pack carries its own palettes. The core only
  reads ZSPR (the INI names one path and `PlayerSprite_Apply` checks the magic), so a pack is
  flattened before it is staged for boot or pushed to a running game; a ZSPR passes through
  untouched.
- `delete-sprite.ts`: a profile's `linkSprite` is only a file name, so deleting the file alone
  leaves a dangling selection: the boot logs not found and falls back to the stock sheet, which
  reads as the setting changing itself. Every profile that selected it is reset, not just the
  active one, since the library is global. Only the active profile's selection is the one the
  core is wearing, so the live game returns to stock only when that profile was among them.
- `sheet-png`: the whole sheet as one PNG (16 by 56 tiles, 128 by 448 pixels), for the tile
  sheet view and the preview inside a pack. It is drawn in the green outfit, the one the game
  starts in.
- `thumbnail.ts`: the front facing standing pose is the sheet's first 2 by 3 tiles, the one pose
  addressable without the pose atlas, so the library list stays cheap.

## apps/desktop/src/game/player-sprite

- Live player sprite swapping. The boot path stages a .zspr through the INI (see boot-files), but a sheet can also be swapped while the game runs: write it to the same MEMFS path and let the core read it again, which overwrites the gfx and palette assets and pushes the new palette straight to CGRAM.
- Both calls return false when no game is running, so callers can fall back to "applies on next boot". Apply also returns false when the bytes are not a ZSPR.

## packages/game-core/src/player-state-rules

- State rules driven by live player state bytes: what the player is doing, and the named story bits in `sram_progress_flags`.
- `player_sleep_in_bed_state` is a step counter that is zero while asleep, so "asleep" comes from the handler state and the counter only says how far into waking the player is.
- PlayerState holds the kPlayerState values this project names (player.h). `ground` is the default and has no label.
- PROGRESS_BITS are `sram_progress_flags` bits, named from the routine that sets each. The mask travels as a tooltip hint (provenance, not chip text) so a doubted label can be traced to its byte.
- Dashing is its own state because the boots change what the player can cross.
- `playerStates` lists every state the bytes imply, in reading order.

## packages/randomizer/src/world/rules/pond-demands.ts

- JS side arming for the demand table all three ponds read (core/game-hooks/pond_demands.c). One row per prize rung, keyed by the pond and the rung's place in that pond's prize list, with the three lines the pond speaks for it.
- The table changes nothing the game computes: the pond plans' own gate bits decide whether a visit reads it (core/game-hooks/pond_demand_visit.c), so there is no bit to request here.
- It is host session state, emptied at every arm and every stop. The session layer composes the rows; this file is the ccall surface only. `setPondDemands` empties the table, then arms every row in one pass.
- The encoding of a row is in pond-demand-native.ts. `pond` is the core's pond key: 0 the capacity pond, 1 the wishing pond, 2 the cursed pond. `rung` is the place in that pond's prize list, from zero.
- `nativeId` is the bottle slot value or the item's receive id, 0 for a counted demand.
- `askMessageId` is the yes/no line naming the demand, `refuseMessageId` the line for a yes that cannot pay, `awardMessageId` the line she rises with. Each is -1 to keep the pond's own contact, refusal or award line.

## apps/desktop/src/game/pond-plan

- JS side arming for the in core rupee pond plan (core/game-hooks/pond_plan.c): one row per throw (its price, the prize ordinal it hands over or -1, the consolation it pays back, the pre rendered lines announcing the price and the consolation) and one row per prize slot (the assigned item, its receipt line, its completion fire id), plus the lines the pond itself speaks.
- Same contract as the other override bridges: every write only records, the gate bit is requested alongside it, and it stays open only while a plan is armed. The session layer composes the rows from the placement; this file is the ccall surface only.
- The gate is armed with the record only writes, so it has latched into WRAM (SyncGateWords, next frame) by the time the pond's handler reads a price.
- Clearing empties the plan, then closes the gate: the same double lock as the other tables.
- PondThrowArm: `prize` is the prize ordinal handed over, or -1 when the throw sells a capacity level. `refund` is the rupees handed back when the throw wins nothing, always below the price. `prompt` is the pre rendered line announcing the price, or -1 for no prompt. `consolation` is the pre rendered line for a throw that wins nothing, or -1 to keep the native one.
- PondPrizeArm is the grant sitting on one prize ordinal.
- `setPondClosedMessage` sets the line an emptied pond shows instead of the native come back later refusal. -1 keeps that native line, which is also what a wallet too light for the current price still shows: only an exhausted pond speaks this one.
- `setPondAwardMessage` sets the two lines a throw carrying a pool item shows in place of the native question asking which capacity family to climb: `more` while the water still holds a prize after this one, `last` for the throw that takes the final one. -1 keeps that question and its two way choice. The native line is one box and so is each of these, so the purchase asks for the same confirmations either way, and an empty seam would drop one.
- `pondThrowsTaken` reads the throws taken on the live file: what the probes and the tracker read back.

## apps/desktop/src/game/preview-core/preview-core.ts

- A core loaded only to render original sounds when no game is running. The preview chip is already independent of the running game (emscripten_sound_preview.c gives it its own SpcPlayer), but it reads the sound banks out of the parsed assets, and those are parsed only once a core has booted.
- Auditioning a sound in the pack studio should not require starting the game, so this boots a core that never runs the game: `noInitialRun` skips `main`, so no SDL, no canvas, no frame loop, just the assets in memory and the preview export reading them.
- It is a second WebAssembly instance of the same compiled module with its own heap. So it is created on demand and dropped the moment a real game module exists; from then on the game's own core answers previews.
- Core chatter from a preview boot is noise in the game log, so only failures are kept.
- WasmInitHeadless parses zelda3_assets.dat and sets the core up without SDL, which is what makes the sound banks readable.
- `standaloneRom` is the ROM whose assets the standalone core holds, so switching profile rebuilds it.
- One boot promise is shared, so several rows asking at the same moment boot once.
- `previewModuleNow` returns the already resolved module without triggering a boot. `ensurePreviewModule` is null only when there is no ROM with extracted assets.

## apps/desktop/src/game/prize-shuffle

- Dungeon prize shuffle gate: JS side arming for the in core reward seam (core/game-hooks/prize_grants.c), with the same contract as the substitution tables. The gate is requested only while a plan overrides a boss reward, so a boss room only consults the hook owned "reward claimed" save bit inside such a session.
- There is no table of its own: a reward substitutes through the npc override table like any other scripted grant. This bit only tells the core that the rewards are shuffled, which licenses the claimed bit read in the two boss room tags and the assigned crystal bank in the rising crystal.

## apps/desktop/src/game/progressive-tiers

- JS side arming of which rungs of each tiered family exist in this seed (core/game-hooks/progressive_grants.c). One bit per rung, bit 0 the first. A pickup climbs to the lowest rung still present at or above the tier already held, so an unticked middle rung shortens the ladder instead of leaving a hole in it.
- Record only writes, the same contract as the capacity plan; the read side sits inside the gated grant seams.
- CORE_FAMILY_INDEX is the kFamilies order in progressive_grants.c, not the catalog's. The core numbers armour after the gloves, and this map is the one place that difference is written down.
- Clearing disarms every family, which gives each one its whole ladder back: that is what a session which never speaks gets, and it is byte for byte the core's behaviour before the masks existed.
- `isFullLadder` is true while every family is at its default ticks, in order, with nothing to arm. The default is every rung but the ocarina's second: that one exists only as a pool copy, and at the default the pool carries a single ocarina copy, which the unarmed ladder reads as the Flute already.
- The mask is written for every family whatever the order setting, because it still governs the copies a locked vanilla giver hands over. The order flag is a separate question: with it set, a pickup carrying the tier's own id may arrive at any time and is refused only when it would step the family back down.

## packages/game-data/src/quiet-receipts

- See packages/game-data/src/quiet-receipts. With a kind's option on, a rupee, bomb or arrow the randomizer delivers goes straight to the wallet, bag or quiver (the quiet_receipt delivery, WasmGrantQuietReceipt), and a placed one is armed with the silent line, so its pickup shows the game's own nothing.
- Each option rides its own gate word 5 bit, so the bit the core reads and the one read here never disagree.
- Under the retro bow the single arrow is the quiver itself, never ammunition, so arrows are never quiet there.
- RECEIPT_KIND lists the native receipts of each kind (ancilla.c Ancilla_AddRupees, misc.c AncillaAdd_ItemReceipt).
- QUIET_RECEIPT_MSG is kReceiptMsg_Silent (game_hooks.h): no dialogue line has this id, and the seam shows no text for it.
- `quietMessageFor` gives the line a placed grant is armed with: the silent one for a quiet receipt.

## apps/desktop/src/game/quiver-icon

- The quiver's in game picture is the 128 B binary the sprite extraction emits beside the PNGs (quiver-icon.4bpp, the drawing reduced to one sprite palette row). It is handed to the core when a randomizer session arms, written to MEMFS and applied with WasmApplyQuiverIconFile, the gear pictures pattern.
- The core draws it for the single arrow receipt a retro seed hands the quiver over as, on the shelf and in the hold up, under the retro bow's own gate (kFeatures3_RetroBow, armed by apps/desktop/src/game/retro-bow). No gate of its own is flipped here.
- A sprite set extracted before the binary existed, or no running module, leaves the arrow in place. `applyQuiverIcon` resolves true when the core took the picture of the active ROM's sprite set.

## packages/randomizer/src/client/active-capacity-profile

- Holds the capacity profile the running seed was generated with, set when the session arms and cleared when it disarms.
- `progressive` says whether upgrades climb the plan in order or each carry a fixed jump.
- Readers such as the cheat console capacity ladders use it to stay inside what the seed allows: logic reads a family as its start rung plus the collected jumps, so a value no set of upgrades reaches is a value logic never assumed.
- A listener that throws never breaks the session.

## packages/randomizer/src/client/ap-client-packets.type.ts

- Client to server packets of the Archipelago multiworld protocol.
- StatusUpdate status 30 is CLIENT_GOAL.
- Get reads data storage keys. Keys starting with `_read_` belong to the server itself (for example a slot's client status).
- SetNotify asks the server for a SetReply whenever one of the listed keys changes.

## packages/randomizer/src/client/ap-kill-link.ts

- The DeathLink kill asks the core to take Link's life when another player in the room died.
- Guarded like every optional export: a core built before `WasmApKillLink` existed answers 'unsupported' and the death is only logged.
- The core drops a kill that arrives while its death module runs (death_link.c), so the same test runs here first: 'down' is a kill that did nothing because Link is already dying or at the game over.
- `MODULE_GAME_OVER` (18) is the core's MODULE_GAME_OVER from game_constants.h, read from the first byte of the UI state buffer.

## packages/randomizer/src/client/ap-link-died

- The core calls `window.__onLinkDied(cause)` when Link dies. One listener at a time, since one online session owns the room.
- The cause is a number from death_link.c: 1 when the room's kill caused the death, 0 for any other. A string cause is the death's own wording, from a host that has one.
- `byRoom` true means the room's own kill caused the death, so it is never sent back out. `text` is empty when the core has none.
- The core calls the handler from inside the wasm frame, so the listener is queued as a microtask and runs after the frame returns.

## packages/randomizer/src/client/ap-names.ts

- Name tables for a multiworld room: slot to player, and per game the item and location names behind the network ids.
- An id means nothing without its game, so every lookup goes through the slot that owns it. slot_info tells which game a slot plays.
- Slot 0 is the server itself (commands, starting inventory), named "Server".

## packages/randomizer/src/client/ap-protocol.type.ts

- The typed subset of the Archipelago network protocol the online session speaks: JSON arrays of packets over a WebSocket, each packet discriminated on `cmd`.
- This file holds the shared shapes; the packets live in ap-server-packets.type.ts and ap-client-packets.type.ts and are re-exported here.
- ApGameData is the per game name to id tables from the server's data package. `checksum` is present on every current server and is the cache key for a game's tables.
- ApNetworkItem carries network ids, not names. In ReceivedItems `player` is the slot whose world held the item (the sender); in LocationInfo it is the slot that receives it.
- ApJsonMessagePart is one piece of a PrintJSON message.

## packages/randomizer/src/client/ap-server-packets.type.ts

- Server commands outside this set fall through unhandled as the closed `Unknown` arm.
- RoomInfo `permissions` holds release, collect and remaining, each a Permission value: 0 disabled, 1 enabled, 2 goal, 6 auto, 7 auto enabled.
- `hint_cost` is a hint's price as a percentage of the slot's location count. `location_check_points` is hint points earned per checked location.
- RoomUpdate is a partial RoomInfo or Connected: only the fields that changed are present.
- PrintJSON `tags` is present on Join only: the tags of the client that joined.
- Retrieved answers a Get with every key asked for, null when the server holds nothing under it.
- SetReply means a watched key (SetNotify) changed.

## packages/randomizer/src/client/ap-socket.type.ts

- The slice of the browser WebSocket the online client uses, kept narrow so a test can hand in an in-process fake through a `createSocket` factory.

## apps/desktop/src/game/randomizer-client/apply-overrides/apply-overrides.ts

- Plan arming pushes a physical plan's override entries into the in-core substitution tables (chest, npc, drop, standing, shop, scripted), wiring each entry's contextual message and completion fire id.
- The poll list skips physical override rows: they report from the substitution seam (the fire id), so only chest, deliver and locked rows are polled. Polling them would misfire on possession style detections.
- A row whose record is a reportable check answers through the tracker's own sweep, which reads modes a plan detection cannot (the event ledger).
- Message id -1 means the class default receipt line.
- A placed rupee, bomb or arrow takes the silent line when its kind is quiet (packages/game-data/src/quiet-receipts).
- A boss reward substitutes through the npc table like any other scripted grant, but the core must also stop reading the dungeon's own pendant or crystal bit as "reward claimed", so the prize shuffle gate is armed exactly when such a row is armed.
- A wish pond rung is skipped here because it arms together with every other rung of both waters in one call (wish-pond-session.ts).
- Armed shop entries are kept for rescanShopCatchUp: arming can run before the profile's SRAM is the active WRAM state (the test harness's --auto-state loads a slot into an already running module after the session armed against whatever booted), so a single check at arm time can read stale sold counters. The tracker bridge's poll loop reruns the scan on an interval, which is correct whenever the real SRAM becomes current.
- A shelf's Nth purchase already happened when N is below its SRAM sold counter (core/game-hooks/shop_table.c). The counter survives save and reload; a purchase from an earlier session has no live fire id event left, so the persisted counter is read directly.
- The rescan is safe to repeat: markLocationFired is a no-op on a location already marked.

## packages/randomizer/src/client/baseline-entries.ts

- The armed overrides an online baseline must still look at. Their completion reports come from the substitution seam, so the plan never polls them.
- A pickup made while no client was connected fired to nobody, and only the save still shows it: the tracker's completed set, which reads an armed giver's real taken bit.

## packages/randomizer/src/client/browser-socket.ts

- The default socket factory: the browser's own WebSocket.

## apps/desktop/src/game/randomizer-client/capacity-rung-messages.ts

- The capacity receipt lines of a session as message ids. A local session folds the lines into its plan texts (receipt-plan-messages); an online session has no plan, so it composes them alone here as the session dialogue's opening pool.
- Either way the result is the lookups the arming hands the core. Under a progressive profile: family to the message ids of each planned rung, in plan order. Undefined means the dialogue could not be composed and the core shows the family's class line.
- Under a fixed profile: the (family, starting rung, jump) entries the core selects by the live rung.

## apps/desktop/src/game/randomizer-client/capacity-session

- Translates the profile a placement was generated with into the exact core writes: one WasmSetCapacityProfile per family (custom flag, start and final tier indices) and the wallet jump table (sorted distinct jumps of the wallet plan, slot = position), plus the host copy of that table the item resolver reads.
- The translation (capacitySessionOf) is pure so a test can pin it without a module; arming and disarming are the only impure steps.
- A profile with no Custom family arms nothing: every family stays on its native grid and the gate bit stays down, so a vanilla or reference seed leaves the core exactly as it found it.
- A progressive session also arms every Custom family's jump sequence (apps/desktop/src/game/capacity-plan) with the message id of each rung's pre-rendered line, so the core climbs the plan in order and shows the jump it applied. A fixed jump session writes the fixed lines instead.
- Plan fields: `families` has one arm per family in the core's family order; `walletTable` is slot to rungs, empty when the wallet stays vanilla; `armed` is true when at least one family is Custom, the only case the core is armed; `ladders` (the Custom families' jump sequences) reach the core only under `progressive`, where pickups climb the plan in order with one progressive item per family; `bonus` is what a pickup hands over beside its ceiling, per family.
- `bonusArmed` is true when some family hands out upgrade items at all (Custom or in pool), the only case a pickup can pay the bonus. The pickup bonus answers to a virtual grant, which an in-pool family hands out even with no Custom family armed, so it follows the pool, not the profile.
- primeCapacitySession is host side only: the wallet table the item resolver needs before the plan is built.
- The hold-up upgrade icons answer to the same capacity gate. A session whose families all stay on the native grid raises the gate for the icons alone: nothing else is armed in the core, so every profile seam keeps its native answer.

## packages/randomizer/src/client/check-detection

- Derives, from a check record's own gameId, the live memory read that proves the check completed: a persisted room flag bit (chest slot, direct mask, or an NPC's room recorded chest bit), an overworld event bit, or a progress buffer byte (bit mask or threshold).
- Mirrors the tracker's check-facts read modes so the poller and the tracker agree on what "done" means. A review mark on a record decides nothing here.
- `CHEST_MASK_BASE` 0x10: the per slot chest open bits in the persisted room flag word start at bit 4 (slot n is 0x10 << n).
- Progress bytes 23 and 24 are pond tier bytes; 27 and 28 are their paired empty rung flags (state_queries_progress.c [27]/[28]).
- isReportableCheck answers whether a record may report a completion at all, for a caller that reads completion from somewhere other than a detection (the tracker's own sweep covers modes no detection covers). A real record can always report; an id nothing answers to cannot.
- detectionOf returns null for an unknown id or a record with no read.
- withProgressBaseline rebases a progress threshold on a Custom family's starting rung: rung r is native level r minus 1, so a tier byte that starts above the first native level still means "advanced by one purchase" when compared past that start. From the empty rung the first purchase leaves the tier byte at 0 and clears the family's empty rung flag, so that start reads the flag byte for 0. Every other detection shape is returned untouched.

## packages/randomizer/src/audit/check-names.ts

- Maps a check id to its community standard display name: `<dungeon> - <check>` when the check belongs to a dungeon, else the check's own name, with a small data file override table for sub-areas whose standard prefix differs from their dungeon (the shared check-standard-name).
- The record form (standardNameOfCheck) takes the CheckRecord itself, so it also answers for a record the registry does not hold: a virtual row the tracker mints for a location with no check of its own (packages/randomizer/src/client/virtual-locations).
- completedLocationKeys is the set of locations a run counts as taken: the locations of the completed checks, plus the locations the substitution seam reported, which are the only word on a row no check record covers (a shelf, a pond prize past the reference's two). Two callers need exactly this set: the rules engine's collected state and the receipt lines' found/total.

## packages/randomizer/src/client/client-status

- The server keeps a slot's client status under the read only data storage key `_read_client_status_<team>_<slot>`: 0 unknown, 5 connected, 10 ready, 20 playing, 30 goal.
- The server sets 5 when the first client of a slot joins and 0 when the last one leaves; goal is never undone.
- slotOfStatusKey returns the slot only when the key names one on this team.
- statusImpliesOnline: goal outlives the client (null, says nothing), unknown means offline, any other status means the client is connected.

## packages/randomizer/src/client/client-uuid.ts

- The install's client id for Connect, generated once and kept in localStorage so a server sees the same client across sessions. When storage is unavailable the id lives for this page only.

## packages/randomizer/src/client/connection-notices.ts

- Turns the network monitor's snapshots into online notices: the slot accepted (at first, or again after a drop), the connection lost, the server not reached at all, and the session ended by an error (a refusal among them).
- Only a change of state speaks, so a retry that fails again says nothing new. A stop the player asked for is silent.
- A session started again after a stop (state back to idle) connects for the first time again, so "ever connected" resets on idle.
- The `[Online]` log prefix is stripped from an error before it is shown.

## packages/randomizer/src/client/data-package-cache

- Data package cache keyed by game and checksum in localStorage, so a reconnect to the same room asks the server only for games whose tables changed.
- Every storage call is guarded: without storage the cache is empty and every game is fetched. A failed write (storage full or unavailable) means the next connect fetches again.

## apps/desktop/src/game/randomizer-client/death-link-switch.ts

- DeathLink on and off for the session: the core's gate bit and the room link (death-link.ts) together.
- The profile's flag switches it on at start; the slot data the room hands over on Connected has the last word (slot-death-link.ts).
- dispose is the session end: the link goes, and the gate bit goes with the core's own disarm.

## packages/randomizer/src/client/death-link-toast-text/death-link-toast-text.ts

- The toast line for a DeathLink notice, split so the player's name can be drawn apart from the rest: `name + text` is the whole line. `name` is empty for our own death.
- The cause is the sending game's own free text, shown as sent, on one line and cut to a length a toast can hold.
- A cause says nothing when it is empty, the name, or "<name> died".
- A cause that opens with the name already reads as a sentence about that player, so it follows the name directly.
- deathLinkToastLine is the whole line, for the toast's accessible label and the log. deathLinkOnlineNotice is the same line as an online notice, with the player's name drawn in the player colour.

## apps/desktop/src/game/randomizer-client/death-link.ts

- DeathLink both ways. Link dying here goes out as a `Bounce` tagged DeathLink; a DeathLink `Bounced` from another player kills Link.
- The room bounces our own death back to us, and the death a kill causes must not go out again as a new one. The core marks the second itself (packages/randomizer/src/client/ap-link-died), and each direction also guards the other for 5 s.
- The core's own word decides first: a death the room's kill caused is never sent back out, however long the death took to commit. The timer stays as the second guard, for a core that reports no cause.
- The Bounce `time` field is in seconds.
- Each death that reaches the player is also told through `notify` (the online notices): one from the room, killing Link or finding him already down, and one of ours sent out.

## packages/randomizer/src/client/delivery-ready.ts

- One shot: calls back once the game can take a server item again, meaning the game is running and the delivery queue has drained.
- The online client asks for the full received list at that moment, since the list stopped where the game last could not take an item.

## apps/desktop/src/game/randomizer-client/file-in-play

- In play means the game left the title modules (the intro, file select, copy, erase, naming and the attract demo: UI mode 'title').
- Choosing a file copies it into the save block before the game leaves them (CopySaveToWRAM), so from then on the bytes the host keeps in the save (the received index, the room hash) are that file's. Before it they are whatever the last file left, or zeros.
- The save changes on a state load, on entering a file from the title, and on the way back to the title (a save and quit, a reset): each fires onSaveSwap.

## packages/randomizer/src/client/fire-reported-classes

- The physical plan classes whose completion arrives from the substitution seam (a fire id is allocated when they are armed, see apply-overrides.ts), never from polling.
- Shared by live arming and the offline reader's armed check mirror, so the routing can never drift between the two.

## packages/randomizer/src/client/foreign-icon-of-game.ts

- The icon id another player's item is held up as: the pool icon of that player's game (packages/game-data/src/data/sprite-manifest/pool-game-icons), as its place in foreign-icons.4bpp, counted from the first foreign icon id.
- A game we hold no drawing for, or an unknown game, gets the Archipelago mark.

## packages/randomizer/src/client/foreign-icon-plan.ts

- The plan with each foreign item armed as its icon id instead of the plain sentinel, so the hold-up shows the icon of the game the item belongs to (core/game-hooks/foreign_icon.c).
- The plan is classified once, with the sentinel, like any placement; this swaps only the target id of the foreign rows, whatever substitution table they arm in (TARGET_FIELDS has one field per table).
- With no resolver (a local seed, or pictures the core did not take) the plan is returned as it came. A resolver answer of undefined keeps the sentinel.

## packages/randomizer/src/client/foreign-item-line.ts

- The receipt line a location shows when its item belongs to another player: what it was and who it went to, `Progressive Scale sent to Zelda!`. One line per such location, composed with the session's other lines, so the pickup says where the item went instead of showing a class template.
- The line comes as candidates, fullest first (receipt-line.type.ts), and the composer keeps the first that fits the box: the item name loses words from its end, then characters (cuts of 16, 12, 8 tried longest first), and says so with "...", before the line falls back to naming the player alone. The player is never shortened.
- The item carries the primary highlight and a named player the secondary.
- ForeignItemOf answers undefined when the room named nothing. ForeignOwners is location to the owning player, as an online session keeps it beside its placement.

## packages/randomizer/src/client/freestanding-key-drops.ts

- Freestanding placed keys that physically cross the drop absorption seam. A key standing in a room is the same absorbable sprite as a released key drop, and the one absorption handler every freestanding pickup crosses is already intercepted by the drop override table (keyed room and size).
- The table certifies, per check, that its room holds exactly one such placed key (decomp audited), so a (room, small) drop entry substitutes it safely.
- The only certified entry today, check-135, is the mountain tower's caged key.
- The lookup calls getCheck so an unknown id throws and the table stays honest with the dataset.

## apps/desktop/src/game/randomizer-client/item-behavior-session

- The item behaviour arms a session makes beside its placement: which rungs of each tiered family exist, how helpful the items are, which items light an unlit room, and whether the bow is fed rupees. All come off the placement's own stats, so a stored seed is played under exactly the rules it was rolled under.
- The lights matter more than they look: the fill counts every ticked one as satisfying a dark spot, so a seed may put something needed behind an unlit room and hand the player a rod for it. Arming them is what makes that rod light the room.
- The item power pair the tier ticks decide is derived here instead of read from the stats, by the same function the logic uses (packages/randomizer/src/world/item-power/item-power-rule). A seed with no beam blade needs the hammer to wake the tablets, and one with no blade at all needs the medallion doors to take none. Freezing that pair at generation time would let a stored placement and the running game disagree the day the derivation changes.
- Plan fields: `modes` is how each family's copies arrive (in order, or the rungs themselves); `itemPower` is the setting after the tier derived fallbacks, what the core is armed with; `darkRooms` is which items the seed counted as a light; `retroBow` is what a shot costs and whether it costs anything; `storyGates` is which recorded event each story gate reads and what the counts ask for; `vanilla` means the full ladder and the unmodified game.
- `retroShelves` are the arrow shelves the core restocks in place (the quiver's shelf and the refills). Only a retro seed with vanilla shops has any; a shuffled scope puts the quiver in the item pool instead.
- Story gates are armed for every seed, altered or not: the seed's own choices replace the settings half of word 5 while it runs (apps/desktop/src/game/story-gates).
- Only a retro seed arms the bow: with it off the shot branch has to stay the vendored expression, and an armed pair of costs with the gate open would charge for shots the seed never priced. The restocked shelves are armed under the same condition, so an unarmed bow never finds a restocked shelf and a restocked shelf never outlives its bow.

## packages/randomizer/src/client/item-lookup

- Resolves a community standard item name to the receive item index the delivery layer feeds to the core, following a duplicate alternate alias one hop when the direct record has no native id.
- The seven crystals answer first: they share one native id, so each one's grantable id is a reservation the records cannot hold (packages/game-data/src/data/prize-receive-id). A pendant carries its own id and falls through to the record path.
- Counter upgrades and progressive families carry no native id: they resolve to the reserved virtual ranges every grant seam translates (upgrade-receive-id and progressive-receive-id contracts), so a progressive copy is mapped to its next tier by the core from live inventory, never statically here.
- A wallet upgrade name resolves to a slot of the session's wallet jump table (session-wallet-table.ts), the table the core climbs by, so the id and the grant never disagree; outside a session it is unresolvable.
- A dungeon flavoured record answers with the targeted id of the dungeon it belongs to (packages/game-data/src/data/dungeon-item-receive-id). Its native id credits whichever dungeon the player stands in, which is right only while the family cannot leave its dungeon, so the targeted id is used for every mode, including the baseline, where it lands on the same dungeon the native grant would have.
- A flavoured name with no record of its own falls back one hop to the base family item ("Small Key (Ice Palace)" to the small key record).
- Every native id is range checked: the native grant tables hold 76 entries, so an id outside 0x00 to 0x4B resolves as undefined instead of reaching the core.
- The retro quiver has no record: it resolves to the single arrow receipt it is granted as (retro-bow.constants.ts).
- itemIdByStandardName is for display (label, sprite) and skips the native id range check because nothing is granted through it.

## packages/randomizer/src/client/key-drop-size.ts

- A key drop spawns the large drop sprite when the drop's vanilla item is its dungeon's Big Key, the small one otherwise.
- The core matches a drop override on (room, size), so an entry armed at the wrong size never fires and the vanilla key is granted instead (drop_overrides.c).

## packages/randomizer/src/client/last-network-status/last-network-status.ts

- The last network picture of the last online session, kept after the session ends (the game stopped, the socket closed). The Network tab shows it as the last known state while no session runs, and says so, instead of an empty page.
- Kept for this run of the app only.

## packages/randomizer/src/client/listener-set.ts

- A set of listeners with an unsubscribe per add, where one listener that throws never stops the rest.

## packages/randomizer/src/client/local-session-items

- Resolves an assigned dataset item id to the receive item index the core understands, and to a display name.
- Progressive families and counter upgrades have no native id: they resolve to the reserved virtual ranges every grant seam translates, so a progressive copy lands on the next tier from live inventory at grant time.
- A dungeon flavoured record resolves to the targeted id naming its own dungeon (the same reading packages/randomizer/src/client/item-lookup gives the name), because its native id would credit whichever dungeon the player stands in.

## apps/desktop/src/game/randomizer-client/local-session.ts

- Plays a generated placement against the live core with no server. start() runs the shared start sequence (session-start.ts: the physical plan, refused loudly on plan errors, then every in-core table) and arms the poller over every detectable planned location.
- Reports: overrides (chest, npc, drop, standing, scripted, shop) and vanilla locked locations are log only because the game grants the item physically. Deliver entries are the one class the session acts on: they route through the delivery queue, as the NPC trigger when the check's gameId carries one, the plain item grant otherwise.
- `stats` holds the arm time plan counts, populated by start(), which the status view reads.
- Message id -1 means the class default receipt line; only a non negative id is passed as a contextual message.
- A listener that throws never breaks the session.

## apps/desktop/src/game/randomizer-client/location-poller

- Watches for newly completed planned checks and reports each one, once, to the active randomizer session. Polls only what the session's plan includes.
- Two sources, one per row. The plan's own detection stays because it is not always the record's own: a locked capacity family's compare is rebased on its starting rung (withProgressBaseline), and only the plan knows that. A row with no plan detection reads the tracker's own completion sweep (packages/navigation/src/tracker/completed-checks-core.ts over packages/navigation/src/tracker/check-facts), which reads every mode a record can carry including the event ledger; without it a row recorded only in the ledger was logged poll blind and never reported.
- Never both for one row: the sweep also resolves records from other records (derived-checks.ts), and a row that already reads straight from memory must not gain a second, looser way to fire.
- A PollEntry has the session key it reports under, the record behind it when there is one, and the plan's own read when it carries one. At least one of the two answers, or the plan would not have kept the entry.
- `baselineOnly` rows are read at a baseline only, from the tracker's completed set: an armed override whose completion the substitution seam reports live. An online baseline reports it when its server lacks it, which is a pickup made while no client was connected.
- The shop catch up rescan runs every tick, not once at arm time: a shelf armed before the profile's real SRAM became the active WRAM state (a test harness loading a state into an already running module) would otherwise read a stale sold counter forever.
- A pending rebaseline is resolved on a tick, never at the load call itself: the flag words the detections read only latch into WRAM a frame after the load reasserts them, so reading immediately would see a zeroed buffer and rearm every check.
- A rebaseline adopts the loaded state's own completions: everything already done counts as reported, everything else becomes eligible again. It replaces the set instead of adding to it, so a state loaded backwards rearms the checks it undid. An online session still reports each complete check its server does not hold (poll-rebaseline.ts).
- A tick that throws is skipped: the module may not be ready yet.
- suppressLocationReport takes a location out of polling's reporting, for example an armed physical override whose completion arrives from the substitution seam, where a possession detection would false fire when the vanilla item arrives from elsewhere.
- requestLocationRebaseline is called after a save state loads. The reported set lives in JS while the completions it mirrors live in WRAM, and a state load swaps that WRAM wholesale; without it the poller reads already collected checks as new and redelivers each deliver class check. The request latches whether or not polling runs yet, because an automation boot loads its state before the session connects.
- pauseLocationPolling stops the ticks but keeps the suppressions: an online reconnect resumes with the same overrides.
- startLocationPolling: the first tick adopts what is already complete instead of reporting it. The state at start is not news to a local session, and an automation boot loads its state around the connect, so waiting for a load's own request is a race the poller loses. `knownReported` is the online half: given, the first tick (and each one after a state load) reports every complete check it answers false for, instead of adopting it silently.

## packages/randomizer/src/client/message-log.ts

- The room's chat and item messages as a ring buffer (the last 200), with change listeners so a panel can follow along. A listener that throws never breaks the log.

## packages/randomizer/src/client/native-grant-id.ts

- What the game's own script passes to the plain receive seam when a check's vanilla grant fires, per check kind.
- The npc kind id comes from the record itself. The boss prize always grants the ceremonial heart, receive id 62 (decomp audited: the arena pickup's receive call). World items (standing, dig, bonk) resolve their vanilla item record's receive id.
- A dungeon reward's falling ancilla carries the id the boss's own script grants. A pendant's record says which id that is; the seven crystals share one id no record holds, so those alone come from the prize table (packages/game-data/src/data/prize-receive-id).
- The native grant tables hold 76 entries (ids 0 to 75); 0xFF marks "no item" in the records.

## packages/randomizer/src/client/network-facts

- What the network section needs that the room state does not already hold, read off the packets as they cross: counters, timestamps, the room's advertised settings, and which of this client's reported checks held another player's item. Two observers, one per direction, each a plain update of the facts.
- `requestedGames` are the games asked for in GetDataPackage: every other game of the room came from the cache by checksum.
- `scoutOwners` maps a location to the slot receiving its item, from the scout answer.
- `retryInFlight` means a scheduled try is under way: its socket is opening or its slot is being accepted.
- The room's settings come from RoomInfo or the part of them a RoomUpdate (or Connected) changes.
- When the socket closes, what described the live connection goes with it.

## packages/randomizer/src/client/network-monitor.ts

- The online client's network section, an Observer on its traffic: every packet in and out passes through here, and so do the socket's open and close, the reconnect schedule and the error that ends a session. Listeners get a fresh NetworkStatus (network-status.ts) after each.
- Once the slot is accepted the ping (packages/randomizer/src/client/network-ping) runs, its echoes stopping here, and the roster is asked for (create-roster.ts). When the roster settles the tracker links open, and they close with the connection.
- `send` in the deps goes straight to the socket; the monitor's own `send` counts the packet first.
- `received` returns true for a ping echo, which goes no further. `changed` means a message was handled and the room state moved, so listeners hear it.
- `attempting`: the scheduled try started; it stays in flight until the next schedule or the slot is accepted.
- `stop` is the session end: the ping stops, the facts stay readable, an error among them. `reset` is the session start: nothing of an earlier run is kept.
- When the connection is gone, what was learned about it (ping, roster, tracker links, presence) goes too.

## packages/randomizer/src/client/network-ping

- Round trip time to the room. While connected, a Bounce tagged `rotp-ping` goes out every PING_INTERVAL_MS addressed to this slot only, and the server echoes it back as a Bounced.
- The time is taken from this client's own record of when each id left, never from the echo.
- PING_WINDOW is how many round trips the mean covers. An echo later than PING_EXPIRY_MS is dropped: the connection it measured is long gone.
- handleBounced answers true when the packet was one of this client's pings.

## packages/randomizer/src/client/network-players.ts

- The room's players on this slot's team, in slot order. This slot is online while its own connection is; every other one as packages/randomizer/src/client/network-presence has it.
- The status is the slot's client status, except that one needing a connected client reads unknown while the slot is offline (a tracker holding the slot keeps the server's value alive).
- This slot's checks come from the room; another slot's from its tracker link (tracker-links.ts), when one is up.

## packages/randomizer/src/client/network-presence

- Who is connected to the room and what each slot's client status says. Three sources feed it: the client status read at connect (packages/randomizer/src/client/client-status), the `!players` line (roster-of-reply.ts), then the room's Join and Part messages.
- A slot can hold several game clients at once, so each keeps a count and reads online while it is above zero.
- Trackers and text clients (this app's own tracker links among them) join and part too, but never count: a player is online while a game is.
- NON_GAME_TAGS are the tags the server calls non game clients (its _non_game_messages). A non game client's Part carries no tags; its text says "has stopped tracking the game" and the like, which NON_GAME_PART matches.
- onlineOf answers true, false, or null when the room has not said. handlePrint answers true when the message changed a slot's count. setOnline records what `!players` listed for the slot.
- setStatus with `seed` also decides online while nothing else has. A key the server did not fill (null) says nothing about presence.

## packages/randomizer/src/client/network-roster/create-roster.ts

- Who is already in the room when the slot is accepted. The server announces joins and parts, never who was there first, so each connection asks twice: a Get of every slot's client status on the team (then SetNotify, so a change arrives as a SetReply), and `!players` once through Say, when there is another player to ask about.
- The roster settles on the `!players` answer, or after SETTLE_AFTER_MS when none comes. Only then do the tracker links open, because a tracker connected to a slot makes the server list that slot as connected. For the same reason a later listing never decides a slot one of this app's tracker links holds.
- This slot's own status is shown too, but its presence is the connection's, so its status never seeds presence.
- query asks once per connection; reset (the connection closed) lets the next one ask again. received answers true when the packet moved a slot's presence or status.

## packages/randomizer/src/client/network-status.ts

- One NetworkStatus snapshot, built from the session's status, the packet facts (packages/randomizer/src/client/network-facts), the room state, the ping, the presence counts, the tracker links' progress and two reads of the game (the received index and whether a file is in play).
- A hint's cost in points follows the server's own formula: a percentage of the slot's locations, never under one point (and 0 when the percentage is 0).
- A game the client did not ask for was served from the cache under the room's checksum, so it counts as matched.
- Queued items are those handed on and not granted yet: the run in a row, plus the positions handed ahead of it, less the ones among them the game already granted.

## packages/randomizer/src/client/network-status.type.ts

- The online session's network picture, one snapshot at a time (network-status.ts builds it). Times are epoch ms, so a reader works out an age or a countdown against its own clock.
- `configuredUrl` is the address as the profile holds it; `url` is the candidate that opened (packages/randomizer/src/client/server-url), null until one did.
- `uuidShort` is the first block of the install's client id.
- `worldVersion` is the world package version the slot was generated with, null until Connected; `appWorldVersion` is the version this app speaks (AP_WORLD_VERSION).
- `connectedAt` is when the slot was accepted on the live connection, null while not connected. `reconnectAttempt` counts tries since the last drop, 0 while connected. `nextRetryAt` is when the next try runs while reconnecting and waiting, null while a try is in flight. `retryInFlight` means a try is under way: its socket is opening or its slot is being accepted. `error` says why the session ended in error, or why the server was never reached while retrying.
- `pingMs` is the last round trip in ms; `pingMeanMs` the mean of the last PING_WINDOW round trips.
- `heldItems` are items the server sent before the scouts were armed, waiting for them. `queuedItems` are items handed to the game and not granted yet. `receivedIndex` is how many of the server's items the save holds.
- A player's `online` is null when the room has not said (neither `!players` nor a join, part or client status). `status` is the slot's client status; a status that needs a client reads unknown while offline. Another slot's `checked` and `total` come from a tracker link, null while none is connected.
- `hintCostPoints` is a hint's price for this slot, worked out as the server does.

## packages/randomizer/src/client/notice-burst

- The toast queue's reducer, which folds a burst into one line. A collect or a release sends a room's worth of items in one message, and a toast per item would bury the game.
- Notices of one group (a kind, and for items the other player) that arrive within BURST_WINDOW_MS of the last one form a burst: the first BURST_LIMIT show as they are, and the next replaces them with a single summary that counts the whole burst ("136 items received from <player>") and keeps counting while the burst lasts.
- An entry's `at` is when its group last grew; `count` above 1 means the entry is a burst's summary.
- Trimming drops the oldest entries past MAX_VISIBLE. The singles of the burst still forming count as one line, since the next notice may fold them: a burst in progress never pushes out a line of another group that would still fit once it folds.
- queueNotice leaves the queue unchanged when the profile turned the notice's kind off.

## packages/randomizer/src/client/notice-of-print.ts

- The notice a PrintJSON message raises, or null. Items are told from this player's side: received from someone, sent to someone, found for ourselves, or passed between two other players.
- A hint keeps the server's own line, its names drawn apart.
- Joins and parts of trackers and text clients (this app's own tracker links among them) raise nothing, and neither does anything this client said or did itself, except its own goal.
- PrintSide `slot` is this client's slot, null before Connected.

## packages/randomizer/src/client/npc-capability

- Capability probes decide, per capability gated location, whether the app can physically play a shuffled item there.
- A location is serviceable when it resolves to a check record, its nominal vanilla item resolves to a native receive id, and it has either a physical substitution key (npc, standing, drop or scripted tables, which report completion at the grant seam itself through override fired events, so no polled detection is needed) or a certified live detection for the deliver path.
- The resulting sets feed generation (only these locations enter the shuffle) and the bridge (the rest classify vanilla locked), so a plan error on a probed location is structurally impossible for fresh seeds.
- Data driven and stable per build, so each set is cached after the first walk.
- The pond probe runs the same test over every pond's own pair of slots: the capacity pond's two carry scripted grant keys (its handler's own seam), like the cave bat and the prize minigame, and each wish pond's two carry npc keys (the receive seam, keyed by the water's room). A numbered rung past a pair has no seam of its own, so certifying the pair certifies that pond's whole ladder (packages/randomizer/src/world/pond/pond-spots reads a pond's pair out of the set).
- POND_SLOT_LOCATIONS maps every pond's two vanilla slots to the grant its fairy makes there in the unmodified game. The capacity pond's pair is named by the upgrade table, the wish ponds' pairs by the npc scope, because that is where each one's vanilla item is written down.
- Generation carries one set for every pond, so all six pond slots are certified; the capacity only complement stays over the upgrade table, because that is the only pair a profile locks.
- The undeliverable sets are complement views: the locations generation must keep vanilla.

## packages/randomizer/src/client/npc-override-key.ts

- Substitution keys for scripted (npc) grants: decides, per check record, how the in-core npc override table identifies the giver's grant at the plain receive seam.
- Indoor givers key by (room, vanilla item); the boss prize keys by its arena room and the ceremonial heart grant. A giver with no room keys by vanilla item alone, and so does a giver whose grant runs somewhere other than the room its record names (ROOMLESS_GRANT_CHECKS).
- Keying by item alone is allowed only while that item id is unique across every roomless giver (certified over both scope surfaces), or, for the audited givers whose shared vanilla item makes that impossible (the three bottle givers), by the giver's own sprite type.
- SPRITE_KEY_CERTIFIED (117, 43, 57): sprite types the decomp audit certifies to grant inside their own handler frame (the bottle seller, the sleeping man under the bridge, the chest carrying locksmith), so the sprite executing at the receive seam is the giver itself.
- ROOMLESS_GRANT_CHECKS (check-060): the record's screen says where the giver is found, but the escorted elder hands his reflector over after the escort ends, on the mountain overworld, when the tagalong trigger for that outdoor area turns him back into a sprite and the fresh sprite's first frame calls the receive seam (tagalong.c:562-570 over kTagalong_OutdoorInfos / kTagalong_OutdoorRooms; sprite_main.c:24674-24686 and 24721-24728, all with player_is_indoors clear). A room test would refuse every one of these grants, so they key by item alone under the same uniqueness rule.
- The boss prize's arena room pins its ceremonial grant, and the dungeon reward's the falling one, since both rows carry the arena room and nothing else.
- NpcOverrideKey: `roomId` is the giver's indoor room index, or null to match by item or sprite; `vanillaItemId` is the native receive id the giver's own script grants; `spriteType` is set on sprite keyed entries only.
- The ambiguous set holds vanilla grant ids carried by two or more roomless givers across both scope surfaces (npc gifts and world items that key by item alone). Room keyed duplicates stay allowed because the room disambiguates them at the seam. Computed once over the scope tables. A slot key (a restock, a pond rung) has no record and no giver, so it is skipped.
- World items (standing, dig, bonk) use this table only when they cross the receive seam and the standing table has no physical claim on the pickup.
- A null key (no native grant id, or a roomless giver of an ambiguous item) sends the caller to the delivery path.

## apps/desktop/src/game/randomizer-client/online-arm-scouted

- The real core's answer to a scout: the scouts become a Placement (scouts-to-placement.ts) and the session arms through the one start sequence a local seed uses (session-start.ts), so a solo room and a local seed with the same options set the game up identically.
- Each location holding another player's item arms the foreign sentinel, with a receipt line naming the item and who it went to.
- Only a core that took the pool icon pictures gets icon ids: the sentinel becomes the icon id of the owner's game, so the hold-up shows that game's icon (foreign-icon-plan.ts). Otherwise the plain sentinel stays.
- Afterwards the dedup set keeps every location the game grants in world: every class but deliver. A deliver row's own item comes back through the receive path instead.
- stopScoutedTexts stops following the tracker with the armed lines (session end).

## apps/desktop/src/game/randomizer-client/online-check-reporter.ts

- A check the poller saw complete, on its way to the room: the goal's own check sends the goal, and a check with a server id is remembered (a reconnect resends it) and sent while connected.

## apps/desktop/src/game/randomizer-client/online-client.ts

- The online session's state machine, with the game and the socket passed in (online-core, a socket factory), so it runs unchanged in node against a fake server. The app builds it through online-session.ts with the real ones.
- Lifecycle: start arms the core and dials; then RoomInfo, DataPackage, Connect, Connected (apps/desktop/src/game/randomizer-client/online-dispatch handles each packet).
- A server that cannot be reached, at the first connect or after a drop (down or restarting), is redialed on the backoff of packages/randomizer/src/client/reconnect with the overrides left armed. The try is scheduled before the status says reconnecting. A stop or a refusal ends the session and disarms everything.
- A save swap asks again (online-save-swap.ts).
- Every packet both ways passes the network monitor, which owns the tracker links (online-network.ts).

## apps/desktop/src/game/randomizer-client/online-collected.ts

- The room holds these locations of this slot as checked (`!collect`, another session of the slot, or this one). The poller takes each out of its reporting for the rest of the session.
- Each shows completed in the tracker at once: a key with a record joins the collected checks, and a restock or a pond rung, which has no record, joins the taken locations its virtual row reads.
- Nothing is written to the game: its own completion flags still say what the save did.

## apps/desktop/src/game/randomizer-client/online-config-of-profile/online-config-of-profile.ts

- What an online profile's session connects with. The room sets the game up (its slot data and scouts), so only the connection travels.

## apps/desktop/src/game/randomizer-client/online-connected

- Connected: store the slot's side of the room, resend what the server missed, scout once, then poll.
- A reconnect finds the scout already answered and the overrides still armed, so it only resumes polling. The poller's first tick reports every locally complete check the server does not hold (poll-rebaseline.ts), which is how a check made offline reaches it.
- Every location the room already holds as checked shows done in the tracker and is never reported again (markRoomChecked); only the ones this game knows are marked.
- Before any of it, the save in play is bound to the room, or the session ends when it belongs to another (packages/randomizer/src/client/online-room-identity), so nothing of another room's save reaches this one.
- A slot from another world package version is refused (storeSlot returns the refusal message), and the slot data's DeathLink decides over the profile's (slot-death-link.ts).
- isKnownReported: whether the server already holds this key's check. A key it has no id for never reports, except the goal check, which counts as reported once the goal is reached.
- First connect scouts the plan, trimmed to locations the slot has. A reconnect whose earlier connection dropped before the answer came asks again, or nothing would ever arm.

## packages/randomizer/src/client/online-context.type.ts

- What every per packet handler of the online client shares.
- `fail` ends the session with an error and no reconnect follows; `logLine` replaces `message` in the log.
- `markConnected`: the server accepted the slot, status goes active and the backoff ladder resets.
- `isLive` is false once the session was stopped: an arm still in flight must undo itself.
- `setPlacement`: the scouts became this placement, shown with who owns each foreign item (the Spoiler tab).
- `setDeathLink` turns DeathLink on or off for the rest of the session: the gate bit and the room link.

## apps/desktop/src/game/randomizer-client/online-core.ts

- The real game behind the online client's seam (online-core.type.ts): the gate bits a session sets before it connects, the teardown when it ends, scouting and arming the scouted placement, delivery, polling, what the save keeps of the room (the received index and the room hash), the room's collected checks and DeathLink.
- arm sets the online gate bits before connecting: the foreign sentinel must be a grant id before the first scouted override arms, and a death must report from the first frame. disarm runs on every stop path (a refused connection included), so a failed start leaves neither bit set.
- The goal's poll row: its event is read from the ledger, which no detection covers, so the row carries none and the poller answers it from the tracker's own sweep (apps/desktop/src/game/randomizer-client/location-poller).
- startPolling arms the fire channel too: the scouted session armed it with the same reporter, and a reconnect before the scouts were armed still reports every substitution it sees.

## packages/randomizer/src/client/online-core.type.ts

- Everything the online client asks of the game, behind one seam. The session speaks the protocol; this is the only way it reaches the core, so a test runs the whole client in node against a fake (apps/desktop/tests/randomizer/ap-protocol.keep.test.ts) and the app passes the real one (online-core.ts).
- DeliveryOutcome 'not-ready': the game cannot take the item now, so the received index must not move past it.
- ScoutedInput is the scout answer and what the room says about the slot. `seedName` is the room's seed name, standing in when the slot data names no seed; `itemName` is an item's name in its owner's game (the room's data package); `gameOf` is the game a slot plays, when the room said.
- ScoutedOutcome armed: the placement the scouts became (null when the core keeps none), the player each foreign item belongs to, and the plan's poll entries (null keeps the ones polling already has). Refused: nothing is armed.
- arm is the session start, before the socket opens (the online gate bits). disarm is the session end: every override, gate and table the session armed.
- armScouted arms the session exactly as a local seed with the same options would, and leaves in `maps.overriddenLocationIds` only the locations granted in world.
- deliver queues one item; `onGranted` runs when the game confirmed the grant, and only then. `senderName` is null when the server itself sent the item. cancelDeliveries withdraws every queued item not granted yet.
- onDeliveryReady is one shot: the game can take items again (running, delivery queue drained).
- isFileInPlay: a save file is in play (not the title, file select or the attract demo). onSaveSwap: the save under the game changed (a state load, a file entered, the return to the title).
- goalEntry is the goal's own poll entry, reported under its check key; null when nothing detects it.
- pausePolling stops the ticks and keeps the armed overrides (a reconnect resumes with them).
- readRoomHash is the room hash the save holds (room-hash.ts); 0 means no room yet.
- markCollected: the room holds these locations of the slot as checked, so show them done and never report them.
- setDeathLink sets the DeathLink gate bit when the slot data decides differently from the profile.
- killLink answers 'armed' when the kill will land, 'down' when Link is already dying, 'unsupported' with no export.

## apps/desktop/src/game/randomizer-client/online-data-package

- RoomInfo and DataPackage: learn every game in the room, from the cache when its checksum is already held and from the server otherwise, then ask for the slot.
- The tables of every game are kept, not only this one's, so a message naming another world's item reads as a name (print-json.ts).

## apps/desktop/src/game/randomizer-client/online-dispatch

- Routes each server packet to its handler. Commands this client has no use for are ignored.
- A socket message passes the network monitor packet by packet first (network-monitor.ts), then raises one change for the monitor's listeners.
- A refused scout never answers, and the session is armed from the scouts alone, so nothing could set the game up: the session ends, as a local seed with no plan does.

## packages/randomizer/src/client/online-goal

- The run's goal goes to the server as `StatusUpdate` with CLIENT_GOAL (30) once the final fight is won.
- The goal is the ledger's "Ganon beaten" event, check-351 (the location packages/randomizer/src/client/randomizer-completion-bits.constants.ts writes the goal rules for; packages/navigation/src/simulation/engine/goal in the simulator names the same row), polled like any other row but never a server location.
- The ledger bit is written the frame Ganon's death finishes, so the goal fires exactly when the run is won.
- Sent once per connection when it fires locally, and sent again on a reconnect when already reached, since the server may never have seen the first and a repeat changes nothing.

## packages/randomizer/src/client/online-handshake

- Pure builders for the client packets the online session sends while connecting, and the parser that turns a raw socket message into typed server packets (a message that is not a JSON array yields no packets).
- FALLBACK_VERSION (0.6.6) is sent when the server's RoomInfo names no version of its own.
- The version claimed is the server's own, so a newer server never refuses an older build.
- items_handling 0b111 (ITEMS_HANDLING_ALL): receive remote items, own world items, and starting inventory.

## packages/randomizer/src/client/online-items.ts

- Resolves a server item name (community standard) to the receive item index the core understands.
- A progressive family name resolves to its virtual id (progressive-receive-id contract), so the tier a delivery lands at is decided by the core from live inventory at grant time, the same path the local session takes.

## apps/desktop/src/game/randomizer-client/online-messages

- PrintJSON: a message is rendered with the room's names (print-json.ts), logged under `[AP]`, kept in the session's message log and told as an online notice (notice-of-print.ts).
- This client's own `!players` echo (sent on each connect, create-roster.ts) is dropped. The answer to it comes on every connect: the room feed keeps it, the log does not.
- RoomUpdate merges the newly checked locations and the renamed players into what Connected stored; a location checked there (a `!collect` among them) shows done and is never reported again.

## apps/desktop/src/game/randomizer-client/online-network.ts

- The online client's network monitor together with the tracker links it opens once the roster settles.
- The tracker links dial the URL the main connection opened on, with this install's client id. That URL is null before the main connection opened.
- The monitor's snapshots also report the connection's changes as online notices.

## packages/randomizer/src/client/online-notices

- What the online session tells the player, one notice at a time: items both ways, the room's other finds, hints, the connection, players joining and leaving, goals, releases, DeathLink and chat.
- The session emits every notice. The play area's toast stack (useOnlineNoticeToasts) listens and shows the kinds the profile's settings leave on.
- A notice is its whole line (every part's text, joined) plus the same line in parts, so an item name and a player name can be drawn in the message highlight colours.
- `counterpart` is the other player an item notice is about, so a burst of them reads as one line.
- A DeathLink notice is a room death that killed Link or found him already down, or our own death sent out.

## apps/desktop/src/game/randomizer-client/online-overrides.ts

- Online scout plumbing: maps every server location of this game to the key it stands for, through the frozen id table (ap-ids.constants.ts). The wire speaks ids, the app keys by location key.
- What each scouted location arms is decided by the shared start sequence over the placement the scouts become (online-scouted.ts). Server items no in-world pickup covers are delivered by apps/desktop/src/game/randomizer-client/server-delivery.
- Scout-first dedup: every scouted location id joins `overriddenLocationIds` before the scout is sent. Once the scouts are armed, the set keeps exactly the locations the game grants in-world, so their receive-path delivery is swallowed (apps/desktop/src/game/randomizer-client/online-received).
- `pollEntries` is what to poll before the scouts are armed. The armed plan replaces it.

## packages/randomizer/src/client/online-probe

- Pre-flight probe for an online randomizer boot. It opens a WebSocket, reads the RoomInfo the server greets every socket with, then closes.
- It never sends Connect, so the room sees no join and no leave. It answers only whether the server is reachable and hosts this game, and reads its version.
- A wrong slot name or password is the real session's to report, through its own error path.
- A bare local host:port tries ws:// only. Any other address tries wss:// first and ws:// when the secure socket never opens (packages/randomizer/src/client/server-url).
- An attempt reports `opened`, which tells the caller whether another scheme is worth a try.
- `game` is the server-side game key and defaults to this app's own registered name.

## apps/desktop/src/game/randomizer-client/online-received

- ReceivedItems are delivered exactly once per save. The save keeps how many of the server's items it already holds (packages/randomizer/src/client/received-index). That number moves only when the game confirms a grant (packages/randomizer/src/client/received-cursor), never when an item is merely queued.
- A packet starting past what the save holds plus what the queue carries is a gap: the client asks for the whole list again (Sync, answered at index 0). A packet starting before it has its known prefix skipped.
- A list stops where the game could not take an item. Nothing resends the rest on its own, so once the game can take items again the full list is asked for once more.
- Nothing is delivered while no save file is in play (the title, file select): the index and the room hash in the save block are not a file's yet. Entering a file asks for the list again (online-save-swap.ts). A save bound to another room takes nothing (packages/randomizer/src/client/online-room-identity).
- An item is this slot's own pickup echoed back when its sender is this slot AND its location is one the core grants in-world (an armed override). That item is already in Link's hands, so it only moves the index. The sender check matters as much as the location: another player's item can carry the same location id from their own world.
- Nothing is decided before the scout answer is in, since only it says which locations the core grants in-world. Packets held until then run in arrival order.
- The server itself sent an item when its sender is slot 0 (an admin send) or its location is negative. The protocol keeps negative locations for items no location holds: -1 is a cheat command, -2 the starting inventory. `!getitem` names the player who asked as the sender.
- The saved index moves over every settled list position in a row.

## packages/randomizer/src/client/online-room-identity

- A save belongs to one multiworld room. The save keeps the room's hash (room-hash.ts): zero until the save first meets a room, when that room's hash is written.
- A save holding another room's hash takes nothing from this one. Its received index counts a different list, so delivering against it would hand out the wrong items.
- `acceptsRoom` ends the session when the save in play may not take this room's items.
- A save with no room yet is bound to this one at its first granted item.
- `bindSaveToRoom` runs on Connected and after every save swap, before any check is reported or item delivered. A save of another room ends the session before it sends that room's checks here. With no file in play there is no save to judge yet; entering one is a save swap.

## packages/randomizer/src/client/online-room

- What the online client knows about its room has two lifetimes. The per-connection half (roomInfo, connected, heldReceived, syncPending, resyncWait) is reset on every new socket. The rest outlives a reconnect, because the overrides armed from the scout answer stay armed while the client redials.
- `heldReceived`: ReceivedItems held until the scout answer is in.
- `syncPending`: a Sync is out, so every further gap waits for its full list.
- `resyncWait`: the cancel for waiting until the game takes items again to ask for the list once more. A new connection sends the full list on its own, so a reset cancels it.
- `reportedLocal`: every location this client reported, resent on a connect for any the server lacks.
- `scoutIds`: the locations asked for in the scout, asked again when a drop lost the answer.
- `scoutArming`: a scout answer is being armed, so a second answer waits for it instead of arming twice.
- `scouted`: the scout answer has been applied, or nothing needed scouting.
- `cursor`: where the received list stands between the queue and the save (packages/randomizer/src/client/received-cursor).
- `roomHash`: the room identity a save is bound to (room-hash.ts), null until RoomInfo names a seed.

## apps/desktop/src/game/randomizer-client/online-save-swap.ts

- The save under the game changed: a state load, a file entered from file select, or the way back to the title. Whatever the queue still holds was meant for the save that is gone, so it is withdrawn.
- The new save is bound to the room first, or ends the session when it belongs to another room. Then the received list is asked for again.
- The answer is filtered by the index the new save holds, so a state loaded from before three items receives exactly those three again, and a file with none of them receives the whole list.

## apps/desktop/src/game/randomizer-client/online-scouted.ts

- LocationInfo is the scout answer. The game arms the session over the placement the scouts become, polling switches to that plan's own entries, and the received items held until now run.
- A session stopped while it armed disarms again. A placement the plan refuses ends the session the way a local seed with plan errors does.

## packages/randomizer/src/client/online-session-config.type.ts

- An online session is started with the room and the slot only. Everything the game is set up with comes from the room itself (the slot data and the scouts), as a local seed's comes from its placement.
- `url` is kept as typed: a bare local host:port tries ws:// only, any other wss:// first, then ws://.
- `game` is the server-side game key and defaults to this app's own registered name.
- `password` is absent or empty for an open room.
- `deathLink` joins the room's DeathLink: a death here kills the others, and theirs kill Link.
- `trackOtherPlayers` opens one tracker connection per other player for their checks count (tracker-links.ts). It is on unless false.

## apps/desktop/src/game/randomizer-client/online-session.ts

- The online session is the multiworld client (online-client.ts) wired to the real game (online-core.ts) and the browser's WebSocket. A test passes its own `deps` to run the same client against a fake server.

## packages/randomizer/src/client/online-session.type.ts

- The online session's surface is the shared session contract plus what the room told it.
- `slotData` is the world's slot data, checked by parse-slot-data.ts. It is null until connected or when malformed.
- `messages` holds the room's last 200 messages, newest last.
- `senderNameOf` names the player an item came from ("Server" for slot 0).
- `placement` is the placement the scouts became, null until they are armed. `onPlacement` also hands the player each foreign item belongs to.
- `networkStatus` (connection, health, players, server and progress) is built fresh on each read. `onNetworkStatus` fires on every packet in or out, every ping echo and every state change.

## packages/randomizer/src/client/online-socket.ts

- One connection to the room, over the candidate URLs of packages/randomizer/src/client/server-url in order. A socket that closes without ever opening hands over to the next candidate, so wss:// failing on a server that only speaks ws:// falls back to it. The session hears one close, for the last socket.
- A socket that fails to construct reports its close in a microtask, so the caller already holds the link when it hears the close.
- A socket error is ignored: the close that follows decides.
- A send that throws (not open yet, or already closing) is dropped: the reconnect resends what matters.
- `onClose(opened)` tells whether any candidate ever opened (a drop, versus nothing answering).
- `close()` returns false when no socket is left to close, so the caller cleans up itself.

## apps/desktop/src/game/randomizer-client/override-fire-registry

- The session-side half of the override-fired completion channel. Each armed physical override entry carries a fire id allocated here. When the core reports a substitution (packages/game-core/src/override-fired) the id maps back to its location and the session reports the check, once.
- Sessions reset the registry when they stop, together with the in-core tables the ids point into.
- While a check is physically armed (npc, drop or standing substitution), its completion must be read from the real substitution facts, never a possession-proxy detection.
- `firedLocations` exists because a shelf slot and a pond prize past the reference's two have no check record, so the tracker's completed set never lists them. Anything that counts completed locations (the receipt lines' found/total numbers) reads these alongside it.
- `markLocationFired` backfills a substitution the core already recorded before this boot (a shelf sold in an earlier session, per its persisted SRAM counter), or a location the multiworld room holds as checked (online-collected.ts). No fire id exists for either, so it bypasses the id ledger and writes straight to the location set the live path also writes.

## packages/randomizer/src/client/physical-plan.type.ts

- The physical plan is the bridge's answer to "what does this placement mean in the running game". Every planned location falls in exactly one class: an in-core chest override, an in-core scripted-grant (npc) override, a poll-and-deliver grant, or a generation-locked vanilla location (no physical action, still reported).
- A non-locked location with no physical path is a plan error, never a silent skip, so a session must refuse to start on any.
- `PlanNpcGrant` holds the parameters forwarded to the delivery queue's npc trigger. A deliver entry carries it when the deliver should run the NPC trigger instead of the queue grant.
- Each override sub-object is present exactly for its plan class: `target` for 'override', `npcOverride` for 'override-npc', `dropOverride` for 'override-drop', `standingOverride` for 'override-standing', `scriptedOverride` for 'override-scripted', `shopOverride` for 'override-shop'. `targetLocalId` at the top level is the native receive id of the assigned item for 'deliver' entries.
- `PlanEntry.item` is the assigned (or scouted) community-standard item name. `detection` is how completion is observed live; absent means poll-blind (locked only).
- npc override: `roomId` is the giver's indoor room index, or null to match by item or sprite. `vanillaItemId` is the native receive id the giver's own script grants. `spriteType` is set for sprite-keyed entries only: the certified giver's sprite type.
- standing override: `area` is the overworld screen index (outdoor) or room index (indoor). `sprite` is the standing prize's sprite type. `half` is the indoor room half the prize stands in: 0 left, 1 right, 2 either.
- shop override: `slotIndex` is the slot's stable id across every shop, which keys its sold counter. `roomId` is the indoor room the shelf stands in. `entrance` identifies the shop when the room is shared, or -1 for any.
- shop override `owArea` is the overworld area the shop's own door stands in, or -1 when no door of its own reaches it. Several doors share one room AND one entrance value, so this is what tells them apart: the running game keeps the area a visit was entered from for the whole visit (core/game-hooks/shop_table.h).
- shop override: `subtype` is the shelf sprite's own subtype, which names one shelf inside the shop. `depthIndex` is the purchase order within the slot (the shelf sells depth 0 first). `depth` is how many purchases the slot carries in total, so the core knows when it empties. `currency` is the native currency tag (packages/randomizer/src/world/shops/shop-price-native: rupees, arrows, bombs, hearts, bottle). `amount` is the amount, or the bottle-slot value a bottle price demands.
- drop override: `roomId` is the drop's indoor room. `big` is true for the large-key drop sprite, false for the small-key drop sprite.
- `PlanCounts.pollBlind` counts locked locations with no usable detection: reported never, logged once.

## packages/randomizer/src/client/placement-bridge

- The placement to game bridge classifies every planned location of a Placement into the physical plan classes.
- Chest-kind checks with a resolvable item become in-core chest overrides. Standing world items with a certified pickup seam become in-core standing overrides: the pickup shows and grants the assigned item natively. Checks whose grant crosses the plain receive seam with a usable key (npc gifts, boss prizes, the receive-crossing world items) become in-core npc overrides. Key drops become in-core drop overrides. The boss-prize slots have no seam at all and are reported as locked vanilla, not dropped.
- Physical classes report completion from the substitution seam itself (override-fired events), so they need no polled detection. Remaining detectable checks are delivered on their flag flip. Generation-locked locations need no action because the game already gives vanilla, and they are still polled and reported. Anything else is a hard plan error the session must refuse on.
- A location has no check record when it is a restock or a pond rung.
- A locked location must hold its vanilla item, so a shuffled item there means the placement predates the lock (a stale seed the game cannot honor), which stays a hard refusal.
- A shelf slot is keyed off the shop dataset, not a check record: the app has none for a shelf, because a shelf is a repeatable purchase in the unmodified game instead of a one-off check. It reports from its own substitution seam.
- A pond prize slot under a non-legacy pond is keyed by its place in that pond's own table (pond-prize-target.ts). It is still the scripted-grant plan class, so completion reports from the substitution seam like every other pond grant.
- The certified scripted-grant surfaces (upgrade pond, cave bat, prize minigame) substitute at their own handler seams. They are checked before the generic keys, since their records carry no receive-seam key at all.
- A freestanding placed key crosses the same absorption seam as a released key drop, so it substitutes through the drop table under its room.
- A key drop's vanilla item names its size; the record's roomId pins it.
- The persisted placement stats say what generation locked; the same derivation names the rows.
- Physical override rows report from the substitution seam, so only a locked row without a detection is invisible to the session (poll-blind).

## packages/randomizer/src/client/placement-view

- Crosswalks a placement into the tracker's own vocabulary, so a check can be shown holding what this run put there instead of its vanilla contents.
- A placement is keyed by id, so a real check is its record (packages/randomizer/src/world/location-record maps a shelf's first stock back to the shelf's record).
- The rows the dataset does not model on its own: a slot with no check record takes the virtual id packages/randomizer/src/client/virtual-locations mints for it, so its row shows what this seed placed; an item with no item record is counted and reported instead of silently dropped; another player's item (an online placement) has no record in this game and is shown by name, with its owner's name when the server gave one.
- `sphereByCheck` holds the sweep sphere the location was reached in.

## packages/randomizer/src/client/plan-armed-checks.ts

- Offline mirror of session arming: the check ids a session would physically arm for this placement. apply-overrides.ts allocates a fire id for exactly the fire-reported plan classes, so classifying the placement the same way names the same checks. An offline read then applies the same real-bit versus possession-proxy routing the live poller uses, without a session ever having started.

## packages/randomizer/src/client/plan-scope-flags.ts

- The scope flags of a persisted placement: what generation locked, derived again from the same stats so the bridge and the fill always name the same rows.
- Option toggles lock whole scope tables. A toggle on locks the capability probe's undeliverable remainder, classified with the same probe so both sides name the same rows.
- The capacity spots follow the profile the placement was generated with: a present fairy slot not proven deliverable stays vanilla, and a vanilla meter locks the bat explicitly, exactly as packages/randomizer/src/world/fill/fill-world does.
- A Custom family with a locked spot also hands the poller its starting rung (rung 0 is the empty tier and is included), so the pond's "purchased" compare keeps meaning "advanced by one purchase". Other modes are omitted.
- A wish pond at Vanilla grants locks her own two slots to what her upgrade produces, so no override is armed there and the real upgrade runs. Only a placement that recorded the rule does.
- A non-legacy pond owns its prize slots outright: they are proven deliverable at generation or they are not locations at all, so nothing of the pond is ever capability-locked.
- A slot sold as a prize rung is out of the npc and world scopes, as the fill left it.
- The rolled shop prices live on the placement, not its stats; the plan builder merges them in.
- A placement that kept the legacy pond carries no prize slots at all: its two pond names stay the capacity families' spots.
- Each wish pond's numbered rungs are that pond's own, apart from the capacity pond's.

## apps/desktop/src/game/randomizer-client/plan-summary-log.ts

- Logs the physical plan's one-line summary and every plan error under the session's tag.

## packages/randomizer/src/client/plan-target-id.ts

- The id an override arms for a planned item is the native grant id its name resolves to, or the core's foreign-item sentinel for another player's item (an online placement only). The setters check the sentinel against the core's own WasmForeignItemId before arming it.
- `planItemLabel` (now plan-item-label.ts) is what a plan error calls the item.

## packages/randomizer/src/client/players-reply/roster-of-reply.ts

- The server's answer to `!players` is a CommandResult line such as `2 players of 3 connected :: Team #1: Link (Zelda) Ganon :: Team #2: ...`.
- A name in parentheses has no client connected; a bare one has at least one.
- Names may hold spaces, so each known name is matched whole, longest first, and taken out of the line once matched.
- `team` is 0-based while the line numbers teams from 1. A known name the line misses is left out of the roster.

## packages/randomizer/src/client/poll-heap-reads

- The live-memory reads behind a check detection, all straight off the core's heap: the persisted room-flag words (with the live room's unsaved bits folded in), the overworld event bytes and the progress buffer.
- The live room block is two little-endian words: the room id, then its unsaved flags.

## packages/randomizer/src/client/poll-rebaseline.ts

- The poller's baseline decision, kept pure so it can be tested without a core. It runs on the first tick and after every state load: whatever reads as complete stops being eligible.
- A local session adopts it all silently, since nothing outside the save needs telling. An online session passes `isKnownReported`, and every complete entry the server does not already hold is handed back in `toReport`: those are the checks made while no client was connected, and the server learns of them here.
- Suppressed entries report from the substitution seam, never from polling, so they stay out whatever the state shows.

## packages/randomizer/src/client/pond-demand-messages.ts

- The pond demand lines in the session's composed pool: for every rung of a custom pond whose demand the core asks, its ask, refuse and award lines (pond-demand-lines.ts), appended in pond and rung order and looked up by the core's own (pond, rung) keys, `${pond}:${rung}`.
- A line index of -1 means the rung has no such line.
- The core asks every demand but one: a rupee demand at the rupee pond is that throw's own price, charged by the pond's own flow with its own lines, so it gets none here.
- The rupee pond's award line says whether the water still holds a prize after this one (a later throw carries a prize), read from the plan's throws exactly as the core reads them.
- Rungs asking for the same thing speak the same words, so a line already in the pool is reused and the pool stays small however long the ladders are.

## packages/randomizer/src/client/pond-demand-native.ts

- A rung's rolled demand in the terms the core stores it, at any of the three ponds (core/game-hooks/pond_demands.h): a kind tag, an amount and one native id.
- The kind tags (POND_DEMAND_KIND) are shared with core/game-hooks/pond_demands.h. They are the shelf's currency tags plus one, so zero is "no demand", and item is the one kind a shelf has no tag for.
- counted: the amount, straight through (hearts in whole hearts). bottle: the value the game stores in a bottle slot for that content, with how many bottles of it as the amount. item: the receive id of the named item, resolved the way a grant of that name is, so a progressive family name carries its virtual id and the core reads the tier from live inventory.
- `nativeId` is the bottle-slot value or the item's receive id, 0 for a counted demand.
- Pure: the item lookup is handed in, so a test pins it with a plain map.
- An item name with no receive id is refused: it would arm a demand the core could never test, and a demand armed as none would hand the rung over for free once the handler charges it.

## packages/randomizer/src/client/pond-demand-rows.ts

- Pond demands for a session, the pure half: the placement's rolled demands in, one row per prize rung of every custom pond out, in the core's own keys.
- POND_DEMAND_KEY is the core's key for each pond (core/game-hooks/pond_demands.h).
- A rung is position k in its pond's prize list (pondPlanOf): the prize ordinal at the capacity pond and the rung of the ladder at a wish pond, the same position the demand roll reads.
- Only a custom pond arms rows: a pond at its native economy asks for what it always asked, and a legacy pond has no rungs at all.
- Each row carries its three composed lines (pond-demand-messages.ts), looked up by the same keys. A session without composed dialogue arms -1 for all three, and the core then keeps each pond's own line at that beat.
- A pond arms whole or not at all. An item demand whose name has no receive id refuses every row of its pond, and the refusal line names the rung that stopped it.
- A row keeps the location it came from for the log and the harness.

## apps/desktop/src/game/randomizer-client/pond-demand-session.ts

- Pond demands for a session, the impure half: hands every custom pond's rows to the core's shared demand table in one call and logs what went in. The disarm half is now disarm-pond-demand-session.ts.
- Every pond's visit reads the table (core/game-hooks/pond_demand_visit.c): a rung with a row asks for its demand, takes it and throws it in before the gift. A rupee row at the rupee pond is that throw's own price, which the pond's own flow already charges.

## packages/randomizer/src/client/pond-prize-target.ts

- The scripted-grant slot a pond prize location arms, or null when the location is no pond's prize.
- Two kinds of pond hand prizes over in order from a table of their own, so both are keyed by position and never by a check record, since most of their slots have none: the capacity pond by the prize ordinal its throw schedule hands over, a wish pond by the water and the rung of its sequence.
- A wish pond at its native economy is neither: its prizes are its own two fairy slots, which are ordinary npc checks and classify as such.

## packages/randomizer/src/client/pond-session.ts

- Pond arming for a session turns the pond setting a placement was generated with into the core's throw table. Split into pond-session.ts (pure translation), arm-pond-session.ts and disarm-pond-session.ts.
- The throw schedule is not stored on the placement: it is derived again from the setting and the placement's own seed (pondPlanOf), so the spoiler, the logic and the running game always read the same prices and the same winning throws.
- The core arms one pond, the capacity one (core/game-hooks/pond_plan.c).
- Each row carries the two pre-rendered lines that belong to its amounts (the price the toss announces, the consolation a losing throw pays), looked up by amount in the session's composed pool (pond-lines.ts). The award line a prize throw shows and the emptied-pond line are armed once alongside them.
- A refused composition hands back -1 for every line, which the core reads as "keep the native one", so the pond still runs its plan with the game's own wording.
- A legacy pond arms nothing at all: the table stays empty, the gate bit stays down, and the pond's own handler runs as it always has.
- Plan fields: `throws` has one row per throw in the order the pond sells them; `prizeCount` is the pond locations of this placement; `awardMoreMessageId` is the line a prize throw shows while the water still holds one; `awardLastMessageId` the line for the throw that takes the last prize; `closedMessageId` the line an emptied pond shows; -1 keeps the native question or refusal.
- Every pond goes down together, so every stop and refusal site clears the wish ponds and the demands too.

## packages/randomizer/src/client/print-json.ts

- Renders a PrintJSON message to plain text. Id parts become names through the room's tables: a player id is a slot, an item id belongs to the game of the slot in its `player` field (the item's owner), a location id to the game of its finder.

## apps/desktop/src/game/randomizer-client/profile-reconnect.ts

- A profile's connection changed and the session follows at once. A profile session that is running, retrying or stopped by a refusal is replaced by a fresh one on the new values; a boot still waiting for the game takes them with it.
- Nothing else runs, so a profile whose game is not up connects at its next boot.

## packages/randomizer/src/client/randomizer-completion-bits.ts

- TS mirror of the C allocation in core/game-hooks/npc_overrides.c, the single documented source of the byte addresses and bit assignment. Keyed by check id; keep in lockstep with the C table's vanilla-item rows.
- Several givers gate on possession of their vanilla item and write no completion flag, so their record detections are possession proxies: sound on a normal profile, false-positive the moment a randomizer seed hands the vanilla item out elsewhere. When a session has physically armed such a check, its completion is read from the real bit the substitution seam persists, exposed as progress-buffer bytes 21, 22 and 25 (state_queries.c).
- A check not in the table already has a real-fact record detection.
- Byte 21 bits: 0x01 check-019 river king (swim gear), 0x02 check-033 first sage (running gear), 0x04 check-041 sick child (catching net), 0x08 check-060 escorted elder (reflector), 0x10 check-077 whirlpool dweller (third medallion), 0x20 check-006 standing fungus, 0x40 check-055 shelved tome, 0x80 check-008 dug-up instrument.
- Byte 22 bits: 0x01 check-080 desert tablet, 0x02 check-070 mountain tablet, 0x04 check-039 smithy's tempered blade. The smithy row's own record flag (progress byte 2 bit 4) has no vanilla writer (a dead invented bit), so its armed completion reads this bit instead.
- Byte 22 also holds the wish ponds' four gear upgrades, which have no vanilla completion flag at all: 0x08 check-021 wish pond returning-weapon slot, 0x10 check-022 wish pond guard-gear slot, 0x20 check-266 cursed pond blade slot, 0x40 check-267 cursed pond piercing-shot slot.
- Byte 25 holds the scripted-grant surfaces with synthetic keys (no vanilla receive id): 0x01 check-273 pond capacity explosives slot, 0x02 check-274 pond capacity projectiles slot, 0x04 check-040 the cave bat's meter upgrade, 0x08 check-078 haunted stump's digging tool. The haunted stump's record flag is the song played to it, not the gift.

## packages/randomizer/src/client/receipt-plan-messages.ts

- Renders one contextual receipt line per planned grant of a physical plan (chest override, scripted-giver override, queue delivery) from the frozen placement and the seed's found/total numbers, and records the baked class-template id each grant falls back to when the session dialogue cannot be composed. Vanilla-locked locations keep their native message and get neither.
- The capacity lines follow: a progressive placement appends one line per planned rung per Custom family (capacity-rung-lines.ts), a fixed-jump placement one line per (jump, starting rung) (capacity-fixed-lines.ts), so the core can show the climb a pickup applied.
- The pond's own three situations follow (the price of a toss, a throw that won nothing, an emptied pond, pond-lines.ts): one line per distinct price and per distinct refund of its plan, so a toss announces its real amount instead of a native line naming amounts no plan charges.
- The award line comes in two, one for a water that still holds a prize and one for the throw that took the last, so a player always knows whether the pond is worth returning to. pondLinesOf ends its list with award-more, award-last and closed, in that order.
- The wish ponds' two host lines follow (wish-pond-lines.ts), and the lines every pond speaks for a rung that asks for something close the pool (pond-demand-messages.ts).
- The pond lines are derived from the setting and the placement's own seed exactly as the session's arming does, so the prices they quote are the prices charged. The lines the core speaks belong to the one pond it arms, the capacity one.
- The fallback class line mirrors the core's own routing. Another player's item says what it was and who it went to.
- Index fields point into `lines`; -1 means none (native pond, or no wish pond planned). `rungIndexByFamily` is for progressive placements only, `fixedLines` for fixed-jump placements only, `pondLines` for non-legacy ponds only.

## apps/desktop/src/game/randomizer-client/receipt-text-refresh.ts

- Composes a local session's contextual lines and keeps their numbers current. The found/total counts are a tracker fact (packages/randomizer/src/receipt-text/receipt-counts), so the lines are rendered from the completed-check set at session start and rendered again on every change of that set (a chest opened, a save state loaded: the tracker derives again from SRAM).
- The session dialogue is composed again in place: the pool keeps its size and order, so every message id the overrides hold stays valid. The ids the arming needs (per location, per rung, per fixed line) are read off the first composition.
- The completed set is the tracker's checks plus the locations whose substitution fired this session: a shelf slot has no check record, so a heart piece bought there would otherwise never count, and the quarter the next piece announces would trail the game's own piece counter by one.
- Another player's items count toward nothing this seed shows.
- When composition is refused (unreadable blob, untranslatable language) a grant degrades to the baked class-template line instead of showing nothing.
- Every pond getter hands back -1 when nothing was composed (a legacy pond, or a refused composition), which the core reads as "no host line, keep the native one". The emptied-pond line replaces the native come-back-later refusal.
- Pond demand lines are keyed by the core's own (pond, rung) keys (pond_demands.h). The wish ponds' two host lines are shared by both waters.
- `composed` false means the baked class lines are in use. `stop` stops following the tracker at session stop.

## packages/randomizer/src/client/received-batch-order.ts

- The server sorts a collect or a release by item id, which puts every wallet and bag upgrade at the end, after the rupees, bombs and arrows they would have held. Capacity upgrades go first, so the ammunition and rupees of the same batch land in a bag or wallet that can hold them. Within each group, the server's own order stands.
- `index` is the item's position in the server's received list.

## packages/randomizer/src/client/received-cursor

- Where the client is in the server's received list, between the queue and the save. The save keeps how many items it holds (packages/randomizer/src/client/received-index), and that number moves only when the game confirms a grant, in list order.
- Items handed to the queue and not granted yet sit between the saved index and `queued`, so a repeated list does not queue them twice. `queued` is one past the last position handed on in a row, never read below the saved index.
- A grant can land out of step with the list (an own pickup echo settles at once, a queued item later), so each settled position is kept in `settled` until every one before it has settled too; the saved index then moves over the whole run.
- A batch is handed on in its own order (received-batch-order.ts), so a position can be handed on before the ones in front of it. Such a position waits in `handed` until the run in front of it is handed on too, and a repeated list skips it meanwhile.
- A save swap resets the cursor, and `epoch` tells a grant queued before the swap that it no longer counts.

## packages/randomizer/src/client/received-index

- How many server items this save has already been handed. The core keeps it in the save (packages/randomizer/src/ap-received-index). An older core without that export falls back to a value held in the page, which lasts only for this page.

## packages/randomizer/src/client/reconnect

- Reconnect timing for a dropped room: 1 s, then doubling, never more than 30 s between tries. A successful connect resets the ladder; a stop cancels the pending try.
- `backoffDelay(attempt)` is 0-based. The scheduled listener's `attempt` is 1 for the first try after a drop.

## packages/randomizer/src/client/refusal-text.ts

- A ConnectionRefused in words: one short sentence per error code the protocol names. The network tab shows the sentence; the log keeps the codes. The server may send no codes at all.

## packages/randomizer/src/client/room-hash.ts

- The identity a save keeps of its multiworld room is a 32-bit FNV-1a hash of the room's seed name, over its UTF-8 bytes. Zero is what a save with no room holds, so a hash that comes out zero is stored as 1.

## apps/desktop/src/game/randomizer-client/run-kind

- Which run this is: the plain game, a seed, or an online multiworld. One answer, asked by every surface that behaves differently for one of them.
- It exists because the app used to ask `placement !== null`, and the boot gate parks an online session with no placement (a server hands locations over one at a time). A multiworld then read as plain play: Normal's placement, the original item at every location, and the wrong roster.
- The seed case carries its placement, so a caller that needs one gets it from the same answer.
- The live question reads the session, for a surface showing the run in progress. The profile question reads the frozen config, for a surface that answers before a game is running (the home screen's per-save readout). A local randomized profile is a seed even before its placement is loaded.
- An online session that ended (stopped, or refused with an error) is no run at all. A live online session is online even once its scouts became a placement for the Spoiler tab; an ended one is plain play, never a seed, whatever placement it left.

## packages/randomizer/src/client/scope-lock.ts

- Which planned locations the session treats as locked vanilla, and the vanilla item a capability-locked location must still hold (now capability-vanilla-item.ts).
- Lock sources: an option toggled off locks its whole scope table (key drops, npc gifts, world items); with a toggle on, the capability probe's undeliverable remainder stays locked so generation and the session always name the same locations; the boss-prize slots are locked whenever the placement was generated without the prize shuffle (packages/game-data/src/data/records/items/prizes.ts).
- A slot sold as a pond prize is exempt from the npc and world scopes.
- The pond's own table is checked before the npc remainder, because it names the item she produces. The fairy slots carry their vanilla item in the capacity table; the bat is an npc-scope row.
- ScopeFlags fields that are absent mean the online flags: nothing capability-locked, nothing capacity-locked, no pond lock, no rung locations, no exemptions.
- `shufflePrizes` off (or absent) keeps every reward slot locked to its vanilla prize.
- `npcLockedLocations` (npc option on only) are scope locations generation keeps vanilla because they have no certified physical path (npc-capability). `worldLockedLocations` is the same over the world-item table.
- `capacityLockedLocations` are the capacity spots generation keeps vanilla under the placement's profile: present fairy slots with no certified physical path, and the bat of a vanilla meter (plan-scope-flags.ts).
- `pondLockedItems` are a wish pond's vanilla slots locked at Vanilla grants, each to the item her upgrade produces there (packages/randomizer/src/world/pond/pond-vanilla-slots), so no override is armed and the real upgrade runs.
- `capacityStartTiers` maps a locked spot of a Custom family to its starting rung (0 is the empty tier), so a polled "purchased" threshold is read past the tier a new file starts at.
- `shops` is the shelf scope the placement was generated with. A placement from before shops existed carries none, which reads as no slot open, so every shop behaves as with the option off. `shopPrices` empty means every shelf keeps its vanilla price.
- `pondPrizeLocations` are the pond's prize slots in prize order when the pond is part of the shuffle. Absent (a legacy pond, and the online flags) means the two reference slots are the capacity families' own spots.
- `wishPondRungs` maps each numbered rung location to its water and place in sequence (wish-pond-rung-keys.ts). Absent when both wish ponds are legacy or at their native economy.
- `pondPrizeSlots` are a wish pond's own two slots that her Custom mode sells as prize rungs (packages/randomizer/src/world/pond/pond-vanilla-slots). The npc and world scopes no longer decide them, in the fill (packages/randomizer/src/world/fill/fill-world) and here alike: they carry a pool item handed over by the rung table.

## packages/randomizer/src/client/scouts-to-placement.ts

- Adapter: a server's scout answers and slot data turned into the Placement a local seed with the same options would have produced, so an online session arms through the same start sequence a local one does (session-start.ts).
- The fill world is built from the slot's options the way the generator builds it, with no fill run: the scouts say what every location holds. Generation-locked rows keep what the fill world pre-places.
- This slot's own items map through the frozen id table; another player's item, or an id this game does not know, is the foreign item.
- The stats come from the generator's own function over that world, and the sweep gives the spheres the Spoiler tab groups by.
- `fallbackSeed` is the room's seed name, used when the slot data names none.
- Deliverable sets: the caller's, else the ones the slot's world was built with, else the app's probes (a room from before slot data carried them).

## packages/randomizer/src/client/scripted-override-key.ts

- Substitution keys for the scripted grants that never cross the receive seam: the certified surfaces of core/game-hooks/scripted_grants.c. Each is a singular, decomp-audited grant moment: the upgrade pond's two capacity purchases (its handler's own once-per-level counter bumps), the cave bat's meter write, and the prize minigame's once-only top roll (its own chest routine, outside the native chest table).
- Keyed by check id so the capability probe, the classifier and the arming switch always agree.
- Table rows: check-273 the pond's explosives-capacity slot, check-274 the pond's projectiles-capacity slot, check-040 the cave bat's meter upgrade, check-270 the prize minigame's top prize (room 262).
- getCheck throws on an unknown id, so looking the check up keeps the table honest with the dataset.

## packages/randomizer/src/client/server-address

- A profile's server address as the two fields the connection form edits. The profile keeps one `host:port` string, the shape the connect path reads (packages/randomizer/src/client/server-url); a scheme the address names stays on the host. For example `wss://host:38281` splits to host `wss://host` and port `38281`; no port gives an empty one.

## apps/desktop/src/game/randomizer-client/server-delivery

- Hands one server item to the delivery queue. Which items reach here (the received index, the echo of an in-world pickup, the room check) is decided by apps/desktop/src/game/randomizer-client/online-received; this resolves, queues and keeps track of what it queued.
- `onGranted` runs when the core confirms the grant, which is the only moment the received index may move.
- The receipt line takes an arrival slot of the session dialogue only when its delivery reaches the front of the queue, and hands it back when that delivery completes, so a burst of any size holds one slot at a time. A retry after a refusal keeps the slot it already took.
- Online context beats the core's item-class default: the receipt shows the online line, pre-rendered with who sent it when the session dialogue is live, the class template otherwise. A null sender means the server itself sent the item.
- An item still waiting in the queue can be withdrawn (cancelServerDeliveries): a save swapped under it will ask for its items again. Granted ones stay granted.

## packages/randomizer/src/client/server-host-locality.ts

- Whether a server address names a machine on this computer or its local network. A local Archipelago server answers plain ws:// only, so a secure attempt there can only fail.
- Local means a loopback address, a private or link-local IPv4 range, an IPv6 loopback, unique-local or link-local address, a `localhost` or `.local` name, or a bare machine name with no dot in it.
- An unbracketed address with several colons is a bare IPv6 address with no port.
- The `IPV4` pattern flagged by no-slop-identifiers was local, renamed DOTTED_QUAD.

## packages/randomizer/src/client/server-url

- The creation form accepts a bare host:port, and the scheme it needs depends on the host: the public servers only answer wss://, a local server only ws://. So a bare address keeps no scheme, and the connect path tries each candidate in turn. A local address (server-host-locality.ts) is tried as ws:// only; any other secure first, plain second. An address that names its scheme is tried as written.

## apps/desktop/src/game/randomizer-client/session-start.ts

- The one start sequence of a randomizer session, whatever produced its placement: a local seed (local-session.ts) or a server's scouts (online-scouted.ts). It classifies the placement into the physical plan, refuses loudly when the plan carries errors, and otherwise arms everything in-core in the order the core needs it. Polling is the caller's: a local session adopts what the save shows, an online one reports what its server lacks.
- The persisted placement carries the profile it was generated with; its wallet table must exist before the plan resolves the wallet item names.
- Item behaviour (which rungs of each tiered family exist, how helpful the items are) is armed before the plan resolves anything: a progressive copy's presentation is read off the ladder, so the ladder has to be the seed's own first.
- Every planned grant's contextual line is pre-rendered and the composed session dialogue pushed into the core before the overrides arm, so the very first chest already carries its exact per-event message id. The lines follow the tracker from there on.
- Receipt gates arm with the session, not with the first delivery: an overridden chest substitutes its item (and its contextual message) natively, so the message gate must already be latched before the first chest can open.
- The dungeon-item seams arm with the session too: an assigned key, big key, map or compass must credit the dungeon its id names from the very first one handed over.
- The capacity lines ride the same composed dialogue: their ids reach the core with the plan (progressive) or the fixed-line table, so a pickup shows the climb it applied.
- Without gear icons, a substituted blade or shield on a shelf, on the ground or on a pedestal draws in the equipped gear's colours; the hold-up ceremony is untouched. The quiver icon lets the quiver a retro seed hands over as an arrow draw as itself (the core shows it only while the retro bow is armed). Currency symbols let a shelf priced in something other than rupees say so beside its digits.
- The pond's throw table must be in the core before any prize slot is armed: a prize is handed over by the throw it sits on, so the schedule comes first.
- Both wish ponds arm after the overrides: a native-economy water pays through their npc entries.
- Hooks: `reporter` is where a substitution the core reports goes (the session's own reportCheck). `foreignItemOf` (online only) gives each foreign item's name and owner for its receipt line. `foreignIconIdOf` (online only) gives the icon id each foreign item is armed as, for its hold-up picture.

## apps/desktop/src/game/randomizer-client/session-stop.ts

- The one teardown of a randomizer session: every table, gate and seam session-start.ts can arm, emptied in the order the core needs. Safe to run on a session that armed nothing, which is how a refused or never-connected session ends.
- The shelf table is cleared too: left armed, the next session (or plain play) inherited every shelf.
- Still-queued deliveries are dropped with the session, because a stopped session must not leave receipt entries retrying forever (clear() resolves completions safely).
- The baked dialogue blob is restored, since the session's pre-rendered lines go with it.

## apps/desktop/src/game/randomizer-client/session-store

- Module-level singleton owning the active randomizer session. Every start and stop in the app routes through here, so the one-active-session invariant has a single home; the page hook is only a subscriber.
- It also holds the pending boot slot: a gated profile boot parks its session material here and the auto-start hook consumes it once the game reports running. The pending placement is loaded by the boot gate for local mode, null for online mode.
- `foreignOwners` (online only) maps a location to the player whose item it holds; empty for every other run.
- A bad listener never breaks the store.
- An online session's placement describes its room, so it goes when the room does: left behind, it would read as a local seed (apps/desktop/src/game/randomizer-client/run-kind). An online error is its end too; the session stays so the page can show the error.
- An online session's last network picture outlives it, as the Network tab's last known state. The picture reads the game, which may already be gone; the last one it sent stands then.
- A session that winds down on its own (socket closed, stop from inside) releases the active slot; every status change reaches subscribers.
- The scouts become the session's placement once armed, so the Spoiler tab reads it as it reads a local seed's.
- `resetSession` is what a profile load runs before it gates, so nothing of the previous profile survives. stopActive leaves a local session's placement standing, since a stopped seed should still show its spoiler; without the reset it outlived its own profile and the tracker went on listing a seed's locations for a normal profile.

## packages/randomizer/src/client/session-wallet-table/session-wallet-table.ts

- The session's wallet jump table, host side: the TS mirror of the sixteen slots wallet_grants.c holds (slot s of virtual id 0x67 + s maps to ladder rungs).
- Both halves are rebuilt from the same family plan at every session start (apps/desktop/src/game/randomizer-client/capacity-session), so a wallet item name resolves to exactly the slot the core will climb by.
- Empty outside a session: a wallet name then resolves to nothing, which the plan reports as an unresolvable item instead of granting a blind slot.

## packages/randomizer/src/client/session.type.ts

- The randomizer session contract: the surface a session mode exposes to the location poller and the UI. A local session resolves a reported check from its own placement table; an online session forwards it to the server.
- `reportCheck` is the poller telling the session a planned location just completed in live memory, keyed by its standard name.
- 'reconnecting' is online only: the server dropped or was never reached, and the session is retrying.
- The file had its header on line 2; it is now on line 1.

## packages/randomizer/src/client/shop-override-key.ts

- The in-core substitution key of a shop-slot location comes off the slot's own check record (`gameId.shopSeam`): the shelf's room, the entrance and overworld area that tell apart a room several doors share, and the shelf sprite's own subtype, which is unique inside any one shop. Together those name one shelf in the running game.
- A restock past the first has no record of its own, because the unmodified game has no such spot; it takes the first one's seam and its own depth index.
- The depth pair rides along so the core knows which purchase of the slot this entry is, and when the slot runs out.
- ENTRANCE_ANY and OW_AREA_ANY (-1) are the core's "match anything" values, for a shop the earlier fields already name.
- A rolled price replaces the shelf's own; with nothing rolled the shelf keeps charging the rupees the unmodified game charges.
- A price with no native form (packages/randomizer/src/world/shops/shop-price-native) cannot be sent, so the shelf gets no override. Only an item price is shaped that way, and no shelf can roll one, so this is the shape of the refusal, not a case that runs.

## packages/randomizer/src/client/slot-data-values

- The per-seed values a slot's data carries, read into the shapes a local placement keeps: the options snapshot, the two medallion locks, the rolled pond demands and shelf prices, and the deliverable spots the world was built with.
- A value the slot does not carry, or carries in a shape this game cannot read, is absent, and the caller falls back the way a placement from before that value existed does.
- A medallion arrives as its key or its name; anything else keeps the vanilla lock.

## packages/randomizer/src/client/slot-death-link.ts

- One DeathLink source: the profile's toggle. It is written into the player file, the world package hands it back as `slot_data.deathLink`, and once Connected that value decides.
- The Connect packet's tags still come from the profile flag (no slot data exists yet), so when the two disagree the tags are corrected with a ConnectUpdate. The session started with the profile's flag already applied; only a disagreement changes it.

## packages/randomizer/src/client/standing-override-key/standing-override-key.ts

- Substitution keys for standing in-world items: decides, per check record, how the in-core standing table (or the plain grant seam) can identify the pickup. Three certified shapes, all from the decomp audit.
- The standing prize sprite (the quarter-heart pickup, sprite 0xeb, one touch-grant handler) is keyed by overworld screen outdoors, and by room plus which horizontal half of the room indoors (the same bit its own obtained flag uses).
- The dash-item dungeon key (sprite 0x3b; its key form bumps the key counter with no receive) is keyed by room, in the two audited key rooms (115 and 140, one per room).
- The receive-crossing world grants (the fungus, the book, the dug-up instrument, the two tablets, the ceremonial sword) cross the plain Link_ReceiveItem seam with a vanilla item unique across roomless givers, so they key by item alone in the npc table. Their native receive ids are 41, 29, 20, 15, 16 and 1. The tablets use receipt method 3, where the seam still applies.
- The indoor half comes from the detection mask: the obtained bit 1024 is left, 512 is right. A maskless record in a shared room takes the half its roommate leaves free (room 283 takes the right half); a maskless record alone in its room matches either half (2).
- item-024 is the heart piece and item-037 the dungeon key.

## packages/randomizer/src/client/tracker-availability

- Tracker statuses for a randomized session: availability comes from the ported rule engine evaluated over the frozen placement, never from the hand-authored normal dataset (which models neither the seed nor the standard-mode escape).
- Completed checks crosswalk to placement locations by their community-standard name. A check whose name is not a location of this placement (event and prize slots, dataset gaps) can never inflate availability, so it reports blocked unless the player completed it.
- A shelf slot or pond prize past the reference's two has no check record (see apps/desktop/src/game/randomizer-client/override-fire-registry), so its completion never reaches `completedChecks`. firedLocationKeys is the session's separate record of those substitutions, folded in so their items still enter the collected-item state the rule engine evaluates against.
- `checks` carries both real CheckRecords and the virtual ones packages/randomizer/src/client/virtual-locations synthesizes for every world location none of those cover (shop slots, chiefly). A virtual id is never in the live-polled completedChecks set, so its status reads off completedLocations / available by its own name.
- completedLocations answers for both kinds. A real check whose normal detection cannot fire in this seed would be stuck at reachable forever: the pond's two named slots keep the records the reference's names gave them and poll the capacity counter bytes, and a randomized pond hands over a pool item without writing either one.
- The completed set carries the event rows too, the record of what the player did. Handing the ids over lets the rules ask about an act instead of guessing it from an item or from the lever being within reach.
- `heldItemIds` are the dataset item ids the player is holding, which the seed world reads by pool name.
- `bigKeyDoors` off (the tracker's "Big Key doors" switch) reads every big key door as open by putting the keys in the state's hands: a door whose key is held is open, so no rule needs a second version (packages/randomizer/src/world/big-keys). `smallKeyDoors` off does the same with each dungeon's small keys, as many as any rule counts (packages/randomizer/src/world/small-keys).
- `reachableScreens` are the dataset screens the engine's regions come out to, for the rows read from the records. computeTrackerSnapshot is for a caller with no use for the screens.

## apps/desktop/src/game/randomizer-client/tracker-link.ts

- A read-only connection to another player's slot, the way a tracker makes one: Connect under that slot's name with the Tracker tag and no game, which the server accepts without the slot's game, sends no items to (items_handling 0) and takes no checks from. NoText spares it the room's chat.
- Its Connected holds the slot's checked and missing locations, and every RoomUpdate after it the newly checked ones: that is the only way the server shares another slot's progress.
- A drop redials on the backoff of packages/randomizer/src/client/reconnect; a refusal ends the link.
- `uuid` is this install's client id plus `-tracker-<slot>`. `progress` is null until the slot was accepted once. `linked` means the slot is accepted on the live socket.

## apps/desktop/src/game/randomizer-client/tracker-links.ts

- One tracker link (tracker-link.ts) per other player on this slot's team, opened once the main connection's roster settled (create-roster.ts) and closed with that connection.
- Off when the profile says not to track the others, since each is a socket of its own.
- `url` is the URL the main connection opened on, null before it did. `uuid` is this install's client id. `open` makes a link for every other player not linked yet.

## packages/randomizer/src/client/virtual-locations

- Synthesizes tracker-facing CheckRecord-shaped entries for every world location this seed placed an item at that no real CheckRecord backs (shop shelves at every restock depth, chiefly). Built fresh per placement so the widget's total matches what this seed generated, never a smaller fixed dataset that silently drops whole categories.
- A virtual record carries no gameId: there is nothing to poll, its status comes from the availability engine and the fire-id ledger, both keyed by the raw world location name.
- Its kind is the one its real siblings carry (a restock is a shop slot, a pond rung a pond slot), so the "type" facet puts every rung of a ladder together; it is not a detection claim.
- vanillaItemIds carries the real vanilla item where one exists (a shop shelf, a key-drop pot). Everything here hands over a real item, so isGuaranteedReward is true even with no vanilla precedent (a pond prize rung).
- A restock rides on the screen its own slot's record names, which is what the world and area grouping reads.
- The slug keeps underscores, because a shop key uses them (`kakariko-shop-shelf_left-slot_2`). A key is already slug-shaped, so mapping a virtual id back to its location is exact.
- The virtual id is shared with packages/randomizer/src/client/placement-view so a virtual check's row and its placed-item lookup can never drift onto two ids for the same location. tracker-availability now reads VIRTUAL_PREFIX from here too.
- One cache slot: placements do not change mid-session, and this only runs against the active one.
- placementCheckRecords is every real record this seed's placement names plus a virtual one for every location none cover. A few checks (the intro's story beats such as "Link Wakes Up", "Rescued Zelda") track real vanilla progress but were never world locations, so counting them would inflate the total; they stay in the base checkRecords array for the normal profile.
- The event records are shown on every profile and are never part of a seed's total. No event is a location of any world, so that list and the placement's never overlap.

## packages/randomizer/src/client/wish-pond-lines.ts

- The two lines a planned wish pond speaks for itself. A planned visit takes no throw and asks nothing, so the native lines at those two beats (the question after she rises, the refusal of a spent water) cannot stand.
- The award: she rises and says this, then the visit's one rung follows on its own receipt. The closing: a water whose ladder is spent, every time she is spoken to.
- A rung that asks for something speaks its own award line instead (pond-demand-messages.ts), since the player did throw something in.
- Neither line names what she hands over; the receipts say that. Candidates run fullest first, so the composer keeps the longer wording when the box has room (receipt-line.type.ts).
- Both waters share the wording, so the pool carries one of each, and only when at least one water is planned (runs on a plan).

## packages/randomizer/src/client/wish-pond-rung-keys.ts

- The two item-throwing waters as the core counts them, and which of a placement's locations are their numbered rungs. The core reads a water by its place in wish_pond_plan.c's own order (the light world's water first, the dark world's second), so that index is written once here and every other file asks for it by pond id.
- A rung key is which water and its place in that water's sequence from zero.
- A rung is a location only while its pond's plan lists it: a legacy pond lists nothing, and a pond at its native economy lists its own two fairy slots, which are ordinary npc checks and never rungs. Pure: a function of the settings alone.

## packages/randomizer/src/client/wish-pond-rungs.ts

- Wish-pond arming for a session, the pure half: the two waters' settings and the classified plan in, one rung row per prize location out, in the order each water hands them over. Nothing here touches a module, so a test pins it with a plain counter standing in for the fire-id ledger.
- capacity (legacy): no rows; the water keeps its native branch list.
- vanilla-cost: the water's own two fairy slots. Each rung hands over that slot's vanilla receive id with no fire id, so the grant crosses the receive seam, where the npc table substitutes the placed item, marks the slot's bit and reports the check as the vanilla throw would. That only pays when the slot's npc entry is armed in the same session, so a slot the plan did not classify as one refuses the whole water.
- custom: the numbered rungs. Each hands over the placed item's own receive id with its receipt line and a fire id from the session's ledger, which is what closes the rung.
- A water arms whole or not at all: the core reads a missing rung as the end of the ladder, so a gap would strand every rung past it.
- Fire ids are allocated only once the whole water is known to arm, so a refused water leaves nothing behind in the ledger.
- `assigned` is false for a vanilla slot, which the receive-seam table substitutes and reports. A row keeps its location and item names for the log and the harness. `rungs` of a water plan is empty for a legacy water and for one that refused; `refusal` says why a water with prizes arms nothing. The session plan's `rungs` is every rung of both waters, the single call the core takes.
- Context: `messageIdOf` gives one location's pre-rendered receipt line or -1; `fireIdOf` allocates the completion id in the session's ledger; `lines` are the two host lines every planned water speaks.

## apps/desktop/src/game/randomizer-client/wish-pond-session.ts

- Wish-pond arming for a session, the impure half: hands both waters' rungs to the core in the single call it takes (the core empties both tables at once), then each armed water's two host lines, and logs one line per water. The disarm half is now disarm-wish-pond-session.ts.
- Arm after the plan's own overrides: a water at its native economy pays out through the npc entries those put in the table, and a custom rung's fire id comes from the same ledger they allocate from.
- A planned water hands over the next rung on each visit, and a spent water only shows its closing line. A rung with no demand takes no throw and asks nothing. A rung with one asks for it first, through the visit every pond shares (pond-demand-session.ts arms the demands and their lines).

## packages/game-data/src/data/records/items/randomizer.ts

- JS side chest item override hooks that talk to the WASM core.
- `messageId` is the pre rendered contextual receipt line for the grant (session dialogue), or -1 to keep the core's item class template fallback.
- The chest path bails on high bit ids and the grant tables hold 76 entries, so an out of range override would open as an empty chest. It is refused before the call.
- kFeatures3_ItemOverrides is armed alongside writing the table. The write itself is ungated (it only records, see item_overrides.c), but the gate must be requested then so it has latched into WRAM (SyncGateWords, next frame) by the time a chest applies the table. It stays open only while the table has entries (itemOverridesActive in packages/game-core/src/live-settings-flags), so no leftover table can reapply outside an active randomizer session.
- Clearing empties the table, then closes the gate. Closing the gate keeps it from reopening for stale data if something else fills the table without going through setChestSlotOverride.

## packages/game-core/src/ratio-capability

- What ratio a profile may render, given the capabilities it has switched on. The preset picker gates its own entries: the widest need the world tilemap and the ultrawide switch, the tall ones need tall rendering. Auto, Screen and Custom went around that, so a wide monitor on Auto, or a tall Custom ratio, handed the core a shape whose capability bits were never set.
- Above LINEAR_RATIO a ratio needs the linear world tilemap, because the stock 512 px fetch runs out. Above ULTRAWIDE_RATIO it also needs the ultrawide switch. Below TALL_RATIO (4:3) it is taller than the original picture and needs the tall renderer.
- `requestedRatio` is the ratio the settings ask for, before any capability is considered. `allowedRatio` pulls it back to what the switched on capabilities support; a profile with everything off renders 4:3, which the core would do anyway.
- `rendersExtended` is true when the view shows more than the original picture on any side. The widescreen corrections answer to it: a tall view has the same transitions, effects and sprites drawn for the original screen, so it needs them too.
- `ratioToString` builds the "W:H" word the core's config parser reads, from the served height (224) so the pair is exact for the shape asked for, and reduced, which is what the ratio pickers hand over too.

## apps/desktop/src/game/receipt-grants

- JS side entry points for the native receipt flow exports (core/game-hooks/receipt_grant.c). Item deliveries route through the delivery queue (`give_item` actions run WasmGrantItemWithReceipt); this module carries the direct calls other systems need: capacity upgrades, and pre arming a contextual receipt message.
- `receiptGrantsActive` drives both kFeatures3_ReceiptExport and kFeatures3_ReceiptMessages in the gate word (packages/game-core/src/live-settings-flags). The setter only records; reassertGateWord3 pushes the word, which latches into WRAM a frame later (SyncGateWords), the same contract the item override arming uses.
- Randomizer sessions arm the receipt gates at start, not at first enqueue: a chest override grant runs fully natively (no delivery is ever enqueued), so its contextual message gate must already be open when the first chest opens. The delivery path still arms at enqueue for grants fired outside a session. Disarming happens at session stop, mirroring clearItemOverrides.
- `grantCapacityUpgrade` grants steps the way the upgrade pond does: kind 0 is bombs, 1 is arrows, each step is one pond level. It arms the receipt gate alongside the call, which latches a frame later, so callers route through the delivery queue (deliverCustom) instead of calling in the same burst that starts a session. The core gates it with kFeatures3_ReceiptExport.
- `armNextReceiptMessage` arms the one shot contextual message for the next receipt that finishes (RANDOMIZER_RECEIPT_MSG ids). It records unconditionally; the core applies it only while kFeatures3_ReceiptMessages is open. Queue routed deliveries pass `messageId` on the action instead; this direct form is for grants that fire outside the queue.

## packages/randomizer/src/foreign-items/receipt-jump-text.ts

- The session line for a capacity upgrade addressed by its virtual receive id, the form the delivery labels and grant logs hold, for example "Explosives +2 tiers" or "Wallet +500 rupees".
- The step families carry the jump in the id; a wallet slot resolves through the session's jump table (the same table the core climbs by), so the text can never disagree with the grant.
- Never a running total: see capacity-jump-text.ts. A progressive id carries no jump of its own, so its label names the next planned step.
- Undefined for a non upgrade id or an unarmed wallet slot.

## apps/desktop/src/game/report-wasm-crash.ts

- Writes a core crash to the log with its stack, and leaves a crash dump behind.
- The dump is written after the stack lines are logged, so the dump's log buffer carries them too.

## apps/desktop/src/game/retro-bow

- JS side arming for the in core rupee bow (core/game-hooks/retro_bow.c): the two costs a shot takes out of the wallet, the plain one and the silver one.
- Same contract as the other override bridges: the write only records, the gate bit is requested alongside it so it has latched into WRAM (SyncGateWords, next frame) by the time a shot is fired, and it stays open only while a retro session is armed, so a stale pair of costs can never start charging for shots again because an unrelated setting changed.
- Clearing empties the costs, then closes the gate: the same double lock as the tables.

## apps/desktop/src/game/retro-shelf

- JS side arming for the in core stock change a retro seed with vanilla shops needs (core/game-hooks/retro_shelf.c). The quiver's shelf sells the quiver until it is owned and a refill after; every other arrow shelf sells the refill, each at its own vanilla price. A shuffled scope puts the quiver in the item pool instead and arms nothing here.
- The write only records. The gate it answers to is the retro gate, which apps/desktop/src/game/retro-bow opens alongside the costs, so a shelf can never be stocked without the bow that needs it.
- ENTRANCE_ANY and OW_AREA_ANY are the core's "match anything" values, for a shop the earlier fields already name.

## packages/packs/src/rsp

- Writes a Relic Sprite Pack. Reading one lives in packages/packs/src/link-sprites/parse-rsp.
- It is a zip, so the contents stay inspectable with ordinary tools and the format can grow an entry without breaking readers that ignore it.
- The tiles go in raw, not as a PNG: the sheet is 4bpp indexed data, and a PNG round trip would mean deriving indices from colours again. A PNG is written alongside only so the file previews in an image viewer; it is never read back.
- `withPreview: false` skips that courtesy PNG. It costs a render, which a boot time flatten does not want.

## packages/game-core/src/save-file

- `hook-save-bytes.ts`: the TS mirror of the hook owned save byte registry. The addresses are
  allocated in `core/game-hooks/save_bytes.h`, the single source of truth with compile time
  no overlap checks; this mirror exists so the offline save reader and the headless probes name
  the same bytes. Nothing may change here alone: `apps/desktop/tests/randomizer/hook-save-bytes.keep.test.ts`
  parses the header and fails when the two disagree. `SAVE_BLOCK_BASE` (`0xF000`) is the base of
  the battery block the game saves and checksums; `0xF406` to `0xF4FD` is the hook layer's run.
  Owners: substitution completion bits, one per possession gated giver (`npc_overrides.c`); the
  wallet ladder rung and one empty rung flag per counted family, explosives, projectiles, meter
  (`capacity_profile.c`); one bit per palace for a dungeon's falling reward handed over, and the
  crystal bit the receipt in flight must bank, 0 for none (`prize_grants.c`); throws paid for in
  a planned pond sequence (`pond_plan.c`); throws taken at each item throwing water, in its own
  counter order (`wish_pond_plan.c`); the sword level the smiths keep while tempering, as
  `0x80 | level` (`smith_sword.c`); one byte per canonical shop slot, armed steps already bought
  (`shop_table.c`); one bit per event the game never records itself
  (`core/game-hooks/events/event_ledger.c`); how many multiworld items this file took, 16 bit little endian
  (`ap_received_index.c`); the FNV-1a hash of the multiworld room's seed name, 32 bit little
  endian, 0 for no room yet (`ap_room_hash.c`).
- `sram-slots`: ports the game's file layout and checksum (`SaveGameFile` in `messaging.c`,
  `Intro_CheckCksum` in `select_file.c`). The 8 KiB battery save holds three `0x500` byte file
  blocks at `0x000`, `0x500` and `0xA00`, each mirrored `0xF00` later; a block is valid when its
  `0x280` little endian words sum to `0x5A5A`. The primary copy is used when it checksums, else
  the backup (the game's own fallback), else the slot is empty or corrupt.
- `offline-inventory.ts`: rebuilds the 34 byte buffer `WasmGetInventoryState` fills
  (`state_queries.c`) from the slot block, so live and offline share one parser. Offsets are the
  vanilla `variables.h` addresses minus `0xF000`: `0x340` to `0x347` bow to bombos, `0x348` to
  `0x34E` ether to book (`0x34F` is the bottle cursor), `0x350` to `0x357` somaria to moon
  pearl, `0x359` to `0x35B` sword, shield, armor, `0x35C` to `0x35F` bottles, `0x374` pendants,
  `0x37A` crystals, `0x36B` heart pieces, `0x36C` health capacity. Keep in step with the C buffer.
- `offline-player-name.ts`: ports the game's decode (`Text_WritePlayerName`,
  `Text_FilterPlayerNameCharacters` in `messaging.c`): six 16 bit name screen tile words at block
  offset `0x3D9`, each folded to a dialogue font code (tiles from `0x76` are digits, shifted down
  by `0x42`; `0x5F`, `0x60`, `0x61` map to `0x08`, `0x22`, `0x3E`), then looked up in the US
  alphabet. A bracketed entry is an icon glyph with no plain text form and reads as `?`.
- `offline-progress.ts`: adapts a slot block to the same three readers the live poller feeds the
  shared sweep, so both agree on what done means. A save on disk has no loaded room, and the
  sleep check resolves through the progress indicator fallback. The event ledger sits in the same
  block, so a save answers it too. `isArmed` routes substitution: a check the placement arms
  reads the real taken bit instead of a possession proxy.
- `progress-offsets.ts`: the offline mirror of `WasmGetProgressFlags` (`state_queries.c`), each
  buffer index mapped to its byte offset inside one file block. By index: 0 progress indicator,
  1 progress flags, 2 progress indicator 3, 3 swim gear, 4 running gear, 5 catching net, 6
  reflector, 7 third medallion, 8 magic consumption scale, 9 to 11 the low bytes of room `0x109`,
  `0x123` and `0x11E` flag words, 12 the sleep step counter (live WRAM only, no offline source;
  its check falls back to index 0 through `packages/navigation/src/tracker/check-facts`), 13 tagalong id, 14 small key count,
  15 big key word low byte, 16 to 18 the high bytes of those three room words, 19 starting point
  id, 20 map marker state, 21, 22 and 25 the substitution completion bytes, 23 and 24 the
  explosives and projectiles tier bytes (the pond's persisted purchase level), 26 the wallet
  ladder index (0 on a vanilla file), 27 to 29 the explosives, projectiles and meter empty rung
  flags (1 while a Custom family sits below its grid), 30 throws taken out of a planned pond (0
  on a file that never met a plan; the completion fact of its prize slots). Rows from hook owned
  bytes come from `hook-save-bytes.ts`, so the table cannot drift from the registry.

## apps/desktop/src/game/save-states

- A save does not wait for the core to boot, unlike a load: what it would capture once the core came up is the boot screen, written over whatever the slot already held.
- The message box's hook state is read at save time, on the frame the core saved (apps/desktop/src/game/state-dialog).
- The music position lives beside the snapshot, not inside it: the core's snapshot layout is fixed and must not grow. It is written unconditionally, so overwriting a slot never leaves the previous save's music position behind.
- The save screenshot is best effort; a failure there does not fail the save.
- A load waits for the core. The shortcuts and the overlay arm with the game view, which is up about two seconds before the core is. A request from that window is early, not wrong. Dropping it instead is what made a load right after boot silently do nothing. A named load waits for the same reason.
- `checkLoadable` runs before the core sees the buffer: a snapshot from a different layout would read off the end of the buffer, and the assert that would catch it is compiled out of a release build.
- After the core loads: the live WASM flags the load reset are put back first; the loaded state's completions become the location poller's new baseline, not a burst of fresh checks to report and deliver again; then the host menu takeover's side effect is put back (the snapshot brought its hud_cur_item_x/l/r with it, and the map button reads that byte with no gate of its own). That runs after the flags so the gate word is already back in WRAM when the C side checks it.
- A save with no music sidecar restores nothing, and its track starts from the beginning.
- The inventory poll is forced so the tracker shows the loaded state.
- `loadNamedState` loads a normal (manual) save by name. Names are stable and quick save never overwrites them, so automation pins to a name. Matching ignores case; the newest save wins if two share a name.
- `loadStateRef` loads what the CLI asked for: a number is a quick save slot, a string is a manual save's name.

## apps/desktop/src/game/scripted-grant-overrides

- JS side arming for the in core substitution slots covering scripted grants that never cross the receive seam: the upgrade pond's two capacity purchases, the cave bat's meter upgrade, the prize minigame's once only top prize (core/game-hooks/scripted_grants.c).
- Same contract as the other override bridges: the write only records, the gate bit is requested alongside it, and it stays open only while armed. Clearing empties the slots, then closes the gate.
- The pond surface is armed through the pond plan's own table (apps/desktop/src/game/pond-plan) instead of the three slots here, because under a plan the pond hands over a numbered sequence of prizes instead of one purchase per family. It stays the same plan class, so the classifier, the fire registry and the poller keep one path for every scripted grant.
- A wish pond rung is the same class again, but it never arms here: the core empties both waters' rung tables at once, so every rung of both is armed in a single call by the session (wish-pond-session.ts).
- `messageId` is the pre rendered contextual receipt line for the grant, or -1 for the core's item class template fallback. `fireId` is the host assigned completion id reported when the entry substitutes, or -1 for none.
- kFeatures3_ScriptedGrants is armed alongside the record only write, so the gate has latched into WRAM (SyncGateWords, next frame) by the time a handler applies it. A pond prize rides the pond plan's own gate, armed with the plan itself; the three fixed slots ride the scripted grant gate.

## apps/desktop/src/game/session-dialogue

Owns the per-session pool of pre-rendered receipt lines and pushes them into the core's live
dialogue memory. The composed blob is the active language's baked bytes verbatim (dictionary and
every baked line, class templates included) plus one compressed line per session message. It is
written to the virtual FS as `/session_dialogue.bin` and adopted by `WasmLoadSessionDialogue`
(session_dialogue.c), which returns the adopted line count, 0 when it refused and kept the baked
blob. Per-seed text never touches the shared asset blob; the baked class lines at 397 to 401 stay
the fallback for any grant without a pre-rendered line.

- A line arrives as candidates, fullest first (receipt-line.type.ts). The composer keeps the
  first one that fits the three visible rows against the language's real glyph widths.
- The pool is composed again whenever the session renders its lines again (the tracker moved a
  found or total number). The ids stay put because the count and order do. The swap is safe
  between frames because the text engine copies a line out of the blob when a message opens,
  never while it shows. Encoded lines are cached by text, so a refresh encodes only what changed.
- The pool has two parts. The arrivals come first: a fixed ring of slots for lines appended at
  runtime (an online receipt). The planned lines follow, and a set replaces them whatever their
  count, since the ring never changes size and so no set can move an arrival.
- `baseChunksOf`: a blob from an older bake stops short of the newer templates, so the ones it
  lacks are appended and the fixed template ids stay correct below the session lines. Without
  this a session line would sit at an id the core shows as a template line.
- A Language Studio set compiles under its own id. Its base encoder cannot be recovered here, so
  the class template lines stay the fallback.
- `prepareLine` makes the fitting candidate drawable (dialogue-text) and wraps it into line
  commands. A yes or no line lays its question out above its two answers (choice-message); a
  detail page opens on a key and scrolls in (page-message).
- `setSessionReceiptMessages` replaces the planned lines with any count and returns their message
  ids, or null when kept baked. Pending arrivals keep their ids and text.
- `appendSessionReceiptMessage` puts one arrival in a free ring slot and returns its id, or null
  when kept baked or while every slot is still held by a pending delivery. The id goes back
  through `releaseSessionReceiptMessage` once that delivery completes.
- `clearSessionDialogue` drops the pool and restores the baked blob (session stop).

### packages/game-core/src/session-dialogue/active-dialogue.ts

Reads the asset blob and INI back from the running module's virtual FS and extracts, at the byte
level, what the composer needs: the active language code (INI `Language`, default `us`, the same
read the core does at boot), its packed dictionary, its per-line compressed chunks in message id
order, and its per-glyph pixel widths indexed by alphabet position. Reusing bytes means the
vanilla lines are never encoded again, so the composed blob carries them bit identical to the
bake. `dialogueIndexOf` is ZeldaSetLanguage's lookup in TS, default index 0.

### packages/game-core/src/session-dialogue/arrival-ring

The received-item lines of a session: a fixed ring of `ARRIVAL_SLOTS` (32) slots at the front of
the pool. A slot is taken when an online receipt reaches the front of the delivery queue and
handed back once the queue reports that delivery complete, so its id is reused by a later
arrival. The pool never grows past the ring however long the session runs; only the delivery in
flight holds a slot. A free slot holds an empty line, never shown because no delivery holds its
id. `next` is where the search for a free slot starts, so a released id is the last one reused.
`takeSlot` returns null while every slot is held. A released slot keeps its line until a later
arrival takes it.

### packages/game-core/src/session-dialogue/choice-message.ts

A yes or no question laid out the way the game's own two answer prompts are. The box shows three
rows and the choose command parks the cursor on the last two (messaging.c
RenderText_Draw_Choose2LowOr3 draws a fixed arrow over dialogue rows 1 and 2), and the engine
never waits on its own. So the answers leave one row for the question (`INLINE_QUESTION_ROWS`),
and anything longer is paged, never scrolled away: the line fills the box, the player clears it
with a key, then the two answers scroll in under the line's short prompt. That is the shape of
the game's own long prompt at the mysterious pond. Paging is the normal case: the composer keeps
the fullest wording the box can page and lays a question inline only when that wording is a
single row. The answers are indented the way the game's own two answer lines are. On a paged
question the rows it does not fill are opened empty, so the box holds three rows before the
scrolls line up, as the game's long prompt opens its third row. A question past three rows pages
at every break so none of it scrolls unread. The row above the answers is the line's own prompt
when one fits, else the last row of the question.

### packages/game-core/src/session-dialogue/dialogue-text.ts

Any text as a message box can draw it; every composer runs its words through this. Each
character resolves to the first rule that applies:

1. Highlight markup passes through untouched (packages/game-core/src/receipt-text/highlight-markup).
2. A character the language's alphabet draws stays itself.
3. A character with an extra glyph (packages/game-data/src/dialog/dialogue-charset) becomes its slot token.
4. Typographic forms become their plain one: dashes a hyphen, curly quotes straight ones, the
   ellipsis three dots, any space a space.
5. A compatibility or accented form becomes its base (a full width letter the letter, an
   accented letter the plain one, a ligature its letters). A Latin letter with no such base takes
   its usual spelling (`LETTERS`: ß to ss, æ to ae, ł to l).
6. With no slot left for it, a bracket becomes a parenthesis, a backslash a slash and a semicolon
   a comma (`NEAREST`).
7. A control or joining character draws nothing.
8. Anything else (another script, an emoji) is a question mark, which every alphabet draws.

Runs of spaces fold into one and the ends are trimmed. `MAX_DEPTH` (2) bounds replacement
chains: a replacement's own characters resolve once more, no further.

### packages/game-core/src/session-dialogue/extra-glyphs

Hands the extra glyphs (extra-glyphs.constants.ts) to the core, which writes them into the active
font's spare slots (core/game-hooks/dialog_extra_glyphs.c). One table entry per glyph,
`ENTRY_BYTES` (34) long: its slot, its width, then its two tiles from `TILE_OFFSET` (2). The core
keeps the copy it built while the table stays the same, so loading on every compose costs a
compare. A core without the export draws no extra glyph and the composer falls back for those
characters. `loadExtraGlyphs` returns true when the core took every one. `sessionCharset` is the
charset a session line is composed in: the alphabet and font widths plus the extra glyphs the
core took (none from a core without them). `clearExtraGlyphs` gives the font its own glyphs back
at session stop. The slots the core took are kept too (`loadedExtraGlyphs`), for the modern face
of the enhanced box, which looks a glyph code up as text (packages/game-core/src/dialog/active-alphabet/active-alphabet.ts).

### packages/game-core/src/session-dialogue/highlight-bytes/highlight-bytes.ts

Encodes a prepared line that carries highlight markup or extra glyph tokens. The text between
them is compressed on its own, so no dictionary word reaches across one, and each becomes the
core's control bytes:

- A highlight marker (core/game-hooks/dialog_highlight.c): one byte 0x80 plus span in the US
  encoding, 0x87 then 0x50 plus span in the European one; span 0 closes, 1 is primary, 2 is
  secondary.
- An extra glyph (dialog_extra_glyphs.c): 0x83 then its slot in the US encoding, 0x87 then its
  slot in the European one.

A line with neither encodes exactly as the plain encoder makes it.

### packages/game-core/src/session-dialogue/page-message.ts

A detail page laid out the way the game moves a long line on to its next box. The core shows a
detail page right after the receipt's own line, in the same box (receipt_pages.c joins the two).
The engine has no command that clears the box, so the page opens with a key wait, then each row
scrolls in from the bottom. Three scrolls push every row of the first page away, so a page
shorter than the box scrolls in empty rows after its own and never shares the box with the page
before it. A page past three rows waits for a key again before each further row, as a long line
does. The page keeps the fullest wording that fits the box on its own.

### packages/game-core/src/session-dialogue/wrap-message

Message text layout. A line already made drawable is word wrapped against the real per-glyph
pixel widths into the box's line commands: `[2]` and `[3]` for rows two and three,
`[Waitkey][Scroll]` for every row past the visible three. The engine renders variable width
glyphs and never wraps on its own. The alphabet and widths are a charset's, so an extra glyph's
token measures by its slot.

- A row past the third scrolls the top row off the box, and the engine never waits on its own, so
  each of those breaks carries a `[Waitkey]` first. Without it a long line pushes its own opening
  away before it can be read, which is what the game's own long lines pause for.
- Highlight markup passes through untouched and measures zero pixels: it becomes control bytes
  the engine draws nothing for.
- `LINE_WIDTH_PX` (164) is the usable pixels per row minus a safety margin: the engine draws 21
  tiles of 8 px per row (messaging.c RenderText_Refresh) and advances the pen by each glyph's own
  width (VWF_RenderSingle), never wrapping. `VISIBLE_ROWS` (3) is the rows the box shows at once.
  `FALLBACK_WIDTH_PX` (8) is assumed for a character missing from the width table.
- A word with no letter or digit (an arrow or another lone symbol) binds to the words on both
  sides, so a range such as `0 > 99` stays on one row and no row ends or starts with the arrow.
- `fitReceiptLine` picks the fullest candidate that fits the visible rows, or the last one when
  none does.

## packages/game-core/src/session-gate-flags

- The armed state of every gate a randomizer session opens and closes, one record instead of a dozen module level booleans. `SessionGate` names each gate the way its setter is spelled.
- They share one contract: the host arms a gate when it has something for the core to apply (a table with entries, a profile, a plan, a live session) and disarms it when that goes away, then pushes features word 3 again so the bit latches into WRAM.
- Nothing here decides what a gate means. packages/game-core/src/live-settings-flags maps each one to its features.h bit and strips every one of them under Vanilla Safe.
- Kept out of packages/game-core/src/live-settings-flags because each gate arrived there as its own `let` plus its own setter, and twelve copies of the same two lines pushed that file past its size policy.

## apps/desktop/src/game/session-tracker

- Records play sessions (start, end, duration): the base for later per session stats.

## packages/game-core/src/settings

- The old file was `@kind data` with code in it. DEFAULT_SETTINGS is now the data file packages/game-core/src/settings/default-settings.ts; the INI writer, the merge and the small helpers moved to logic files beside it.
- MIN_ENHANCED_ASPECT: the two host drawn HUD styles (Enhanced and Modern) draw the life, magic and consumable groups and the host owned menu out into the side bands, which only exist from 16:9 up. The 0.001 absorbs the rounding in a reduced W:H pair, so a display that is 16:9 is never rejected by a last decimal miss.
- Dialog pacing defaults are the stock values, so a fresh profile plays text exactly as the game does.
- The enhanced dialog box is what the app ships with, so a fresh profile gets the chamfered single line frame over a dark ground with drifting triforces. Vanilla Safe masks the HudOverride bit these all ride on, which keeps a stock profile stock.
- hudHighlightPrimary and hudHighlightSecondary are the app's own accent gold and ok green, snapped to the game's 15 bit colours when pushed.
- The online notice defaults give one toast toggle per kind. The quiet receipt defaults make randomizer rupees, bombs and arrows arrive without a hold up or message.
- An unset offscreen enemy mode is the 'idle' default.
- ExtendedAspectRatio carries only the ratio value (plus extend_y); every rendering companion is its own [Features] key. With extendedRendering off the engine gets vanilla 4:3 and no flags.
- aspectRatio and extendY are baked at boot from the INI, not carried in the gate words, so the C side parity mask cannot reach them: Vanilla Safe must force extended rendering off in the INI, which collapses every dependent render flag with it.
- The ratio written is the one the capabilities cover. Auto, Screen and Custom skip the picker's own gates; without this, a wide monitor on Auto asked the core for a shape its feature bits were never set for.
- The INI render flags mirror buildFeatureFlags (the live bridge) so the boot config and the live push agree. Widescreen sprites and visual fixes follow what the profile renders, not what its ratio word says: Auto on a 4:3 display is 4:3, and a ratio the capabilities do not cover is pulled back to one they do. Wider or taller both count.
- Custom MSU music has no gate word bit (an Electron, renderer and config.c toggle the emulated CPU never reads), so Vanilla Safe forces it off at the INI boundary.
- A custom player sprite has no gate word bit until config.features3 reflects it (ApplyConfiguredPlayerSprite in emscripten_main.c). The boot path treats the LinkGraphics key's presence as "override on", so it is not written under Vanilla Safe.
- Tall rendering forces the enhanced HUD: the native HUD is a fixed 4:3 tile strip, wrong under tall. Forcing it in the merge (not in the settings UI) covers every consumer at once: INI, live push and the HUD gate word all read the merged value.
- The control scheme is not stored; it is derived from the style (controlSchemeOf). Modern controls are the app drawn HUD plus the Modern style, so one value carries both.
- Both host drawn styles are the host drawn HUD plus the host owned pause menu, with no meaning while the native rendering stays, so they force the overlay on for both parts, in the merge for the same reason as tall.
- enableAudio is no longer in the UI and is always kept on.
- The settings key `offscreenAI` and the INI key `PauseOffscreenAI` keep their names: they are persisted or wire names, and "AI" there means enemy behaviour. The reader for that setting is `offscreenEnemyMode`.

## packages/game-core/src/shadow-casting

A WebGL pipeline: a single channel heightmap rasterized on the CPU from shape elements, a shadow
pass that ray marches through it for the sun and point lights, an optional separable blur that
softens shadow edges (up to 8 px, skipped in debug mode or below 0.1 px), and a composite that
outputs the light map, which CSS `mix-blend-mode: multiply` combines with the game. The
heightmap is rebuilt every frame in viewport local space, matching the NavigationOverlay's
coordinates: the view origin is subtracted from world coordinates, and light positions are
offset the same way. The heightmap is one byte per pixel and its width need not be a multiple
of 4, so row alignment is set to 1. Inside a shape the height is hard edged and full. A shape
with 32 or more sides is treated as an ellipse, otherwise as a regular polygon with rounded
corners; freehand shapes use point in polygon tests. A light coloured `sample` takes its colour
from the game canvas at its position. Lights are capped at 16. With no screen data, or when
disabled, the canvas is cleared to fully transparent. The default viewport is 512 by 240 SNES
pixels.

## apps/desktop/src/game/shop-overrides

- JS side arming for the in core substitution table that turns a shop shelf into a randomizer location (core/game-hooks/shop_overrides.c). One entry per purchase: a slot stocked to depth N is armed as N entries sharing a shelf key and differing only in their depth index, and the core sells them in that order.
- Same contract as the other override bridges: the write only records, the gate bit (kFeatures3_ShopOverrides) is requested alongside it so it has latched into WRAM (SyncGateWords, next frame) by the time a shelf applies it, and it stays open only while armed. Clearing empties the table, then closes the gate.
- ShopSlotTarget: `slotIndex` is the slot's stable id across every shop, which keys its sold counter. `roomId` is the indoor room the shelf stands in. `entrance` identifies the shop when its room is shared, or -1 for any. `owArea` is the overworld area of the shop's own door, telling shared doors apart, or -1 for any. `subtype` is the selling sprite's subtype: one purchasable spot in the shop. `depthIndex` is which purchase of the slot this is, 0 sold first. `depth` is the total purchases the slot carries, so the core knows when it empties. `currency` is the native currency tag (rupees, arrows, bombs, hearts, or a bottle's contents). `amount` is the amount, or the bottle slot value a bottle price demands.
- `messageId` is the pre rendered contextual receipt line for the purchase, or -1 for the core's item class template fallback. `fireId` is the host assigned completion id reported the moment the purchase substitutes, or -1 for none.

## apps/desktop/src/game/simulator/drive

- The headless drive loop for `--sim-run`: it steps the pure engine against a SimulatorPort like the widget runner, but records into a RecorderState with no store or UI.
- A VisitLog is one OBSERVE, recorded verbatim: where the virtual player stood and what detection handed the engine there. `screenFloods` only samples on a screen change outside traversal, so it skips every route destination and cannot answer "why was this exit never seen". `name` is the dataset display name, for the log only and never for a decision. `index` is the room index indoors and the overworld screen index (0 to 63 is the map cell) outdoors.
- `path` is every screen the virtual player stood on, in order, including the ones a multi hop route only passed THROUGH (`observed: false`). `visits` skips those, so anything needing a real walked route reads `path`. `via` is how the screen was entered (see arrivalLabel). `gained` and `lost` are the items that appeared or VANISHED on arriving; a durable item in `lost` means something wrote over its slot, which an end of run total cannot reveal.
- A CheckLog is a verified check pinned to WHERE in the walked path it happened: `atPathIndex` indexes `path` at the moment it verified, and `items` is the inventory then, as display names. An item that LEAVES this list between two checks was clobbered. Item names are resolved at the point of logging and stored nowhere else.
- A LogLine is one narrative level line the engine emitted, in order (trigger attempts, unlocks, resets, trap slams): the widget's log wording, persisted so a headless stall can be read back afterward.
- Screen flood stats are captured on entry and on unlock, with the same numbers as the widget.
- The tally answers whether the region memory path fires, counted from the engine's own events.
- Only the 'idle' and 'observing' phases run `observe`, which is what records exits. 'traversing' means the route has further hops to make, so that screen is passed through and never observed.
- `target` means physically traversed to (visited), not only reachable by flood.

## packages/navigation/src/simulator/exit-order

- Walk distance ordering for detected exits: BFS steps from the entry tile, so the simulator tries the CLOSEST way out first.
- HOP_STEPS (999) is stamped on tiles the flood reached but the walk BFS still cannot, after ledge hops are walked: reachable, distance unknown.
- AREA_EXIT_BIAS (0x1000): exits LEAVING a big multi sub screen area sort after every exit inside the area, so the whole big screen gets explored before moving on.
- A ledge drop is ONE WAY. Priced as one move, the ordering dropped off ledges with work still pending above, and the screen left behind was marked visited. So a hop costs LEDGE_COST, more than any walk on the current footing (HOP_STEPS is the ceiling a real distance stays under): every walkable target first, drops after, deepest last. A hop's distance saturates below the out of area bias, so a tile many hops away in THIS area still sorts ahead of another sub screen's exits.
- The start may sit on a tile that was not reached (door thresholds, spawn markers), so the walk also seeds from every reached tile within 2 of it.
- Ledge drops are one way edges the walk must use: a tile only reachable by hopping a ledge has a real distance, not a sentinel. Without them the BFS stops at every ledge and everything beyond sorts arbitrarily.
- Flood reached tiles the walk could not touch lie across one way hops (ledge drops seed the flood but are not step adjacent), so they stay reachable for exit detection, sorted after every real walk.
- `distanceAt` tolerates exits whose own tiles are solid by taking the nearest tile within 4. That radius covers doorway notches, whose door tiles run about 4 deep into the wall, with the first walkable tile that far from the recorded door position.
- `decodeScore` splits an ordering score (real steps, out of area bias, unknown sentinel) back into what it means; the raw score is never shown. A score past the bias is still a real walk, just on another sub screen of a big area.
- `sortExitsByDistance` takes one precomputed score per exit (same order); exits on other sub screens of a big area carry the area bias. The score feeds the log; `steps` only ever holds a real distance.
- `entryFromEdge` is the landing tile on the DESTINATION screen when crossing an edge at a position; `exitFromEdge` is where the exit sits on the SOURCE screen. `reachedGrid` is the engine's region memory format.

## packages/navigation/src/simulator/flood-room

- Single room indoor flood by address. It feeds floodFillScreen the room's REAL entrances (exit doors at their spawn tiles, plus stairs and walk through boundaries) so an interior always detects its way out (at least one entrance, never 0). The grid arrives with the uncle's blocker footprint already stamped (see screen-grids.ts), remote rooms included.
- Intra room scroll boundaries (a 2x2 room's internal doorway) come from the live room layout read, which is only available for the loaded room.
- A room's spawn record can sit outside its walkable floor (the door threshold, not the ground behind it). Seeding there reads as a sealed room, so the flood falls back to the room's own entrance list, which lands on floor.

## packages/navigation/src/simulator/flood-screen

- The simulator's view of one overworld screen: the shared flood plus the summary numbers the run and the nav widget both report. The flood itself is `floodOneScreen` (packages/navigation/src/flood/flood-area), run for every caller, so a screen flooded from a given seed answers the same for the widget and for the run.
- `intraCount` is the intra room scroll boundaries (a 2x2 room's internal doorway crossings).
- `edgeRows` holds raw attrs and reach for the rows nearest the top and bottom edges (rows 0 to 3 and 60 to 63, columns 14 to 31). It shows whether a border crossing runs over open ground or over a cliff face. Diagnostic only.
- `sprites` lists what this screen's spawn table reports and whether the flood can stand within 2 tiles of each. For a LARGE (multi screen) area the table is the whole area's and its coordinates are area relative, so they run past 63 and do not index a single screen's grid; `reached` is only meaningful on a small screen.
- `floodOneOverworld` is null when the grid cannot be built. The widget calls the same flood, so the same seed on the same screen cannot give the two of them different numbers.
- A usable entrance transition is one the player can take right now: the BFS reached it without unmet item tiles, and the entrance tile itself is not under an item locked obstacle (for example the stairs west of the uncle's house buried under a rock, where the proximity trigger fires from beside the rock but the way in is sealed).
- `floodOverworldScreen` floods by address: the game need not be standing on the screen.

## packages/navigation/src/simulator/interactables

- Decodes the raw sim query records into the engine's SimChest, SimSprite and SimDoor value types. Detection stays free of dataset reads: positions, open bits and door kinds all come straight from the game.
- DOOR_KINDS matches SimDoorKind() in core/game-hooks/sim_queries.c, by index.
- Room sprites are the static spawns of any room, read from its sprite table, so they work for remote rooms the virtual player is not in. The progress conditional NPCs the table lists (intro uncle, King Zora before the Flippers, and so on) are filtered later by the engine's presence gate (evaluatePresence over the NPC's declarative condition), the one sanctioned dataset read for the detector.
- `posKnown` is always true for sprites: spawn positions come from the static table and are valid remotely, and the engine floods the VIRTUAL room's grid, so the flood can always judge these tiles. Failing open here would let unreachable NPCs trigger through walls and blockers.
- A standing item indoors hands over the same thing it does outdoors. Without `itemId` the trigger fell back to item id 0, which is a real item (the uncle's sword), so the woods heart piece silently handed out a second sword and the piece never counted.
- A big overworld area returns the SAME spawn table whichever of its four screens is queried, with every tile relative to the area's head screen. Each spawn is resolved to the screen it sits on before it becomes a SimSprite, so `roomId` always names the screen that owns it and `tile` is always local to that screen.
- A room's doors include its CELL LOCKS, the keyhole plates that gate a jail cell (room object 0x18). They carry no door table record at all, so they arrive as big key doors flagged `cellLock`, keyed by chest slot.

## apps/desktop/src/game/simulator/live-port.ts

- The SimulatorPort adapter that drives the real game through the wasm bridge and the delivery queue. The pure engine only ever speaks to this seam.
- Runner contract: the engine's verifying phase compares the flag snapshot AFTER a trigger, so the runner must `await port.trigger(action)` and then allow about 2 frames before stepping the engine with a fresh `observe()`, passing the id from the last `onItemReceived` callback as `obs.itemReceived`. Awaiting trigger() alone only guarantees the delivery executed (flag set and item granted); the extra frames let item receipt and auto skip dialog settle.
- The auto skip dialog and developer tools setters force their features0 bit (or defer to the user's setting with null) and push it to the core immediately.
- The tracker has already resolved the native receive index to a record, so the dataset id is what travels. This used to throw the id away and forward the raw native number, which the engine's verify step then looked up again.
- The room section split is valid because the player is standing in whatever room this reads (see WasmGetRoomLayoutInfo).
- The delivery queue drains on its own rAF loop. It is started when the port is created so trigger() completions fire even if the game was started without it.

## apps/desktop/src/game/simulator/observe/observe.ts

- Builds a SimObservation from live game state: the real location from the UI state buffer, the virtual location as a screen id plus tile, the inventory from the tracker, and flags as independent SRAM copies for comparison.
- The virtual traversal key is the GAME's own number (room index indoors, overworld screen index outdoors), never a dataset entry: a colliding room index used to misplace the virtual player before the first hop. Indoors it is region qualified so the live position keys the same node the exit that led here named (see interiorScreenId).
- `observe` first refreshes the tracker's inventory and completed check sets from WRAM so the observation reflects the latest state (for example right after a delivered item). It is not forced: it reads again on every call but only logs or notifies on an actual change.
- The NPC presence snapshot: progress bytes and the follower live in the 16 byte progress buffer; the SRAM copies come from the same flag snapshot.
- The helpers after `observe` are shared by the widget runner and the headless `--sim-run` driver; keep one copy.
- TILE_REQS are the traversal tokens tile attributes gate on. `bombs` belongs here: one interior attr is a bombable wall (`req: 'bombs'`, packages/game-data/src/data/native-tables/tile-tables.constants.ts). The overworld tables carry NO bomb requirement, so a cave mouth behind a bombable wall is reachable regardless; that is a revealed secret event flag, not a tile requirement, and is not modelled yet.
- The flood inventory is built from the engine's reach tokens and always includes bare hands lift (lift.1).
- Detect results (flood plus exits) are cached per screen, epoch and entry REGION (tile shifted right by 4): a room entered again through another door floods a different region.
- Room queries decode the room tables indexed by dungeon; outdoor screens read the overworld sprite table instead. Overworld chests and doors do not exist as interactables (standing items and secrets come later), so only sprites are supplied outdoors.
- `waitAfterTrigger` waits two frames so a triggered delivery has landed before the next observation.

## packages/navigation/src/simulator/overworld-area.ts

- Resolves an overworld sprite's AREA relative spawn coordinate to the screen it sits on, and its local tile there. A large (2x2) overworld area shares one sprite table across all four screens, and the game reports every spawn's position relative to the area's HEAD screen, so a spawn on the far half carries a row or column past 63 instead of one clipped to a single screen's 64x64 tile grid.
- SCREEN_TILE_SPAN is the tiles per overworld screen on either axis (the flood grid size). Overworld screens are laid out 8 per row.
- WORLD_SCREEN_COUNT (64) is the screens in one world. The area head table (`wasmGetAreaHeads`) only covers this many entries and is reused for the other world by masking off a screen index's +64 offset before the lookup, then adding it back.
- A row or column past 63 belongs to the screen one row down (head + 8) or one column right (head + 1), the only two offsets a 2x2 area can produce. `screenIndex` is whichever of the area's screens the sprite table was queried through.

## packages/navigation/src/simulator/probe-room-anchors

- Two diagnostics for telling a room's real interior from the dead space around it, for the `room=` probe. A dungeon supertile is always a full 64x64 grid and a room rarely fills it. The remainder reads as attr 0x00, the same value as plain floor, so a flood seeded there spreads through space the player can never stand in. When a crossing looks wrong these answer the first question: is the flood standing anywhere the game put something, and is the wall it left through a wall at all?
- Anchors sit on walls and in doorways, so a record can be a tile or two (ANCHOR_SLACK) off the floor the player stands on.
- The anchor report lists which of the room's own doors, stairs, chests, sprites and entrance seeds the flood reached. A flood that hits none of them is standing in dead space, whatever its tile count says.
- `edgeOpenCount` counts how much of one outer wall is open on the outermost tile ring. Read it as padding, not as wall: nearly every room answers 64 on every edge because the supertile's outer ring is open all the way round. That ring is what lets a stray flood run a room's whole perimeter, so a low number is the interesting case.
- Passable attrs for this count: 0x00, 0x80 to 0x8d, 0x90 to 0xaf.

## packages/navigation/src/simulator/probe-room-threat.ts

- The combat sweep's verdict on a probed room's gating sprites. See packages/navigation/src/simulation/engine/enemy-reach for what "gating" and "clearable" mean.
- `inventory` is the LIVE tracker inventory at probe time (not a simulated run's inventory), so a room probed before picking anything up reads every sprite as `no-weapon` by design.
- The combat context is built the same way the runner's combatFor does (observe.ts) but straight off the bridge, because the probe runs without a SimulatorPort.
- The room's section split is only trustworthy when the player is standing in the probed room (the layout read is live only, see WasmGetRoomLayoutInfo). A remote probe gets no split, so every gating sprite counts, the same as a plain single section room.

## apps/desktop/src/game/simulator/probe-room/probe-room.ts

- The indoor counterpart of the `flood=` diagnostic: everything that decides whether a room has a detectable way out, side by side, so a table disagreement (entrance list, entrance to room map, fall hole table, room to exit screen table) is obvious.
- RoomProbe fields: `exitScreen` is the overworld screen the exit table says this room comes out on (undefined means no entry). `entranceIds` are entrance ids whose destination is this room, per the entrance to room table; `entranceRows` shows raw against enriched rows for those ids, where the game says the door is. `fallHoleIds` are the ones the fall hole table claims; they are currently dropped as seeds. `seeds` are what the flood ran with (id at or above 1000 is a stair, at or above 2000 a boundary). `transitions` are the entrance transitions the flood emitted and why each was kept or dropped. `exits` is what exit detection produced. `gridBuilt` says whether the rebuild by address produced this room's grid. `chests` says whether the flood can stand next to each chest. `sprites` carry the kind the simulator assigns them. `attrRows` are raw attrs per layer across rows 30 to 52, where the flood stops, showing what it thinks is solid. `entranceTable` is the whole entrance to room table, so an absent room can be told from a short read. `neighbourEntrances` are entrance ids landing in rooms within 8 of this one; these find the door when this room has none. `edgeOpen` mostly reads 64 because the outer ring is the supertile's padding. `anchors` says which of the room's own anchors the flood reached (none means dead space). `scrolls` are the game's own edge scroll records (staircases and walk boundaries that name a destination room) to compare against what the flood claims. `bbox` is the bounding box of the reached region. `threat` is the combat sweep's verdict.
- Map glyphs: '.' solid, ' ' floor, 'o' obstacle (needs an item), '#' flooded, '*' flooded obstacle, '+' flooded solid. Obstacles are attrs at or above 0xF0 and 0x71.
- Chests are solid: the run must stand on a NEIGHBOUR, so touchable means a reached tile within 2.

## packages/game-core/src/simulator/read-game-state.ts

- Parses the live game UI state buffer into the location read the runner uses (room, screen, entrance and player pixel position), or null when unavailable.
- Both imports come straight from their own modules, not the apps/desktop/src/game barrel: the bridge reaches this file (packages/game-core/src/bridge/room-doors), so a barrel import here closes a cycle back through live-settings and cheat-rules-memory, whose top level subscribeGameState call then runs before wasm-bridge has defined it and the renderer stops on the boot splash.

## packages/navigation/src/simulator/read-loadout.ts

- The player's full loadout, read from the game, not tallied by the run. The run's own inventory is a set of check names: it answers "what did the run collect" but not "what does the player have" (no hearts, no equipment tiers, no map, compass or key state per dungeon). Those live in the save and the game already decodes them for the HUD, so this reads the same buffer the HUD does.
- Tiers stay NUMBERS. The display layer decides what to call a tier 2 sword; naming it in code would put the game's own product names into the repository, which the copyright gate exists to prevent. 0 means not held; higher is a better tier of the same slot.
- Health is stored in eighths of a heart (PER_HEART).
- The map, compass and big key bitfields cover 16 dungeons. `dungeonIndex` is `palaceIndex >> 1`, how the game's own dungeon tables index; the name is display only, resolved from the screen data.
- The dungeon bit is tested the game's own way (hud.c: `field << dungeonIndex & 0x8000`), so the slot order cannot drift from what the HUD draws. Only dungeons the player has something for are reported; the full sixteen slots are mostly empty early and would bury the ones that matter.
- The game keeps ONE small key counter, for the dungeon being stood in.
- Rupees report the GOAL, not the displayed counter. The HUD ticks `link_rupees_actual` up toward `link_rupees_goal` a few per frame (hud.c:389), so a run that ends while the counter is still climbing would report less than the player owns.
- `grants` is a diagnostic: how many times the game was told to hand over an item, per item id (0 to 255) and per site. Link_ReceiveItem is not idempotent, so a count above the number of checks taken means something was granted twice. Sites: 0 chest, 1 npc, 2 overworld, 3 kill.

## apps/desktop/src/game/simulator/room-crossing-exits.ts

- WARP_DOOR (0x46) is kDoorType_WarpRoomDoor; only a west or east one resolves a travel slot.
- OUTDOOR_LANDING_DEPTH (2) is how many rows below the outdoor door's record its landing tile sits, clamped to row 63.
- RoomExitContext's `cached` is the `^ow:N` qualifier the node being detected was reached by, or ''. RoomExitPass is everything derived once for a whole room, not per crossing.
- A stair exit lands on the DESTINATION room's stair or walk boundary leading back here, the tile the player appears on after taking the crossing.
- The way back outside is anchored on the OUTDOOR side of the same door. A room reached through a cached entrance leaves by the door it came in by: several overworld doors share one such interior and the game remembers which, so the node carries it and the exit honours it instead of picking the first table row with that entrance id.
- The exit table exit is the table's own answer for a room whose door the flood never touched.
- Respawn points and the holes that drop INTO this room are arrivals, not ways out, so neither becomes an exit.

## packages/navigation/src/simulator/room-doorways

- Geometry tests for a doorway through a room's OUTER wall, shared by every detector that decides whether a door table record is a real way through.
- A candidate is validated against the DESTINATION room's own grids: exit doors back to the overworld share the same door table encoding, so mirroring one into the neighbouring room id fabricates a connection into solid wall (for example the castle's front entrance doors "leading" into the basement jail rooms below).
- Rooms are laid out 16 per row, 20 rows; ROOM_EDGE_ADJ proposes the room id plus or minus 1 or 16 as a neighbour.
- Entrance rooms are the rooms an overworld entrance points at: the MOUTH of a standalone place. Two mouths never scroll into one another; each is the way into a different cave, house or dungeon. ROOM_EDGE_ADJ proposes neighbours regardless, which is how room 0x10a "scrolled north" into 0xfa and the run walked from the desert to the mountain summit through two unrelated caves. A mouth scrolling INWARD is fine (that is what a dungeon's entrance hall does), so only a crossing from mouth to mouth is rejected. The set is memoized only once the table has loaded.
- Door trigger tiles sit a few tiles INSIDE the wall (a south door's record is about row 55, a north one about row 4); records in the middle of the grid (for example row 36, the lower page's top) are internal quadrant doors, not ways out of the room. That is why the outer wall bands sit below 8 and at or above 52.
- Wall strip attrs that mean "crossing here never scrolls to the adjacent room": 0x8E is the exit door trigger (walks OUT of the dungeon), 0xF0 to 0xF7 is a flag gated door, solid until its story flag, as the sanctuary's escape door is. `exitDoorAt` checks the strip at the position (the notches are 2 wide) up to 14 deep, on any layer.
- `doorwayLandingOpen` is the reality check that kills fabricated connections: the DESTINATION room must have walkable floor (or door passage) behind the doorway, on any layer, against its OPPOSITE wall. A real doorway lines up with its opening: the old 14 deep by 9 wide window accepted any room with floor loosely near that wall, which is how unrelated caves at consecutive room indices "scrolled" into one another. The window is now 3 deep and 3 wide.

## apps/desktop/src/game/simulator/room-exits.ts

- UNREACHED (0xffff) is the ordering score for an exit whose tile the walk never reached.
- OUTSIDE_ORIGINS are the origins that leave the dungeon or house entirely instead of moving within it.
- `dedupe` drops duplicate exits: same destination AND same way in. Keying on the destination alone collapsed every crossing into a screen down to one, and they are not interchangeable: one side of a screen can carry several separate crossings landing in places that do not connect. The sanctuary grounds hold a ledge the lower part cannot reach, and the only way onto it is the second of two east crossings from the screen to its west, which the old key threw away, making the ledge permanently unreachable.
- Room counts are what is REAL for a room, for the log's numbers: distinct doors back outside, and every other crossing counted as an edge. The raw flood formulas count spawn markers and door tiles read as borders too many times.
- `detectRoom` floods an indoor room and turns its crossings into traversal exits: the crossings facade answers what leaves the room, `usableCrossings` keeps the ones the player could walk, and room-crossing-exits speaks them in the engine's SimExit vocabulary.

## packages/navigation/src/simulator/scan-sprite.ts

- Answers where the game puts a given sprite. A check's room index comes from our own data, and when that index is wrong the failure is silent: the room exists, it just holds something else, so the check never fires and nothing says why. Asking every room's spawn table settles it against the game, not the dataset.
- Indoor room indices run 0x000 to 0x17F (LAST_ROOM).
- Which overworld screen a room is entered from is what names it; a room index alone cannot be checked against anything.

## apps/desktop/src/game/simulator/screen-exits.ts

- A DetectedScreen's `reached` is the flood reached tiles: the engine's region memory for visits after the first. An OverworldExitPass `group` is the sub screens of the big area being visited; a group of one is a plain screen. An OrderedExit records whether taking it leaves the big area being explored.
- A door or a pit into a room: a pit is one way, because the player drops in and must find another way out, while a doorway can always be walked back through. That is what `twoWay` tells the graph.
- One overworld sub screen is flooded exactly like any other screen. Sub screens of a big area (castle style groups) are separate visits: borders into sibling sub screens are ordinary exits, ordered before exits out of the area so the whole big screen gets explored before moving on.
- `detectScreenExits` gives a screen's flood numbers plus the game driven exits the run traverses on. It is the ONLY exit source the simulator has, with no static connection data behind it. A synthetic id the dataset does not define still names a real room, so it is detected from its number: real geometry and a coarse name beat a hole in the graph.
- Location resolution is shared through `locationForScreen` for both vocabularies. A second copy reading the overworld index out of `roomIndex`, which an overworld record does not carry, sent every overworld detection by dataset id to screen 0.

## packages/navigation/src/simulator/screen-location.ts

- Maps a screen id to the numeric location the room addressable reads need. A synthetic `room:N` or `ow:N` id still carries the GAME's number; returning null for those made the room a hole in the graph, and with two way doors a hole welds together every screen pointing at it (`room:277` joined lw-2e, lw-3a and lw-34). The dataset only supplies the name.
- The native index lives in DIFFERENT fields by kind: `overworldIndex` outdoors, `roomIndex` indoors. Reading `roomIndex` for both silently resolved every overworld screen to index 0.

## packages/navigation/src/simulator/screen-name

- Maps a TraversalId to the DISPLAY NAME of the place it leads to, or null when the dataset cannot answer. A traversal id is the game's own number (`ow:19`, `room:112@0,0`), not a dataset key, so the lookup goes through the field that holds it (`overworldIndex` for overworld records, not `roomIndex`). The synthetic room id may carry the region and entrance qualifiers a node key carries.
- A bare room number is ambiguous (palace or cave), so the asking screen lends its palace (a stair inside a dungeon stays in it). The room keyed index is keyed on `roomIndex:palaceIndex`, so a lookup without a palace only matches a record without one; the candidate scan covers a dungeon room reached from outside any dungeon. If more than one candidate remains, answer null: a visible id beats a confidently wrong name.
- Names are display only; nothing here feeds traversal. `displayNameFor` is for a field that must hold a string: the raw id stands in for an unnamed place.

## apps/desktop/src/game/simulator/screen-resolve

- Numeric screen and room indices to traversal keys. Room indices collide across the dataset (room 0x55 is BOTH 'dam' and a castle's secret passage).
- An overworld traversal key is the GAME's number, never a dataset id: identity drives `visited`, the frontier and the graph, and a dataset keyed identity let a wrong or missing `roomIndex` merge two places or drop a room. Names are for logs only. The interior key follows the same rule.
- The region qualifier says which part of the room a landing tile sits in (tile coordinates shifted right by REGION_SHIFT, 5). One room SLOT can hold two separate interiors side by side (room 0x122: entrance 101 lands at col 15, entrance 102 at col 47, in different worlds). A node keyed on the room alone joined the two worlds through a hut; quantising the landing tile keeps them apart.
- Rooms 0x100 to 0x17F except 0x104 are left by RESTORING the overworld state cached on the way in (`LoadOverworldFromDungeon`, core/zelda3/src/overworld.c:1791: `if (room != 0x104 && room < 0x180 && room >= 0x100) LoadCachedEntranceProperties();`). Several overworld doors share one such interior (lw-11 and lw-35 both use entrance 101), so the node carries the door it came in by as a `^from` suffix. A key that is already qualified (a hop deeper into the same cave) keeps the original door.
- An entrance's landing tile in its room is its spawn point, which is always walkable.
- Area info is big multi sub screen membership (castle style groups); undefined means a 1x1 screen.

## apps/desktop/src/game/simulator/sim-log-writer.ts

- Detailed JSONL sink for a simulator run. `append` is fire and forget: each entry is stringified and pushed to the electron log handler, but writes are serialized through a single promise chain so bursts never interleave lines. `write` is the SimEvent typed alias the runner drives.

## packages/navigation/src/simulator/sprite-kinds

- Maps a static sprite type to a SimSprite kind. NPCs that hand out a check are 'npc' (the trigger planner then resolves their flag payload from CHECK_NPC_FLAGS by sprite type); everything else falls back to 'other', which cannot be triggered and feeds coarse reachability. The union has no 'enemy' or 'item' member, so 'other' is the neutral default. The map starts small and grows as vanilla runs surface more check giving NPC ids.
- NPC ids: 0x16 the first sage; 0x1a Blind's Hut hint NPC; 0x1f Sick Kid; 0x28 sets the bombable wall room flag on trigger; 0x2b dwarf at the smithy; 0x2e named villager (progress flag); 0x36 Mad Batter or potion NPC; 0x39 hint or storyteller NPC; 0x3a half magic bat NPC; 0x52 King Zora; 0x73 Link's Uncle (UncleAndPriest); 0x75 Bottle Merchant; 0xad Old Man (Death Mountain); 0xbb shopkeeper dispatch (subtype2 selects the role; the cave gift giver is one).
- Standing items are collected by walking onto them, not by talking. The pair that matters before the first dungeon: the fungus in the woods and the loose heart pieces (`Sprite_E7_*` and `Sprite_HeartPiece`, sprite_main.c:705): 0xe7 and 0xeb.
- STANDING_ITEM_IDS is what a standing sprite hands over (the Link_ReceiveItem argument): 0xe7 gives 0x29, 0xeb gives 0x17.

## packages/navigation/src/simulator/trigger.ts

- Maps a TriggerAction onto the delivery queue and resolves once the delivery has FULLY completed (onComplete fires when the game consumed the item, not when the flag was written), so the runner never steps the engine while the item get dialog animates.
- A door record pair is the records describing one PHYSICAL doorway: the room's own [roomId, index] plus, for an outer wall door, the adjacent room's matching record (opposite direction, same kind, within 4 tiles along the wall, among the first 4 records).
- A door is unlocked the way the game would: one key is spent on the room's own record, and the same doorway's twin record opens for free. A trap shutter slamming shut clears the open bit on both records.
- The engine's npc action carries only the flag payload; sprite 0xFF means no in game sprite transition and no side effects tied to an id, just a flag plus item.
- Boss (simplified): set the boss room flag and grant its item, then queue the prize as a second delivery. Resolve on whichever entry executes last.
- Door: no item pickup is involved, so the bits are written directly (no queue). A cell lock's "index" is its chest slot, not a door table slot. Bombable walls blow open without consuming a key; big keys are never consumed.
- Kill is virtual: mark the room's drop or cleared bit and grant the drop through the normal receive path. A kill that satisfies the room tag also opens the room's closed shutter doors, as the game does. Door kind 4 is the shutter (SimDoorKind order).
- Progress steps are scripted rescue progression: pure state writes with no item pickup.
- Pull switch: the room's tag routine raises its trapdoors when a switch is pulled, so every shut shutter in the room opens (the door out behind the sanctuary). A drain switch writes the same overworld event byte its room's tag routine would, for real: no item (0xFF), just the flag the game itself reads.
- Bomb wall: a blast turns the cracked patch into floor for the rest of the run. No game write by address exists for this, so the opened state lives in the flood facade and every later grid build stamps it (packages/navigation/src/flood/bombed-walls).
- Trap shutters slam shut behind the player: every OPEN shutter record closes.

## packages/game-core/src/snes-color

- SNES colour words, as the palette editor needs them. The hardware stores a colour as BGR555, one little endian word laid out `0bbbbbgg gggrrrrr`, five bits per channel.
- Only 32 levels per channel exist, so a value a colour picker hands back is quantised before it is believed; otherwise the swatch shows a colour the console cannot produce.
- The 5 to 8 bit expansion copies the high bits into the low ones instead of multiplying by 8, so a full 5 bit channel reaches 255 instead of stopping at 248. That is what lets a hex value survive a round trip through the picker unchanged.
- `bgr555ToRgba` packs little endian RGBA, for writing straight into ImageData.
- `hexToBgr555` accepts `#rrggbb` or `rrggbb`. `isExactColor` is false when a hex value is off the 5 bit grid, meaning the editor had to snap it.

## apps/desktop/src/game/sram-sync

- Periodic persistence of SRAM from WASM MEMFS to disk, every 5 seconds, skipped when the bytes did not change.
- A failed sync is ignored: it can happen during shutdown.
- `pauseSramSync` stops the periodic flush without the final flush `stopSramSync` performs. The gameplay simulator uses it so a mid run tick never persists half simulated SRAM to the profile's sram.dat. Resume restarts the interval, also without a flush, and does nothing when it is already running.

## apps/desktop/src/game/standing-overrides

- JS side arming for the in core standing prize substitution table (core/game-hooks/standing_overrides.c), mirroring the drop table's contract in apps/desktop/src/game/drop-overrides: the write only records, the gate bit is requested alongside it, and it stays open only while the table has entries.
- StandingOverrideTarget: `area` is the overworld screen index (outdoor) or room index (indoor). `sprite` is the standing prize's sprite type. `half` is the indoor room half the prize stands in: 0 left, 1 right, 2 either.
- `messageId` is the pre rendered contextual receipt line (session dialogue), or -1 for the core's item class template fallback. `fireId` is the host assigned completion id reported when the entry substitutes, or -1 for none.
- The item id indexes the 76 entry native grant tables, so an out of range one would corrupt the receipt; it is refused like in the other override setters.
- kFeatures3_StandingOverrides is armed alongside the record only write, so it has latched into WRAM (SyncGateWords, next frame) by the time a pickup applies the table. Clearing empties the table, then closes the gate, the same double lock as clearItemOverrides.

## apps/desktop/src/game/state-buffers

- Save states held in memory, not on disk: capture the live state into a buffer, and push a buffer back into the core. The simulator and the manual and auto save flows work this way; quick slots go through apps/desktop/src/game/save-states. Views never touch the module directly.
- SCRATCH_SLOT (98) is the slot for buffers that never touch disk: written, read by the core, then unlinked. A failed unlink is ignored.
- `loadStateFromBuffer` mirrors loadState for buffers not on disk. It is synchronous, so unlike loadState it cannot wait out a boot: callers reach it through ensureGameRunning() or already hold a live core. A core that is not ready is logged as such, never answered with a quiet false.
- It runs the same `checkLoadable` guard as loadState. Buffers captured in session carry at most the capture stamp and pass straight through; the check matters for the ones that came off disk.

## apps/desktop/src/game/state-dialog

- The message box across a save and a load. The enhanced box is drawn from statics in the core's dialog hooks, and a save state holds none of them (core/game-hooks/dialog_hook_state.c). A state saved with a message up would load into a game that waits on a button with no words on screen. So the hook state is read on the frame the core saves, travels in the save file's stamp, and goes back in right after the load.
- A save with no such state (no message up, a closed gate) loads with the dialog store marked stale, and the host box holds back until the next message.
- `withDialogState` is called right after WasmSaveState, before any await, with the bytes it produced. A core built before the export throws; the save is still a save.
- A stamp whose dialog text is not base64 counts as no dialog state.
- `resumeDialogAfterLoad` is called after WasmLoadState and after the live settings are pushed again: the pacing push clears the step credit the restore puts back. Its stamp is the one read off the buffer before it was stripped.

## packages/game-core/src/state-load-signal

- When a save state was last loaded. A load swaps the whole game under the app, so whatever the tracker finds done right after it was done in that state, not by the player just now. The check toasts read this to stay quiet; the tracker itself still follows the loaded state.
- A load is also announced to listeners, for state that lives in the save and must be read again (the online client's received index). A throwing listener never breaks a load. `onStateLoaded` returns the unsubscribe.
- `wasStateJustLoaded` is true for `windowMs` after a load: long enough for the next sweep and its derived rows to land.

## apps/desktop/src/game/state-stamp

- Stamps outgoing save state bytes with the version and format that produced them. Applied at the storage boundary, not at each call site, so quick slots, manual saves and auto saves are all covered by one write path. The one thing stamped earlier is what has to be read from the core on the frame it saved (stampAtCapture).
- Layout drift is caught here too: the bytes the core produced are already in hand, so comparing their snapshot length against the generated constant costs nothing. A C change that moves the layout fires the first time anyone saves, long before a release, without the probe running.
- Drift is reported once per session: a wrong layout is a standing condition, not a per save event.
- `stampAtCapture` puts what only the moment of capture knows on the bytes before anything awaits. The game keeps running while a screenshot is taken and the version is looked up, so by the storage boundary the core has moved on. `stampStateBuffer` completes that stamp and keeps what it carries.

## apps/desktop/src/game/stock-player-sheet

- The sheet the game ships with, for starting a custom sprite from scratch.
- Both halves come out of a ROM's compiled asset blob, not from the ROM or a running game: the tiles are one named entry, the gear palette another. That keeps "create new" available with no game running and no new extraction, at the cost of needing a ROM whose assets were built once.
- The gear asset holds five outfits. Only the first four are taken: the fifth is the flash palette used while the player is zapped, which no sheet format carries and which the core leaves on the shared row on purpose.
- `stockPaletteFrom` pulls the stock palette alone, to stand in for a sheet that ships tiles only. `loadStockSheet` is null when the ROM's assets have not been compiled yet.

## apps/desktop/src/game/story-gates

- Arming the story gates: which half of gate word 5 the settings ask for, and which a seed asks for while it runs. The word itself is derived in the shared module (packages/randomizer/src/world/story-gates/story-gate-word), so both sides fold a setting the same way.
- The default is the event reading, everywhere. A file with no seed arms every scene gate and the ledger, and leaves the count gates at the original numbers.
- Vanilla Safe alone forces the whole word to zero, which the core also enforces in its own parity mask.
- A seed arms exactly its own choices and replaces the settings half while it runs; null hands the word back to the settings half.

## apps/desktop/src/game/tracker/bridge

Connects the core's item and check notifications to the tracker. It installs
`window.__onItemReceived`, polls the inventory state every 2 seconds (`POLL_INTERVAL_MS`), and
polls room, overworld and progress flags for check completion beside it.

- A delivered item reaches listeners as its dataset id plus the native index the game reported.
  The name is left out on purpose: a listener that wants one looks it up from the id, so two
  consumers can never disagree about what an item is called.
- The inventory change is logged by name, so a reader can recognise what the player picked up.
- Progression events are checks, never inventory: they arrive with the rest of the completed set
  from the flag poll, which reads the same progress bytes.
- Room flags are polled alongside the inventory even when the inventory read failed; a read that
  throws means the module may not be ready yet. A zero inventory pointer skips both.
- The item callback defers its poll to the next microtask to avoid calling back into WASM while
  the callback is still on the WASM stack (it fires through EM_ASM inside, for example,
  WasmCheatGiveItem).
- A fresh game start resets the unknown items, and the first poll is forced so the tracker shows
  the current game state at once.
- `pollEventStatus` reads the live side of the reversible events beside the completed set.

## packages/navigation/src/tracker/check-facts

Per-record native fact tests: whether a check record's own `gameId` reads as complete from the
live WASM heap. Each record is tested on its own fields, so a fact shared by two records (a boss
and its prize flip the same room bit) resolves both; no reverse lookup that could only hand back
one winner. The one fact with no record-owned address is the "out of bed" read (a direct WRAM
offset), which is what the facade's reverse index stays for.

- `CHEST_OPEN_MASKS` are the room-state slots for the bits a chest-open word can carry.
- `BED_STATE_BUFFER_INDEX` (12) is the progress buffer index that carries
  player_sleep_in_bed_state.
- `isRoomFactMet` checks a chest slot or a direct room mask bit, whichever the record carries. A
  gift giver's own room bit (`roomFlag`) is read through the room reader, so the room the player
  stands in answers from its live bits: the save block only gets them when the room is left.
- `isOverworldFactMet` reads an overworld event bit (standing items, dig spots, events).
- `isProgressFactMet` reads an NPC progress buffer bit or an event threshold.
- `isEventFactMet` reads a ledger bit (core/game-hooks/events/event_ids.h): an event the game
  never records for itself.
- `isOutOfBedFallbackMet`: a save loaded past the first gift is out of bed even if the bed state
  byte no longer says so, so the progress indicator (buffer index 0) answers too. Only for the
  record owning `BED_STATE_BUFFER_INDEX`.
- `outOfBedCheckId` resolves the out of bed check from the raw native fact, the one legitimate use
  of the reverse index left in polling.

## packages/navigation/src/tracker/collected-checks

Checks the multiworld room holds as done while the save does not: a location collected for this
slot by `!collect`, or checked in another session of the same slot. The tracker shows them
completed, as the room does. The game's own completion flags are never written: this is the
app's view alone, and it goes with the online session. `addCollectedChecks` returns true when any
id was new. `withCollectedChecks` adds every collected check to the completed set the save shows.

## packages/navigation/src/tracker/completed-checks-core.ts

The per-check completion sweep, shared by the live poller (flag-polling) and the offline battery
save reader (packages/navigation/src/save-file/offline-progress.ts). Every check record is tested against whichever of
its own gameId fields describe a detection mode. A null reader stands for a source that is not
available (a gated live query, or the offline path's missing live WRAM byte) and skips its modes
instead of reading zeros, since zero can satisfy an equality threshold, so a made up read is not a
safe "no".

- `readEventByte` reads the event ledger bytes (WasmGetEventBytes, or the battery file's own
  copy). `inventory` is the items held, for the derived pass's held-item events; null skips them.
- A physically armed substitution row never completes off its record's possession proxy, because
  the vanilla item can arrive from anywhere in a shuffled seed. The substitution seam persists the
  real taken bit instead (progress bytes 21 and 22). Normal profiles never arm, so they keep the
  proxy.
- Armed rows answer from their own taken bit alone in the derived pass too: a fallback that reads
  the vanilla item would tick them the moment that item turned up anywhere on the seed.

## packages/navigation/src/tracker/derived-checks.ts

The derived pass of the completion sweep: the records that are true because of other records. A
combined event names the records it is made of (`derived`), a dungeon-wide event names a dungeon
and the kinds it sums (`derivedDungeon`), and a check the game keeps no flag for answers from a
vanilla `fallback`. Records are visited in dataset order, so a combined event only names records
that come before it; one pass is enough. `armed` lists the rows a seed has armed: their own taken
bit is the only answer, never a fallback.

## packages/navigation/src/tracker/event-status

The live side of the reversible events: for every record with a `now` condition, whether it holds
this poll. Pure over a presence snapshot, the same language the simulator reads NPC presence
with, so a status is one declarative condition on the record and nothing else. It never touches
the completed set: an event that happened stays ticked, and this only says whether it is true
right now.

## packages/navigation/src/tracker/flag-polling

Reads WASM memory to find which checks are completed. Detection is driven by each check record's
own `gameId`, never by a name-keyed table: this module only builds the live heap readers (with
the loaded room's live bits folded into its room word) and hands them to the shared sweep
(completed-checks-core), which the offline battery save reader feeds with file-backed readers of
the same shape.

- The event ledger and the story status bytes are read guarded: a core built before them has no
  export to call.
- The bed state is also read directly, for the window before the progress buffer is filled:
  save_dung_info sits at g_ram + 0xF000 (`SAVE_DUNG_INFO_RAM`), so the base comes off the room
  pointer, and the bed state byte is at 0x37C (`BED_STATE_RAM`).
- What the online room holds as done shows as done too (collected-checks).
- `PROGRESS_BYTES`, `OW_EVENT_BYTES` and `ROOM_WORDS` are how many progress bytes, overworld event
  bytes and room words the exports expose.

## packages/navigation/src/pathfinding/core/inventory.ts

Reads the 39 byte buffer from WasmGetInventoryState and turns it into a set of item ids. The set
is keyed by dataset id, never by display name. Names are not unique (two records share several
of them), so a name-keyed owned set loses records by construction; ids also mean the compiler
rejects a display string mistaken for an owned item. The slot to id mapping lives in item-ids.

- `bigKeys` is one bit per dungeon, the core's own big key word. `bombCapacity` is how many bombs
  the bag holds, zero only on a file that starts without a bag. `bombsEverHeld` is true once a
  bomb has ever been held (the ledger's bit). `swordAtSmiths` is the sword the smiths keep while
  `sword` reads 255: 0x80 or level, or 0 (smith_sword.c).
- Bow slot values 1 and 2 are one rung, 3 and up is two; the byte is not a rung count here.
- While the smiths keep the sword to temper it (sprite_main.c, the tempering payment) the game
  writes level 255. Read as a level that held every sword up to Golden, which completed the
  Pyramid Fairy's Golden Sword row the moment the smith was paid. The sword is still the
  player's, since it comes back at the pickup, so a row that asks for it must not drop out and
  come back. A payment made before the level was recorded (`SWORD_KEPT_UNRECORDED`) means a sword
  went over at an unknown level.
- Bombs are spent and found again all the time. Before the first one, a rule that asks for bombs
  is not met; after it, an empty count is a refill away, so it stays met as long as the player can
  carry any. The count alone would flip a dozen rows at every last bomb.
- The mirror counts at slot value 2; value 1 is the scroll before the upgrade.
- The top flute value replaces the plain one instead of stacking on it.

## packages/navigation/src/tracker/item-ids

Raw inventory slot values to dataset item ids, never display names. Two sources only: the game's
`Link_ReceiveItem` index resolved through the facade (the dataset owns the join), and an explicit
id for items with no receive index (pendants and crystals are SRAM bits, not pickups). Resolution
is lazy (per poll) because a published dataset bundle can replace the records.

- `LADDERS` are progression ladders as native receive indices, weakest rung first. The raw slot
  byte counts rungs held, and every rung below is held too (a top tier sword still answers "any
  sword"). Bow slot values 1 and 2 are the plain bow, 3 and up adds the silver one on top.
- `BY_VALUE` covers slots where the raw byte selects one item instead of climbing a ladder. A
  bottle's value is its contents; the slot being non-empty is handled separately (`BOTTLE_SLOT`,
  an empty bottle).
- `SIMPLE` covers plain held or not held bytes. No record expresses bomb capacity (the dataset
  only has pickups), so the standard bomb pickup stands in for "carries bombs". The same gap
  leaves `ITEM_TO_TOKEN`'s bomb key unmatched.
- `MIRROR` is held at slot value 2.
- `PENDANT_BITS` and `CRYSTAL_BITS` map SRAM bits to ids for items never granted through
  `Link_ReceiveItem`. The pendants point at item-056, 057 and 058, the trio the Pendants group and
  the sage's `presence` and `requirements` name. Bit order follows the core's own
  kDungeonCrystalPendantBit (zelda_rtl.c) read against the receive id each boss grants
  (kBossFinishedFallingItem to kFallingItem_Type): 0x04 and 0x37 green, 0x02 and 0x39 blue, 0x01
  and 0x38 red.
- `BIG_KEY_BITS`: the core keys the word by dungeon index (kUpperBitmasks: the highest bit is
  index 0), and the castle's key can land under the sewers' index or the castle's own, so both
  bits name it.
- `addLadder` adds every rung up to `held`, so a tier byte yields its whole progression.

## packages/navigation/src/tracker/normal-placement-ref.ts

Normal's placement, built once for the session. Nothing about it varies while the app runs: every
location holds what the unmodified game puts there, and no rng is drawn. Two tracker surfaces and
the simulator's picker ask for it, so it is built on the first ask and kept.

## packages/navigation/src/tracker/record-row-inputs

What the file's own settings hand the rows that are read from the dataset. Two shapes, both off
the placement, so the plain game and a seed are set the same way:

- Overrides, for the three rows whose requirement is a setting: what the pedestal asks for, and
  the medallion each of the two gated entrances wants. Their rules cannot be written into the
  dataset because the answer moves with the profile. Any three dungeons has no single requirement
  to name, so the pendant count stands in for it. The medallion entrance's rule is human, armed,
  and carrying what this seed asks for.
- Grants, for the two tracker switches. A door whose key is held is open, and a room you carry a
  light into is lit, so the switches hand the reader the item instead of rewriting the rule. The
  seed's own accepted lights come in this way too: the records name the Lamp, and a player seeing
  by a Fire Rod on a seed that counts one reads as seeing.

`LAMP` is the one item every unlit room record names, so granting it is what "can see" means to a
record. `LIGHT_WORLD_CLEARED` is the combined event "All Light World dungeons cleared"
(packages/game-data/src/data/records/checks/events/world.ts, n 283). `bigKeyItemIds` is every Big Key the dataset knows.
Nothing here comes from a second rule table; before this the same four answers came out of a
resolver that also carried a copy of every location rule.

## packages/navigation/src/tracker/tracker-count.ts

Whether a tracker row counts toward the run's check total. The roster also lists rows that are
not checks: the event records (beating Agahnim, the frog, the smiths among them) and the status
only rows. Those stay in the list, but a total is its item locations only, which is what an
Archipelago room counts for the slot.

## packages/navigation/src/tracker/tracker-roster.ts

The rows the app lists for a run, built once and read by every surface that lists them: the
Checks widget, the randomizer page's spoiler tab and the cheat console's Checks tab. On a seed
the roster is the seed's own: every record the placement names, plus a virtual row for each
location no record covers (shelves, chiefly), plus the event rows. No event is a location of a
seed, so the two lists never share a row. Without a placement it is the dataset's own list,
which is where the fairy rungs and the intro's story beats live: real rows that were never
locations of any world.

## packages/navigation/src/tracker/tracker-statuses/tracker-statuses.ts

Every check's status, from one engine, for the plain game and for a seed alike. Which reading
answers a row depends on the row, never on the mode:

- A row the world holds a location for is answered by the generator, over the placement handed
  in. Normal's placement is the one where nothing moved (packages/randomizer/src/normal-placement), so the engine
  cannot tell the two modes apart.
- A row it holds no location for is answered from the dataset's own record, against the place
  the row happens at. That is every event, because an event is a thing that happened and no
  location of any world, and the fairy rungs while no pond sells them. On a seed those rungs are
  locations, so the same rule sends them to the engine instead.

The place comes from the engine too: its reachable regions, named as dataset screens
(packages/game-data/src/logic/regions/reachable-screens.ts), so there is one graph. `fired` holds locations the session
recorded as taken where no check record could see it. `smallKeyDoors` off reads every small key
door as open (packages/randomizer/src/world/small-keys). `trackerReachableScreens` gives the screens the engine says
the player can stand on.

## packages/game-core/src/turbo

- The configured speed goes down with the other live settings; the held state goes down on the shortcut's press and release. Both are pacing globals in the core, so a save state load never disturbs them and nothing needs asserting again afterwards.
- The core is told the ladder percent while turbo is enabled, 100 (real time) otherwise.
- Both calls are guarded: a core built before turbo existed lacks the exports. Holding is a no op before the module exists and harmless while the speed is 100.

## packages/game-core/src/ui-bridge-diff.ts

- Shallow change detection between two GameUIState snapshots, run every frame.
- The host menu fields are compared because the host menu gates the pause takeover: a frame where only they moved still has to reach the store, since the open and close edge and the clobbered item detection both ride on it.

## packages/game-core/src/ui-bridge-parser

- Parses the raw WASM UI state buffer into a typed GameUIState. UI_BUFFER holds the byte offsets of each field; two byte fields are little endian.
- Module numbers: 0 Intro, 1 FileSelect, 2 CopyFile, 3 EraseFile, 4 NameFile, 0x14 (20) Attract (the intro "video" and legend demo) all read as title. 5, 6, 8, 10, 15, 16 read as loading. 7 and 9 are active gameplay. 0x0E (14) Interface, 0x12 (18) GameOver, 0x17 (23) SaveAndQuit.
- Interface sub modules map to UI modes; a missing entry falls back to gameplay (potions and the like are an overlay).
- Module 11 (MODULE_FALLING_ENTRANCE) is the dungeon pit fall transition, but the engine reuses it for the three overworld switch tile locations (normal gameplay; the module never returns to 9). Only that flavour keeps overworld_screen_index at 128 or above (OVERWORLD_SPECIAL_AREA_SCREEN_MIN in core/game-hooks/game_constants.h); real overworld screens, light or dark world, are 0 to 127.
- The floor indicator is only a HUD element during gameplay; it does not change the mode.
- The host menu's active item byte (132) repeats byte 14 on purpose (see HostMenuState). Byte 14 is the HUD's readout of the equipped item; byte 132 is the host's own register read back, so a value the native menu moved (its init walks the 21 entry grid before the hold engages, and replaces any id that grid has no row for) can be detected and written again.
- The game parks the countdown seconds at 0xFF or 0xFE, sign bit set, while no countdown runs.

## apps/desktop/src/game/ui-bridge

- High frequency polling of game UI state from WASM: a requestAnimationFrame loop reads the UI state buffer every frame, parses it into a typed GameUIState (ui-bridge-parser), diffs it (ui-bridge-diff), and pushes changes to the zustand store.
- Haptic polling runs every frame, even when the UI state did not change. The message box mirror rides the same loop with its own change check.
- Repair after a save file load: leaving the title and file select modules is the one moment the core has just copied a save file out of SRAM into WRAM, and with it hud_cur_item_x/l/r, the abandoned lane design's per button registers. Two vendored paths read those bytes with no feature bit of their own (see HostMenu_DropSecondaryItems in core/game-hooks/host_menu.c), so an old save silently moves the map button to Select while the modern scheme still sends X. Arming the takeover again zeroes them; it does nothing when the host never armed one.
- The gear high water mark follows the state decoded in this loop instead of a store subscription, so it is recorded whether or not the pause menu was opened this session. A tier earned and then dropped has to stay reversible either way. It takes the whole state, not its equipment block, because the arrow row's mark is an inventory byte.
- The map used to pause the game when it reached its idle state. That deadlocked: pausing stops ZeldaRunFrame(), which stops input processing, so the player could never close the map. The game's own submodule system handles the map idle state without help, so the hook was removed (the empty `checkMapPause` is gone).

## apps/desktop/src/game/upgrade-icons

- The in game capacity upgrade icons are the 512 B binary the sprite extraction emits beside the PNGs (capacity-icons.4bpp, one 4bpp icon per family). They are handed to the core when a randomizer session arms, written to MEMFS and applied with WasmApplyUpgradeIconsFile, the player sprite pattern.
- The core shows an icon over a capacity upgrade's hold up receipt under kFeatures3_CapacityProfile. A sprite set extracted before the binary existed, or no running module, leaves the refill art in place. `applyUpgradeIcons` resolves true when the core took the icons of the active ROM's sprite set.

## packages/navigation/src/usable-crossings/usable-crossings.ts

- MAX_DOORWAY_SPAN is the widest a room to room crossing can be and still be a doorway. A supertile's outer padding ring is open tiles all the way round, so a flood that gets into it anywhere runs the whole perimeter and reports a crossing spanning most of every edge. A real doorway is a notch a few tiles wide; the first castle's own room to room walks measure 2 to 6.
- WARP_DOOR is kDoorType_WarpRoomDoor, which teleports. THRONE_DOOR is kDoorType_ThroneRoom, a push wall. Crossing either teleports or is refused, so it never scrolls to the adjacent room; the throne wall stops blocking while a follower is active.
- BLOCKED_SPREAD is how far from a blocked door record a wall spot still belongs to it.
- CrossingFilterScope: `roomIndex` is used indoors only. `connections` are the border bundles the edges were built from, because a ScreenCrossing carries neither the tile span nor the free tile count the filters need. `flood` is the flood the crossings were collected over, when the caller ran one.
- `connectionCrossingId` is the id the facade mints for a border bundle, the join between the two.
- A standalone interior is a room the game can leave straight to the overworld. Two of them never scroll into one another: each is the mouth of a different cave, house or dungeon.
- An exit spot is a wall spot that walks out of the dungeon, not into a room.
- An indoor room to room scroll is usable when it is a doorway width notch, in a wall that is not an exit door trigger, with floor behind it on the neighbour's side, between two rooms that are not both mouths onto the overworld. Outdoors an edge is usable when it has a free tile.
- The flood knows a crossing by its own id. Outdoors a pit is seeded at `FALL_HOLE_ID_BASE + id` so it never collides with a door sharing its number; every other crossing keeps the number its own table gives it.
- Gated entrance ids are entrances the flood touched but the player cannot take: every transition onto them is gated by a tile requirement the loadout does not meet, such as stairs buried under a rock, whose proximity trigger fires from beside it while the way in stays sealed. Table read crossings carry no gate of their own, so without this the run walks through the rock.
- `usableCrossings` is the one plausibility pass over a collected screen, so the simulator, the recommendations and anything else reading the facade see the same set. The facade emits every crossing the game's tables describe; this decides which of them the player could walk.
- `takeableCrossing`: a border bundle answers to the filters that built it, never to `available`. One item gated tile anywhere along the run puts that item on the whole bundle's requirements, so judging it that way deletes a crossing whose other tiles are plain floor. Everything else asks for its own cheapest approach and can be judged directly.

## packages/game-core/src/wasm-bridge

The singleton core holding the Emscripten module reference and game state, plus a re-export hub
for the per-concern bridge facades (bridge). Every other game module imports from here to reach
the running module. The bridge modules import `getModule` and `getGameState` from here and only
call them at runtime, so the re-export cycle is safe.

- `UI_STATE_BUFFER_SIZE` (133) is the size of the UI state buffer exported from C; the last byte
  in use is 132 (core/game-hooks/ui_state.c).
- `subscribeGameState` replays the current state to a new subscriber, deferred one microtask so
  the caller's unsubscribe handle is assigned before a listener that calls it runs. Without the
  replay, a subscriber that starts waiting after the status already became `running` never sees
  the transition and hangs: useAutoTest and useSimRun call waitForRunning only once
  loadProfileForGame has resolved, which itself sets the status to `running`.
- `setInput` pushes a SNES input bitmask to the running module, called by the InputManager each
  frame. It stays self-contained (no import from packages/game-core/src/bridge/wasm-call) so wasm-bridge has no static
  edge into wasm-call. That edge completed a two-way cycle which, combined with lifecycle's
  dynamic import of this module, could be evaluated as a second instance under the Vite dev
  server and desync the startGame re-entry guard.
- The raw host menu commands are re-exported here, but app code goes through packages/game-core/src/host-menu,
  which is where the takeover's wanted state and the equipped item re-assert live.

## apps/desktop/src/game/wasm-warmup

Background WASM warmup in three stages: inject the Emscripten glue (defines `window.Zelda3`;
built with MODULARIZE, so nothing runs until called), fetch the .wasm bytes (streamed over http,
one IPC blob over file), then `WebAssembly.compile` into a cached module that startGame reuses
(instantiate-wasm). `warmWasmCore` runs once and reports progress. Over file the bytes come as one
blob from the Brock port kit (`readCore`) with no progress; over http with no length header the
progress is indeterminate.

## packages/game-core/src/webgl/gl-helpers

Shared WebGL helpers for every fullscreen post process pipeline (shadow casting, edge glow).
Filter and draw mode are parameters so each pipeline supplies only what differs; `label`
prefixes compile and link errors.

## apps/desktop/src/game/wish-pond-plan

- JS side arming for the two item throwing waters (core/game-hooks/wish_pond_plan.c). One row per numbered rung, keyed by the water it belongs to, and two host lines per water: the one she says when she rises, and the one a spent water shows.
- A planned visit hands over the next rung with no throw and no question, so neither line may be a native one: -1 shows no line at all.
- Same contract as the other override bridges: every write only records, the gate bit is requested alongside it, and it stays open only while a plan is armed. The session layer composes the rows; this module is the ccall surface only.
- WishPondRungArm: `pond` is 0 for the light world's water, 1 for the dark world's (wish_pond_plan.c counts them so). `rung` is the place in that water's sequence, from zero. `messageId` is the pre rendered line shown with the grant, or -1 for none. `fireId` is the id the host is told fired, or -1 to leave the report to the receive seam table. `assigned` is true when newItem is the placed item itself: the core resolves it, arms the line on the receipt and keeps the receive seam table off it. False for a slot's vanilla id, which the table substitutes.
- `setWishPondRungs` arms both waters' rungs in one pass. The clear comes first because the core empties both tables at once, so one call carries every rung of both. The gate goes up with the record only writes, so it has latched into WRAM (SyncGateWords, next frame) by the time a handler reads a rung; an empty list leaves both waters on their native branches.
- `setWishPondLines` is armed after the rungs: their clear resets both lines to none.
- `wishPondThrowsTaken` reads the rungs taken at one water on the live file: what the probes and the tracker read back.
- Clearing empties both tables, then closes the gate: the same double lock as the rupee pond.

## packages/packs/src/zspr-write/zspr-write.ts

- Serializes a PlayerSheet back to ZSPR, for the studio's export and for the boot path (the core only reads ZSPR). The override layer is folded onto the original: the file carries one palette, so whichever layer the caller asks for is the one that survives. `layer: 'override'` (the default) bakes the edits; `'original'` writes the palette as imported.
- The display name and the author are NUL terminated UTF-16LE; the third string, a short credit line, is NUL terminated ASCII.
- The spec's checksum is a 16 bit sum of every byte, followed by `0xFFFF - sum`. The four checksum bytes are summed as the seed value `FF FF 00 00`, not zero, which reproduces other tools' output byte for byte. Nothing here validates it.

## packages/packs/src/zspr/parse-zspr.ts

- Reads ZSPR, the community custom sprite container, into a PlayerSheet.
- Header, 29 bytes: "ZSPR", a version byte, a four byte checksum, then (offset, length) for the tile block and for the palette block, a sprite type word, and six reserved bytes. ZSPR_HEADER names those offsets.
- Three strings follow, in this order: the display name and the author as NUL terminated UTF-16LE, then the author again as NUL terminated ASCII for a short in game credit. The two data blocks sit wherever the header's offsets point, in practice just past those strings.
- The palette block is four outfits of 15 words followed by two glove words. A sheet may ship tiles only; that parses as long as a stock palette is supplied to stand in, which mirrors PlayerSprite_Apply keeping the player on the stock row for a short block.
- `parseZspr` returns a sheet with an empty override layer, or null when the bytes are not a ZSPR.

## apps/desktop/src/hud/active-profile

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

## apps/desktop/src/hud/custom-glyph-store

A custom glyph pack is an override, never a replacement. It holds only the positions the
player imported and names a built-in `fallbackPack`, so a pack with four face buttons still
draws shoulders, triggers and the d-pad through the chain in `resolve-glyph.ts`. Images are
stored like user sprites: raw bytes in the platform FileStore under the profile's folder,
with a JSON manifest beside them. A stored file has no URL of its own on either host, so the
bytes are read once into an object URL and cached; `customGlyphUrl` is the synchronous
lookup a render pass needs. Files are flat, one per pack and position, so the file name is
the key.

## apps/desktop/src/hud/layout-document-io

Player layouts use the same document format and the same loader (`loadLayout`) as the
built-ins in `packages/hud/data/layouts/`. They differ only by the `builtIn` flag. A
stored document that does not validate is refused, never repaired: it is dropped from the
list and its reasons are kept in `problems`, so a screen can say which layout is broken.
Layouts are validated on the way out too, because the editor's draft is not a document until
it passes. The store file is `hud-documents.json`, not the old flat format's
`hud-layouts.json`; nothing shipped in that format, so there is nothing to migrate. Saving
upserts by id. A fork gets a new id and records `basedOn`, which the editor's start from
list reads. An unknown id resolves to the shipped default, since a stale id in a settings
file is far likelier than a request for no interface.

## apps/desktop/src/hud/slot-content.ts

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

## packages/input-mapping/src/runtime/axis-press-threshold

The single place where a raw axis reading becomes pressed, shared by live play (the SNES
bitmask, function hotkeys) and by binding capture (the raw input dispatcher). A trigger axis
(SDL's fixed `LEFT_TRIGGER` and `RIGHT_TRIGGER` indices) uses the family overridable
threshold the calibration screen shows (`packages/input-mapping/src/family/live-control-state.ts`,
`resolveTriggerPressThreshold`), never a second number. Any other axis, such as a stick
standing in for a direction, uses a plain deflection of 0.5. Device keys are `vid:pid` in
hex; a device whose SDL type was not recorded this session uses the generic threshold.

## apps/desktop/src/input/binding-display

One source of truth for a binding's label and icon, shared by the controls editor rows, the
save state hints, `InputGlyph` and the controller overlays. A bound control always draws a
glyph: one row of bare text beside rows with art reads as broken. Device art is preferred
and comes through `icon`, but it is missing when the pad is unplugged or its family has no
picture for that control, and an axis never stored an icon because its glyph depends on which
end of the stick is meant. So the generic fallbacks are keyed off the binding's own shape,
and only `none` draws nothing.

## packages/input-mapping/src/runtime/controller-card-info.ts

Name and family come from the SDL driven resolver (`resolve-device.ts`), never from a hand
written database. `sdlType` is carried for the controls screen's apply console defaults drag
and drop, which resolves the defaults through the family layer.

## packages/input-mapping/src/runtime/controller-device-groups.ts

Groups the snapshot by vendor and product id, so an adapter that presents one entry per port
renders as one group with a port list. The Brock input module suffixes `#N` to the device key
of the second and later devices sharing a vid:pid; that is read back to number ports.
Unclaimed listed devices sharing a vid:pid never get a suffix (only SDL claimed devices get a
key assigned), so arrival order is the fallback. A blank product name falls back to
the first group member that has one.

## apps/desktop/src/input/controller-family-cache

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

## apps/desktop/src/input/controller-name-cache

Names for every controller seen this session, seeded from the snapshot and kept live by
the input module's `onAdded`. An event only listener never learns the name of a device connected before
it subscribed, since that device announces itself once. The OS product string is no
substitute: devices reached over a raw USB interface report it empty, which is how a pad
shows as "Unknown Controller". Names are keyed by device key and by vendor and product, since
a caller with a raw device list has ids but no device key. Blank names are ignored so a later
real one is not shadowed. Recording starts at module load and only listens.

## packages/input-mapping/src/runtime/device-detector

SDL3 is the only controller transport on every platform (the Gamepad API path is gone), so a
device is an SDL entry or the keyboard, and there is no activation step. The keyboard's
`sdlType` of `keyboard` is not a real SDL type but a stable sentinel, so the apply defaults
drag can tell it from a gamepad. Mice, trackpads and touchpads are filtered out by name.

## packages/input-mapping/src/runtime/device-scoped-map

A binding lookup keyed by the device that created it, then by the binding key (a button
index, or `axisIndex:direction`), so a binding recorded on one pad never fires from another
pad with the same index. A binding with no source device (console default presets never stamp
one) is filed under `ANY_DEVICE` (`*`) and matches every gamepad.

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

## packages/input-mapping/src/runtime/function-actions.ts

Shortcut and cheat bindings fire callbacks on rising edges from keyboard and gamepad. Saved
mappings are merged with the defaults so a newly added action always has a binding. Gamepad
maps are scoped by owning device. `clearHeld` releases every held action, so a hold style
action (turbo) is let go even when its release is lost while input is suppressed mid hold.

## apps/desktop/src/input/haptic-bridge

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

## apps/desktop/src/input/input-manager

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

## apps/desktop/src/input/item-ownership

Does the live save hold this item? The scheme layer is pure and has no inventory, and
assignments are stored per profile, not per save, so a fresh file inherits buttons pointing at
items it never found. Pressing one used to park the equipped item register on an item the
save does not have, while the pause menu refused that same cell. The answer is
`buildItemCells`' own `owned` flag, the same function the pause grid and `planAssignment` use,
so the press and the menu cannot drift. It lives in the input layer because the router is the
only place holding both the pressed slot and the live state. The UI store publishes a new
inventory object on most frames, so identity is useless as a memo key; the 24 bytes are
compared instead and the cells rebuilt only when the inventory moved. Item ids are 1 to 24.

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

## apps/desktop/src/input/process-controller-state.ts

SDL3 controller intake. The native addon already decodes and factory calibrates reports into
normalized values, so the old per device HID parser is bypassed. Trigger calibration applies
here, on the normalized 0 to 1 range of the trigger axes (from `LEFT_TRIGGER` on), read live
from the input module's `useCalibrationStore` so a calibration saved on the Controllers screen
applies at once; sticks arrive normalized to -1 to 1.

## packages/input-mapping/src/runtime/profile-devices/allowed-devices.ts

The whitelist the input engine gates on: a keyboard when the map has keyboard bindings, and
gamepads whose vid:pid appears in the map or as the assigned device. A connected but
unmapped controller contributes nothing. Keys are lowercase, four hex digits each.

## packages/input-mapping/src/runtime/profile-utils

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

## packages/input-mapping/src/runtime/resolve-bindings

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

## packages/input-mapping/src/runtime/resolve-device.ts

The single resolver both the calibration cards and the controls screen use. SDL's own
`hasButton`, `hasAxis` and `buttonLabels` decide what exists; the family layer only decides
labels and icons. No preset and no device database is consulted, so the screens cannot
disagree. An unavailable entry was never opened by SDL and resolves to an empty control list.

## packages/input-mapping/src/runtime/scheme-runtime

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

## apps/desktop/src/input/seed-device-cache.ts

Seeds a per device cache from the controller snapshot, then keeps it live with the input
module's `onDevices` and `onAdded`. Three caches once listened to the added event alone and never recorded a device connected before they subscribed. Snapshot
entries and added events both satisfy `DeviceSnapshotFields`; `remember` decides whether an
entry carries enough to record.

## apps/desktop/src/input/snes-button-glyph.ts

The picture and name of whatever input a SNES button is bound to: keycaps for a keyboard
profile, the pad's own face buttons for a controller profile, resolved like the Controls
screen's rows. An unbound button falls back to the SNES button's own picture.

## apps/desktop/src/hooks/useControllerDevices.ts

Device list state for the Controls page and the Controller Diagnostics page, read from the
input module's `useControllerDevicesStore`, plus RotP's adapter grouping. The module keeps a
rescan pending until the next snapshot arrives or three seconds pass.

## apps/desktop/src/input/vibration

A transport free vibration call through the input module's `vibratePattern`, which sequences
the segments in main on desktop and in the WebView on Android. Default intensity is 0.7.

## instance

The renderer's view of the named instance flags (`--instance`, `--profile`), forwarded by the
preload as `api.instance`. A named instance is an automated launch running beside the user's
own app: it is marked on screen and boots into its own profile, and it must not write files
every launch shares (see `setLastProfile` in `apps/desktop/src/storage/profile-store`). Values are read at
call time, never cached; `window.api` is installed before render. `isAutomationLaunch` is
true for any automated launch, named or not. Such a run must not change which profile opens
by default (`app.json`) or where the window sits, and gating on it means a run that forgot
`--instance` still cannot damage the user's setup.

## log-bus

- The ring keeps 1000 entries, enough for a whole randomizer session start burst (a full
  plan application logs about 500 entries).
- A listener that throws is skipped so it cannot break the bus.
- Every entry is mirrored to the native console, unconditionally, so the main process file
  logger captures the channels. It used to
  depend on `import.meta.env.DEV`, which is fixed at build time, while the file logger
  attaches on `is.dev` at run time; an unpackaged run of a production bundle then wrote no
  channel lines, the one case a crash log is for.
- WebAssembly `RuntimeError`s are left to the lifecycle crash handler and never logged by the
  global handler: they would flood during the game loop.
- `window.__logEntries` and `window.__logSubscribe` are exposed for Playwright and devtools.
  A burst safe capture needs a listener, since the ring drops old entries.

## packages/msu/src/player/build-channels/build-channels.ts

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

## packages/msu/src/player/channel

One replaceable sound chip channel, in the two behaviours the game needs. Music and the
ambient bed are stateful (a new id replaces the old and has a position worth resuming); the
two effect channels are additive (a new id layers over what is sounding, nothing resumes).
The engine holds four channels and never asks which is which.

## packages/msu/src/player/channels/active-layers

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

## packages/msu/src/player/channels/additive-channel.ts

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

## packages/msu/src/player/channels/channel.type.ts

- `fadeNode` is the gain the game's own volume transitions act on. Only music is ever sent
  one; the others hold it at full so every channel has the same three stage gain chain.
- `restartOnRepeat`: off, selecting the id already playing is a no op (the chip's behaviour
  for a port rewritten with its own value, which the ambient bed needs); on, it restarts,
  which music needs after a fade to zero.
- `resumeEnabled` is read per selection, so a mid session toggle applies at once.
- Programs sharing a `group` hand playback across on a switch (`MsuSoundDef.syncGroup`).

## packages/msu/src/player/channels/stateful-channel.ts

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

## packages/msu/src/player/channels/trigger-pool.ts

Which file each layer of an additive channel uses for this trigger. A sword swing authored
with four recordings should sound like four recordings. The variation belongs to the trigger,
not the play mode, so it is chosen here and handed to the scheduler as the starting file; the
continuous modes already draw from their own pool. A file is drawn from every file except the
one the layer just used, since the same sample twice reads as broken variation. It is
deliberately unseeded; only the exporter, which must produce the same bytes twice, needs a
seed.

## packages/msu/src/player/debug-bus

The engine's own diagnostic feed for decisions no live report can show. A channel report
says what is sounding and the core's sound trace says what the game raised; the chance roll
sits between them, and a layer that lost its roll appears in neither. Without this feed a 10%
thunder looks like a broken one. It lives outside React and is always on: publishing to
nobody costs nothing, and a bad listener never breaks playback. A roll event names the
channel, the program (track number or sound id), the layer and its odds (1 to 100).

## packages/msu/src/player/decode

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

## packages/msu/src/player/engine.ts

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

## packages/msu/src/player/export

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

## packages/msu/src/player/fade

The game asks for volume transitions with three control bytes, not a level: `0xF1` fades out,
`0xF2` ducks to a low level, `0xF3` returns to full. Each has its own speed, a per frame step
out of 256 at 60 frames a second, converted to a ramp duration so a fade takes the same wall
time as on hardware. A starting track returns to full at the fastest step (24).

## packages/msu/src/player/layer-effects/build-effect-chain.ts

Every effect is one or more biquad filters, the whole vocabulary the manifest allows, so it
plays the same everywhere and can be flattened into an export. The three band EQ is a low shelf
at 250 Hz, a peak at 1 kHz (Q 0.7, about an octave and a half) and a high shelf at 4 kHz. An
empty chain is no nodes at all.

## packages/msu/src/player/schedulers

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

## packages/msu/src/bridge/sound-claim

Which sound ids a pack claims on a channel, as the 64 bit mask the core wants. The core reports
only a sound whose bit is set, so the mask decides whether the app replaces an effect or the
chip plays it. It travels as two unsigned 32 bit halves because that is what a `ccall` can
carry; bit 31 makes a JS int negative, so each half is converted to uint32. Ids outside 0 to 63
are dropped, never wrapped, so a typo claims nothing. Channels are in the core's index order:
ambient, sfx1, sfx2. Only sounds that author at least one layer are claimed.

## packages/msu/src/player/title-reset

Replacement audio goes back to nothing at the title. Resume positions carried across runs would
start the opening in the middle of itself. The game ends a run by reloading the sound chip's
song bank, which stops the chip's ambience without raising the no bed id, so a storm would keep
raining over the title. Reaching a title module is the one unambiguous signal that no run is in
progress, and save and quit, a game over and a hard reset all arrive there. The modules are the
core's own dispatch order (`kMainRouting`), the same set `packages/game-core/src/ui-bridge-parser` reads as the
title UI mode: intro (0), file select (1), copy file (2), kill file (3), name file (4) and the
attract demo (20). Music is not silenced: every path to the title fades it out first
(`Death_Func31` and `FadeMusicAndResetSRAMMirror` write the fade byte the same frame), so a cut
would replace that fade with a click. Silencing happens once on the way in; forgetting
positions happens on every title event, since the title loops into its demo and back.

## packages/msu/src/player/track-loader.ts

Audio is decoded per id, on demand: a real pack is over a gigabyte of PCM and only a few ids
sound at a time. Decoded audio is cached so re-entering an area or repeating an effect does not
decode twice, capped so a long session cannot grow without bound. One loader per channel, so a
busy effect channel cannot evict the music. A layer whose files all failed is dropped rather
than left to play silence.

## packages/msu/src/player/voice.ts

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

## packages/hub-client/src/sanctuary/github-handle.ts

The linked GitHub login is the one identity a filed issue mentions.

## apps/desktop/src/sprites/apply-sprites-for-rom.ts

The enhanced HUD reads sprites from the shared base, so the base must always track the ROM
in use. A set that was already available and is rewritten moves the revision, because the
extraction clears the folder before writing it again and every URL on screen fails for the
duration. Only the ROM still active gets its flag refreshed, so a profile switch during an
extraction cannot let the old ROM's result overwrite the new one. One log line per run names
the base, the verdict and the file count, so a listing stuck on placeholders can be
diagnosed from `session.log`.

## apps/desktop/src/sprites/ensure-sprites-extracted.ts

Extraction runs at most once per ROM per session. Concurrent callers (startup, profile
select, boot) share the in-flight promise, and a finished run, successful or not, is not
repeated on the next profile switch. The manual buttons keep their own path.

## packages/packs/src/sprite-apply/sprite-rom.ts

With no active profile (a first run, a missing pinned profile, the profile creation form), a
ROM that is ready to play stands in, so views that draw item art do not show placeholders
over a set that is on disk.

## apps/desktop/src/hooks/useSpriteRevision.ts

Sprite URLs carry the revision. A view that memoizes them recomputes when the revision moves,
or it keeps serving the URLs that failed while the folder was being written.

## storage

Each store binds a library in `apps/desktop/src/storage/` to the platform FileStore and mirrors the
old `window.api` method names, so call sites swap one for one and persistence runs per OS
through the platform layer.

## apps/desktop/src/storage/assets-store

The `.dat` is checked and loaded over FileStore and extracted in a Web Worker: ROMs and
language sets are read here, the worker bakes them, and the base blob plus one sidecar per
optional cartridge are written back. The base and each supplement are separate files, so
rebuilding the base never destroys a supplement; they are joined only when loading, because
the core expects a single buffer. The bake pulls in the whole dialogue compression path,
which belongs off the UI thread.

- A missing blob is not stale. The missing file path already recompiles; staleness only
  concerns a blob that exists but predates the current bake format (`packages/asset-extraction/src/bake-version`).
- A supplement whose cartridge is gone must not linger as a stale sidecar.
- After a bake, anything already running booted with the previous blob and is now behind,
  so the game assets store is told.
- `recompileAll` rebuilds every ROM that already has a cached `.dat`, after a language set
  changes.

## apps/desktop/src/storage/audio-probe.ts

ffprobe is a native process and only runs in the main process. On a host without that IPC
surface (mobile, browser) the probe resolves null, which callers already treat as nothing
knowable, so no caller needs a host check.

## apps/desktop/src/storage/extraction-client.ts

One Web Worker per job.

## apps/desktop/src/storage/import-progress-bus

Import runs in the renderer over FileStore, so progress is published on this bus, never as a
main process IPC event. `useImportProgress` subscribes to it.

## apps/desktop/src/storage/languages-store

- Saving, creating and duplicating a set all rebake every blob, which is expensive, so
  callers debounce edits.
- `getLanguageSetFont` returns the set's glyph tiles plus its per glyph advance table and
  never rebakes, so a preview can ask freely. `exportLanguageSet` packs the set folder as
  `.rlang` and never rebakes either.

## apps/desktop/src/storage/link-sprites-store

Validation is per container: a ZSPR by its magic, a sprite pack by being a readable zip with a
manifest, so a mislabelled file is rejected on import, not at boot. `writeLinkSprite`
overwrites in place for the studio's save and skips the rename that import applies.

## apps/desktop/src/storage/menu-text-store.ts

The menu, credits and closing caption bodies are decoded on demand from the player's own
ROM. They are not in a language pack (the extractor copies their bytes undecoded) and are
game derived text, so they may never be committed. Results are cached per language because
reaching them means reading a whole ROM. The set's own language is preferred, but another
region's ROM still shows a translator what each slot holds, and the answering language
travels with the result. A ROM the pipeline cannot read is skipped. No matching ROM is an
ordinary state, not a failure.

## apps/desktop/src/storage/msu-store

- `listMsuPackEntries` lists every file in the pack folder except the manifest; this is what
  an export stores.
- The audio probe is passed to the metadata read unconditionally. It answers null when no
  decoder is installed, so the encoded rows stay unfilled.
- `canTrashMsuPack` is true when a deleted pack goes to the system recycle bin and false when
  it is removed for good.
- The import result type comes from `msu-contract`, so the renderer cannot fall behind what
  an import reports.

## apps/desktop/src/storage/profile-store

`app.json` decides which profile opens by default and is shared by every launch. Loading a
profile for play writes it on each run, so `setLastProfile` does nothing on any automated
launch, named instance or not; otherwise the user's next normal launch would resume an
automated run's profile. The gate sits at this single seam so no call site can forget it.
`updateActiveInputProfileId` merges the active input profile id into the config without
clobbering other settings, for the profile cycle shortcut outside the settings screen.

## apps/desktop/src/storage/roms-store

Import runs in the renderer (pick or download, unzip or raw, then FileStore) and reports on
the import progress bus. Every import names its kind. The base cartridge boots the game; a
supplement only adds to one, is digest checked before it is written, and never replaces a
file already there.

## apps/desktop/src/storage/saves-store

Every save state leaves through one of the four writers (quick state, normal save, its
overwrite, auto save), so the version and format stamp is applied there and not at each call
site. SRAM is excluded: it is the game's own save file and has nothing to do with snapshot
layout. Screenshots come back as base64 strings. SRAM and quick slots go through the Brock port
kit's save store (`port-save-store.ts`); named and auto saves through `apps/desktop/src/storage/save-files`.

## apps/desktop/src/storage/sprites-store

The sprite base URL comes from the platform (`app-sprite://` or `convertFileSrc`). A build
without sprite definitions extracts nothing and can never call a set stale. The staleness
rule itself lives in the shared store (`sprites.isStale`); this side only supplies what this
build emits. The capacity, gear, quiver, pool and shop price symbol reads return the binary
from the ROM's extracted set, or null before it exists.

## apps/desktop/src/storage/ui-views

The single boundary for durable view state, keyed and app level, not per profile (see
`apps/desktop/src/ipc/ui-views-contract.type.ts`). Nothing else touches `window.api.uiViews`; a composite
that wants persistence goes through `useViewState`. The whole map loads once and is cached,
every mutation rewrites the whole map, and writes are fire and forget: a failed write logs and
is dropped. Rapid saves collapse into one write about 400 ms later. A save before the map has
loaded waits for the load first, because writing early would clobber every other
collection's saved layout with a file holding only this key. Entries that are not well formed
snapshots are dropped on load.

## apps/desktop/src/hookshop-reads

The Hookshop's catalogue reads (the home page, every item, one item) through the Brock catalog
module, typed with the store API's own shapes. Without the module (a host with no main process)
each read answers `NO_CATALOG`, a failure the tab shows like any other.

## packages/hub-client/src/store-site

The Hookshop origin is a placeholder until the store's domain exists. The main process names
the same origin for the store API in `apps/desktop/electron/hub/endpoints`. The media bucket is
private: store-api signs every picture it returns and puts the link in `url`, valid for two
hours. Without one the tab draws the kind's icon.

## tracker-state-io

Typed wrapper around the per profile tracker state IPC, so presentational tiers never touch
`window.api` directly.
