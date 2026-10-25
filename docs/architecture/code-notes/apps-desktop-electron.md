<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/electron

Facts about the main process and preload in `apps/desktop/electron/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/electron/ (display, from the Brock display module)

The refresh rate readout, the synced rate for fullscreen with its restore on leaving fullscreen or quitting, the "Change refresh rate" action and the native mode drivers (user32 and CoreGraphics through koffi, xrandr on Linux) come from the Brock display module (`@drizztdourden08/brock-display`). The main process keeps no display code of its own.

## apps/desktop/electron/ (updater, from the Brock updater module)

Self update comes from the Brock updater module (`@drizztdourden08/brock-updater`): the Velopack hooks, the update check, the version picker, the download and the swap. The release feed is the `repo` in `brock.config.ts`, and the main process keeps no updater code of its own.

## apps/desktop/electron/ (saves, from the Brock port kit)

The main process keeps no save store. The renderer writes saves over the FileStore: SRAM and quick slots through the Brock port kit (`@drizztdourden08/brock-port-kit`), named and auto saves through `apps/desktop/src/storage/save-files`.

## apps/desktop/electron/ (ROMs, from the Brock port kit)

The main process has no ROM channel. The Brock port kit creates the roms and assets folders, and the renderer imports ROMs over the FileStore (`apps/desktop/src/storage/roms-store`, on `packages/roms/src/library`).

## apps/desktop/electron/ (WASM core, from the Brock port kit)

The Brock port kit serves the WASM core bytes to a renderer loaded over `file://`, where `fetch()` is blocked (`window.api.portKit.readCore`). The main process keeps no core code of its own.

## apps/desktop/electron/app/install-size-type.ts

Makes Windows show the app's size in Apps and Features. Velopack writes `EstimatedSize` as a `REG_QWORD`; Windows only reads that value as a `REG_DWORD`, so it is ignored and the size column stays blank. The number itself is right, so this rewrites it in the type Windows reads, without working it out again. It runs on every launch because an update rewrites the key with the wrong type; it costs one registry read when there is nothing to do. `reg` prints lines like `EstimatedSize    REG_QWORD    0x529cd`. An absent key means this is not an installed copy, which is not a problem.

## apps/desktop/electron/assets/compile-rom-assets/

Compiles a ROM's `zelda3_assets.dat`, baking in every stored language set so the core can switch language at run time through the INI. `recompileAllAssets` recompiles every ROM that already has a cached blob, used when the stored sets change (a language set imported, installed or duplicated).

## apps/desktop/electron/assets/load-compiled-languages.ts

The language extras one asset blob compile bakes in, on the desktop host: every stored language set (its edited dialogue, glossary and name payload plus its font pair) is read off the Data folder and compiled into a packed entry. A set that fails to compile is warned about and skipped, so one broken translation never blocks the blob.

## apps/desktop/electron/boot/ffmpeg.task.ts

Declares the optional ffmpeg tool to the Brock tools module at boot. From then on the module finds it, installs it as the `tool:ffmpeg` job (download, checksum, unpack, all shown in the job dialog) and runs it with an argument array. The copy lives in `Data/tools/ffmpeg/<version>/`, under the app's own data root, so an isolated `--user-data` launch gets its own copy.

## apps/desktop/electron/debug/dump-layers-handler.ts

The `--dump-layers=N [--hover-tile=col,row]` automation flag. The renderer loads save state slot N, dumps the dual layer collision grid (the same data the navigation overlay uses) through `debug:dumpLayers` to `<project>/debug-output/dump-layers.json`, then exits. With `--hover-tile`, it also opens the navigation overlay, hovers that tile to trigger the tooltip, and takes a screenshot.

## apps/desktop/electron/debug/dump-nav-handler.ts

The `--dump-nav=N|NAME` automation flag. The renderer loads a save state, dumps the navigation widget state (entrances, screen detection, transitions) to `debug-output/dump-nav.json`, then exits. An all digit value names a quick save slot; anything else names a manual (normal) save.

## apps/desktop/electron/debug/sim-log-handler.ts

The simulator run log sink. `sim:appendLog` appends one JSONL line per simulator event to `debug-output/simulator/<runId>.jsonl`; `sim:openLog` reveals that file in the OS file manager. `sanitizeRunId` strips anything outside `[A-Za-z0-9_-]`, so a run id can never contain a path separator, `..` or a drive letter, and never escapes the simulator log folder.

## apps/desktop/electron/debug/sim-run-handler.ts

The `--sim-run[=slot=N;target=<screenId>;stop=<checkId>;max=N]` automation flag. It runs the gameplay simulator headlessly to a stop condition, then writes a `SimRunReport` (outcome, reached screens, verified checks, boundary edges, data correction suggestions) to `debug-output/sim-run.json` and exits. It drives the in chat data correction loop. `stop` takes a check id (`check-072`), not a check name: the engine's stop condition compares identities, and 11 dungeons share a "Big Chest". The command line hands over free text, so only a value that looks like a real check id becomes one.

