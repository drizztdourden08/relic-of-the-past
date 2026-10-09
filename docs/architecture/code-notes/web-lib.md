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
