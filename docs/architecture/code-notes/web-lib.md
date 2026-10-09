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

## store/store-site

The Hookshop origin is a placeholder until the store's domain exists. The main process names
the same origin for the store API in `electron/hub/endpoints.ts`. The media bucket is
private: store-api signs every picture it returns and puts the link in `url`, valid for two
hours. Without one the tab draws the kind's icon.

## tracker-state-io

Typed wrapper around the per profile tracker state IPC, so presentational tiers never touch
`window.api` directly.
