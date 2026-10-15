<!-- @layer docs @kind doc -->
# Code notes: packages/game-core

Facts about `packages/game-core` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

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

## packages/game-core/src/aspect-ratio/

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

## packages/game-core/src/audio-volume/

- Master volume is a Web Audio GainNode inserted between SDL2's ScriptProcessorNode and the AudioContext destination.
- Mobile WebViews and browsers create the AudioContext suspended (autoplay policy). The game start tap's user activation has expired by the time the context exists, so the next real interaction resumes it, and the listeners remove themselves once the context runs.
- Arming the gesture listeners again is harmless: duplicate listeners are de-duplicated by identity.
- lastRequestedVolume is kept so a gain node created on demand starts at the last volume anyone asked for.
- getMasterAudioTarget creates the master gain when missing instead of handing out the raw destination. A caller connected to the destination stayed connected to it, so replacement audio attached early escaped the master volume slider for the whole session. It is null only while SDL2 has not created its audio context, and the caller retries after boot.

## packages/game-core/src/bridge/announce-music.ts

- Asks the core to report again the music and ambient bed it is playing. It mirrors restore-music.
- The core writes its control port only when the music changes, so an engine that attaches after a selection (behind a boot-time state load, or a late audio context) has missed it and waits in silence for the next one.
- Call it once the handlers are registered and the gate is armed: the core checks both.

## packages/game-core/src/bridge/combat-tables/

- Both buffers open with a status byte: 1 when the row that follows was filled, 0 when the developer tools gate is off or the query was out of range. A zero row is a legitimate answer, so that byte is the only thing telling the two apart.
- Sprite row layout: status, initial health, initial flags4, then 16 damage-by-class entries already reduced through the game's own two-step lookup.
- Shared tables: ancilla (projectile) type to damage class (57 bytes), then tile attribute to projectile collision behaviour (256 bytes): 0 pass, 1 block, 2 sloped, 3 layer-dependent, 4 priority flip.

## packages/game-core/src/bridge/commands.ts

- `wasmSetPaused` pauses or resumes the game at the C level.

## packages/game-core/src/bridge/deluxe-entrances.ts

- Tells the core which entrances the extended pack gives a track of their own.
- The remap tables belong to the renderer and the core keeps no copy. The core only needs to know, per entrance, whether a dedicated track exists, so it can hand the game a selectable indoor song for entrances whose own byte never selects one (a duck, or an overworld song carried indoors).
- Pushed as a bitmask of 32 entrances per word, every time a session starts. The mask is armed for an extended pack and cleared for any other.

## packages/game-core/src/bridge/dialog/

- C side: core/game-hooks/dialog_*.c.
- The mirror snapshot is null when the module is not running or the HUD override gate is closed.
- Pacing is in quarter units (4 means 1x, 0 means instant), plus the hold-A and B-fill switches.
- Hidden means the native box stays off VRAM because the host draws its own.
- `wasmGetDialogFont(0)` is the active language's glyph sheet, `(1)` its width table, as a view into the loaded asset blob. Null when the render-queries gate is closed.
- The palette is the four SNES colour words the text box draws with this frame.
- Mark stale after a state load: the native box shows until the next message starts.
- Hook state is copied out of the core's frozen buffer: two length bytes, then the blob. Null with no message up, a stale mirror or a closed gate. It takes the module itself because saves and loads run wherever the core does, not only while the game is running.
- Restore returns false when the core refused the blob and restored nothing.

## packages/game-core/src/bridge/host-gates/

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

## packages/game-core/src/bridge/host-menu/

- The only place in the app that spells the six WasmHost* export names. Everything above goes through `packages/game-core/src/host-menu`, which adds the wanted-state and re-assert rules; nothing here holds state.
- Both gates are checked on the C side at every call (core/game-hooks/host_menu.c), so these stay plain fire-and-forget commands. See docs/hooks/host-menu.md.
- Takeover records the host's standing request; the C side defers it, like WasmSetHudHidden.
- Close is the "continue" exit and hands the menu state machine back where the vanilla branch does.
- Save and quit rebuilds the HUD, then hands off to the save-and-quit module.
- Set active item writes the core's single equipped-item register; `hudItem` is a new-style id, 1 to 24.
- Is holding answers 1 while the takeover is in force and the gate allows it.
- Set gear `kind`: 0 blade (tiers 0 to 4), 1 guard (0 to 3), 2 armour (0 to 2), 3 arrow type (0 to 1). It repaints and re-derives in one call; the arrow write keeps the register's ammunition half.

## packages/game-core/src/bridge/nav-tables/

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

## packages/game-core/src/bridge/progress/

- `packages/game-data/src/logic/queries/progress-tier` says what each progress indicator value means. A tier with no row in the dataset is reported as itself, never renamed here.
- The progress indicator reads from WRAM and works indoors or outdoors; null only when the game is not running.
- `screenEventFlags` is save_ow_event_info for the current screen. Bit 0x20 says the event overlay has been applied.

## packages/game-core/src/bridge/restore-music.ts

- Hands music back to the emulated sound chip.
- While the host plays music the core keeps its music port paused. Clearing the gate does not undo that: the port is written only when the music changes, and the core has tracked the current track all along, so it thinks its track is already playing and writes nothing. Without this call the chip can stay silent indefinitely.
- The custom player sprite and the HUD override each have their own restore for the same reason.
- Call it while the external-music gate is still armed, since the core checks the gate.

