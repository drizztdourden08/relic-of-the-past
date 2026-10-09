<!-- @layer docs @kind doc -->
# Desktop code notes

Facts about `apps/desktop/electron/` that the code cannot say on its own: protocol rules, OS quirks, file layouts, and the reasons a line that looks strange has to stay. Each heading names the file or folder it explains, relative to `apps/desktop/electron/`.

## Entry points and startup

### main.ts

The main process entry. Its top level runs in a fixed order, and each step depends on the ones before it:

1. Velopack first: the Brock updater module (`@drizztdourden08/brock-updater`) runs its install, update and uninstall hooks before anything of the app's own. The document types (`.msul`, `.rsp`, `.rlang`) and the `relic-of-the-past` link scheme are declared in `brock.config.ts` (`fileAssociations`, `protocols`), and Brock registers them.
2. The portable `data` folder (every other location derives from userData), then `--user-data`, which outranks it.
3. `app.setName('relic-of-the-past')`, so dev and production share one userData path.
4. Crash forensics, after the userData decisions (the crash dump folder derives from userData) and before any child process.
5. The named instance identity, before the first window exists (a no op on a normal launch).
6. The privileged `app-sprite` and `app-debug-capture` schemes.
7. `disable-features=CalculateNativeWinOcclusion` keeps requestAnimationFrame alive when the window is occluded (for example a `--no-focus` launch behind other windows); otherwise Chromium pauses frames and stalls the headless game loop. Several `--disable-features` values must share one switch, comma separated.

When the app is ready: in dev the HTTP cache is cleared so static asset changes show at once. Paths and data folders are prepared (the installed size registry fix is cosmetic and not awaited), and the previous `session.log` is rotated so the renderer's batches land in a file scoped to this launch. Then every IPC handler registers (`startup/ipc-handlers.constants.ts`; their order does not matter), the main window is created, and the dev file logger mirrors console output to disk in dev. `--boot-timing` logs boot milestones from the first main process timestamp. With `--dump-layers` the renderer console is forwarded to stdout. Opened files and install links reach the app through Brock's `onOpen` (see `documents/open-document.ts`). The application menu carries only the clipboard shortcuts; debug items live in the in app Advanced menu.

On quit, the Brock display module puts back the refresh rate it changed and the Brock input module stops the controllers.

### startup/

Wiring that `main.ts` runs once the window exists. `IPC_HANDLERS` lists every handler group; the screen editor writes to source files, so it registers in dev only, never in a packaged build. Wiring that needs the live window stays in `main.ts` after `createWindow()`. `forwardWindowEvents` sends window state to the renderer. Test and automation launches (`--window-size`, `--fresh`) must not overwrite the saved window bounds (`isEphemeralLaunch`).

### preload.ts

The preload bridge. The flat `window.api` methods are generated from the join maps (`buildInvoke`, `buildSend`, `buildEvents`); only the non IPC helpers and the nested namespaces are spelled out. `const api: IpcApi` ties the whole surface to the shared contract.

- `startup` carries the test and automation layout flags main forwards through `additionalArguments`. `automation` is true for any test or automation launch, which must not write shared configuration. `muted` starts the master volume at zero; the in app control still owns the state.
- `instance` is the named instance identity (`--instance`, `--profile`), null on a normal launch. The renderer marks the window with the name and boots straight into `profile`.
- `__relicDebug` is a dev and test aid outside the `IpcApi` contract: `RELIC_FORCE_ASPECT` (for example `16:9` from a Playwright launch) overrides the profile's aspect ratio at boot. It is null in normal runs.

## app

### app/install-size-type.ts

Makes Windows show the app's size in Apps and Features. Velopack writes `EstimatedSize` as a `REG_QWORD`; Windows only reads that value as a `REG_DWORD`, so it is ignored and the size column stays blank. The number itself is right, so this rewrites it in the type Windows reads, without working it out again. It runs on every launch because an update rewrites the key with the wrong type; it costs one registry read when there is nothing to do. `reg` prints lines like `EstimatedSize    REG_QWORD    0x529cd`. An absent key means this is not an installed copy, which is not a problem.

### app/portable-mode.ts

Where this copy of the app keeps its user data. A `data` folder at the install root claims everything: profiles, saves, ROMs, extracted assets, MSU packs, sprites, configuration. The folder is found relative to the executable, so a copy that carries one can move to another drive, another machine or a USB key and still find its own files.

The root is the folder holding `Update.exe`, not the folder holding the executable. The packaged layout:

```
<root>/  .portable     marker written into the portable build
         <app>.exe     launcher, path stable across updates
         Update.exe
         current/      the app, replaced wholesale on every update
```

`app.getPath('exe')` resolves inside `current/`, so anything stored beside the executable is destroyed by the first update. A dev run has no install root (the executable is Electron itself inside node_modules). A portable copy is self contained from its first launch: the folder is created up front, so a user who unzips onto a USB key gets travelling data without knowing the convention. An installed copy switches only when someone deliberately creates the folder. This must run before anything reads a path.

### app/user-data-arg.ts

`--user-data=<dir>` points this launch's user data at an explicit folder. Everything the app stores derives from Electron's userData path, so redirecting it isolates a launch completely: an automated instance given its own folder can never read or touch the per user data in the normal location. It is the same mechanism as portable mode (`app.setPath` before anything reads a path), and the explicit flag outranks the install folder convention, so it is applied after `applyPortableMode`.

## instance

### instance/automation-launch/