## apps/desktop/electron/diagnostics/debug-report/capture-frame-budget/

Frame selection math for downsampling a capture session to fit a byte budget, shared between the video path (budget against the encoded video's own size) and the no ffmpeg fallback (budget against raw PNG bytes). Frames are picked at even intervals across the whole sequence, so downsampling thins detail out evenly and never cuts the start or the end off. `budgetedFrameCount` assumes size scales roughly linearly with frame count; a session already under budget keeps every frame.

## apps/desktop/electron/diagnostics/debug-report/capture-manifest/

Tracks which capture sessions have been uploaded in a report, per profile, at `debug-captures/<profileId>/manifest.json`. Nothing else marks a session sent: building a report deletes nothing, so a cancelled dialog or a failed upload leaves every session as selectable as before. `forgetSession` runs when a session is deleted outright, so its manifest entry does not linger.

## apps/desktop/electron/diagnostics/debug-report/collect-capture-sessions.ts

Reads what a report ships for each capture session the picker checked: the position timeline plus whatever `finalize-capture-session/` put in `packaged/` (a size budgeted video, or a PNG fallback). Never the unlimited local frames or full video, which stay on disk for review whether or not a report is sent. Which sessions ship is the caller's choice (`sessionKeys`; the bug report transport ships the ones the player ticked in the dialog, see `sanctuary/bug-report/`); nothing here decides eligibility or changes disk state. A session is marked sent only once the report uploads (`capture-manifest/`).

## apps/desktop/electron/diagnostics/debug-report/finalize-capture-session/

Runs the moment a recording stops: writes every raw frame and the position timeline for that session under `profiles/<profileId>/debug-captures/<sessionKey>/`, beside the profile's saves and config. Living under the profile means deleting the profile takes its capture data with it.

Two videos come out, because the local copy and the one a report ships follow different rules. The local recording has no size limit (only the 5 minute time limit the renderer's store enforces), so `video-full.mp4` encodes every captured frame. `packaged/` holds what a report sends: a video downsampled to fit `PACKAGED_BUDGET_BYTES` (2 MB), built by encoding again an evenly spread subset of the same frames once the full video turns out over budget. Without ffmpeg it ships that same evenly spread subset as raw PNGs, sized against their own byte count.

## apps/desktop/electron/diagnostics/debug-report/list-sessions.ts

The session listing for the bug report picker, served over `debug-capture:listSessions` (and `debug-capture:deleteSession`, which removes a session folder and its manifest entry; both channels accept only a `session-<digits>` key): every recorded capture session for a profile, with a small preview and its sent state. Unlike `collect-capture-sessions.ts`, it is not filtered to eligible sessions, since the player picks what ships. Without ffmpeg, `packaged/` holds the evenly spread PNG subset instead of a video, and every one of those frames goes to the picker so it can cycle through them as a stand in video.

## apps/desktop/electron/documents/import-document.ts

Character sprites (`.rsp`) and language sets (`.rlang`) opened from the desktop. Each goes through the same shared installer the Hookshop uses, so an opened file and a store install land the same way, under a name nothing else has. A language set is baked into the game assets after, so it can be picked at once. The file's size is held to the Hookshop's cap for its kind before it is read. The outcome is logged; an opened file that cannot be imported never stops the app.

## apps/desktop/electron/documents/open-document.ts

Every file the app is opened with arrives through Brock's `onOpen` (`handlers/documents-handlers.ts`), on any platform and at any time, so nothing here reads argv or the macOS `open-file` event. A `.rsp` character or a `.rlang` language set is imported here (`import-document.ts`); a `.msul` music pack belongs to the renderer's importer (`useMsulOpen`), so this file ignores it.

## apps/desktop/electron/hub/client/

One JSON call to a site's API. The device token rides as a Bearer header when one is given. A non 2xx answer becomes an error carrying the status and the API's own message, so callers can tell a revoked token (401) from a network failure.

## apps/desktop/electron/hub/device/

`deviceLabel` is the text the site shows on the confirm page and the devices list, for example "Windows · DESKTOP-4F2". `devicePlatform` reads anything that is not Windows or macOS as Linux.

## apps/desktop/electron/hub/endpoints/

Where the sites' APIs live. Each answers under `/api` on its own origin, through its hosting rewrite, so the device token never crosses an origin. The origins are public, the same trust model as the GitHub URL in the updater. Every call names the API it goes to; one device token serves them all. The Hookshop origin is a placeholder until the store's domain exists. A query value that is empty or absent is left out of the URL.

## apps/desktop/electron/hub/identity.ts

Who this device is signed in as: `GET /me` with the stored token. A 401 means the token was revoked on the site or the device row is gone, so the token is dropped and the app reads as signed out. Any other failure (offline, 5xx) keeps the token and reports null this time.

## apps/desktop/electron/hub/ipc-handlers.ts

Registers one sign-in provider per site with the secrets module, so the confirm page opens on the site that asked while the token serves every site. The channels of its own are `hub:signOut`, which cancels any sign in still waiting and drops the token, and `hub:me`.

## apps/desktop/electron/hub/sign-in/

The device code sign in runs on the sign-in driver of the Brock secrets module (`@drizztdourden08/brock-secrets`), which opens the confirm page, polls, cancels and hands over the token. `hubSignInProvider` gives it one provider per site: begin asks that site's API for a short user code, poll asks whether the person confirmed, and the token goes to `token-store/`. A system that cannot encrypt the token refuses before the browser opens.

## apps/desktop/electron/hub/token-store/

The device token, kept as the `hub-token` secret of the Brock secrets module, which encrypts it with `safeStorage`. One token serves every site's API. Without a working `safeStorage` nothing is written: `saveToken` throws, so the sign in reports it. `readToken` returns null when no token is stored.

## apps/desktop/electron/input/

SDL3 controllers, hotplug, the mapping database, calibration, rumble and the raw capture channels come from the Brock input module (`@drizztdourden08/brock-input`, channels `input:*`). This folder keeps only what is the game's own.

## apps/desktop/electron/input/register-device-permissions.ts

The WebHID and WebUSB choosers on the main window session. The USB device chooser prefers a Nintendo device (vendor `0x057E`).

## apps/desktop/electron/lib/node-file-store.ts

A Node fs `FileStore` for the main process itself, rooted at the same Data folder that the renderer reaches over IPC. It is called in process, so a domain module from `apps/desktop/src/storage` can run inside a handler with no renderer round trip.

## apps/desktop/electron/main.ts

The main process entry. Its top level runs in a fixed order, and each step depends on the ones before it:

1. Velopack first: the Brock updater module (`@drizztdourden08/brock-updater`) runs its install, update and uninstall hooks before anything of the app's own. The document types (`.msul`, `.rsp`, `.rlang`) and the `relic-of-the-past` link scheme are declared in `brock.config.ts` (`fileAssociations`, `protocols`), and Brock registers them.
2. The portable `data` folder (every other location derives from userData), then `--user-data`, which outranks it.
3. `app.setName('relic-of-the-past')`, so dev and production share one userData path.
4. Crash forensics, after the userData decisions (the crash dump folder derives from userData) and before any child process.
5. The named instance identity, before the first window exists (a no op on a normal launch).
6. The privileged `app-sprite` and `app-debug-capture` schemes.
7. `disable-features=CalculateNativeWinOcclusion` keeps requestAnimationFrame alive when the window is occluded (for example a `--no-focus` launch behind other windows); otherwise Chromium pauses frames and stalls the headless game loop. Several `--disable-features` values must share one switch, comma separated.

When the app is ready: in dev the HTTP cache is cleared so static asset changes show at once. Paths and data folders are prepared (the installed size registry fix is cosmetic and not awaited), and the previous `session.log` is rotated so the renderer's batches land in a file scoped to this launch. Then every IPC handler registers (`hub/ipc-handlers.constants.ts`; their order does not matter), the main window is created, and the dev file logger mirrors console output to disk in dev. `--boot-timing` logs boot milestones from the first main process timestamp. With `--dump-layers` the renderer console is forwarded to stdout. Opened files and install links reach the app through Brock's `onOpen` (see `documents/open-document.ts`). The application menu carries only the clipboard shortcuts; debug items live in the in app Advanced menu.

On quit, the Brock display module puts back the refresh rate it changed and the Brock input module stops the controllers.

## apps/desktop/electron/msu/optimize-handlers.ts

IPC for normalising a pack to one audio format: measure first, convert second. They are two channels, not one call with a flag: measuring encodes a slice of every candidate, so it wants its own progress and result, and nothing is written until someone has read the numbers and said yes. Both report per file progress on one event. Pack and file names come from the renderer, so they become paths only through `pack-fs/`, which refuses a traversal. Both operations need the encoder, so `requireEncoder` throws unless the tools module reports ffmpeg ready.

## apps/desktop/electron/msu/optimize/analyze.ts

The measured preview: every file the pack would convert, and what each would cost. Every audio file not in the target format is measured, mp3 and ogg included: a pack in one format is the point. An already compressed source will grow, and its row says so. Each measurement encodes a short slice, one encoder run per file; the progress report keeps that from looking like a hang. The list is not "everything outside the target format": an original a previous run already converted sits beside its copy until it is thrown out, and measuring it would promise a second encode. One scratch folder serves the whole pass and is removed whatever happens.

## apps/desktop/electron/msu/optimize/audio-source.ts

How one pack file is handed to the encoder, and how long it is. An MSU-1 `.pcm` has no container: the format fixes rate, channels and sample format, so the decoder is told all three before `-i` and the duration follows from the byte count. Everything else carries a container, so a probe identifies it and reports the duration. An empty probe is a file this operation cannot touch; that is the only thing that drops a file from a run. The eight byte MSU-1 header is skipped. It is two whole sample frames, so leaving it in would not shift the channels, only put one click at the very start. Only the raw format carries a repeat point in its header.

## apps/desktop/electron/msu/optimize/flac-encode.ts

The encoder invocation lives in one place, so the slice that measures a file and the run that converts it use the same compression level. `-map 0:a:0` takes the first audio stream only, so an mp3 with cover art does not gain a video stream. The sample format is left to the encoder, not pinned to 16 bit: a 24 bit source pinned to 16 would silently stop being lossless. `FLAC_COMPRESSION_LEVEL` is the encoder effort on a 0 to 12 scale; above 5 saves about 2% more for several times the time. An encode runs through the tools module with its 10 minute budget, not the probe one, since a long track legitimately runs for minutes. A conversion asks ffmpeg for `-progress` on stdout and turns each `out_time_us` line into the file's own fraction, so the bar moves inside a long track. A failure throws the encoder's last line, so it names the file's own problem.

## apps/desktop/electron/msu/optimize/loop-point.ts

The repeat point an MSU-1 file declares in its first eight bytes (the magic text, then a 32 bit little endian sample index). It is a positional read, not the shared FileStore helper: FileStore reads whole files, and this runs over a whole pack. A file with no valid header answers null, the same as "no repeat point". Zero also reads as null, since an unset `loopSample` already means "from the beginning".

## apps/desktop/electron/msu/optimize/measure.ts

What one file would cost in the target format. The number is measured, never assumed: FLAC on 16 bit stereo lands anywhere between 40% and 70% of the source depending on how busy the material is, so a flat percentage would be a guess. A fixed slice is encoded and its bytes per second are scaled to the file's own duration. A file shorter than the slice is the slice, so its estimate is not scaled at all: it is the exact size the conversion will produce. Each slice is written into the scratch folder under its index and deleted after.

## apps/desktop/electron/msu/optimize/pack-audio/

The pack's audio as this operation sees it: every file with its size, which are already in the target format, and what a converted file gets called. One readdir plus a stat per entry; no file is opened, and a file that vanishes between the listing and the stat is skipped.

`pendingConversions` returns the files a run would convert: not yet in the target format, and not superseded by a same stem file that is. Converting a superseded original again would encode a second suffixed copy and orphan the first, doubling the pack every run; its reference is pointed at the existing copy instead. `freeTargetName` keeps the stem in the target format. A pack can already hold `foo.flac` next to `foo.pcm`, so the name is suffixed, never overwritten: an odd name beats a lost file.

## apps/desktop/electron/msu/optimize/run.ts

The conversion, in the one order that keeps a pack playable:

1. Repeat points first. An MSU-1 header dies with the container, so every loop point is written into the manifest before any byte is encoded, or intro then loop tracks restart from zero. A file without the header magic answers null, so an encoded source has nothing to move.
2. Encode one file at a time and point the manifest at the new name as each lands, so an interrupted run leaves a pack that is consistent as far as it got. A half written output is removed on failure: it would look like a converted file.
3. Reconcile at the end: every reference to a superseded original (a name spelled in another case, or left over from an earlier run) moves to the converted file.
4. Originals are kept. Deleting them is a separate, confirmed action.

A pack installed from the Hookshop is read only, so it is refused before any step runs. A pack with no manifest is promoted to one first (the same synthesized view the player builds for a classic pack at load time, so nothing audible changes), so the loop points have somewhere to live and the rename is a manifest edit like any other. Refusing would exclude the packs most worth converting. A pack with no manifest and no file name carrying a track number has nothing to convert. A name the preview listed but a previous run already covered is skipped, not encoded again; the reconciliation moves its reference onto the copy that exists. `fileNames` are the files the user approved in the preview.

## apps/desktop/electron/msu/pack-fs/

Where one pack's files are on disk, and its manifest read and written, over Node fs. Pack and file names come from the renderer, so every name that becomes a path segment is checked for traversal before it is joined (`safeName`). The manifest format comes from `packages/hub-contracts/src/manifest`, so the Node handlers and the FileStore backed renderer cannot drift on what a `pack.json` is. A pack installed from the Hookshop is read only (`refuseInstalledPack` throws).

A pack's name is its folder; the name inside its settings follows it on read and on write. `readPackManifest` returns null for a classic pack (no manifest) and for one that is unreadable or of an unknown version. The file inventory uses the same rule as the FileStore side (`packages/msu/src/inventory`): regular files, manifest excepted. It is read from the folder at write time; a file that vanishes mid listing is skipped.

## apps/desktop/electron/msu/read-msul-handler.ts

`msu:readMsulFile` only reads `.msul` files: it reads a path outside the app's own storage, so it must not become a general purpose file reader for the renderer.

## apps/desktop/electron/preload.ts

The preload bridge. `createPreloadBridge` from the Brock electron module builds the flat `window.api` methods from the composed invoke, send and event maps (the Brock base maps plus the app's `APP_*` maps). The file spells out only the app's own nested namespaces (shadow casting, the screen editor), the sprites URL helper and the debug global.

- `startup` carries the test and automation layout flags main forwards through `additionalArguments`. `automation` is true for any test or automation launch, which must not write shared configuration. `muted` starts the master volume at zero; the in app control still owns the state.
- `instance` is the named instance identity (`--instance`, `--profile`), null on a normal launch. The renderer marks the window with the name and boots straight into `profile`.
- `__relicDebug` is a dev and test aid outside the `IpcApi` contract: `RELIC_FORCE_ASPECT` (for example `16:9` from a Playwright launch) overrides the profile's aspect ratio at boot. It is null in normal runs.

## apps/desktop/electron/protocol/

`app-sprite://sprites/<romStem>/<file>.png` is served from the data root's `sprites/` folder, the same root the renderer's FileStore lists when it checks whether a set is extracted, so a `--user-data` override moves both together. `app-debug-capture://captures/<profileId>/<sessionKey>/<file>` is served from a profile's `debug-captures/` folder, so the bug report session picker can preview a recording's video (or a frame PNG without ffmpeg) without piping bytes through IPC. The `sprites` and `captures` hosts are labels, unused by code. Both schemes are registered as standard, so Chromium hands the path over percent encoded (spaces, commas and parentheses in a ROM stem included) with dot segments already collapsed; it is decoded and encoded again as a proper file URL, so a stem holding `#` or `%` still resolves. The path functions are pure: the handler supplies the root.

## apps/desktop/electron/recommendations/recommendation-files/

The disk adapter behind `RecommendationStorage`: one file per collection at `Data/recommendations/<kind>.json`. The relative path comes from `recommendationFile`, so the engine stays the single source of truth. Operations on one kind are serialized behind a per kind queue (`queued` runs a task after everything already queued for that kind, failure included). The queue wraps the whole store call, not just the save, or two decisions could read the same snapshot and overwrite each other. Neither half of `recommendationStorage` queues: the handler already holds this kind's turn for the whole operation, and a load or save that tried to take that turn again would wait on itself.

## apps/desktop/electron/recommendations/recommendation-handlers.ts

The recommendation store lives in the main process, not in the renderer, because both of its mutating operations are a read, modify, write over a whole collection file. Splitting them across an IPC round trip would put the read and the write on opposite sides of a boundary two callers can interleave on. Keeping the collection on this side means one queue (see `recommendation-files/`) makes every caller's operations sequential, which is what a batch accept relies on.

## apps/desktop/electron/sanctuary/bug-report/

The transport behind Brock's bug report dialog (`bugReport` in `main.ts`): it files the report on the Sanctuary, whose API also opens the GitHub issue. Signed out, it refuses before anything is built. Otherwise it builds the debug zip with Brock's `collectDebugFiles` and `writeDebugZip`. The profile's own files (settings, profile, randomizer and input files, every quick slot, the 5 newest named saves, the 2 newest auto saves, the live state from the snapshot, and the capture sessions the player ticked in the dialog) go in only when the snapshot says `attachDebugFiles`, which is the live `allowDebugLogging` setting at the moment the dialog opened. With that setting off the zip holds only the report, the logs and the files the player attached, and no zip is built when the player attached none. The report is filed first and the zip uploaded after, so a zip that is too large or fails to upload still leaves a filed report, and the receipt says the debug files are missing. Capture sessions are marked sent only once the upload went through. The receipt links to the Sanctuary report page and to the GitHub issue. When the upload fails after the report was filed, the zip stays in the temp folder and the receipt carries a `retry` that uploads it again over Brock's `bugReport:retry`; the zip is removed after a good retry, when the next report is sent, or when the report has no upload to retry. Brock shows "Reporting as" with the signed in account's display name (`identity`) in place of the contact field.

## apps/desktop/electron/sanctuary/bug-report/report-snapshot-of.ts

The context, the profile id, a live save state and the `attachDebugFiles` flag, captured by the renderer when the bug report dialog opens and sent as the report's extras, since the main process cannot read the running game. The recordings section of the dialog adds `captureSessions`, the keys of the recordings the player ticked, to the same extras. The flag is the `allowDebugLogging` setting at that moment, and the live state is only captured when it is on. Without a snapshot, or with the flag off, the report carries no profile files and no capture sessions. With the flag on, a snapshot with no profile falls back to the launch's profile or the last one played.

## apps/desktop/electron/sanctuary/ipc-handlers.ts

The Sanctuary's own channels. `sanctuary:submitReport` files a report with no attachment. `sanctuary:reportSnapshot` keeps what the renderer saw when the bug report dialog opened (`report-snapshot/`). Signing in belongs to the shared account (`hub/ipc-handlers.ts`).

## apps/desktop/electron/sanctuary/submit-report/

The calls to the Sanctuary API. `fileReport` is `POST /reports`, which creates the record and the GitHub issue in one call and answers with a presigned PUT for the zip. `uploadReportZip` sends the zip straight to the bucket, then `POST /reports/:id/complete`. A failed upload leaves the record with no zip; nothing is kept for a retry.

## apps/desktop/electron/screen-editor/actor-writer/ and apps/desktop/electron/screen-editor/dungeon-writer/ and apps/desktop/electron/screen-editor/item-writer/

- An actor is filed by kind into the last file of its size split group.
- A dungeon is one record in one file, named by its own file stem, under its world.
- An item is filed by its dungeon when it names one, and by category otherwise, one file each.

For all three, an existing record is edited or removed where it already sits, found by id; records are never moved.

## apps/desktop/electron/screen-editor/check-writer/

Creating, rewriting and removing a check record; the record based path, and the only one that should grow. A check is filed with its dungeon when it names one, otherwise with the area of the screen it sits on (`packages/game-data/src/data/record-file-targets`). Neither is derived from a name, so renaming a check never moves it. A check's destination is read off live dungeon and screen records, so the registry has to be seeded first: the barrel imports `packages/game-data/src/data` for that side effect alone.

## apps/desktop/electron/screen-editor/connection-pair-writer/

Mints both halves of a brand new crossing atomically. Every `toConnectionId` is required (`packages/game-data/src/data/types/connection`), so a crossing with no partner mints two ids on one allocator turn and writes both halves before either id is observable. When both halves land in one file, it is one edit, so a failure mid write cannot leave a dangling partner. The halves usually belong to different screens, so two files: both edits are validated before either file is touched. If the second `writeFile` fails (a full disk), the first half is rolled back best effort, so a dangling `toConnectionId` cannot survive silently; the error says whether the rollback worked.

## apps/desktop/electron/screen-editor/data-files/

Finds the dataset files a kind's records live in. A create knows its destination (`packages/game-data/src/data/record-file-targets`). An update or delete must not assume one: several collections were split by size (junk items span four files, one dungeon's checks two), so the canonical file may not hold the id, or worse, an edit would land a second copy. An existing record is located by its id across the kind's subtree, and null comes back when no file carries it. Every path `packages/game-data/src/data/record-file-targets` derives is relative to `records/`, not to the data folder as a whole (`DATA_SEGMENTS`).

## apps/desktop/electron/screen-editor/dataset-record-writer/

The create, update and delete engine the record facade collections share. Everything kind specific is a `RecordWriterSpec` (the kind to allocate an id under and whose subtree an existing record is found in, where a brand new record is filed, which emitter serializes it, and the record type a started file's array is typed with), so the three operations are written once. A create uses the spec's canonical destination, starting that file when the tree has none yet (a dungeon is one record in one file, and an area may have no interiors today). An update or delete locates the record by id (`data-files/`), because a record's real home is not always the one the resolver would pick.

## apps/desktop/electron/screen-editor/enumeration-writer/

Creating, relabelling or removing a closed set enumeration entry. No other collection references an entry's id (`apps/desktop/src/data-inspector/reference-usage`), so there is no delete guard half. Every successful write also regenerates `enumeration/enumeration.type.ts`, which the `World`, `ScreenKind` and similar unions come from. Duplicates are keyed on the category and value pair, since two categories may share a value (`check-kind:npc` and `actor-kind:npc`). `category` always precedes `value`, but hand authored rows are one object per line while `literal()` emits one field per line, so the gap is matched as whitespace of any width.

The type regeneration is best effort: the entry write already landed, so a failure is logged, not reported; the next edit or `npm run generate:enum-types` catches it up. `root` must be passed to `generateEnumTypes`: its default guess is relative to its own file, which is wrong from the bundled main and once crashed every production launch on a nonexistent `dist/shared/...` path.

## apps/desktop/electron/screen-editor/geography-writer/

Writing an area or a location record. Creating one is its own channel: the caller supplies a display name and nothing else, because that is all there is to a brand new area or location, and the id comes from the allocator. Rewriting and removing take the whole record, like every other record facade collection, and go through the shared engine. Each collection is one file per world, so the destination comes from the record's own world (`packages/game-data/src/data/record-file-targets`), and both resolvers always return a path. This process is the allocator, so it is the one place allowed to brand an id. Areas and locations are records, so they sit under the synced record tree.

## apps/desktop/electron/screen-editor/id-allocator/

The single owner of record numbering. Ids are never supplied by a caller: it reads every id in a kind's source tree and hands out the next free `<kind>-NNN` on one serialized queue, so an id cannot be minted twice. Each task starts only after the previous one finished reading and its caller has written, so a concurrent pair cannot both see the same highest id; `withAllocatedIds` runs the scan and the caller's write on that queue. `KIND_ROOTS` lists where each kind's records live, relative to `packages/game-data/src/data/records/`; it is a list because a kind may one day spread over more than one folder.

The scan matches the quoted id literal wherever it sits, not only after `id:`. `item-groups.ts` also writes it as `Swords: 'ig-001'` in the `ITEM_GROUP_IDS` map, which an `id:` anchored scan would miss. A sibling reference (for example `toConnectionId`) also counts as used, which is the safe direction.

## apps/desktop/electron/screen-editor/ipc-handlers.ts

IPC for the dev screen and connection editor. The renderer sends records, never source text and never an id for something new: this process allocates every id and runs the dataset's own emitter, so a write cannot carry a caller minted id or a shape the record interfaces no longer describe. The six record facade collections register through `record-handlers.ts` (all one shape: workspace root plus a record payload, a thrown error reported as a refusal); a new crossing's pair goes through `connection-pair-writer/`.

`screenEditor:writeCheck` still takes source text: `packages/game-data/src/data/checks/` has not moved onto the record facade, so there is no record shape to emit there. That channel predates the record facade and still has a caller (the simulator's dataset correction loop); nothing new should reach for it, because a text payload cannot be checked against the record shape the way `serializeCheckRecord` is.

`editSourceFile` does read, transform, write in one place, so every handler treats a writer error the same way and nothing half writes.

## apps/desktop/electron/screen-editor/item-group-writer/

Creating, relabelling or removing an item group. `item-groups.ts` writes `id` two ways: the symbolic `ITEM_GROUP_IDS.<Key>` form every entry started with, or the plain literal a row gets once this path has edited it. The matcher tries the literal first and falls back to the symbolic form (`symbolicNeedle`); only a write normalises a row, and only that row. `ITEM_GROUP_IDS` still names the seven groups that predate this path, but any number of groups is a normal writable collection with allocator minted ids. Labels are the closest thing this collection has to a key, so a duplicate label is refused. Delete is the delete guard's actual delete step, once the caller has confirmed it.

## apps/desktop/electron/screen-editor/record-file-template/

The empty record file a create starts when the tree holds none for that path yet. The layout files a record by its world, its area, or its dungeon and floor, so a destination can be a file nobody has needed yet: the first interior of an area, or a dungeon, which is one record in one file. The array is named by the same rule every other file of its collection follows (`packages/game-data/src/data/record-file-targets`), so the loader's glob picks the new file up like any other. The emitted file starts with the `@kind data` header.

## apps/desktop/electron/screen-editor/resolve-source-file.ts

A traversal safe path resolver for the screen editor's writable source roots. `data` points at the record tree, not `packages/game-data/src/data` as a whole: a wider root would let a write land on the schema or the aggregators.

## apps/desktop/electron/screen-editor/source-writers/

Write helpers for the editor's source file edits. Each data file exports one array literal: insert a new entry before the closing `];`, or replace or remove the entry whose `id:` matches. Records are matched by walking real brace depth, not by regex: a record is multi line and contains nested objects and arrays, which a `\{[^}]*\}` pattern fails to span. The walk skips string literals and comments, so a brace inside either cannot shift the depth. A record's span is its full lines, trailing comma included. An `id` is the only key ever matched on; the extra needle exists only for item groups (see `item-group-writer/`).

## apps/desktop/electron/screen-editor/tag-writer/

Appends a new vocabulary term to the tag dataset file. The caller supplies a key and the collections it belongs on. The two levels come from the key, the id from the allocator, the record text from the dataset's own emitter, so no key derived id or stale shape can reach disk. `namespace:value` is required: it is the hierarchy the collection is organised by. The renderer refuses too, but this is the check standing between a bad key and the file. A duplicate is matched on the key, which is what a duplicate is. A relabel is always a replace (the record is already open, no id to allocate), and delete is the delete guard's actual delete step.

## apps/desktop/electron/screen-editor/workspace-root.ts

Locates the repo root the editor writes into by walking up to the ancestor that contains `packages/game-data/src/data`. A fixed depth from `__dirname` breaks because dev, the production build and a packaged app all bundle at different depths. It falls back to the working directory (the app is always launched from the repo root) for a bundle outside the source tree, and caches the answer for the life of the process.

## apps/desktop/electron/shadow-casting/store/

Shadow data is a committed source asset (not per user state), so it lives under `public/data`, not userData. Writes are dev only (`shadow-casting:save` refuses otherwise); in dev, `__dirname` resolves into the build output beside the bundled public folder. The project is cached after the first read.

## apps/desktop/electron/storage/installed-guard/

The lock on what the Hookshop installed. An installed music pack, language set or sprite file stays as its author published it, so every write a renderer can ask for (the file store IPC and the music pack optimiser) asks here first and is refused inside one. The store's own install, update and uninstall write through their in process file store and never pass through here, which makes them the only writers.

- `INSTALLED_ROOTS` is the Data path an installed item occupies, by kind. Only paths under `GUARDED_TOP` can hold an installed item, so other paths skip the registry read.
- Windows and macOS folders ignore case, so a differently cased path is the same item there (`foldCase`).
- Roots are compared in one spelling: POSIX, relative, no leading `/` or `./`, no trailing slash (`normalizeRel`).
- `refuseInstalledRemoval` also refuses removing a folder that holds an installed item.

## apps/desktop/electron/store/ (the Hookshop)

The catalogue reads, install jobs with their progress and cancel, the checks a download passes (size cap, https, sha256), uninstall, the installed record and `relic-of-the-past://install` links come from the Brock catalog module (`@drizztdourden08/brock-catalog`). RotP keeps what a pack is and where it lands: the configuration in `hookshop/`, the installers in `packages/hub-contracts/src/store/install`, and duplicating.

## apps/desktop/electron/store/duplicate.ts

Duplicating an installed item into one the player can edit. The install record names the item and its licence; a licence that does not allow copies is refused with its reason. Otherwise the kind's duplicate writes the copy through the store's in process file store, crediting the original in `basedOn`. A language copy is baked into the game assets after, the way an install does it.

## apps/desktop/electron/store/hookshop/

The catalog module's configuration for the store API.

- `endpoint/` sends the device token as a Bearer header. With no token, `hubFetch` answers a 401 itself, and a 401 from the site drops the token, so the tab shows the sign in card either way.
- `schema/` parses each answer of the store API (an item, a page, the home page, a download grant). A grant without the pack's kind, author or licence is refused, since the install record needs all three.
- `installers/` wraps each container's installer from `packages/hub-contracts/src/store/install` as a catalog installer over `storeFiles`, and `maxBytes` holds a download to the cap for its kind.
- `hooks/`: before an update or an uninstall removes a copy, `releasePack` points every profile that selected it at the replacement, or back to the default. After a language set is installed or removed, the game assets are baked again.
- `isInstalling` and `installedPacks` read the module's jobs and installed record for the rest of the main process.

## apps/desktop/electron/store/ipc-handlers.ts

Configures the Hookshop on the catalog module (`hookshop/`) and keeps the one channel of its own, `store:duplicate`. The device token stays in the main process, so the renderer holds neither the token nor a download URL.

## apps/desktop/electron/store/repoint-profiles.ts

A pack a profile selects is never left dangling. Each kind lives in one field: a music pack in the profile's `msuPack`, a language set in its `language`, a character in its config's `linkSprite`. Every profile is checked, since the library is global. An update points the selection at the new copy; an uninstall passes null, which is each field's default. It returns the ids of the profiles that changed.

## apps/desktop/electron/store/store-files/

The Data root the Hookshop installs into, as one in process file store that every installer and the duplicate share.

## apps/desktop/electron/store/store-result/

Wraps a store call into the answer `store:duplicate` gives: its data, or why not.

## apps/desktop/electron/tools/ffmpeg-release.ts

Resolves the pinned ffmpeg asset name against BtbN's `latest` release right before every install, since that release's bytes (and so its checksum) change whenever BtbN rebuilds it. BtbN prunes its dated releases, so `latest` is the one tag that never returns 404. The GitHub REST API returns the asset's own published sha256 digest alongside its size and download URL in one call, which the tools module checks before anything is unpacked. Nothing here computes or guesses a checksum: it relays what BtbN published for the exact bytes about to be fetched.

## apps/desktop/electron/tools/ffmpeg-tool.ts

The ffmpeg tool definition: the `ffmpeg` and `ffprobe` binaries, one version folder, and a download only on Windows. Linux builds ship as `.tar.xz` on a platform that has a package manager, so Linux reads PATH and the hint names the package to install. A copy found on PATH is the user's own and is used as it is, with no checksum.

## apps/desktop/electron/tools/ffprobe-parse.ts

Reads ffprobe's JSON report into the fields kept. ffprobe emits numbers as strings and "N/A" for anything unstated, so every value becomes a finite number or null, never NaN. The per stream figure wins and the container's is the fallback (VBR streams often omit theirs).

## apps/desktop/electron/tools/ipc-handlers.ts

The one RotP ffmpeg channel left: `ffmpeg:probeAudio`. State and install belong to the tools module (`tools:state`, `tools:install`). The probe takes a Data root relative POSIX path, not an absolute one, so the renderer never names a path outside the app's own storage. Traversal out of the root is refused the same way the generic file store refuses it.

## apps/desktop/electron/tools/probe-cache/

Remembers what ffprobe said about a file, so it is asked once per file, not once per draw of the files list (a native process launch per encoded file, per redraw). Entries are keyed on path, size and mtime, so a rewritten file misses on its own and nothing is invalidated by hand. Only a real answer is kept: a null (tool missing, file unreadable) can change without the file changing, so it is asked again next time. The cache is one JSON file under the app's data root (`cache/audio-probe.json`), written at most once per second. A lost cache write only costs a probe.

## apps/desktop/electron/tools/probe-file.ts

What ffprobe says about one media file, or null when the tool is not installed, the file is not media, or the probe failed. Null is a normal answer, not an error. The probe gets 30 seconds, long enough for a large file on a cold disk and short enough not to hang the UI. Each file is asked once (see `probe-cache/`).