## packages/game-core/src/bridge/room-doors/

- The room header stores a staircase destination as one byte, written with `BYTE(dungeon_room_index) = ...` (dungeon.c:4339). The room's high byte carries over, so a staircase never leaves its bank of 256 rooms. Reading the byte as the whole index once sent every 0x1xx cave stair to a dungeon room (0x119 read as 0x19).
- The stair layer is the attr page the stair tile sits on (0 BG2, 1 BG1); taking the stair lands the player on that layer.
- The room-addressable variants work for any room, not only the loaded one, and rebuild that room's attr table and header as a side effect.
- Walk boundaries are inter-room walk-throughs (palace toggles such as castle to sewer).
- Travel destinations are the 5 bytes from the room header. Tag bytes (tag1, tag2) drive scripted room effects.

## packages/game-core/src/bridge/room-grids/

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

## packages/game-core/src/bridge/room-layout/

- Quadrant fullsize X or Y of 0 means that axis is not merged by a blast wall.
- `intraEdges` lists which edges of the current quadrant are intra-room boundaries, not room-to-room.
- `intraEdges` only carries an edge when the room's quadrant flags say the axis is not merged, so an east or west entry means the room is split in X and a north or south entry means split in Y, whichever quadrant the player is in. The player's section comes straight from the live quadrant read, not from a pixel position.
- Floor raw: 0 is 1F, 1 is 2F; negative floors are stored unsigned, 0xFF is B1, 0xFE is B2.
- Effective width and height are the bounding box in map cells of every cell containing the room.

## packages/game-core/src/bridge/second-cartridge/

- C side: core/game-hooks/gba_alttp.c.
- Two separate questions, deliberately kept apart. Available: the supplement container is in the asset blob. Enabled: the player asked for the extra content.
- Both must hold before anything appears in the world, so owning the cartridge with the option off still gives an untouched overworld. The core defaults to disabled, so a host that never calls the setter behaves like the base game.

## packages/game-core/src/bridge/sim-queries/

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

## packages/game-core/src/bridge/sound-preview/

- Renders what the sound chip would play for one sound id, for A/B against a replacement. The core uses a private second chip (emscripten_sound_preview.c), so nothing disturbs the playing music or a save's state. Needs a core with parsed assets; see preview-core.
- Music is a preview target but not a SoundChannel; it is written to a port like the rest. Ports match SOUND_CHANNEL_PORTS in the sound catalogue.
- The chip runs one frame per video frame; the core counts a duration in frames.
- Bank -1 lets the core find the bank holding the sound. Music ids are spread across banks (overworld songs in the base one, dungeon songs in the bank layered over it) and effects sit in the base bank, so the search answers both without a table here.
- Null when the core cannot render; digital silence when the id has no sound. Callers report the two differently.
- Samples are interleaved stereo 16-bit signed, copied out because the core reuses the buffer for the next render and a growing heap can detach the view.
- The bank in the result only matters for diagnosing a silent id.

## packages/game-core/src/bridge/sprites-blockers/

- Uncle blockers are active Uncle sprite blocker coordinates for the indoor early-game variants.
- Navigation blockers are live dynamic blockers used by the navigation flood fill.
- Guard spawns are the static overworld tutorial guard spawns (sprite 0x3F and 0x40) for the current area, independent of camera proximity loading.

## packages/game-core/src/bridge/title/

- C side: core/game-hooks/title_mirror.c and title_override.c. The frame decode follows the struct in title_mirror.c field by field.
- int16 piece_x[3] is aligned to the next even byte after the fade byte, so it starts at 18; piece_y follows at 24.
- The poly block is the poly thread's 4bpp tiles; the view is taken every frame because the heap can grow.
- The palette is the eight SNES colour words the triangles draw with.
- Title frame is null when the game is not running or the gate is closed.
- Hidden is in force only when the gate is open, the request was made and the title is on screen.

## packages/game-core/src/bridge/ui-state/

- The UI state buffer is returned as the heap and a pointer.
- The overlay mode bitmask controls native rendering suppression.
- Menu state: 0 gameplay, 1 opening, 2 open, 3 closing. Used to sync the enhanced HUD overlay with the native pause animation.

## packages/game-core/src/bridge/view-origin/view-origin.ts

- The rendered frame is not the camera: a wide view draws `extraLeftRight` pixels before the camera column, a tall view draws `extraTopBottom` rows before its first row, and the camera lock shifts the picture so its edge can rest on the map boundary. Anything drawn over the game (navigation overlay, shadow editor, tile tooltip) must start from this origin or it sits off what it marks.
- Consumers once derived this inline; some carried the lock shift and some did not, and none carried the rows a tall view adds on top.
- Lines above the picture: a tall view adds the same budget above and below; the 240-line view adds its 16 lines below only, so a surplus of exactly 16 means nothing on top. Anything that marks a spot in the picture (the message box, on a scanline the game names) starts below these lines. Frame furniture (enhanced HUD, pause menu) is placed against the rendered frame and reaches the top in every shape.

## packages/game-core/src/bridge/wasm-call/