Is this launch automation, not a person playing? An automated launch is read only for the shared configuration, which belongs to the person at the keyboard: `config/window-state.json` (the window's size, position and mode) and `app.json` `lastProfileId` (which profile opens by default next time). This is enforced here, not trusted to callers: an agent that forgets `--instance` still cannot repoint the default profile or move the window. `--no-focus` counts because every automated launch must pass it. A flag matches bare or with `=value`, so `--window-size=1280x800` counts too.

Headless ("no human watching") means every automation flag except `--instance` and `--profile`, which only select an identity. A bare `--instance=NAME` launch (a tagged but human usable window) stays visible; `--instance=NAME --no-focus` still goes headless. `--visible` is the explicit handover override (`--auto-state=... --visible` pins a state for a person to look at) and beats the heuristic; without it every state pinned launch was forced headless and a visible handover produced no window at all.

### instance/instance-config/

Named instance startup flags. `--instance=NAME` marks a named instance: it identifies the window (title, icon, titlebar chip) and selects the game profile of the same name, so parallel launches never share save data. `--profile=NAME` selects a game profile by id or display name and defaults to the instance name. A named instance never writes the two files shared by every launch: `config/window-state.json` (guarded by `isEphemeralLaunch`) and `app.json` `lastProfileId` (guarded in the renderer's profile store). This only sandboxes the game profile; userData is the same folder for every instance, and other Data files are app wide tool state on purpose (Data Inspector view state, review progress, stick calibration). The name becomes a profile folder, so anything but a plain slug is rejected.

### instance/instance-identity.ts

Makes the OS present a named instance as its own app wherever windows are listed; `BrowserWindow.icon` alone is not enough. On Windows, grouping and pinning key off the AppUserModelID, so each instance gets its own id (and with it its own taskbar group and icon); `setAppUserModelId` must come before the taskbar button, so this runs before the first window. On macOS `BrowserWindow.icon` is ignored and the dock icon is set through `app.dock`. On Linux the window icon is what desktop environments show, so nothing extra. A normal launch is untouched.

## window

### window/create-window/

The main window. Automation (`isHeadlessLaunch`) opens it off every monitor: a hidden window gets no requestAnimationFrame, so the emulator never ticks, while off screen keeps it shown (frames run, CDP input routes) without compositing a pixel. The position is derived from the real display layout so Windows cannot clamp it back, and centring is off so it cannot override that position. There is no "show in background" helper: `showInactive()` plus `blur()` plus `SetWindowPos(HWND_BOTTOM)` still dropped a fullscreen game out of exclusive fullscreen and pushed the foreground to the desktop.

- `focusable: false` sets `WS_EX_NOACTIVATE` on Windows, so `SetForegroundWindow` (what `Page.bringToFront` and a Playwright click end up calling) cannot succeed. Undoing focus after the fact was too late: the user's window was already deactivated. CDP input needs no OS focus. On Windows this also implies `skipTaskbar`.
- `paintWhenInitiallyHidden` paints before and without a visible surface, so an off screen automation run still renders for screenshots. `backgroundThrottling: false` keeps the rAF driven game loop at full speed when unfocused.
- A named instance carries its name in the title and swaps to the bot icon, so parallel agent launches can be told apart from the taskbar alone. The WASM core's SDL window title (`kWindowTitle` in `emscripten_main.c`) reaches `document.title` and would override the instance name, so the title is held.
- A normal launch starts transparent and is faded in by `armReveal` once the renderer's shell has settled; automation has no splash, so it stays opaque. Everything that moves the window happens while it is still transparent, so by the time the user sees it, its geometry is final. It uses `show()`, not `showInactive()`: the splash is a child of this window, and a child of a never activated window sinks behind whatever the user had open; activating costs nothing visually at opacity 0.
- Headless launches apply only the saved size; the saved position (or maximize, fullscreen) would drag the window back onto a display. `keepWindowInBackground` is the backstop.
- F1 to F12 and Tab pass through to the renderer instead of being taken by Electron menu accelerators.
- There is no `setAudioMuted` here: it is a webContents kill switch the in app audio state cannot see or undo. `--muted` is forwarded to the renderer and starts the app's own master volume at zero instead.

### window/keep-in-background.ts

Holds an automation window behind whatever the person at the keyboard is doing, for the whole life of the window, not only at launch. Many things raise a window later: Playwright's click path calls `Page.bringToFront()` before every click, DevTools activates its owner, the OS raises windows for its own reasons. Enumerating those has repeatedly missed one, so gaining focus at all is treated as the fault and undone immediately. Input still works: CDP does not need OS focus. It blurs only while the window holds focus: an unconditional `blur()` takes focus off without handing it back, so the foreground falls through to the desktop ("Program Manager"), measured doing exactly that. A single raise can fire several events, so they are coalesced (`BOUNCE_DEBOUNCE_MS`) into one helper process. The first painted frame can bounce the window back up the z order on Windows, hence the `ready-to-show` hook.

### window/send-to-back.ts

Pushes a window to the bottom of the OS z order (behind other apps) without activating it, for `--no-focus` launches. Electron's `showInactive()` only avoids focus; on Windows a newly shown window still lands on top, so Win32 `SetWindowPos(HWND_BOTTOM)` is called on the native handle. `SWP_FLAGS` is `SWP_NOSIZE | SWP_NOMOVE | SWP_NOACTIVATE`, and `HWND_BOTTOM` is 1. The PowerShell script goes through `-EncodedCommand` (UTF-16LE base64), which sidesteps all shell and quote escaping. It does nothing off Windows (macOS and most Linux window managers already honour `showInactive`'s ordering).

### window/startup-config/

Test and automation startup flags. Window size is consumed in the main process; the rest are forwarded to the renderer through `additionalArguments` (read in preload).

| Flag | Effect |
|---|---|
| `--window-size[=WxH]` | open at a fixed size (default 1280x800); saved geometry is not applied |
| `--widgets=a,b,c` | open these widgets docked on their default side, on a clean layout |
| `--fresh` | ignore the saved widget layout, open nothing (no home menu), and do not persist layout or window changes |
| `--muted` | start the app's own volume at zero, exactly as the speaker button does; the in app control then owns it |
| `--sound` | the opposite signal, for a profile that was left muted |
| `--auto-start` | boot the game with the active profile to its title screen; no state is loaded (that is `--auto-state`) |

Starting the game is a renderer action (it owns the profile and the module). The renderer does not inherit main's argv, so `--instance` and `--profile` are forwarded, and so is the automation verdict, because the renderer owns the `app.json` write. Test and automation launches must not persist window or layout state over the user's (`isEphemeralLaunch`, which delegates to the one automation predicate). The one launch that may is a handover over its own data folder (`--visible` with `--user-data`, without `--window-size` or `--fresh`): its `window-state.json` sits inside that folder, so keeping the size and position the person gave it writes nothing of theirs.

### window/text-interaction.ts

Native text interaction for the main window: a right click menu (Copy, Paste, Select All, shown only where they make sense) and a main process Ctrl or Cmd+C handler. The renderer hosts a live game whose input layer listens to the same key events, so handling the copy chord at the `before-input-event` stage makes a selection always copy, whatever page handlers do with the keystroke.

### window/window-icon.ts

Resolves the window and taskbar icon. A named instance (an agent launch) wears Sentri so it is recognisable from the taskbar. Windows renders a multi resolution `.ico` better than a downscaled PNG, so it gets the `.ico` first and the PNG after; elsewhere only the PNG shows. Every candidate is optional and the logo's PNG is the last resort, so a missing asset never breaks a launch. Dev serves from the source tree; a packaged build serves from the bundled renderer. The files come from `npm run logos` (`apps/desktop/public/logos`).

### window/window-state/

The saved window geometry. The normal bounds are tracked through move and resize, because `getNormalBounds()` is unreliable on Windows with `titleBarStyle: 'hidden'` (it includes the invisible frame). A saved position that no longer falls on a visible display is dropped. The saved state is applied before the window is ever visible: it holds content bounds while the constructor takes window bounds, and the hidden title bar makes the two disagree on Windows, so it cannot go through constructor options.

### window/aspect-ratio.ts

The aspect ratio lock. Setting a lock snaps the window by shrinking it to fit the ratio, never growing it. Resizing is then enforced manually through `will-resize`, which accounts for the title bar offset. A corner drag fits within the proposed bounds and never exceeds either dimension.

### window/boot/

The boot splash gets its own frameless window, so the main window never has to be splash sized and then grow in front of the user. It is a child of the main window, not `alwaysOnTop`: a child floats above its parent only, so a boot while the user is in another app never covers their work. There is no preload and no bundle, only plain markup driven through one small global. The splash is 480x360 exactly because the installer's animated splash is generated to match it frame for frame (`scripts/build/make-installer-splash.mjs`). It is centred on the display the main window is on, and `movable: false` is a second lock against a window manager that offers its own move handle. A status line message is best effort: a lost one never breaks the boot.

The reveal is the boot mediator, the one place that knows both the splash and the main window exist. The renderer's shell ready signal lands there and drives the swap. It is idempotent because the signal, a watchdog (8 s), and a dead renderer can all trigger it, and a boot that goes wrong must still end with a visible window. The main window is held invisible by opacity, not `show: false`: Chromium does not schedule requestAnimationFrame for a hidden page, so React would mount into a stalled frame loop. A transparent window is still hit testable, so mouse events are ignored until the reveal; otherwise clicks were swallowed while it could not be seen.

`fadeWindow` ramps opacity. `setOpacity` does nothing without a compositing window manager (a bare X11 session), so nothing downstream may depend on the ramp running.

### window/ipc-handlers.ts

`window:shellReady` means the renderer's UI has settled and painted, so the splash hands over to the main window.

## lib

### lib/archive/extract-entries-by-basename.ts

Extracts only the entries whose base name is wanted, straight into the target folder. The rest of the archive is never inflated. Tool archives carry a few hundred MB of docs and extra executables beside the two binaries kept. The list of written paths lets a caller tell a partial archive from a complete one.

### lib/download.ts

On an aborted download the partial file is removed. `removePartialFile` waits for the write stream to close first, because Windows keeps the file locked while the handle is open.

### lib/json-store/strip-bom.ts

Editors and shells (Windows PowerShell `Set-Content` and `Out-File`) often write a leading UTF-8 byte order mark. `JSON.parse` rejects it, so `readJson` strips it first.

### lib/main-log-file/

The main process log is `Data/debug/main-console.log`. One module owns its path, its line format and both append paths, so the dev console mirror and the crash forensics write the same file in the same shape.

The file is scoped to one launch: the first write of the process truncates it. A line produced before `initPaths()` has run is held back (the path is relative until then, and a write would land beside the executable). Held lines are flushed ahead of the first line that reaches the disk, so an early failure is not lost. Every write is best effort: a logging failure never surfaces in the app it observes. `appendMainLogSync` exists for handlers that run as the last thing before the process dies.

### lib/import-source.ts

Resolves an import source (a local path or a URL) to the matching files inside it: a direct file, an archive (.zip, .7z, .rar) or a download, plus a `cleanup()` that removes every temp it made. A URL download is always tried as an archive first. When it is not an archive, the result has no files and the caller may treat `downloadedPath` as a raw file.

### lib/dev-file-logger.ts

Dev only, never wired up in a packaged build. Mirrors main and renderer console output to disk continuously, so a hard crash leaves the last thing that happened on disk. Main output lands in `main-console.log` through `lib/main-log-file`; renderer output arrives through the `console-message` event, so the renderer needs no change. `getUserDataPath()` only resolves after `initPaths()`, so nothing here runs at module load. A failed log write is swallowed: logging never breaks the app it logs.

### lib/node-file-store.ts

A Node fs `FileStore` for the main process itself, rooted at the same Data folder that `storage/file-handlers.ts` exposes to the renderer over IPC. It is called in process, so a `shared/storage` domain module can run inside a handler with no renderer round trip.

### lib/ipc/bridge/

The typed preload IPC primitives. `invoke`, `send` and `subscribe` are keyed by channel. `buildInvoke`, `buildSend` and `buildEvents` generate the flat `window.api` methods from the join maps, so no channel literal is written per method. One local cast bridges the untyped `ipcRenderer` surface.

### lib/ipc/handle/

The typed main process IPC primitives. `handle`, `on` and `emit` constrain the channel to a key of the contract and infer arguments and return type from it, so a mistyped channel or a wrong handler signature fails to compile.

`emit` swallows a throwing `webContents.send`. The render frame can be mid disposal during a reload or navigation, and then `send` throws "Render frame was disposed before WebFrameMain could be accessed". These are fire and forget events and the renderer subscribes again on load, so a dropped send in that window is harmless. It also keeps the high frequency HID forwarder from flooding the console.

## input

SDL3 controllers, hotplug, the mapping database, calibration, rumble and the raw capture channels come from the Brock input module (`@drizztdourden08/brock-input`, channels `input:*`). This folder keeps only what is the game's own.

### input/profile-store/

Input bindings, stored per game profile in `profiles/<id>/input-profiles.json`.

### input/register-input-handlers.ts

The `inputProfiles:*` channels and `controller:write-debug-capture`, which writes a diagnostics or byte-capture report under `<userData>/debug/`. `sanitizeFileStem` strips anything outside `[A-Za-z0-9_-]`, so a device supplied name can never contain a path separator, `..` or a drive letter.

### input/register-device-permissions.ts

The WebHID and WebUSB choosers on the main window session. The USB device chooser prefers a Nintendo device (vendor `0x057E`).

## display

The refresh rate readout, the synced rate for fullscreen with its restore on leaving fullscreen or quitting, the "Change refresh rate" action and the native mode drivers (user32 and CoreGraphics through koffi, xrandr on Linux) come from the Brock display module (`@drizztdourden08/brock-display`). The main process keeps no display code of its own.

## documents

### documents/open-document.ts

Every file the app is opened with arrives through Brock's `onOpen` (`handlers/documents-handlers.ts`), on any platform and at any time, so nothing here reads argv or the macOS `open-file` event. A `.rsp` character or a `.rlang` language set is imported here (`import-document.ts`); a `.msul` music pack belongs to the renderer's importer (`useMsulOpen`), so this file ignores it.

### documents/import-document.ts

Character sprites (`.rsp`) and language sets (`.rlang`) opened from the desktop. Each goes through the same shared installer the Hookshop uses, so an opened file and a store install land the same way, under a name nothing else has. A language set is baked into the game assets after, so it can be picked at once. The file's size is held to the Hookshop's cap for its kind before it is read. The outcome is logged; an opened file that cannot be imported never stops the app.

## languages

### languages/ipc-handlers.ts

A language set installed from the Hookshop is read only: every write into its folder is refused (`refuseInstalledSet`). The picked language code must match the ROM's region, or the font and encoder configs would not line up. `extractFromSource` resolves a source to exactly one ROM, extracts its dialogue, then cleans up the temps.

### languages/language-pack/

Language pack persistence. A pack lives in `userData/Data/languages/<code>/` and holds everything needed to bake the language into an asset blob and show it in the inspector UI, without the source ROM:

| File | Holds |
|---|---|
| `dialogue.txt` | decoded strings (`N: text`), the source for compression and the UI |
| `font.bin` | raw 2bpp glyph sheet (256 tiles x 16 bytes) |
| `font-width.bin` | per glyph width table |
| `meta.json` | `LanguageMeta` (glyph and line counts, encoder, flags, source ROM) |

A folder without a `meta.json` is an incomplete pack and is skipped. `loadPackedLanguages` returns the pre packed entries for every extracted language, ready to bake into an asset blob.

## sprites

### sprites/extraction-state/

The main process half of "are this ROM's sprites complete?". The renderer answers the same question over its FileStore (`shared/storage/sprites.ts`), and that is the path the app takes today. This half backs the `sprites:check` and `sprites:extract` IPC, which is still part of the contract and must not disagree with it. Both read the same receipt file (`extraction.json`), keyed by the same manifest digest, so whichever half extracted a folder, the other recognises it.

A receipt is used, not a bare file name comparison, because a definition the ROM cannot satisfy produces no file; a bare comparison would find that file missing forever and extract again on every launch. A completed run records the manifest it ran against, and a receipt for the current manifest is taken at its word. Change the manifest and the digest changes with it, so a grown manifest still forces a name by name comparison: exactly the one time extraction an older profile needs. An empty or absent folder is never complete, receipt or not.

### sprites/ipc-handlers.ts

When the build carries no sprite definitions, extraction fails with a message: success for zero files would read as "this ROM has no sprites", not "this build cannot do it". Extraction is synchronous and fast, so its "decode" phase is indeterminate. The receipt is written after the files, never before. `sprites:check` answers "complete against the current manifest", not "has any files at all" (see `extraction-state/`).

## msu

### msu/edit-handlers.ts

Pack editing IPC: the `.msul` manifest plus per file create, rename and delete. These are the same operations as `shared/storage/msu-edit`, expressed over Node fs; the manifest format and validation come from that module so the two never drift. Paths and manifest reads and writes come from `pack-fs/`, which also guards every renderer supplied name against traversal before it becomes a path segment, and refuses every write into a pack the Hookshop installed. After a pack is renamed, its manifest is written again so the name inside its settings becomes the new folder name.

### msu/import-selection.ts

Which of an archive's audio files belong to the pack. An MSU pack is flat: the file name carries the track number. Anything in a subfolder is an extra (usually alternate takes), and a recursive walk copying by base name would put two files on one slot. So the rule is depth: keep the shallowest level that has audio. That reads a pack at the archive root and one nested a folder down alike. `nested` lists the files left below the pack's own level.

Track numbers are then made unique as a backstop: two files at the same level can still claim one slot, and which one plays must not depend on directory order. The files are sorted by name first, so the same archive imports the same way twice; `duplicates` lists the files whose track number was already claimed.

### msu/ipc-handlers.ts

`isMsuFile` uses the shared audio extension set, so a format the pack can hold is a format the pack is counted by. A private `(pcm|opuz|msu)` pattern here once made a converted pack list as empty. An import resolves a source to its tracks and copies them into the pack folder; extras in subfolders are not tracks, and two files cannot share a slot (see `import-selection.ts`). `skippedNested` and `skippedDuplicate` report the files left out for each reason.

`msu:readMsulFile` only reads `.msul` files: it reads a path outside the app's own storage, so it must not become a general purpose file reader for the renderer.

### msu/optimize-handlers.ts

IPC for normalising a pack to one audio format: measure first, convert second. They are two channels, not one call with a flag: measuring encodes a slice of every candidate, so it wants its own progress and result, and nothing is written until someone has read the numbers and said yes. Both report per file progress on one event. Pack and file names come from the renderer, so they become paths only through `pack-fs/`, which refuses a traversal. Both operations need the encoder, so `requireEncoder` throws unless the tools module reports ffmpeg ready.

### msu/pack-fs/

Where one pack's files are on disk, and its manifest read and written, over Node fs. Pack and file names come from the renderer, so every name that becomes a path segment is checked for traversal before it is joined (`safeName`). The manifest format comes from `shared/storage/msu-edit`, so the Node handlers and the FileStore backed renderer cannot drift on what a `pack.json` is. A pack installed from the Hookshop is read only (`refuseInstalledPack` throws).

A pack's name is its folder; the name inside its settings follows it on read and on write. `readPackManifest` returns null for a classic pack (no manifest) and for one that is unreadable or of an unknown version. The file inventory uses the same rule as the FileStore side (`packages/msu/src/inventory`): regular files, manifest excepted. It is read from the folder at write time; a file that vanishes mid listing is skipped.

### msu/resume-handlers.ts

Per save music resume sidecars over Node fs. Each `{save}.msu.json` is written beside the save it belongs to. Quick slots carry no manifest, so a sidecar is the one mechanism that fits all three save kinds. The naming comes from `packages/game-core/src/save-paths`, so the renderer's FileStore path and this one address the same file.

### msu/optimize/analyze.ts

The measured preview: every file the pack would convert, and what each would cost. Every audio file not in the target format is measured, mp3 and ogg included: a pack in one format is the point. An already compressed source will grow, and its row says so. Each measurement encodes a short slice, one encoder run per file; the progress report keeps that from looking like a hang. The list is not "everything outside the target format": an original a previous run already converted sits beside its copy until it is thrown out, and measuring it would promise a second encode. One scratch folder serves the whole pass and is removed whatever happens.

### msu/optimize/audio-source.ts

How one pack file is handed to the encoder, and how long it is. An MSU-1 `.pcm` has no container: the format fixes rate, channels and sample format, so the decoder is told all three before `-i` and the duration follows from the byte count. Everything else carries a container, so a probe identifies it and reports the duration. An empty probe is a file this operation cannot touch; that is the only thing that drops a file from a run. The eight byte MSU-1 header is skipped. It is two whole sample frames, so leaving it in would not shift the channels, only put one click at the very start. Only the raw format carries a repeat point in its header.

### msu/optimize/flac-encode.ts

The encoder invocation lives in one place, so the slice that measures a file and the run that converts it use the same compression level. `-map 0:a:0` takes the first audio stream only, so an mp3 with cover art does not gain a video stream. The sample format is left to the encoder, not pinned to 16 bit: a 24 bit source pinned to 16 would silently stop being lossless. `FLAC_COMPRESSION_LEVEL` is the encoder effort on a 0 to 12 scale; above 5 saves about 2% more for several times the time. An encode runs through the tools module with its 10 minute budget, not the probe one, since a long track legitimately runs for minutes. A conversion asks ffmpeg for `-progress` on stdout and turns each `out_time_us` line into the file's own fraction, so the bar moves inside a long track. A failure throws the encoder's last line, so it names the file's own problem.

### msu/optimize/loop-point.ts

The repeat point an MSU-1 file declares in its first eight bytes (the magic text, then a 32 bit little endian sample index). It is a positional read, not the shared FileStore helper: FileStore reads whole files, and this runs over a whole pack. A file with no valid header answers null, the same as "no repeat point". Zero also reads as null, since an unset `loopSample` already means "from the beginning".

### msu/optimize/measure.ts

What one file would cost in the target format. The number is measured, never assumed: FLAC on 16 bit stereo lands anywhere between 40% and 70% of the source depending on how busy the material is, so a flat percentage would be a guess. A fixed slice is encoded and its bytes per second are scaled to the file's own duration. A file shorter than the slice is the slice, so its estimate is not scaled at all: it is the exact size the conversion will produce. Each slice is written into the scratch folder under its index and deleted after.

### msu/optimize/pack-audio/

The pack's audio as this operation sees it: every file with its size, which are already in the target format, and what a converted file gets called. One readdir plus a stat per entry; no file is opened, and a file that vanishes between the listing and the stat is skipped.

`pendingConversions` returns the files a run would convert: not yet in the target format, and not superseded by a same stem file that is. Converting a superseded original again would encode a second suffixed copy and orphan the first, doubling the pack every run; its reference is pointed at the existing copy instead. `freeTargetName` keeps the stem in the target format. A pack can already hold `foo.flac` next to `foo.pcm`, so the name is suffixed, never overwritten: an odd name beats a lost file.

### msu/optimize/run.ts

The conversion, in the one order that keeps a pack playable:

1. Repeat points first. An MSU-1 header dies with the container, so every loop point is written into the manifest before any byte is encoded, or intro then loop tracks restart from zero. A file without the header magic answers null, so an encoded source has nothing to move.
2. Encode one file at a time and point the manifest at the new name as each lands, so an interrupted run leaves a pack that is consistent as far as it got. A half written output is removed on failure: it would look like a converted file.
3. Reconcile at the end: every reference to a superseded original (a name spelled in another case, or left over from an earlier run) moves to the converted file.
4. Originals are kept. Deleting them is a separate, confirmed action.

A pack installed from the Hookshop is read only, so it is refused before any step runs. A pack with no manifest is promoted to one first (the same synthesized view the player builds for a classic pack at load time, so nothing audible changes), so the loop points have somewhere to live and the rename is a manifest edit like any other. Refusing would exclude the packs most worth converting. A pack with no manifest and no file name carrying a track number has nothing to convert. A name the preview listed but a previous run already covered is skipped, not encoded again; the reconciliation moves its reference onto the copy that exists. `fileNames` are the files the user approved in the preview.

## tools

### boot/ffmpeg.task.ts

Declares the optional ffmpeg tool to the Brock tools module at boot. From then on the module finds it, installs it as the `tool:ffmpeg` job (download, checksum, unpack, all shown in the job dialog) and runs it with an argument array. The copy lives in `Data/tools/ffmpeg/<version>/`, under the app's own data root, so an isolated `--user-data` launch gets its own copy.

### tools/ffmpeg-tool.ts

The ffmpeg tool definition: the `ffmpeg` and `ffprobe` binaries, one version folder, and a download only on Windows. Linux builds ship as `.tar.xz` on a platform that has a package manager, so Linux reads PATH and the hint names the package to install. A copy found on PATH is the user's own and is used as it is, with no checksum.

### tools/ffmpeg-release.ts

Resolves the pinned ffmpeg asset name against BtbN's `latest` release right before every install, since that release's bytes (and so its checksum) change whenever BtbN rebuilds it. BtbN prunes its dated releases, so `latest` is the one tag that never returns 404. The GitHub REST API returns the asset's own published sha256 digest alongside its size and download URL in one call, which the tools module checks before anything is unpacked. Nothing here computes or guesses a checksum: it relays what BtbN published for the exact bytes about to be fetched.

### tools/ipc-handlers.ts

The one RotP ffmpeg channel left: `ffmpeg:probeAudio`. State and install belong to the tools module (`tools:state`, `tools:install`). The probe takes a Data root relative POSIX path, not an absolute one, so the renderer never names a path outside the app's own storage. Traversal out of the root is refused the same way the generic file store refuses it.

### tools/probe-file.ts

What ffprobe says about one media file, or null when the tool is not installed, the file is not media, or the probe failed. Null is a normal answer, not an error. The probe gets 30 seconds, long enough for a large file on a cold disk and short enough not to hang the UI. Each file is asked once (see `probe-cache/`).

### tools/ffprobe-parse.ts

Reads ffprobe's JSON report into the fields kept. ffprobe emits numbers as strings and "N/A" for anything unstated, so every value becomes a finite number or null, never NaN. The per stream figure wins and the container's is the fallback (VBR streams often omit theirs).

### tools/probe-cache/

Remembers what ffprobe said about a file, so it is asked once per file, not once per draw of the files list (a native process launch per encoded file, per redraw). Entries are keyed on path, size and mtime, so a rewritten file misses on its own and nothing is invalidated by hand. Only a real answer is kept: a null (tool missing, file unreadable) can change without the file changing, so it is asked again next time. The cache is one JSON file under the app's data root (`cache/audio-probe.json`), written at most once per second. A lost cache write only costs a probe.

## updater

Self update comes from the Brock updater module (`@drizztdourden08/brock-updater`): the Velopack hooks, the update check, the version picker, the download and the swap. The release feed is the `repo` in `brock.config.ts`, and the main process keeps no updater code of its own.

## recommendations

### recommendations/recommendation-handlers.ts

The recommendation store lives in the main process, not in the renderer, because both of its mutating operations are a read, modify, write over a whole collection file. Splitting them across an IPC round trip would put the read and the write on opposite sides of a boundary two callers can interleave on. Keeping the collection on this side means one queue (see `recommendation-files/`) makes every caller's operations sequential, which is what a batch accept relies on.

### recommendations/recommendation-files/

The disk adapter behind `RecommendationStorage`: one file per collection at `Data/recommendations/<kind>.json`. The relative path comes from `recommendationFile`, so the engine stays the single source of truth. Operations on one kind are serialized behind a per kind queue (`queued` runs a task after everything already queued for that kind, failure included). The queue wraps the whole store call, not just the save, or two decisions could read the same snapshot and overwrite each other. Neither half of `recommendationStorage` queues: the handler already holds this kind's turn for the whole operation, and a load or save that tried to take that turn again would wait on itself.

## store (the Hookshop)

The catalogue reads, install jobs with their progress and cancel, the checks a download passes (size cap, https, sha256), uninstall, the installed record and `relic-of-the-past://install` links come from the Brock catalog module (`@drizztdourden08/brock-catalog`). RotP keeps what a pack is and where it lands: the configuration in `hookshop/`, the installers in `shared/store/install`, and duplicating.

### store/ipc-handlers.ts

Configures the Hookshop on the catalog module (`hookshop/`) and keeps the one channel of its own, `store:duplicate`. The device token stays in the main process, so the renderer holds neither the token nor a download URL.

### store/hookshop/

The catalog module's configuration for the store API.

- `endpoint/` sends the device token as a Bearer header. With no token, `hubFetch` answers a 401 itself, and a 401 from the site drops the token, so the tab shows the sign in card either way.
- `schema/` parses each answer of the store API (an item, a page, the home page, a download grant). A grant without the pack's kind, author or licence is refused, since the install record needs all three.
- `installers/` wraps each container's installer from `shared/store/install` as a catalog installer over `storeFiles`, and `maxBytes` holds a download to the cap for its kind.
- `hooks/`: before an update or an uninstall removes a copy, `releasePack` points every profile that selected it at the replacement, or back to the default. After a language set is installed or removed, the game assets are baked again.
- `isInstalling` and `installedPacks` read the module's jobs and installed record for the rest of the main process.

### store/duplicate.ts

Duplicating an installed item into one the player can edit. The install record names the item and its licence; a licence that does not allow copies is refused with its reason. Otherwise the kind's duplicate writes the copy through the store's in process file store, crediting the original in `basedOn`. A language copy is baked into the game assets after, the way an install does it.

### store/store-files/

The Data root the Hookshop installs into, as one in process file store that every installer and the duplicate share.

### store/repoint-profiles.ts

A pack a profile selects is never left dangling. Each kind lives in one field: a music pack in the profile's `msuPack`, a language set in its `language`, a character in its config's `linkSprite`. Every profile is checked, since the library is global. An update points the selection at the new copy; an uninstall passes null, which is each field's default. It returns the ids of the profiles that changed.

### store/store-result/

Wraps a store call into the answer `store:duplicate` gives: its data, or why not.

## hub

### hub/client/

One JSON call to a site's API. The device token rides as a Bearer header when one is given. A non 2xx answer becomes an error carrying the status and the API's own message, so callers can tell a revoked token (401) from a network failure.

### hub/sign-in/

The device code sign in runs on the sign-in driver of the Brock secrets module (`@drizztdourden08/brock-secrets`), which opens the confirm page, polls, cancels and hands over the token. `hubSignInProvider` gives it one provider per site: begin asks that site's API for a short user code, poll asks whether the person confirmed, and the token goes to `token-store/`. A system that cannot encrypt the token refuses before the browser opens.

### hub/device/

`deviceLabel` is the text the site shows on the confirm page and the devices list, for example "Windows · DESKTOP-4F2". `devicePlatform` reads anything that is not Windows or macOS as Linux.

### hub/endpoints/

Where the sites' APIs live. Each answers under `/api` on its own origin, through its hosting rewrite, so the device token never crosses an origin. The origins are public, the same trust model as the GitHub URL in the updater. Every call names the API it goes to; one device token serves them all. The Hookshop origin is a placeholder until the store's domain exists. A query value that is empty or absent is left out of the URL.

### hub/identity.ts

Who this device is signed in as: `GET /me` with the stored token. A 401 means the token was revoked on the site or the device row is gone, so the token is dropped and the app reads as signed out. Any other failure (offline, 5xx) keeps the token and reports null this time.

### hub/ipc-handlers.ts

Registers one sign-in provider per site with the secrets module, so the confirm page opens on the site that asked while the token serves every site. The channels of its own are `hub:signOut`, which cancels any sign in still waiting and drops the token, and `hub:me`.

### hub/token-store/

The device token, kept as the `hub-token` secret of the Brock secrets module, which encrypts it with `safeStorage`. One token serves every site's API. Without a working `safeStorage` nothing is written: `saveToken` throws, so the sign in reports it. `readToken` returns null when no token is stored.

## sanctuary

### sanctuary/ipc-handlers.ts

The Sanctuary's own channels. `sanctuary:submitReport` files a report with no attachment. `sanctuary:reportSnapshot` keeps what the renderer saw when the bug report dialog opened (`report-snapshot/`). Signing in belongs to the shared account (`hub/ipc-handlers.ts`).

### sanctuary/bug-report/

The transport behind Brock's bug report dialog (`bugReport` in `main.ts`): it files the report on the Sanctuary, whose API also opens the GitHub issue. Signed out, it refuses before anything is built. Otherwise it builds the debug zip with Brock's `collectDebugFiles` and `writeDebugZip`, adding the profile's settings, profile, randomizer and input files, every quick slot, the 5 newest named saves, the 2 newest auto saves, the live state from the snapshot, and the newest unsent capture sessions that fit `CAPTURE_BUDGET_BYTES`. The report is filed first and the zip uploaded after, so a zip that is too large or fails to upload still leaves a filed report, and the receipt says the debug files are missing. Capture sessions are marked sent only once the upload went through. The temporary zip is always removed.

### sanctuary/report-snapshot/

The context, the profile id and a live save state, sent by the renderer when the bug report dialog opens, since the main process cannot read the running game. The transport takes it once. A snapshot older than 30 minutes is ignored, and without one the report falls back to the launch's profile or the last one played.

### sanctuary/submit-report/

The calls to the Sanctuary API. `fileReport` is `POST /reports`, which creates the record and the GitHub issue in one call and answers with a presigned PUT for the zip. `uploadReportZip` sends the zip straight to the bucket, then `POST /reports/:id/complete`. A failed upload leaves the record with no zip; nothing is kept for a retry.

## screen-editor

### screen-editor/ipc-handlers.ts

IPC for the dev screen and connection editor. The renderer sends records, never source text and never an id for something new: this process allocates every id and runs the dataset's own emitter, so a write cannot carry a caller minted id or a shape the record interfaces no longer describe. The six record facade collections register through `record-handlers.ts` (all one shape: workspace root plus a record payload, a thrown error reported as a refusal); a new crossing's pair goes through `connection-pair-writer/`.

`screenEditor:writeCheck` still takes source text: `shared/game/checks/` has not moved onto the record facade, so there is no record shape to emit there. That channel predates the record facade and still has a caller (the simulator's dataset correction loop); nothing new should reach for it, because a text payload cannot be checked against the record shape the way `serializeCheckRecord` is.

`editSourceFile` does read, transform, write in one place, so every handler treats a writer error the same way and nothing half writes.

### screen-editor/check-writer/

Creating, rewriting and removing a check record; the record based path, and the only one that should grow. A check is filed with its dungeon when it names one, otherwise with the area of the screen it sits on (`record-file-targets.ts`). Neither is derived from a name, so renaming a check never moves it. A check's destination is read off live dungeon and screen records, so the registry has to be seeded first: the barrel imports `@shared/game/data` for that side effect alone.

### screen-editor/actor-writer/, dungeon-writer/, item-writer/

- An actor is filed by kind into the last file of its size split group.
- A dungeon is one record in one file, named by its own file stem, under its world.
- An item is filed by its dungeon when it names one, and by category otherwise, one file each.

For all three, an existing record is edited or removed where it already sits, found by id; records are never moved.

### screen-editor/connection-pair-writer/

Mints both halves of a brand new crossing atomically. Every `toConnectionId` is required (`packages/game-data/src/data/types/connection.ts`), so a crossing with no partner mints two ids on one allocator turn and writes both halves before either id is observable. When both halves land in one file, it is one edit, so a failure mid write cannot leave a dangling partner. The halves usually belong to different screens, so two files: both edits are validated before either file is touched. If the second `writeFile` fails (a full disk), the first half is rolled back best effort, so a dangling `toConnectionId` cannot survive silently; the error says whether the rollback worked.

### screen-editor/data-files/

Finds the dataset files a kind's records live in. A create knows its destination (`record-file-targets.ts`). An update or delete must not assume one: several collections were split by size (junk items span four files, one dungeon's checks two), so the canonical file may not hold the id, or worse, an edit would land a second copy. An existing record is located by its id across the kind's subtree, and null comes back when no file carries it. Every path `record-file-targets.ts` derives is relative to `records/`, not to the data folder as a whole (`DATA_SEGMENTS`).

### screen-editor/dataset-record-writer/

The create, update and delete engine the record facade collections share. Everything kind specific is a `RecordWriterSpec` (the kind to allocate an id under and whose subtree an existing record is found in, where a brand new record is filed, which emitter serializes it, and the record type a started file's array is typed with), so the three operations are written once. A create uses the spec's canonical destination, starting that file when the tree has none yet (a dungeon is one record in one file, and an area may have no interiors today). An update or delete locates the record by id (`data-files/`), because a record's real home is not always the one the resolver would pick.

### screen-editor/enumeration-writer/

Creating, relabelling or removing a closed set enumeration entry. No other collection references an entry's id (`reference-usage.ts`), so there is no delete guard half. Every successful write also regenerates `enumeration/enumeration.generated.type.ts`, which the `World`, `ScreenKind` and similar unions come from. Duplicates are keyed on the category and value pair, since two categories may share a value (`check-kind:npc` and `actor-kind:npc`). `category` always precedes `value`, but hand authored rows are one object per line while `literal()` emits one field per line, so the gap is matched as whitespace of any width.

The type regeneration is best effort: the entry write already landed, so a failure is logged, not reported; the next edit or `npm run generate:enum-types` catches it up. `root` must be passed to `generateEnumTypes`: its default guess is relative to its own file, which is wrong from the bundled main and once crashed every production launch on a nonexistent `dist/shared/...` path.

### screen-editor/geography-writer/

Writing an area or a location record. Creating one is its own channel: the caller supplies a display name and nothing else, because that is all there is to a brand new area or location, and the id comes from the allocator. Rewriting and removing take the whole record, like every other record facade collection, and go through the shared engine. Each collection is one file per world, so the destination comes from the record's own world (`record-file-targets.ts`), and both resolvers always return a path. This process is the allocator, so it is the one place allowed to brand an id. Areas and locations are records, so they sit under the synced record tree.

### screen-editor/id-allocator/

The single owner of record numbering. Ids are never supplied by a caller: it reads every id in a kind's source tree and hands out the next free `<kind>-NNN` on one serialized queue, so an id cannot be minted twice. Each task starts only after the previous one finished reading and its caller has written, so a concurrent pair cannot both see the same highest id; `withAllocatedIds` runs the scan and the caller's write on that queue. `KIND_ROOTS` lists where each kind's records live, relative to `packages/game-data/src/data/records/`; it is a list because a kind may one day spread over more than one folder.

The scan matches the quoted id literal wherever it sits, not only after `id:`. `item-groups.ts` also writes it as `Swords: 'ig-001'` in the `ITEM_GROUP_IDS` map, which an `id:` anchored scan would miss. A sibling reference (for example `toConnectionId`) also counts as used, which is the safe direction.

### screen-editor/item-group-writer/

Creating, relabelling or removing an item group. `item-groups.ts` writes `id` two ways: the symbolic `ITEM_GROUP_IDS.<Key>` form every entry started with, or the plain literal a row gets once this path has edited it. The matcher tries the literal first and falls back to the symbolic form (`symbolicNeedle`); only a write normalises a row, and only that row. `ITEM_GROUP_IDS` still names the seven groups that predate this path, but any number of groups is a normal writable collection with allocator minted ids. Labels are the closest thing this collection has to a key, so a duplicate label is refused. Delete is the delete guard's actual delete step, once the caller has confirmed it.

### screen-editor/record-file-template/

The empty record file a create starts when the tree holds none for that path yet. The layout files a record by its world, its area, or its dungeon and floor, so a destination can be a file nobody has needed yet: the first interior of an area, or a dungeon, which is one record in one file. The array is named by the same rule every other file of its collection follows (`record-file-targets.ts`), so the loader's glob picks the new file up like any other. The emitted file starts with the `@kind data` header.

### screen-editor/resolve-source-file.ts

A traversal safe path resolver for the screen editor's writable source roots. `data` points at the record tree, not `shared/game/data` as a whole: a wider root would let a write land on the schema or the aggregators.

### screen-editor/source-writers/

Write helpers for the editor's source file edits. Each data file exports one array literal: insert a new entry before the closing `];`, or replace or remove the entry whose `id:` matches. Records are matched by walking real brace depth, not by regex: a record is multi line and contains nested objects and arrays, which a `\{[^}]*\}` pattern fails to span. The walk skips string literals and comments, so a brace inside either cannot shift the depth. A record's span is its full lines, trailing comma included. An `id` is the only key ever matched on; the extra needle exists only for item groups (see `item-group-writer/`).

### screen-editor/tag-writer/

Appends a new vocabulary term to the tag dataset file. The caller supplies a key and the collections it belongs on. The two levels come from the key, the id from the allocator, the record text from the dataset's own emitter, so no key derived id or stale shape can reach disk. `namespace:value` is required: it is the hierarchy the collection is organised by. The renderer refuses too, but this is the check standing between a bad key and the file. A duplicate is matched on the key, which is what a duplicate is. A relabel is always a replace (the record is already open, no id to allocate), and delete is the delete guard's actual delete step.

### screen-editor/workspace-root.ts

Locates the repo root the editor writes into by walking up to the ancestor that contains `shared/game/data`. A fixed depth from `__dirname` breaks because dev, the production build and a packaged app all bundle at different depths. It falls back to the working directory (the app is always launched from the repo root) for a bundle outside the source tree, and caches the answer for the life of the process.

## saves

The main process keeps no save store. The renderer writes saves over the FileStore: SRAM and quick slots through the Brock port kit (`@drizztdourden08/brock-port-kit`), named and auto saves through `packages/game-core/src/saves`.

## profiles

### profiles/ipc-handlers.ts

`profiles:update` whitelists by design, with the rule shared with the renderer's store (`apps/desktop/src/profiles/storage/profile-patch.ts`): an absent field is left alone, null clears it, and of `randomizer` only the connection moves. `updateProfile` in `store/` is a whole profile write; field whitelisting happens in this handler, so `randomizer` stays exactly as loaded and is never patched there.

## roms

The main process has no ROM channel. The Brock port kit creates the roms and assets folders, and the renderer imports ROMs over the FileStore (`lib/storage/roms-store`, on `packages/roms/src/library`).

## storage

### storage/file-handlers.ts

Generic file store IPC, rooted at the Data folder; it backs the platform `FileStore` port on Electron. Renderer supplied paths are POSIX and relative, and resolution blocks traversal outside the root. Every write, removal and new folder inside an item the Hookshop installed is refused (`installed-guard/`). `file:trash` moves to the Recycle Bin (the Trash on macOS) so a delete can be undone there, and does nothing when the path is missing.

### storage/installed-guard/

The lock on what the Hookshop installed. An installed music pack, language set or sprite file stays as its author published it, so every write a renderer can ask for (the file store IPC, the music pack and language channels) asks here first and is refused inside one. The store's own install, update and uninstall write through their in process file store and never pass through here, which makes them the only writers.

- `INSTALLED_ROOTS` is the Data path an installed item occupies, by kind. Only paths under `GUARDED_TOP` can hold an installed item, so other paths skip the registry read.
- Windows and macOS folders ignore case, so a differently cased path is the same item there (`foldCase`).
- Roots are compared in one spelling: POSIX, relative, no leading `/` or `./`, no trailing slash (`normalizeRel`).
- `refuseInstalledRemoval` also refuses removing a folder that holds an installed item.

### storage/ipc-handlers.ts

Storage info IPC: where data lives, revealing it in the OS file manager, and a per domain usage summary (immediate entry count plus recursive byte size). It backs the platform `StoragePort` on Electron. `sanitizeId` strips anything outside `[A-Za-z0-9_-]`, so an id can never contain a path separator, `..` or a drive letter. An unreadable file is skipped in the byte count.

## shadow-casting

### shadow-casting/store/

Shadow data is a committed source asset (not per user state), so it lives under `public/data`, not userData. Writes are dev only (`shadow-casting:save` refuses otherwise); in dev, `__dirname` resolves into the build output beside the bundled public folder. The project is cached after the first read.

## assets

### assets/compile-rom-assets/

Compiles a ROM's `zelda3_assets.dat`, baking in every stored language set so the core can switch language at run time through the INI. `recompileAllAssets` recompiles every ROM that already has a cached blob, used when the stored sets change (extract, edit, delete).

### assets/load-compiled-languages.ts

The language extras one asset blob compile bakes in, on the desktop host: every stored language set (its edited dialogue, glossary and name payload plus its font pair) is read off the Data folder and compiled into a packed entry. A set that fails to compile is warned about and skipped, so one broken translation never blocks the blob.

## debug

### debug/dump-layers-handler.ts

The `--dump-layers=N [--hover-tile=col,row]` automation flag. The renderer loads save state slot N, dumps the dual layer collision grid (the same data the navigation overlay uses) through `debug:dumpLayers` to `<project>/debug-output/dump-layers.json`, then exits. With `--hover-tile`, it also opens the navigation overlay, hovers that tile to trigger the tooltip, and takes a screenshot.

### debug/dump-nav-handler.ts

The `--dump-nav=N|NAME` automation flag. The renderer loads a save state, dumps the navigation widget state (entrances, screen detection, transitions) to `debug-output/dump-nav.json`, then exits. An all digit value names a quick save slot; anything else names a manual (normal) save.

### debug/session-log-handler/

The always on session log sink. The renderer batches its structured log bus lines (every channel, game core stdout included, see the renderer's session log tap) and sends them over one fire and forget channel per batch; each batch is appended to `Data/debug/session.log`. Appends are chained, so batches land in arrival order even when a flush overlaps a slow disk write; a failed write drops that batch silently. At startup the previous file is rotated to `session-1.log`, so the last two sessions stay readable after the fact. The first launch has nothing to rotate, and that miss is fine. Every write is best effort: logging never surfaces in app code and never blocks startup.

### debug/sim-log-handler.ts

The simulator run log sink. `sim:appendLog` appends one JSONL line per simulator event to `debug-output/simulator/<runId>.jsonl`; `sim:openLog` reveals that file in the OS file manager. `sanitizeRunId` strips anything outside `[A-Za-z0-9_-]`, so a run id can never contain a path separator, `..` or a drive letter, and never escapes the simulator log folder.

### debug/sim-run-handler.ts

The `--sim-run[=slot=N;target=<screenId>;stop=<checkId>;max=N]` automation flag. It runs the gameplay simulator headlessly to a stop condition, then writes a `SimRunReport` (outcome, reached screens, verified checks, boundary edges, data correction suggestions) to `debug-output/sim-run.json` and exits. It drives the in chat data correction loop. `stop` takes a check id (`check-072`), not a check name: the engine's stop condition compares identities, and 11 dungeons share a "Big Chest". The command line hands over free text, so only a value that looks like a real check id becomes one.

## diagnostics

### diagnostics/ipc-handlers.ts

Diagnostics IPC: one read only channel returning the host hardware and OS readout that backs the About page's debug info block.

### diagnostics/collect-displays.ts

The per monitor readout. Only the main process can see the whole desktop; the renderer's `window.screen` describes the one display the window sits on, which is exactly the blind spot when a report says "it is wrong on my second monitor". A `displayFrequency` of 0 means the platform did not report one, not a real 0 Hz. With no display server (headless CI) there is no primary display, and every entry reports `primary: false`.

### diagnostics/collect-gpu.ts

The GPU readout. The renderer only sees the ANGLE string WebGL hands it; the main process also knows the PCI ids, the driver version, which adapter is active on a hybrid graphics machine, and which accelerated features Chromium turned on. `getGPUInfo` resolves an untyped bag whose shape varies by platform and driver, so the raw types narrow only the fields reported. It returns nothing under `--disable-gpu`, or when the info process never reported back.

### diagnostics/collect-host/

The OS, CPU and memory side of the host readout. Everything comes from the `os` module or the app itself, so it is cheap and synchronous. `process.getSystemMemoryInfo` is the only source of swap figures and reports kilobytes; it is unavailable in some sandboxes, so swap degrades to null while total and free memory always come from the `os` module.

### diagnostics/crash-forensics/install.ts

Crash forensics turn a silent death into a trace in `Data/debug/main-console.log`. It is installed once, before app ready, because the crash reporter must be running before any child process exists. It only observes: no handler changes what the app does, and nothing leaves the machine (the reporter is local, upload off, no submit URL; minidumps land under `app.getPath('crashDumps')`). Lines written before `initPaths()` are held by the log module and flushed with the first line that reaches the disk, so this can run ahead of main's own ready work.

### diagnostics/crash-forensics/forensics-log/

The one write path for crash forensics lines. The terminal is written directly, not through `console`: the dev file logger wraps `console` to mirror it, so going through it would put every line in `main-console.log` twice. `noteSync` is for handlers that may be the last thing to run before the process dies (the line is on disk before they return). `terminal: false` keeps a periodic line out of the dev terminal while it still reaches the file. A GUI launch may have no terminal at all; the disk line is the one that matters.

### diagnostics/crash-forensics/memory-heartbeat.ts

One compact line every 30 s: the main process's own memory, then every process Electron knows about (browser, GPU, renderer, utilities), so the log leading up to a death shows whether something was growing. File only, not the terminal. `workingSetSize` and `peakWorkingSetSize` are already in kilobytes. The timer is unref'd, so it never keeps the process alive, and a failed metrics read is never the thing that fails.

### diagnostics/crash-forensics/process-gone-hooks.ts

The death notices Electron hands the main process: a renderer or a child process (GPU, utility) going away, and a page that stops answering. All are hooked at the app level, so every window and every webContents is covered without the window layer knowing about it. They are written synchronously: a dying GPU process can take the browser process with it in the same instant.

### diagnostics/crash-forensics/process-hooks.ts

Node level failure hooks for the main process. `uncaughtExceptionMonitor` is used, not `uncaughtException`: the monitor observes without counting as a handler, so Electron's own handling (its error dialog) is left exactly as it was. It also sees an unhandled promise rejection, because Node's default mode escalates one into an uncaught exception, and the monitor's `origin` says which it was. Registering an `unhandledRejection` listener instead would swallow that escalation. Every line is written synchronously because there may be no next tick.

### diagnostics/crash-forensics/quit-hooks.ts

Records how the app was asked to leave, so a log that ends in a quit can be told apart from one that ends in a death. The origin is whichever fired first: `window-all-closed` (the user closed the window), `app.quit` (an explicit call, such as the updater's), `app.exit` (the immediate form). A quit event with no origin recorded came from outside the app's code: the OS ending the session, a signal, or a kill. `app.quit` and `app.exit` are wrapped, never replaced: the original runs unchanged after the mark. Lines are written synchronously; `quit` is the last event before exit.

### diagnostics/debug-report/capture-frame-budget/

Frame selection math for downsampling a capture session to fit a byte budget, shared between the video path (budget against the encoded video's own size) and the no ffmpeg fallback (budget against raw PNG bytes). Frames are picked at even intervals across the whole sequence, so downsampling thins detail out evenly and never cuts the start or the end off. `budgetedFrameCount` assumes size scales roughly linearly with frame count; a session already under budget keeps every frame.

### diagnostics/debug-report/capture-manifest/

Tracks which capture sessions have been uploaded in a report, per profile, at `debug-captures/<profileId>/manifest.json`. Nothing else marks a session sent: building a report deletes nothing, so a cancelled dialog or a failed upload leaves every session as selectable as before. `forgetSession` runs when a session is deleted outright, so its manifest entry does not linger.

### diagnostics/debug-report/collect-capture-sessions.ts

Reads what a report ships for each capture session the picker checked: the position timeline plus whatever `finalize-capture-session/` put in `packaged/` (a size budgeted video, or a PNG fallback). Never the unlimited local frames or full video, which stay on disk for review whether or not a report is sent. Which sessions ship is the caller's choice (`sessionKeys`; the bug report transport picks the newest unsent ones within its budget, see `sanctuary/bug-report/`); nothing here decides eligibility or changes disk state. A session is marked sent only once the report uploads (`capture-manifest/`).

### diagnostics/debug-report/delete-session.ts

Deletes one capture session outright: frames, both videos, `snapshots.jsonl` and `packaged/`, everything under `debug-captures/<sessionKey>/`. The picker's own delete action confirms in the renderer first; this performs the removal with no further checks.

### diagnostics/debug-report/finalize-capture-session/

Runs the moment a recording stops: writes every raw frame and the position timeline for that session under `profiles/<profileId>/debug-captures/<sessionKey>/`, beside the profile's saves and config. Living under the profile means deleting the profile takes its capture data with it.

Two videos come out, because the local copy and the one a report ships follow different rules. The local recording has no size limit (only the 5 minute time limit the renderer's store enforces), so `video-full.mp4` encodes every captured frame. `packaged/` holds what a report sends: a video downsampled to fit `PACKAGED_BUDGET_BYTES` (2 MB), built by encoding again an evenly spread subset of the same frames once the full video turns out over budget. Without ffmpeg it ships that same evenly spread subset as raw PNGs, sized against their own byte count.

### diagnostics/debug-report/list-sessions.ts

The session listing for the bug report picker: every recorded capture session for a profile, with a small preview and its sent state. Unlike `collect-capture-sessions.ts`, it is not filtered to eligible sessions, since the player picks what ships. Without ffmpeg, `packaged/` holds the evenly spread PNG subset instead of a video, and every one of those frames goes to the picker so it can cycle through them as a stand in video.

## protocol

### protocol/

`app-sprite://sprites/<romStem>/<file>.png` is served from the data root's `sprites/` folder, the same root the renderer's FileStore lists when it checks whether a set is extracted, so a `--user-data` override moves both together. `app-debug-capture://captures/<profileId>/<sessionKey>/<file>` is served from a profile's `debug-captures/` folder, so the bug report session picker can preview a recording's video (or a frame PNG without ffmpeg) without piping bytes through IPC. The `sprites` and `captures` hosts are labels, unused by code. Both schemes are registered as standard, so Chromium hands the path over percent encoded (spaces, commas and parentheses in a ROM stem included) with dot segments already collapsed; it is decoded and encoded again as a proper file URL, so a stem holding `#` or `%` still resolves. The path functions are pure: the handler supplies the root.

## wasm

The Brock port kit serves the WASM core bytes to a renderer loaded over `file://`, where `fetch()` is blocked (`window.api.portKit.readCore`). The main process keeps no core code of its own.

## automation

### automation/arm-game-screenshot-watchdog.ts

A `--game-screenshot` run (a `--screenshot` that waits for the game, see `defer-game-screenshot.ts`) exits with code 1 when the app has not finished booting within 60 s, or when no screenshot was taken within 240 s. A boot that stalls would otherwise leave a headless window running forever with nothing to report. Both timers are unref'd, so they never keep the process alive.

## ui-views

### ui-views/ipc-handlers.ts

Data Inspector and table view state, held as one app level JSON map. It follows the shape and location of `connection-review.json` and `nav-review.json` (under `getUserDataPath`, not under `profiles/`). The renderer debounces before calling, so the handler is a plain read and write.

## connections

### connections/ipc-handlers.ts

Connection review data and nav review data (per screen connection point reviews with comments), each one app level JSON file.

## dialogs

### dialogs/ipc-handlers.ts

A cancelled save dialog reports `saved: false` with no error, because declining is not a failure.

## test

### test/ipc-handlers.ts

The test automation channels. `test:getArgs` returns the renderer's view of `--auto-state` and `--screenshot`. `--auto-state=N` (all digits) loads quick save slot N after the game starts; `--auto-state=NAME` loads the manual (normal) save called NAME. Names are stable and quick save can never overwrite them, so automation and regression baselines pin to a name, not a slot index. `--screenshot=NAME` captures the window to `tests/screenshots/{NAME}.png` after the state loads (`test:screenshot`), resolved from the project root in dev and in a packaged build.
