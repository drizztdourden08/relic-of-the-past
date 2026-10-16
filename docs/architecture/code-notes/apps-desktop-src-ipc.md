<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/ipc

Facts about `apps/desktop/src/ipc/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/ipc/api.type.ts

`IpcApi` is the renderer facing `window.api` surface, derived from the channel contracts and the join maps. Flat invoke, send and event methods carry exactly their contract signature. Nested namespaces and the few helpers that are not IPC are spelled out.

`ExtrasApi` holds the process flags and pure renderer helpers exposed on `window.api`:

- `os` is `process.platform` on Electron (`win32`, `darwin` or `linux`).
- `startup` holds the test and automation start flags (set from the launch flags). `automation` is true for any automated launch and makes it read only for shared configuration. `muted` and `sound` are the launch's audio intent, applied through the app's own mute control; both directions are explicit so neither depends on the profile's stored volume. `autoStart` boots the game and stops at its title screen, with no save state involved.
- `instance` is the named instance identity (set from the launch flags). Both fields are null on a normal launch; `name` marks the window and `profile` is the profile to boot into.

## apps/desktop/src/ipc/controller-contract/

The one controller channel that is RotP's own: `controller:write-debug-capture` writes an input calibration debug capture into `userData/Data/debug` and returns the full path. Every other controller channel, and the device, capture and calibration types, come from the Brock input module (`input:*`, types from `@drizztdourden08/brock-input`).

## apps/desktop/src/ipc/event-contract.type.ts

Event channels, main to renderer: `webContents.send` paired with `ipcRenderer.on`. Each value is the listener signature; the `onX(cb)` subscribers and the main process `emit` derive from it.

- `msu:optimize:progress` sends one report per file, for the measuring pass and the converting pass alike. While a file converts it also carries `fileFraction`, read from the encoder's own progress lines.

Opened files and install links, the sign in's user code, Hookshop install progress and every controller event come from Brock and its modules (`onOpen`, the secrets, catalog and input modules), not from this contract.

## apps/desktop/src/ipc/ffmpeg-contract.type.ts

The one RotP ffmpeg channel: probe one media file. State and install come from the Brock tools module (`tools:state`, `tools:install`, with progress in its job dialog). `ffmpeg:probeAudio` takes a POSIX path relative to the Data root and is null when the tool is absent or the probe failed.

## apps/desktop/src/ipc/hub-contract.type.ts

The shared account channels: sign out and the signed in identity. One device token serves every site's API. The device code sign in itself, with its user code and cancel, runs on the Brock secrets module's sign-in driver.

- `HubMe`: the signed in identity as the account card shows it, null when no device token is held. `deviceLabel` is this device's label as the API recorded it at confirm time.
- `hub:signOut` cancels any sign in still waiting and drops the device token. The device row on the site stays until it is revoked there.
- `hub:me` is null when no token is held, or when the API no longer accepts it (the token is dropped then).

## apps/desktop/src/ipc/invoke-contract.type.ts

Request and response channels: `ipcRenderer.invoke` paired with `ipcMain.handle`. `InvokeContract` is the one source of truth for every invoke channel's signature; the preload and the main process handlers are checked against it. It joins one interface per domain (dev tools, screen editor, controller, MSU, ffmpeg, Sanctuary, account, Hookshop), each split out to keep files short.

## apps/desktop/src/ipc/invoke/

- `dev-tools-invoke-contract.type.ts`: the recommendation store, test automation, debug dumps, the simulator run log (a detailed JSONL sink), shadow casting, and the debug capture finalize.
  - The recommendation store keeps one file per collection (`Data/recommendations/<kind>.json`). The collection lives in the main process: folding a pass and recording a verdict are read, modify, write over a whole file, and an IPC round trip in between would let two callers interleave.
  - A debug capture recording finalizes the moment it stops: raw frames, the position timeline and an ffmpeg encoded video land in their own folder under `debug-captures/<profileId>/` at once, never deferred to packaging. The report zip is built by the bug report transport in the main process (`apps/desktop/electron/sanctuary/bug-report/`), with no channel of its own.
- `screen-editor-invoke-contract.type.ts`: the dev only screen editor. Record payloads carry no id and no source text: the main process allocates the id and serializes with the dataset's own emitter. The six collections added after the record facade share one generic payload trio. `writeCheckRecord` has its suffix because the older text based `writeCheck` still has callers. Area and location already mint through `allocateGeography` (a display name, not a whole record), so they only gain write and delete.

## apps/desktop/src/ipc/msu-contract/

The MSU channels: reading an opened `.msul` and normalising a pack to one audio format. Pack import, listing and editing, and the per save music resume sidecars (`{save}.msu.json`), run in the renderer over the file store.

- `MsuResult.skippedNested`: audio the archive kept below the pack's own level, meaning alternates and extras, not tracks. `skippedDuplicate`: audio dropped because an earlier file already claimed its track number. The renderer's pack install returns it.
- `msu:readMsulFile` reads a `.msul` the app was opened with and rejects any other extension.
- `msu:optimize:analyze` measures every candidate by encoding a slice of it, so nothing is written yet. One encoder run per file, reported on `msu:optimize:progress`.
- `msu:optimize:run` moves repeat points into the manifest first, then encodes and points the manifest at the new names. Originals are kept; removing them is a separate action.

## apps/desktop/src/ipc/recommendation-contract.type.ts

Wire types for the recommendation store's three channels. The engine's own shapes are the domain model (`packages/navigation/src/recommendations`) and IPC carries them unchanged, so this file only re-exports them. Everything crossing here is plain data by construction: a detector may not hold a module handle or a wasm pointer, which is what makes a pass structured cloneable without a translation layer.

## apps/desktop/src/ipc/sanctuary-contract.type.ts

The Sanctuary channels. Signing in belongs to the shared account (`hub-contract.type.ts`), and a report with its debug zip is sent by the main process transport behind Brock's bug report dialog, not over a channel here.

`SanctuarySubmitInput` files a report with no attachment; a report that could not be filed answers with `error` alone. `SanctuaryReportSnapshot` is what the renderer sends when the bug report dialog opens: the report context, the active profile and a live save state, which only the renderer can read.

## apps/desktop/src/ipc/screen-editor-contract/

The dev editor's write contract. Its types enforce two rules:

1. A caller never supplies an id for a new record. Create payloads carry the record without its id, and the main process allocates the next free `<kind>-NNN`. `Allocated<T>` is nominal (branded by `allocatedBrand`), so an id invented in the renderer has nowhere to go.
2. A caller never supplies record text. The main process serializes the record with the dataset's own emitter, so the shape on disk is whatever the record interface says.

- `AllocateGeographyArgs`: new geography. The name is for display only; the id comes back allocated.
- `AllocateTagArgs`: a new vocabulary term. The caller supplies only the key (`namespace:value`) and the collections it belongs on. The levels are split from the key, labels default to its parts (`label` to the second level, `namespaceLabel` to the first), and the id comes back allocated. A key without a separator is rejected, since it has no namespace and no place in the hierarchy.
- `WriteScreenArgs` inserts a new screen (`replaceId: null`) or rewrites one in place. `filePath` is relative to `packages/game-data/src/data/`; `packages/game-data/src/data/record-file-targets` derives it from ids.
- `WriteConnectionPairArgs` mints a new crossing with no existing partner (see `pendingPartnerId` in `packages/game-data/src/data/connections/pending-partner`). Both halves are allocated on one `withAllocatedIds` turn and written before either id is observable, so no `toConnectionId` can name a partner that was never written. The halves often sit on different screens, hence two file targets.
- `WriteTagArgs`, `WriteItemGroupArgs`, `WriteEnumerationArgs` relabel or reshape an entry already on file. There is no insert variant: new entries go through their allocate channel, and these only replace an id the renderer already has open.
- `DeleteTagArgs`, `DeleteRecordArgs` and the other delete payloads are the delete guard's actual delete step, once the caller has confirmed it.
- `AllocateItemGroupArgs`: `ITEM_GROUP_IDS` still names the seven groups that predate this path, but it is no longer a ceiling; the id comes back allocated like any new record.
- `AllocateEnumerationArgs`: a new closed set label row. The category names the group it joins.
- `AllocateRecordArgs`, `AllocateRecordResult`, `WriteRecordArgs` are the payloads every later collection shares. Screen, connection, tag and item group predate the record facade and carry something kind specific; the six that came after are record in, id back, so they share one generic trio. The same two rules hold: `Unnumbered<T>` is all a caller may send for something new, `Allocated<T>` is all that comes back.

## apps/desktop/src/ipc/store-contract.type.ts

The one Hookshop channel of RotP's own. The catalogue, installs, updates, uninstalls, progress and install links run on the Brock catalog module (`window.api.catalog`).

- `StoreResult`: the call answers with its data or why not. `signedOut` is set when no device token is held or the API refused it, so the view can show the sign in card.
- `StoreDuplicateResult`: the editable copy's kind and its pack folder, sprite file name or set id.
- `store:duplicate` copies an installed item to a free new name the player can edit, crediting the original in the copy's `basedOn`. It is refused, with the reason, when the licence does not allow copies.