- Shared call helpers: module guard, try and catch, count-prefixed array decode, so each bridge query is a short declaration of its packed layout.
- `callWhenRunning` runs only when the module is loaded and the game is running; any throw returns the fallback.
- Table layout: `countBytes` is the count header size (1 is u8, 2 is little-endian u16); `dataStart` is where the first row begins; `maxCount` is a defensive clamp, because several C tables cap their length.
- Gated tables: byte 0 is a status flag, 0 when the export's gate was closed or the argument out of range, 1 when the count-prefixed table at byte 1 was filled. A closed gate returns null, not an empty array, so "not allowed" and "nothing here" stay distinct. C side: WasmGetRoomChests and friends (sim_queries.c).

## packages/game-core/src/canvas-context.ts

- A stopped game loses its canvas WebGL context to free the GPU (apps/desktop/src/game/lifecycle stopGame). The canvas hands that same lost context back on the next getContext, SDL's renderer then fails to initialise on it, falls through to a 2d context the canvas can no longer give, and the core dies on "createImageData of null". So a restart first asks the canvas to restore the context and waits for the restored event (or a timeout).

## packages/game-core/src/capture-frame/

- Game frame capture for save state screenshots.
- Reading the game's WebGL canvas asynchronously is unreliable: the backbuffer can be cleared after present, and toBlob on a hidden WebGL canvas returns blank in some WebViews (Android's). So capture piggybacks on the FX render loop: a save requests a capture, and the loop, right after it draws the visible FX canvas, encodes that frame. Reading in the same turn as the draw sidesteps every async, visibility and preserveDrawingBuffer quirk.
- fulfillFrameCapture is called by the FX loop right after it renders the visible canvas.
- The frame is copied into a 2D canvas first because toBlob is dependable on a 2D canvas, and drawImage reads the source canvas's freshly rendered contents.
- A newer capture request supersedes an unfulfilled one, which resolves null. A request with no frame in time (the game is not running) also resolves null.

## packages/game-core/src/cheat-rules-memory/

- The Rules tab's standing choices (walls, lit rooms, damage dealt and taken) are kept between sessions. The core holds them in plain memory that a fresh boot clears, so they are remembered on every change and put back once the game runs.
- The core refuses a cheat until its gate word has landed, a frame or so after boot, so the restore is tried twice (RESTORE_DELAYS_MS).
- A category the profile turns off still refuses them; nothing here overrides a gate.
- localStorage is a convenience: a failed write is ignored.
- onCheatRulesRestored tells a panel that reads the rules by getter to draw them again.

## packages/game-core/src/cheats/

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

## packages/game-core/src/core-ready/

- The one honest answer to "can the core take a command right now?": a live module and a running core. Either missing and the ccall goes nowhere.
- The renderer has a looser "running": the game view has its asset blob (useGameLifecycle's isRunning). The Emscripten module appears roughly two seconds later, and everything gated on the loose flag (the save state overlay, its shortcuts, the Home tab's load buttons) is live for that gap. A command issued in it used to find a null module and be dropped. Anything that reaches into the core orders itself against this check instead.
- A request made mid-boot is early, not a mistake: waiting it out makes "load slot 3" mean the same thing whether the core came up a second ago or is a second away. whenCoreReady resolves false on a crash and on the timeout, so no caller waits forever.
- The 30 s default timeout is generous: it covers a boot that has to extract assets first, and nothing should ever reach it.
- `settle` is assigned synchronously before any listener can run: subscribeGameState replays the current state on a microtask, never during the call.

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

## packages/game-core/src/dialog-texture/

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

## packages/game-core/src/dialog/

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

## packages/game-core/src/edge-glow/

A WebGL post process that fills the black bars around the game: a mirror pass reflects game
pixels into the bars, progressive Gaussian blur passes soften the reflection, and a composite
blends the sharp reflection near the edge into the blurred one further out, with animated
Voronoi noise modulating blur, saturation and opacity, plus a pixelation mask and an edge fade.
Fullscreen quads are drawn as two triangles (six vertices). Without WebGL a 2D fallback copies
the game canvas each frame and ignores every effect control, so the game still renders. A clean
frame, when given, is uploaded separately and mirrored with its blue and red channels swapped.

## packages/game-core/src/enhanced-fallback/

- The app-drawn HUD styles (Enhanced and Modern) need a 16:9 or wider display. There are two ways to lose one: narrow the ratio in settings, or narrow the window.
- The settings screen owns the correction either way, because it alone holds the profile's settings and the toast queue. Both routes ask through this one event instead of each dropping the style and raising its own message: one rule, one wording, one toast id, so a player who trips it twice sees the notice replaced, not stacked.
- requestEnhancedFallback asks the settings owner to drop back to the Original style and say why.

## packages/game-core/src/follower-state.ts

