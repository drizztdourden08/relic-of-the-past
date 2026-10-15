<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/storage

Facts about `apps/desktop/src/storage/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/storage/

Each store binds a library in `apps/desktop/src/storage/` to the platform FileStore and mirrors the
old `window.api` method names, so call sites swap one for one and persistence runs per OS
through the platform layer.

## apps/desktop/src/storage/assets-store/

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

## apps/desktop/src/storage/import-progress-bus/

Import runs in the renderer over FileStore, so progress is published on this bus, never as a
main process IPC event. `useImportProgress` subscribes to it.

## apps/desktop/src/storage/languages-store/

- Saving, creating and duplicating a set all rebake every blob, which is expensive, so
  callers debounce edits.
- `getLanguageSetFont` returns the set's glyph tiles plus its per glyph advance table and
  never rebakes, so a preview can ask freely. `exportLanguageSet` packs the set folder as
  `.rlang` and never rebakes either.

## apps/desktop/src/storage/link-sprites-store/

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

## apps/desktop/src/storage/msu-store/

- `listMsuPackEntries` lists every file in the pack folder except the manifest; this is what
  an export stores.
- The audio probe is passed to the metadata read unconditionally. It answers null when no
  decoder is installed, so the encoded rows stay unfilled.
- `canTrashMsuPack` is true when a deleted pack goes to the system recycle bin and false when
  it is removed for good.
- The import result type comes from `msu-contract`, so the renderer cannot fall behind what
  an import reports.

## apps/desktop/src/storage/profile-store/ (the named instance flags, from Brock)

The renderer's view of the named instance flags (`--instance`, `--profile`), forwarded by the
preload as `api.instance`. A named instance is an automated launch running beside the user's
own app: it is marked on screen and boots into its own profile, and it must not write files
every launch shares (see `setLastProfile` in `apps/desktop/src/storage/profile-store`). Values are read at
call time, never cached; `window.api` is installed before render. `isAutomationLaunch` is
true for any automated launch, named or not. Such a run must not change which profile opens
by default (`app.json`) or where the window sits, and gating on it means a run that forgot
`--instance` still cannot damage the user's setup.

## apps/desktop/src/storage/profile-store/

`app.json` decides which profile opens by default and is shared by every launch. Loading a
profile for play writes it on each run, so `setLastProfile` does nothing on any automated
launch, named instance or not; otherwise the user's next normal launch would resume an
automated run's profile. The gate sits at this single seam so no call site can forget it.
`updateActiveInputProfileId` merges the active input profile id into the config without
clobbering other settings, for the profile cycle shortcut outside the settings screen.

## apps/desktop/src/storage/roms-store/

Import runs in the renderer (pick or download, unzip or raw, then FileStore) and reports on
the import progress bus. Every import names its kind. The base cartridge boots the game; a
supplement only adds to one, is digest checked before it is written, and never replaces a
file already there.

## apps/desktop/src/storage/saves-store/

Every save state leaves through one of the four writers (quick state, normal save, its
overwrite, auto save), so the version and format stamp is applied there and not at each call
site. SRAM is excluded: it is the game's own save file and has nothing to do with snapshot
layout. Screenshots come back as base64 strings. SRAM and quick slots go through the Brock port
kit's save store (`port-save-store.ts`); named and auto saves through `apps/desktop/src/storage/save-files`.

## apps/desktop/src/storage/sprites-store/

The sprite base URL comes from the platform (`app-sprite://` or `convertFileSrc`). A build
without sprite definitions extracts nothing and can never call a set stale. The staleness
rule itself lives in the shared store (`sprites.isStale`); this side only supplies what this
build emits. The capacity, gear, quiver, pool and shop price symbol reads return the binary
from the ROM's extracted set, or null before it exists.

## apps/desktop/src/storage/ui-views/

The single boundary for durable view state, keyed and app level, not per profile (see
`apps/desktop/src/ipc/ui-views-contract.type.ts`). Nothing else touches `window.api.uiViews`; a composite
that wants persistence goes through `useViewState`. The whole map loads once and is cached,
every mutation rewrites the whole map, and writes are fire and forget: a failed write logs and
is dropped. Rapid saves collapse into one write about 400 ms later. A save before the map has
loaded waits for the load first, because writing early would clobber every other
collection's saved layout with a file holding only this key. Entries that are not well formed
snapshots are dropped on load.
