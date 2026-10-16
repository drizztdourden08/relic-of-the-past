<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/views/GameSession

Facts about `apps/desktop/src/views/GameSession/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/views/GameSession/behavior/compute-flood-fill.ts and apps/desktop/src/views/GameSession/behavior/compute-overworld-flood-fill.ts

Pure builders for the `--dump-nav` payload: no WASM calls, the data is passed in. The flood itself was already run by the shared runner (`floodRoomRun`).

- `reachableRows` holds 64 rows of 64 base-36 characters, one ReachState digit per tile (0 is unreachable), from `encodeReachableRows`.
- `reachableByLayer` gives the reachability per layer for dual-layer rooms, which reveals tiles reached on both layers.
- `ledges` are the one-way ledge traversals cliff preprocessing produced (start to landing).
- `attrRows` holds the raw attribute grids as 64 rows of 2-character hex bytes, for baselines and diagnosis (`encodeAttrRows`); `layer1` only for dual-layer rooms.
- `scrollBoundary` detects the scroll boundaries of a 2x2, 1x2 or 2x1 room and lists the tiles that cross them.

## apps/desktop/src/views/GameSession/behavior/create-profile-flow.ts

The storage side of profile creation: generate the randomizer placement (local mode), create the profile, pin any frozen settings into its config, save the placement. It is kept apart from `useProfileManagement` so the hook only orchestrates state, and so a generation failure aborts before anything reaches disk: local mode generates before the profile exists, so a failed generation aborts creation instead of leaving a profile with no placement.

The overrides are a creation form preset's config values, then any setting the randomizer pinned on top. The pin always wins, since it is what makes the frozen placement play as stored. They are merged over the freshly written (empty) config, so the values are on disk from day one.

`withDeliverable`: an online profile keeps the probed spots on its config, so the player file written later randomizes the same npc, pond and world spots a local seed of this profile would.

## apps/desktop/src/views/GameSession/behavior/delete-profile-flow.ts

Deleting the active profile stops the game first, as a guard that `useDeleteProfile` registers with `profileRemoval.add` from brock-react. The game stop lives in `GameSession` state, which `main.tsx` cannot reach, so the guard cannot go on `<BrockApp profiles={{ onBeforeRemove }}>`. The guard runs after the delete confirm and before the folder goes, so the exit save and the session end land in a folder that still exists. Brock does the rest: it makes the most recently used remaining profile active, and opens `product.profilesRoute` (Data > Profiles) when the last one goes.

## apps/desktop/src/views/GameSession/behavior/dump-flood-items.ts

The player's real traversal tokens, for the `--dump-nav` flood. The dump used to flood with an empty inventory, so it reported fewer reachable tiles than the widget for the very same room (590 against 608 in the Jail Cell), and a baseline captured from it could not be compared with anything. It now floods with what the player carries, from the same tracker the simulator reads. `TILE_REQS` are the traversal tokens the flood understands; other reach tokens do not matter here. `lift.1` is always present: lifting bare-handed needs no item.

## apps/desktop/src/views/GameSession/behavior/ensure-profile-assets.ts

Extracts the assets when they are missing, or when the cached blob predates the current bake format, then loads the cached asset blob for a ROM. It returns `null` (after logging) when the blob is missing and extraction fails, and the boot aborts on `null`. A stale blob is softer: it still boots the game, so a failed recompile (for example when the ROM file is gone) logs an error and keeps the old blob instead of blocking the boot.

## apps/desktop/src/views/GameSession/behavior/find-split-tiles.ts and apps/desktop/src/views/GameSession/behavior/is-layer1-reachable.ts

`findSplitTiles` lists every tile where the two collision layers disagree. `isLayer1Reachable` walks breadth-first from a tile through connected `0x00` tiles on layer 1, and returns true when that region does not touch the grid boundary, meaning layer 1 is an enclosed, reachable interior instead of being open to the edge.

## apps/desktop/src/views/GameSession/behavior/get-game-ratio.ts and apps/desktop/src/views/GameSession/behavior/sync-aspect-ratio-lock.ts

The live canvas reflects the rendered width (custom ratios included), so it is preferred. Before a canvas exists the ratio falls back to the viewport, the screen, the 256 by 224 original picture or the named ratio; only the `fit` window lock uses that fallback, and it syncs again once the canvas exists. `TITLEBAR_HEIGHT` is added to the lock in the default window mode outside fullscreen.

## apps/desktop/src/views/GameSession/behavior/load-input-profile.ts

The stored input profiles are read as written. With no saved profiles the InputManager stays on its keyboard default.

## apps/desktop/src/views/GameSession/behavior/load-player-sprite.ts

Stages the profile's selected player sprite for the next boot; the bridge writes it to MEMFS. It is flattened on the way through, since the core cannot read a sprite pack.

## apps/desktop/src/views/GameSession/behavior/randomizer-boot-gate.ts

The pre-boot gate for randomized profiles. Local mode needs a placement this build can read, rolled again from the seed when the file is older (`rerollPlacement`, which saves it so the profile boots). Online mode needs a server URL. The live server pre-flight only logs: a server that is down never blocks play, and the session retries it. On success the boot's session material is parked in the pending slot of the session store, where the auto-start hook (`useRandomizerBoot`) consumes it once the game runs. On failure the caller aborts the boot with the returned reason.

## apps/desktop/src/views/GameSession/behavior/roll-placement.ts

Rolls a local seed's placement from its seed and frozen options. The ported pipeline consumes the frozen snapshot directly. The capability probes name the npc-scope locations and capacity slots the app can physically deliver; the rest stay locked vanilla, so the plan can never carry errors. The same seed and options always roll the same placement.

## apps/desktop/src/views/GameSession/behavior/run-dump-flood.ts

Runs the `--dump-nav` flood and derives its annotations. It is kept apart from the pure builders because it does touch the game: it goes through the same runner the simulator uses (`floodRoomRun`, `floodOneOverworld`), so a dump and a run can never report different reachability for the same screen. The bug this replaced was a hand-built option set with an empty inventory.

`reachableCount` and `totalTiles` describe the whole connected area (`propagateArea`), the same total the widget shows; everything else in the flood dump still describes this screen alone. Without this, a room that only reaches its full extent through a stitched neighbour under-reports next to the widget. `annotations` hold the mechanics with their reachability, where a check the flood cannot reach is `blocked`.

## apps/desktop/src/views/GameSession/behavior/useAppMainEffects.ts

- The notch mode defaults to filling the notch until a profile loads, which keeps startup windows clear of a cutout.
- `--auto-flood` opens the navigation widget once, on mount (`window.api.autoFlood`).
- Game input is suppressed while a menu or an overlay is open: input reaches the game only while it runs and no page is open.

## apps/desktop/src/views/GameSession/behavior/useAudioSettings.ts

A launch flag is applied by using the mute control, not by working around it. The settings push that runs when the game starts applies the profile's volume again, so anything set before that is undone. So the hook waits for the game to run, then presses the mute button once. Nothing new gates the audio. Both flags are honoured, so the result never depends on the volume the profile happens to hold: `--muted` presses it only if sound is on, `--sound` only if it is off. The current volume is read through the state setter, so a stale render's value is never used.

`initFromSettings` takes the volume as loaded. A `--muted` launch is already zero there, because the flag is applied once in `mergeSettings`, where the setting is born. Two earlier attempts set the engine volume (and the mute override) from here instead, and both lost: `pushLiveSettings` applies `settings.masterVolume` again to the gain node and the WASM mixer when the game starts.

## apps/desktop/src/views/GameSession/behavior/useAutoTest.ts (`--auto-state`, `--screenshot`, `--auto-start`)

Reacts to the command line arguments `--auto-state=N|NAME` and `--screenshot=NAME`. When either is present it:

1. starts the game with the current profile,
2. loads the requested state (a number is a quick-save slot, a string the name of a manual save),
3. waits `RENDER_SETTLE_MS` for rendering to settle,
4. captures a screenshot through the main process.

`--auto-start` is the third way in: boot the game and stop, with no state and no screenshot. The sequence already separates starting the game from loading a state, so the early guard is the only thing that stood between them.

With a screenshot and no state, it still waits `RENDER_SETTLE_MS`: `running` is reached before the first frame is painted, so a screenshot taken at once catches a black canvas and proves nothing.

## apps/desktop/src/views/GameSession/behavior/useDebugLaunchHooks.ts

Bundles the launch hooks driven by the command line (auto-test, dump-layers, dump-nav, sim-run) behind one call, so the AppMain view stays lean. Each does nothing unless its flag is present.

## apps/desktop/src/views/GameSession/behavior/useDisplaySettings.ts

The aspect ratio lock follows the fullscreen state and syncs whenever a display setting changes while the game runs. Under the `fit` constraint nothing is locked until the core reports `running`, because the canvas has no buffer dimensions before that. The lock then syncs once from the game state subscription, which replays the current state, so a game that is already running syncs at once.

## apps/desktop/src/views/GameSession/behavior/useDumpLayers.ts (`--dump-layers=N`, `--hover-tile=col,row`)

A debug hook for the `--dump-layers=N` flag, with `--hover-tile=col,row` as an option. It runs the whole pass itself and exits, dumping the room index and the dual-layer grids (the same data the overlay uses) as JSON. `--hover-tile` also drives the tooltip over the target tile so the screenshot captures it. Usage:

```text
npx electron dist/electron/main.js --muted --dump-layers=6
npx electron dist/electron/main.js --muted --dump-layers=6 --hover-tile=45,31
```

It waits `STATE_SETTLE_MS` for the state to apply and a few frames to render before the first screenshot. The room index comes from the UI state buffer (offset 77, 16-bit little-endian, `readRoomIndex`).

`verifyHoverTile` checks the data at the hovered tile before any UI interaction: whether the two layers split there, and whether layer 1 is an enclosed, reachable interior (`isLayer1Reachable`).

`captureHoverTooltip`: the navigation widget opens on its own through autoFlood, since `--hover-tile` implies autoFlood in the preload. It waits for the flood button (the widget rendered), clicks it, then waits for the TileInspector, which appears once the flood completes and renders the overlay. It then waits a tick so the `useEffect` that registers `window.__debugHoverTile` has run, calls it to set the tooltip state directly, waits for React to render the tooltip, and takes the hover screenshot.

`logHoverVerdict` reports the hovered tile: attribute 0x1C on either layer means normalization failed; otherwise the tile has a legitimate split, or both layers match.

## apps/desktop/src/views/GameSession/behavior/useDumpNav.ts (`--dump-nav=N`)

A debug hook for the `--dump-nav=N` command line flag. It starts the game, loads save state N (a number is a quick slot, a name is a manual save), waits `DUMP_SETTLE_MS`, reads the navigation state from WASM (screen detection, entrances, transitions, exits, stairs), writes it to `debug-output/dump-nav.json`, then closes the window.

`collectNavDump` reads everything in a fixed order. `readNavLocation` reads the UI state buffer at the same offsets `apps/desktop/src/game/ui-bridge` uses in `parseGameUIBuffer` (`UI_STATE_OFFSETS`, little-endian 16-bit for the indexes). The live dual-layer tables are read before the attribute grid is rebuilt. The rebuild now snapshots and restores WRAM, so the order is no longer load-bearing, but the two describe different things (the live room against the ROM-derived one), and reading the live one first keeps that plain. The toggle floor positions are only populated after `WasmBuildRoomAttrGrid` runs, so they are read after it.

`floodStartOf`: the flood starts on the sub-screen the player is physically on. For a multi-screen area that is not the area index the game reports (the area head). Anchoring the flood to the head measures the position against the wrong origin, pushes the start tile past 63 where it clamps, and seeds the walk in a sealed pocket. The navigation widget derives the live sub-screen the same way (`useNavigation.ts`), and `apps/desktop/tests/e2e/flood-parity.keep.spec.ts` catches drift.

`buildNavDump` assembles the JSON. Its key order is the file's key order, so it is kept stable for baselines. A door of type 22 (`LAYER_TOGGLE_DOOR_TYPE`) toggles the layer, and an attribute byte from 0x90 to 0x97 is a layer toggle tile. `annotations` carries the mechanics with their reachability: a detected check the flood cannot walk to is flagged `blocked`, so a dump says whether a thing is obtainable.

## apps/desktop/src/views/GameSession/behavior/useGameLifecycle.ts

`setGameData` marks the assets as booted: the bytes were just read from disk, so this is the generation the game plays.

## apps/desktop/src/views/GameSession/behavior/useLoadProfileForGame.ts

- The profile is read again from storage for this boot. The caller's object can be a snapshot from an earlier load, and fields edited in the Data Manager since then (`msuPack`, `language`) must reach the game, not the values the snapshot was taken with.
- `setActiveProfile` deliberately gets the caller's object, not the one read again. Automation keys an effect on the identity of `activeProfile` (`useAutoTest.ts`), so handing back a fresh object runs that effect again, and its cleanup cancels the launch already in flight: the run then stops before it loads its save state. Nothing needs the fresh object in state, because the settings UI reads the pack from storage itself.
- There is no MSU path in the ini any more: music packs are played by the app, not the core, so nothing is written into the core's virtual filesystem for it to open.
- Auto-save is configured before the game starts.
- `resetSession()` clears whatever the previous profile left behind, ahead of the gate that may park new material. Its placement is what the tracker builds its roster from, and nothing used to clear it, so a normal profile loaded after a randomized one went on listing the seed's locations instead of the game in front of the player.
- The randomizer gate: a randomized profile only boots when its session can start afterwards (a placement on disk, or a server URL).

## apps/desktop/src/views/GameSession/behavior/useMsulOpen.ts

Imports a music pack the app was opened with, from the desktop file association. Brock reports the path (`useAppOpen`), and this hook takes only `.msul` files. Reading it needs a trip back through IPC because the renderer cannot open an arbitrary path itself. The import is the one the Data Manager performs, so an opened pack and a dropped pack land the same way.

## apps/desktop/src/views/GameSession/behavior/useProfileManagement.ts

`useActivateRomSprites`: every path that changes the active profile lands in `setActiveProfile`, so this is the one place the ROM's sprite set is activated (base URL, availability, extraction). With no profile active a ready ROM stands in (`spriteRomOf`), because the creation form draws item art before any profile exists and would otherwise show placeholders over a set that sits on disk.

## apps/desktop/src/views/GameSession/behavior/useRandomizerBoot.ts

Auto-start for randomizer sessions tied to a profile. A gated boot parks the session material in the pending slot of the session store. When the game reaches `running` with a pending entry for the current profile, the matching session starts with no user action. When the game leaves `running`, the active session stops with it, so a randomized session never outlives its game. It is safe across restarts: every gated boot parks a pending entry again, and the started flag arms again as soon as the game stops.

## apps/desktop/src/views/GameSession/behavior/useReloadTarget.ts

Publishes how to bring the running game up to date with the text on disk. The assets blob reaches the emulator once, at boot, and loading the same profile again is what reads it again, so that is what gets registered. The data screens cannot reach it on their own, which is why the notice there can offer a button instead of instructions. It is registered from an effect on the active profile, not from inside the loader, because a closure built in there could not name the callback it sits in.

## apps/desktop/src/views/GameSession/behavior/useSimRun.ts (`--sim-run`)

A debug hook for the `--sim-run` flag. It starts the game, optionally loads a save (`state=` by name, `slot=` by quick slot), forces auto-skip-dialog and developer tools on, drives the gameplay simulator headlessly to its stop condition, writes a SimRunReport to `debug-output/sim-run.json`, then exits. It powers the in-chat data correction loop: run, read the suggestions, apply, run again.

Developer tools unlock the combat table queries and the full simulation. The sim run is itself a developer tool, so it may switch the gate on for its own duration without touching the user's saved setting, and it must switch it back off. `setSimulatorSupport(true)` arms the `WasmSim*` mutators (`kHostGate_SimulatorSupport`) for the run; without it every door unlock, kill drop and cell lock trigger silently does nothing. Both are dropped again in the `finally`.

A features word set from here is only wanted until the core latches it on its next frame (`zelda_rtl.c:989`), so the queries the gate unlocks answer with nothing if they run in the same tick. `FEATURE_LATCH_MS` gives the core frames to pick it up.

`runSimDiagnostic` handles the diagnostic modes, which write their own payload and exit instead of running the simulation:

- `floodScreen`: an addressable flood of one screen. It checks that the sim's flood matches the normal in-game flood without running the whole simulation. It seeds from the live player tile only when the game is standing on the flooded overworld screen; otherwise it floods without a seed (a remote screen).
- `scanSprite`: which rooms hold a given sprite? A dataset room index that points at the wrong cave is invisible until you ask the game itself.
- `probeRoom`: why does one room read as a dead end? It dumps the tables that decide it (entrance seeds, fall holes, the exit screen entry, the detected exits).
- `combatSprite` (`simCombatSprite`): one sprite type's resolved combat row plus the shared ancilla and tile combat tables. A `null` query result is flagged explicitly, so developer tools being off is never mistaken for a sprite that deals no damage. The damage rows are unpacked from a compressed asset when a file is loaded (`select_file.c:228`), so this reads all zeros unless the run also loads a state: pair `combat=` with `slot=` or `state=`. A sprite with bit `0x40` of `flags4` set (`ROOM_CLEAR_EXEMPT_BIT`) is left out of a room clear count, per `Sprite_CheckIfRoomIsClear`.

`readWantedFeatures` reads the features word the core has been asked for, which latches on the next frame. `-1` means the module was not reachable, which is not the same as no features; `-2` means the query itself failed.

`runFullSimulation` writes the report. Inventory entries put the id first so each entry is unambiguous and sorts stably, and the name after so a person can read the artifact; the name is resolved there and stored nowhere. `loadout` is what the player holds, read from the save, not tallied from check names: hearts, equipment tiers, and the per-dungeon map, compass and big key state the run does not track.

## apps/desktop/src/views/GameSession/behavior/useStoreLinks.ts

A store install link the browser opened lands on the Hookshop tab whatever page was open: the Brock catalog module delivers it (`useCatalogLinks`), the link waits in the link store and the tab installs it. It does nothing off Electron.