- Who follows the player, read from live game state. `follower_indicator` (RAM 0xF3CC) is the game's own tagalong id, mirrored into the flag snapshot's progress buffer (slot 13) by state_queries.c. It is what the game believes now, not a flag the simulator set when it triggered the rescue, so a run resumed from a save state, or a state walked into by hand, reports the truth.
- Centralised because two places gate on it (the throne room push wall's annotation and its walk-through boundary), and both had the buffer index and the id comparison inline.
- The game has many tagalong ids (old man, blind maiden, the frog). Only the rescued princess (id 1) gates traversal today, so only she is named. 0 is nobody following.
- isFollowerActive is true when the princess is in tow right now, which is the throne room gate.

## packages/game-core/src/fps.ts

- Reads the current frame rate from the running WASM module; 0 when there is none.

## packages/game-core/src/haptic-polling/

- Frame-by-frame detection of game state changes for haptics. It runs inside the ui-bridge rAF loop and detects the dash (periodic pulses), state transitions (falling, landing, death), spin attack release, and health decreases as a backup if the C hook misses.
- PLAYER_STATE values are the player handler states from player.h.
- UI_STATE_OFFSET are byte offsets into the UI state buffer: 0 main module, 115 handler state, 116 is-running, 117 dash counter.
- The player is dashing when is-running is set and the dash counter is from 32 up to below 64 (charging complete).
- A landing is a move to the ground state from one of the ledge jump states.
- Main module 18 is game over.
- The unused write-only `prevIsRunning` field was dropped.

## packages/game-core/src/host-menu/

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

## packages/game-core/src/live-game-states.ts

- Reads the live flag snapshot and hands it to the state registry. It is split from active-states.ts so the rules stay pure (unit-testable with a plain object) while the WASM read lives here.
- Two sources make one list: SRAM progress (follower, story beats, keys) and live player-state bytes (what the player is doing, named progress bits).

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

## packages/game-core/src/live-settings-flags/

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

## packages/game-core/src/live-settings-gate/

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

## packages/game-core/src/mem-file-store/mem-file-store.ts

A `FileStore` held in memory, with bytes, text and a modification time. Tests use it as a disk, and the pack viewers use it to run a file bound reader over bytes that never touch one.

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

## packages/game-core/src/observations/

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

## packages/game-core/src/override-fired/

- The C to JS completion signal for physical overrides. When an in core substitution table (npc, drop, standing) applies an entry, the check that entry stands for is completed at that instant, and the core reports the host assigned fire id the arming call carried (GameHook_NotifyOverrideFired calls window.__onOverrideFired).
- Sessions use this for their physical rows instead of save flag or possession polling, because several giver checks have no reliable flag, and possession reads false fire when the vanilla item arrives from elsewhere.
- The core calls the hook synchronously from inside the wasm frame, so the handler is deferred to a microtask and never re enters the module mid execution.

## packages/game-core/src/pathfinding/crossing.type.ts

`ScreenCrossing` is one record for every way on or off a screen.

- `CrossingClass`: `edge` is a screen boundary scroll; `entrance` is every other crossing (doors, thresholds, stairs, holes, drops, warps, respawn points).
- `CrossingOrigin` is the detector that produced the crossing. `room-border` covers both a room's walk through boundary row and a flood border scroll between rooms; `class` tells them apart.
- `CrossingTarget.native` uses the game's unified 0x00 to 0x7F overworld numbering, where bit 0x40 is the dark world.
- `CrossingSpan` is the run of tiles a boundary scroll covers and how many are plain floor or need an item. `from` and `to` are columns for a north or south scroll and rows for an east or west one.
- `id` is stable within a screen: `ent:5`, `stair:1001`, `edge:north:31-32`, `warp:3`. `kind` uses the dataset's own vocabulary, so a proposal needs no translation.
- `tile` is the walkable tile the player stands on, offset already applied. `placed` is false for a crossing the game names without a position, such as the exit table's way back outside: it belongs in a list but on no map.
- `layer`: 0 upper floor, 1 lower floor. `span` and `layerToggle` are set on edges only; `layerToggle` means the scroll flips the player's floor.
- `target` is resolved once, never per render.
- `available` means the flood reaches it and every requirement is held. An unavailable crossing is kept and marked, never dropped.
- `steps` is the walk distance from the flood's start tile, set only when that distance is real. `arrival` says in words how the crossing is taken ("via north edge, tiles 31-32").
- `ScreenCrossings.screenIndex` is the room index indoors and the overworld screen index outdoors.

## packages/game-core/src/player-state-rules/

- State rules driven by live player state bytes: what the player is doing, and the named story bits in `sram_progress_flags`.
- `player_sleep_in_bed_state` is a step counter that is zero while asleep, so "asleep" comes from the handler state and the counter only says how far into waking the player is.
- PlayerState holds the kPlayerState values this project names (player.h). `ground` is the default and has no label.
- PROGRESS_BITS are `sram_progress_flags` bits, named from the routine that sets each. The mask travels as a tooltip hint (provenance, not chip text) so a doubted label can be traced to its byte.
- Dashing is its own state because the boots change what the player can cross.
- `playerStates` lists every state the bytes imply, in reading order.

## packages/game-core/src/profile-data/index.ts

- Paths and format match the Electron handlers: `profiles/<id>/{sessions,tracker,randomizer,input-profiles}.json`.

## packages/game-core/src/public-api/

Each folder is one concept of the package's public surface, and the package `index.ts` only star re-exports them. The split exists to keep the entry barrel under the barrel line cap, so a name moves between folders without changing what the package exports. Add a new export to the folder of its concept, and add a folder when a concept has none. The folders are `gameplay`, `items`, `saves`, `session`, `settings` and `ui-bridge`.

## packages/game-core/src/ratio-capability/

- What ratio a profile may render, given the capabilities it has switched on. The preset picker gates its own entries: the widest need the world tilemap and the ultrawide switch, the tall ones need tall rendering. Auto, Screen and Custom went around that, so a wide monitor on Auto, or a tall Custom ratio, handed the core a shape whose capability bits were never set.
- Above LINEAR_RATIO a ratio needs the linear world tilemap, because the stock 512 px fetch runs out. Above ULTRAWIDE_RATIO it also needs the ultrawide switch. Below TALL_RATIO (4:3) it is taller than the original picture and needs the tall renderer.
- `requestedRatio` is the ratio the settings ask for, before any capability is considered. `allowedRatio` pulls it back to what the switched on capabilities support; a profile with everything off renders 4:3, which the core would do anyway.
- `rendersExtended` is true when the view shows more than the original picture on any side. The widescreen corrections answer to it: a tall view has the same transitions, effects and sprites drawn for the original screen, so it needs them too.
- `ratioToString` builds the "W:H" word the core's config parser reads, from the served height (224) so the pair is exact for the shape asked for, and reduced, which is what the ratio pickers hand over too.

## packages/game-core/src/recommendations/detection-types/observation.type.ts

The live evidence shapes carried by `ScreenObservations`.

- `ObservedDestKind` says how a raw destination index resolves to a screen id. An entrance id is not one of them: it names a room only through the native entrance table, so a producer resolves it there and reports the `room` it found.
- `ObservedTransition` is one real transition leaving the current screen, read off a native table, so an absence is provable. `source` names the table (the exit map, the stair table, the flood). `index` is the raw game index: an overworld screen index, a room index, or an entrance id.
- `ObservedCrossing` is a crossing already resolved against the dataset. `toScreenId` is null when no record covers the destination, the one case nothing may be written for. `targetRoomOrScreen` is the raw index the detector reported. `isExit` is true for the exit screen detector, which reuses the `entrance` type. `label` is display text only.
- `LiveSpriteObservation` is one spawn from `wasmGetRoomSpriteSpawns` or `wasmGetOverworldSpriteSpawns`, declared structurally so the bridge's `SimSpriteRaw` values pass in. `spriteType` is the native sprite type byte and joins to `ActorRecord.gameId.spriteType`.
- `SpriteCombatObservation` is the resolved combat row for a sprite type (`wasmGetSpriteCombat`). The table is enumerable per type, so a disagreement with `ActorRecord.combat` is proven. `damageByClass` has 16 entries indexed by ancilla damage class.
- `GrantedItemObservation.receiveCount` is the `Link_ReceiveItem` call tally (`wasmGetReceiveCount`); nonzero proves the game granted the item at least once. `ownedItemIds` is what the tracker read as held at the same moment, which the vanilla duplicate swap rule (`resolveDuplicate`) needs. `fromInventoryDelta` is true when the entry came from watching the tracker's inventory change. A delta only proves an item appeared, so a detector grades it `likely`, never `certain`.
- `ChestObservation` is one chest the room draws, from `wasmGetRoomChests` (the bridge's `SimChestRaw` rows). The table lists a room's chests, draw tiles and static contents whether or not one was opened, so an absence is provable. A receive event only proves something occurred. `chestIndex` is the draw order slot and joins to `CheckGameId.chestIndex` and the open bit mask. `itemId` is in the same raw id space as `ItemGameId.receiveItemId`. When `posKnown` is false the draw position could not be decoded and `col` and `row` are 0xFF.
- `LiveDungeonMapPosition` comes from `wasmGetDungeonMapPosition`. `found` is the table's own answer: the native call reports false for a house, a cave or outdoors, a resolved negative like `known(undefined)`. Not read is `ScreenObservations.dungeonMapPos` being absent. `floorRaw` is the raw floor byte: 0 is 1F, 1 is 2F, 0xFF is B1, 0xFE is B2, the same encoding as the bridge's `DungeonMapPosition.floorRaw`.
- `LiveWalkBoundary` is one boundary from `wasmGetRoomWalkBoundaries`, such as a palace toggle wall between the castle and the sewer. `destRoom === 0` means no boundary on that wall, like the unused slot of every other room addressable table.
- `LiveDoorBoundaryTile` is one door tile from `wasmGetRoomDoorBoundaryTiles`. It carries no destination. It proves a door exists at a wall and gives its open state, so the indoor edge probe uses it only as a sign that the room's exits were read, never for identity.

## packages/game-core/src/save-file/

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

## packages/game-core/src/save-paths/index.ts

- Quick slots are bare `save{N}.sav` with no manifest; normal and auto saves are `{id}.sav` tracked in `manifest.json`. Anything stored per save therefore keys off a file name stem, not a manifest entry.

## packages/game-core/src/save-state/compatibility/

A file on disk is inspected directly, through the stamp this app writes on every save.

- `checkLoadable`: every save this app writes carries a stamp, so a file without one was made by
  a version this build does not read.
- `describeStamp` names the version a stamped save was made in, for any list of saves.

## packages/game-core/src/save-state/current-format.constants.ts

Written by `core/wasm-build/layout-probe.mjs` during the wasm build; never edit it by hand.
It carries only the `@kind data` header, so this note is where its purpose lives. It holds the save state layout this build produces:
the ordered snapshot region lengths and the id derived from them. It is committed on purpose. It
lets typecheck and the release gate see the layout without building wasm, and a layout change
shows up as a diff to review.

## packages/game-core/src/save-state/formats.ts

The record of save state formats this project has shipped. Nothing here decides compatibility;
that is the generated id's job. This is the written history: which id, from which version, and
what moved. The release gate (`tooling/state-format/check-state-format.mjs`) reads this file as text by
its path and blocks an id that has no row, so a layout change cannot ship without one. The file
must keep its name and its `id: '...'` lines.

`BASELINE` is the last release that shipped before a format id was published with it. Without
it, every older version reads as unverifiable and the update dialog would warn about builds that
are provably fine. No build that could produce them ever wrote anything but that id. It is
frozen: nothing is ever added, because later versions publish their own format.

`isCurrentFormatRegistered` is the release gate's whole question: does the current build's
computed id have a row.

## packages/game-core/src/save-state/save-state.type.ts

Save state identity: what a build declares about the format it reads, what a `.sav` records
about the build that wrote it, and the verdicts drawn from comparing them.

- `KnownFormat` is a format the project has shipped. Its id comes from the generated module. The
  row is the human readable half: `since` is the first app version that shipped the format, and
  `note` says in one sentence what changed in the layout.
- `StateStamp` is written into the trailer of every save this build produces, and kept tiny. `v`
  is the trailer schema, not the state format. `app` is the app version that wrote it. `at` is in
  epoch milliseconds. `dialog` is the core's dialog hook state at the save, in base64
  (`core/game-hooks/dialog_hook_state.c`). It is present only when a message was up and the host
  was allowed to draw it.

## packages/game-core/src/save-state/state-file/

The `.sav` container: the core's header, and the metadata trailer we add to it. A save state is
an 8 word header, the input log, then the snapshot. Every length comes from the header and
nothing is read to the end of the file, so bytes appended past the end are invisible to the
core. That is where the stamp goes:

```text
[ core bytes ][ stamp json ][ uint32 json length ][ 8 byte magic ]
```

One write site covers quick, manual and auto saves, and the metadata travels with the file when
it is copied or synced. Loading strips the trailer anyway and does not rely on the core to
ignore it. The core does ignore it today; stripping means nothing depends on that staying true.

- `HDR_SNAPSHOT_OFFSET` is `hdr[6]`, the snapshot's byte length, which is what the core reads
  back.
- A trailer length that would run past the front of the file is not our trailer.
- A trailer that cannot be parsed counts as no trailer.
- `appendStamp` replaces an existing stamp, so a buffer saved twice still carries one stamp.

## packages/game-core/src/save-types/saves.type.ts

- Quick save slots run 0 to 11.
- `autoSaveIntervalSeconds` ranges 60 to 1800, default 300. `autoSaveMaxEntries` ranges 1 to 20, default 5.

## packages/game-core/src/session-dialogue/active-dialogue.ts

Reads the asset blob and INI back from the running module's virtual FS and extracts, at the byte
level, what the composer needs: the active language code (INI `Language`, default `us`, the same
read the core does at boot), its packed dictionary, its per-line compressed chunks in message id
order, and its per-glyph pixel widths indexed by alphabet position. Reusing bytes means the
vanilla lines are never encoded again, so the composed blob carries them bit identical to the
bake. `dialogueIndexOf` is ZeldaSetLanguage's lookup in TS, default index 0.

## packages/game-core/src/session-dialogue/arrival-ring/

The received-item lines of a session: a fixed ring of `ARRIVAL_SLOTS` (32) slots at the front of
the pool. A slot is taken when an online receipt reaches the front of the delivery queue and
handed back once the queue reports that delivery complete, so its id is reused by a later
arrival. The pool never grows past the ring however long the session runs; only the delivery in
flight holds a slot. A free slot holds an empty line, never shown because no delivery holds its
id. `next` is where the search for a free slot starts, so a released id is the last one reused.
`takeSlot` returns null while every slot is held. A released slot keeps its line until a later
arrival takes it.

## packages/game-core/src/session-dialogue/choice-message.ts

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

## packages/game-core/src/session-dialogue/dialogue-text.ts

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

## packages/game-core/src/session-dialogue/extra-glyphs/

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

## packages/game-core/src/session-dialogue/highlight-bytes/highlight-bytes.ts

Encodes a prepared line that carries highlight markup or extra glyph tokens. The text between
them is compressed on its own, so no dictionary word reaches across one, and each becomes the
core's control bytes:

- A highlight marker (core/game-hooks/dialog_highlight.c): one byte 0x80 plus span in the US
  encoding, 0x87 then 0x50 plus span in the European one; span 0 closes, 1 is primary, 2 is
  secondary.
- An extra glyph (dialog_extra_glyphs.c): 0x83 then its slot in the US encoding, 0x87 then its
  slot in the European one.

A line with neither encodes exactly as the plain encoder makes it.

## packages/game-core/src/session-dialogue/page-message.ts

A detail page laid out the way the game moves a long line on to its next box. The core shows a
detail page right after the receipt's own line, in the same box (receipt_pages.c joins the two).
The engine has no command that clears the box, so the page opens with a key wait, then each row
scrolls in from the bottom. Three scrolls push every row of the first page away, so a page
shorter than the box scrolls in empty rows after its own and never shares the box with the page
before it. A page past three rows waits for a key again before each further row, as a long line
does. The page keeps the fullest wording that fits the box on its own.

## packages/game-core/src/session-dialogue/wrap-message/

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

## packages/game-core/src/session-gate-flags/

- The armed state of every gate a randomizer session opens and closes, one record instead of a dozen module level booleans. `SessionGate` names each gate the way its setter is spelled.
- They share one contract: the host arms a gate when it has something for the core to apply (a table with entries, a profile, a plan, a live session) and disarms it when that goes away, then pushes features word 3 again so the bit latches into WRAM.
- Nothing here decides what a gate means. packages/game-core/src/live-settings-flags maps each one to its features.h bit and strips every one of them under Vanilla Safe.
- Kept out of packages/game-core/src/live-settings-flags because each gate arrived there as its own `let` plus its own setter, and twelve copies of the same two lines pushed that file past its size policy.

## packages/game-core/src/settings/

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

## packages/game-core/src/shadow-casting-types/shadow-casting.constants.ts

- `DEFAULT_LIGHTING_CONFIG` is used when no per screen data exists. `EMPTY_SHADOW_PROJECT` is the empty project template.

## packages/game-core/src/shadow-casting-types/shadow-casting.type.ts

- `ShapeDefinition.sides` is the number of polygon sides (3 triangle, 4 rectangle, 64 and up a circle); ignored for freehand. `cornerRadius` runs 0 (sharp) to 1 (fully rounded, a circle at 4 sides).
- `scaleX` and `scaleY` are stretch factors, default 1. `rotation` is in degrees.
- `x` and `y` are the centre in screen local coordinates (x 0 to 512, y 0 to 448). `width` and `height` are the bounding size. `points` holds arbitrary vertices for freehand shapes.
- `HeightmapElement.height` is normalized 0 to 1. `smoothing` is the edge falloff radius in pixels.
- `LightSource.intensity` runs 0 to 1, `radius` is the falloff radius in pixels. `color` is `sample` to sample the game pixel colour at the light's position, or a hex colour string. `castShadows` makes the light cast shadows through the heightmap.
- `ScreenLightingConfig.sunAngle` is in degrees (0 east, 90 south). `sunElevation` is degrees above the horizon. Intensities and `shadowSoftness` run 0 to 1. `cycleSpeed` is the full day and night cycle duration in seconds.

## packages/game-core/src/shadow-casting/

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

## packages/game-core/src/simulation/types/room-section.type.ts

A multi screen indoor room can carry more than one scrolling section, each with its own shutters and sprites. The game loads sprites only for the section the player stands in.

- `splitX`: column 32 divides the room into a west and an east section. `splitY`: row 32 divides it into a north and a south section. A destroyed blast wall merges two quadrants back into one.
- `playerSectionX` is the player's section along the X split (0 west, 1 east). `playerSectionY` is the same along the Y split (0 north, 1 south).

## packages/game-core/src/simulator/read-game-state.ts

- Parses the live game UI state buffer into the location read the runner uses (room, screen, entrance and player pixel position), or null when unavailable.
- Both imports come straight from their own modules, not the apps/desktop/src/game barrel: the bridge reaches this file (packages/game-core/src/bridge/room-doors), so a barrel import here closes a cycle back through live-settings and cheat-rules-memory, whose top level subscribeGameState call then runs before wasm-bridge has defined it and the renderer stops on the boot splash.

## packages/game-core/src/snes-color/

- SNES colour words, as the palette editor needs them. The hardware stores a colour as BGR555, one little endian word laid out `0bbbbbgg gggrrrrr`, five bits per channel.
- Only 32 levels per channel exist, so a value a colour picker hands back is quantised before it is believed; otherwise the swatch shows a colour the console cannot produce.
- The 5 to 8 bit expansion copies the high bits into the low ones instead of multiplying by 8, so a full 5 bit channel reaches 255 instead of stopping at 248. That is what lets a hex value survive a round trip through the picker unchanged.
- `bgr555ToRgba` packs little endian RGBA, for writing straight into ImageData.
- `hexToBgr555` accepts `#rrggbb` or `rrggbb`. `isExactColor` is false when a hex value is off the 5 bit grid, meaning the editor had to snap it.

## packages/game-core/src/state-load-signal/

- When a save state was last loaded. A load swaps the whole game under the app, so whatever the tracker finds done right after it was done in that state, not by the player just now. The check toasts read this to stay quiet; the tracker itself still follows the loaded state.
- A load is also announced to listeners, for state that lives in the save and must be read again (the online client's received index). A throwing listener never breaks a load. `onStateLoaded` returns the unsubscribe.
- `wasStateJustLoaded` is true for `windowMs` after a load: long enough for the next sweep and its derived rows to land.

## packages/game-core/src/turbo-speed/

The turbo speed ladder. The upstream desktop build ran 16x while its key was held, which is unplayable: text and menus fly past before they can be read. This ladder climbs from 1.25x to a 10x ceiling, with steps widening as they go so the slider feels even.

`DEFAULT_TURBO_SPEED` is fast enough to matter and slow enough to still read dialog. `turboSpeedIndex` snaps an unknown stored value to the nearest rung. `turboSpeedAt` clamps to the ladder. `turboSpeedPercent` is the whole percent value the core takes, snapped to the ladder so an odd stored value never leaks through.

## packages/game-core/src/turbo/

- The configured speed goes down with the other live settings; the held state goes down on the shortcut's press and release. Both are pacing globals in the core, so a save state load never disturbs them and nothing needs asserting again afterwards.
- The core is told the ladder percent while turbo is enabled, 100 (real time) otherwise.
- Both calls are guarded: a core built before turbo existed lacks the exports. Holding is a no op before the module exists and harmless while the speed is 100.

## packages/game-core/src/ui-bridge-diff.ts

- Shallow change detection between two GameUIState snapshots, run every frame.
- The host menu fields are compared because the host menu gates the pause takeover: a frame where only they moved still has to reach the store, since the open and close edge and the clobbered item detection both ride on it.

## packages/game-core/src/ui-bridge-parser/

- Parses the raw WASM UI state buffer into a typed GameUIState. UI_BUFFER holds the byte offsets of each field; two byte fields are little endian.
- Module numbers: 0 Intro, 1 FileSelect, 2 CopyFile, 3 EraseFile, 4 NameFile, 0x14 (20) Attract (the intro "video" and legend demo) all read as title. 5, 6, 8, 10, 15, 16 read as loading. 7 and 9 are active gameplay. 0x0E (14) Interface, 0x12 (18) GameOver, 0x17 (23) SaveAndQuit.
- Interface sub modules map to UI modes; a missing entry falls back to gameplay (potions and the like are an overlay).
- Module 11 (MODULE_FALLING_ENTRANCE) is the dungeon pit fall transition, but the engine reuses it for the three overworld switch tile locations (normal gameplay; the module never returns to 9). Only that flavour keeps overworld_screen_index at 128 or above (OVERWORLD_SPECIAL_AREA_SCREEN_MIN in core/game-hooks/game_constants.h); real overworld screens, light or dark world, are 0 to 127.
- The floor indicator is only a HUD element during gameplay; it does not change the mode.
- The host menu's active item byte (132) repeats byte 14 on purpose (see HostMenuState). Byte 14 is the HUD's readout of the equipped item; byte 132 is the host's own register read back, so a value the native menu moved (its init walks the 21 entry grid before the hold engages, and replaces any id that grid has no row for) can be detected and written again.
- The game parks the countdown seconds at 0xFF or 0xFE, sign bit set, while no countdown runs.

## packages/game-core/src/wasm-bridge/

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

## packages/game-core/src/webgl/gl-helpers/

Shared WebGL helpers for every fullscreen post process pipeline (shadow casting, edge glow).
Filter and draw mode are parameters so each pipeline supplies only what differs; `label`
prefixes compile and link errors.

## packages/game-core/src/world/dark-rooms/dark-room.type.ts

What the file assumes about an unlit room. The reference asks this as one three-way choice (`Options.py` `DarkRoomLogic`: lamp, torches, none), which mixes two questions: must a room be lit at all, and which items count as a light. The app asks them apart, because only the second is a matter of taste: a player who accepts feeling their way through the dark wants it said once, not spelled into every item list. `DarkRoomLightField` lists the four things a player can carry into an unlit room and still see by. With `requireLight` true an unlit room is passable only while an accepted light is carried; with it false the room counts as passable in the dark, so the seed may send the player through blind. Accepting no light reads as requiring none.

## packages/game-core/src/world/item-power/item-power.type.ts

`ItemPowerSetting` holds the questions inside the reference's single four-step `item_functionality` choice (`Options.py` `ItemFunctionality`: easy, normal, hard, expert), asked one at a time. That choice is a bundle: one step moves eight unrelated things at once, so a player who wants the barrier to stop protecting them would also lose their potions and fairies. Each step is a row of independent switches in the reference's own patcher (`Rom.py` 817 to 870 writes eight separate bytes per step), so the app exposes the switches and lets the bundle be a preset the player builds. Every default is the normal step, the unmodified game.

- `catchFairies`: swinging the net at a fairy puts it in an empty bottle.
- `byrnaInvulnerable`: the blue barrier makes the player untouchable while it is up.
- `capeDoubleMagic`: the cape burns the meter twice as fast as normal.
- `silverArrowsAnywhere`: silver arrows keep their extra bite outside the last fight.
- `powderFairy`: the powder turns an enemy into a fairy, not the lesser prize.
- `hammerTablets`: the hammer wakes the two tablets, so the book alone is enough beside it. Reads as on whenever no beam sword can be found, because a requirement nothing in the seed can meet is a dead end.
- `swordlessMedallions`: a medallion opens its door with no sword in hand. Reads as on whenever no sword at all can be found.
- `pullableCurtains`: a hanging cloth door comes down when grabbed and pulled, and when cut. Reads as on whenever no sword at all can be found.
- `hammerLastFight`: the hammer lands on the last fight, which otherwise refuses it. Reads as on whenever no beam sword can be found: the first sword scores nothing there.
- `hammerTowerSeal`: the tower's seal breaks to a hammer and does not throw the blow back. Reads as on under the same condition.
