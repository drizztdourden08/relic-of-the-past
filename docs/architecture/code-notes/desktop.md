<!-- @layer docs @kind doc -->
# Desktop code notes

Facts about `apps/desktop/electron/` that the code cannot say on its own: protocol rules, OS quirks, file layouts, and the reasons a line that looks strange has to stay. Each heading names the file or folder it explains, relative to `apps/desktop/electron/`.

## Entry points and startup

### main.ts

The main process entry. Its top level runs in a fixed order, and each step depends on the ones before it:

1. Velopack first (`runVelopackHooksFirst`): its install, update and uninstall hooks may restart the process, so nothing of the app's own may happen before it. The document types (`.msul`, `.rsp`, `.rlang`) ride on those hooks: registered after install and every update, removed before uninstall. Windows only; the other platforms get them from the package. Velopack loads lazily, so on a distro too old for its Linux module the app still starts, without self update.
2. The portable `data` folder (every other location derives from userData), then `--user-data`, which outranks it.
3. `app.setName('relic-of-the-past')`, so dev and production share one userData path.
4. Crash forensics, after the userData decisions (the crash dump folder derives from userData) and before any child process.
5. The named instance identity, before the first window exists (a no op on a normal launch).
6. The privileged `app-sprite` and `app-debug-capture` schemes.
7. `disable-features=CalculateNativeWinOcclusion` keeps requestAnimationFrame alive when the window is occluded (for example a `--no-focus` launch behind other windows); otherwise Chromium pauses frames and stalls the headless game loop. Several `--disable-features` values must share one switch, comma separated.
8. macOS can deliver a store install link before the app is ready, so `listenForOpenUrl` runs here.

When the app is ready: a process started by an install link while the player's app runs hands the link over and quits. In dev the HTTP cache is cleared so static asset changes show at once. Paths and data folders are prepared (the installed size registry fix is cosmetic and not awaited), and the previous `session.log` is rotated so the renderer's batches land in a file scoped to this launch. Then every IPC handler registers (`startup/ipc-handlers.constants.ts`; their order does not matter), the main window is created, and the dev file logger mirrors console output to disk in dev. `--boot-timing` logs boot milestones from the first main process timestamp. With `--dump-layers` the renderer console is forwarded to stdout. Input handlers register after `initPaths`, because the calibration and profile stores resolve paths through `getUserDataPath`. A `.msul` the app was launched with reaches the renderer's importer, and store install links arrive from argv, macOS, or a process the browser started. The application menu carries only the clipboard shortcuts; debug items live in the in app Advanced menu.

On quit, input stops and the display refresh rate is restored, so quitting from fullscreen never leaves the player's display on a rate they did not pick.

### startup/

Wiring that `main.ts` runs once the window exists. `IPC_HANDLERS` lists every handler group; the screen editor writes to source files, so it registers in dev only, never in a packaged build. Wiring that needs the live window stays in `main.ts` after `createWindow()`. `forwardWindowEvents` sends window state to the renderer. The synced refresh rate switch rides on the fullscreen transitions, not on renderer state, so the display is handed back even when the window is closed straight out of fullscreen. Test and automation launches (`--window-size`, `--fresh`) must not overwrite the saved window bounds (`isEphemeralLaunch`).

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

### input/calibration-store/

Stick and trigger calibration data, stored per device. Stick calibrations are keyed by "vid:pid". Trigger calibrations are keyed by `deviceKey:axisIndex`.

### input/profile-store/

Input bindings, stored per game profile in `profiles/<id>/input-profiles.json`.

### input/controller-snapshot.ts

Builds the device snapshot for `controller:list` and `controller:devices`. It holds every device SDL claimed plus anything the device lister sees that SDL has not claimed. It takes the listing as a parameter because `listDevices()` is a synchronous native HID enumeration (about 10 ms), so `sdl3-source.ts` caches it across snapshot builds. A live device keeps SDL's own name in the snapshot because the connect event fires once and is missed by anything that subscribes later or after a release. Its gamecontrollerdb mapping line is resolved once on add: it never changes while connected, so there is no native lookup per snapshot.

### input/device-availability.ts

Classifies listed devices as available or not. SDL claims a device by opening it, so any listed device whose vid:pid is not among the ones SDL has open is unavailable: held by another application, or filtered out by SDL's own hidapi rules. It is pure and free of I/O, so it stays easy to unit test.

### input/device-lister.ts

The one place that decides which listers feed the controller device snapshot; nothing else calls a lister directly. SDL's own enumeration (`device-lister-sdl.ts`, backed by the addon's `enumerateHid()`) is the sole source now that the node-hid fallback is gone. That lister tags bus type itself and lists every device SDL cannot claim. When several listers are active, the first to report a vid:pid wins. A listed device is found by enumeration alone, with no opening, reading or writing.

### input/haptic-pattern-player.ts

Turns a timed pattern of `{ durationMs, intensity }` segments into one SDL rumble call per segment, waiting `durationMs + gapMs` between. It runs in the main process so timing never drifts under renderer load. A new pattern on a device cancels whatever was still playing on it. The first call is a silent rumble: it stops the motor and doubles as a check that the device exists and can rumble.

### input/mapping-db/

The mapping database follows the Ship of Harkinian pattern. A bundled `gamecontrollerdb.txt` ships with the app, then an optional user copy at `<userData>/gamecontrollerdb.txt` loads second on top of it, so a line the player adds or edits there wins over the bundled default for that GUID. `loadMappingDatabases` runs once at startup; the applied total is logged by the controller layer, so only what was registered and from where is reported here.

The bundled db ships in the repo at `resources/gamecontrollerdb.txt`. electron-builder's extraResources copies it into `process.resourcesPath` for a packaged build. In dev there is no such copy, so the path falls back to the repo root, found relative to the bundled main file (electron-vite writes main two levels under the repo root in dev and in a production build). It is null when neither exists, for example a source checkout missing the file. This is the same idea as the native addon's own resolution, applied to a data file.

`addUserMapping` registers a mapping for the live session and appends it to the user db so it survives a restart, creating that file on the first write. It writes nothing and returns false when the line does not look like a real mapping.

`isMappingLine` accepts a line with at least a GUID, a name and one real binding (a `key:value` field that is not `platform:`). A blank line or a comment (starting with `#`) is rejected. SDL's GUID is historically 32 hex characters and can run longer on newer revisions, so any hex run of 24 or more is accepted. SDL also uses the literal `xinput` as a pseudo GUID for its built in generic XInput mapping.

### input/sdl3-device-key/

Assigns and frees device keys for connected SDL joysticks. Bindings, profiles and calibration are keyed by "vid:pid" (four lowercase hex digits each, for example "057e:2009"), and that key must keep working for one device per vid:pid. A four port adapter exposes four devices sharing one vid:pid, so the second and later get a "#N" suffix (N = 2, 3, ...). Slots are tracked per vid:pid, not counted, so removing a device in the middle frees exactly its own slot, and a later connect can reuse it without changing the key of any device still connected.

### input/sdl3-source.ts

The SDL3 controller transport: owns the native addon's lifecycle in main and translates its raw events into the `controller:*` IPC contract. It is the sole controller input transport, started from `ipc-handlers.ts`.

The HID listing is cached. `listDevices()` is a synchronous native enumeration (about 10 ms on a two device machine); calling it per `controller:list` stalled the calibration screen, so it runs only on connect, disconnect and rescan. `rescan` refreshes the cache because the OS listing can change with no SDL claim event (a device SDL still cannot claim).

In `start`, the order matters: `listDevices()` bottoms out in SDL's own hidapi, and reaching it before the SDL thread initialises leaves the gamepad backend unable to claim anything through HIDAPI (no rumble, no gyro, no input). So `sdl3.start` runs first, then the cache refresh.

`releaseHold` releases the gamepad subsystem so a raw HID open on the same device can succeed; the snapshot reports no claimed devices while held, since every gamepad closes through the normal `removed` path first. `restoreHold` is enough on its own to bring it back. Raw capture bytes arrive as `controller:raw` and joystick capture samples as `controller:joystick` events, both for the gamepad diagnostics wizard.

### input/ipc-handlers.ts

`sanitizeFileStem` strips anything outside `[A-Za-z0-9_-]`, so a device supplied name can never contain a path separator, `..` or a drive letter. The USB device chooser prefers a Nintendo device (vendor `0x057E`).

### input/native/sdl3/

Loader and typed wrapper for the SDL3 gamepad Node-API addon. The addon is required at runtime on first use, so a missing or unbuilt addon degrades to "this transport is unavailable" and the app still starts. The load result is cached, failure included. Pure transport: no button or axis interpretation happens here.

Addon candidates, in priority order: packaged resources (shipped as extraResources, never packed into asar, see `scripts/build/electron-builder.config.js`; `resourcesPath` is only set once packaged); the source tree prebuilt resolved from the bundled main (the build puts main at `apps/desktop/dist/electron`, two levels below the app folder, so `__dirname` never holds a `prebuilds/` of its own); the same path from `process.cwd()` (`brock dev` runs in the app folder); then a local dev build.

The types describe the raw transport surface only: the fixed SDL button order and axis layout the addon reports. They carry no device specific or SNES mapping meaning.

- `connectionState` is bus agnostic, read from `SDL_GetJoystickConnectionState`. It is never a USB versus Bluetooth answer: SDL does not report bus type for an XInput backed pad, only whether the link itself is wired.
- `sdlType` is SDL's own family for the device (`SDL_GamepadType`, lowercased and hyphenated). It is never a VID/PID guess.
- `hasButton` is indexed by the `SDL_GamepadButton` enum (from `SDL_GamepadHasButton`); `hasAxis` by `SDL_GamepadAxis`, length 6 (from `SDL_GamepadHasAxis`). `buttonLabels` is indexed like `hasButton`: the label the pad prints (`SDL_GamepadButtonLabel`: A, B, X, Y, CROSS, CIRCLE, SQUARE, TRIANGLE), or empty when SDL does not know.
- `SDL_BUTTON_NAMES` and `SDL_AXIS_NAMES` name each index of a `state` event's `buttons` and `axes` arrays, in SDL's fixed order, so a caller never guesses which slot means what.
- A `joystick` event is emitted only while a joystick capture is active and only when something changed. Its arrays are sized to the device's own button, axis and hat counts, the raw indices a gamecontrollerdb line is written in, not the fixed gamepad layout.
- `gamepad-hold` follows `releaseGamepads` or `restoreGamepads`, so a caller can tell whether the subsystem is held open for a raw HID capture.
- `enumerateHid` lists every HID device the OS reports, whether or not SDL could claim it, so "held by another application" can be told apart from "not plugged in". It is filtered to the generic desktop usage page's joystick, gamepad and multi axis usages (HID spec constants, not a device list). `busType` is `unknown` when the OS does not report one.
- `rescan` tears the gamepad subsystem down and back up so SDL probes again devices it cached as unavailable at startup. It is fire and forget: watch for `removed` and `added` events.
- `releaseGamepads` closes every open gamepad and joystick and quits the gamepad subsystem, so a raw HID open on the same device can succeed. The SDL thread and `SDL_hid_*` stay alive. `restoreGamepads` brings the subsystem back, replaying every mapping this addon added; it works without a prior release, and SDL synthesizes `added` events again.
- `startRawCapture` opens a diagnostic raw HID capture, one at a time (a second call closes the first). Its result is never a bare boolean. `unavailable-exclusive` is the expected case for a controller SDL already holds through libusb: the open failing is not a bug, it is what the UI needs to explain. `not-found` means no matching device is enumerable; `error` carries what SDL reported.
- `listJoysticks` lists every joystick SDL has open, mapped or not. A controller with no mapping appears here but never through the gamepad `added` and `removed` events; this is what makes it visible to a mapping generator at all.

## display

### display/mode-switch/

Applies a synced refresh rate for the duration of fullscreen, and puts the original back. It is driven from the main process, not the renderer, because the restore has to survive the window closing, the app quitting, or the process dying. A player stranded on a rate they did not choose is a worse bug than the judder this fixes. It only changes the rate in fullscreen; windowed mode is composited by the desktop anyway.

- `Preference.targetHz` is the desired rate, or 0 for "the highest multiple of 60 this display offers".
- `rateToRestore` is the rate in effect before anything was touched. Non null means a restore is owed. It is set only after a switch succeeded, and only to the rate the display came from.
- `syncedRateMap` maps each multiple of 60 label to the actual rate to request for it. A display often reports both the NTSC variant and the exact rate (Windows lists 59 and 60, 119 and 120). Both pass the tolerance check, but the game runs at 60.0988, so 59.94 slips a frame every few seconds. Each group collapses to one label with the closest match, which is why the exact rate may differ from the label.
- The current rate is compared against the exact rate, not the label, so sitting on 59.94 still moves to 60.
- `restoreRate` clears the owed rate before calling the driver, so a failing driver cannot leave the app retrying forever on every event.
- Leaving fullscreen always restores. Turning the preference off mid session hands the display back at once. `restoreOnShutdown` is the last restore at app shutdown, so a quit from fullscreen cannot strand the display.
- `applyPermanently` is the explicit "Change refresh rate" action. Nothing is recorded for restoring, because the player asked for this to stick, and a pending fullscreen restore is dropped: it would drag the display back off the rate just chosen.

### display/refresh-rate.ts

The refresh rate of the display the game window is on, not the primary display. Electron reports the current rate only, with no mode list. The mode list comes from the native driver where available and is empty otherwise; the renderer then derives candidate rates arithmetically. A `displayFrequency` of 0 means the platform declined to report one, not a real 0 Hz. The driver already restricts itself to the current resolution, so every rate it lists is one a switch reaches without changing resolution. With no display server (headless CI), it reports nothing and the renderer measures the rate itself.

### display/native/

`getDisplayModeDriver` picks the platform's display mode driver once, at first use; constructing one loads native bindings, which startup should not pay for. A platform without one gets an inert driver that reports why, so callers never branch on `process.platform` themselves.

Every driver method may fail softly. `available` false means no binding could load or the OS has no implementation. An empty rate list, or false from `setRate`, means the platform has one but the display or compositor would not cooperate. The caller reports either state to the user. `unavailableReason` is the text the UI shows. `listRates` returns the rates offered at the current resolution, so switching changes only the rate.

### display/native/koffi-loader.ts

koffi is required at runtime, lazily and cached, so a missing or unloadable binding degrades to "this setting is unavailable" and the app still starts. koffi is Node-API based, so it loads under Electron's ABI without a rebuild (verified against Electron 42 and Node 24). It is only ever reached from the main process: native code has no business in the renderer or the mobile bundle.

### display/native/windows.ts

Windows driver, through user32 via koffi. Two things learned the hard way:

- Electron reports DIPs while the OS reports physical pixels (a 4K screen at 200% scaling is 1920x1080 to Electron and 3840x2160 to user32). Mode matching therefore uses the values read back from `EnumDisplaySettingsW`, never Electron's display size.
- Windows rounds rates to whole numbers, reporting 119 and 120 for 119.88.

`CDS_FULLSCREEN` asks Windows to treat the change as belonging to this process, so the original mode comes back on its own after a crash. Every resolution, rate and depth combination is its own mode entry, so the list is long (`MAX_MODES`). `setRate` restates the resolution along with the rate (`DM_PELSWIDTH | DM_PELSHEIGHT | DM_DISPLAYFREQUENCY`), so a driver that ignores a partial DEVMODE cannot read it as a resolution change.

### display/native/macos.ts

macOS driver, through CoreGraphics and CoreFoundation via koffi. `CGDisplayModeGetRefreshRate` returns 0 for displays that do not report a rate, so 0 means unknown and is filtered out. The two Copy calls transfer ownership, so `withModes` releases both after every use; skipping that would leak on every poll. Not verified on hardware: it was written from the documented CoreGraphics surface (opaque handles only), and every path fails softly, so the worst case on an untested Mac is the setting declaring itself unavailable.

### display/native/linux.ts

Linux driver, through the xrandr CLI. No FFI on purpose: xrandr ships with every X11 desktop, and libXrandr's soname varies by distribution. Wayland is the limitation: xrandr reports nothing or only sees XWayland, so the rate list is empty and the setting reports itself unavailable. Per compositor tools (wlr-randr, kscreen-doctor) would each need their own driver. Not verified on hardware; it needs a pass in the Linux VM.

The `xrandr` output lists an output line, then indented mode lines whose rates carry markers:

```
DP-1 connected primary 2560x1440+0+0 ...
   2560x1440    143.97*+ 120.00   99.95    59.95
```

`*` marks the active rate and `+` the preferred one, so both are stripped before parsing. Parsing stops at the first connected output with a geometry, which is the one in use, and a new unindented line ends that output's mode block. xrandr exits 0 even when a rate is silently rounded, so `setRate` confirms by reading the rate back. The driver probes once at construction, which also tells whether the session is one xrandr can see.

## documents

### documents/document-associations/

Registers the app's document types with Windows (`.msul` music packs, `.rsp` characters, `.rlang` language sets) and takes them back out, along with the store's install link type the app claims at run time. electron-builder only writes associations through its NSIS and MSI installers, and Windows ships through Velopack from a plain directory build, which registers no file types.

The keys are written under HKCU classes (no elevation, right for a per user install) through `reg.exe` with an argument array: no dependency, no shell quoting. This runs inside Velopack's fast callbacks, which exit the process the moment the callback returns, so the work is synchronous on purpose. A failure is logged and swallowed: it must never turn into an install that did not complete. Deleting a key that is already absent is not an error.

The `.msul` icon ships as an extra resource (see the electron-builder config); the other types use the app's own icon.

`notifyShell` tells the shell the associations changed. Without it a running Explorer keeps showing "MSUL File" with a blank icon until restarted (verified). No Node binding exists, so it goes through a one line PowerShell call to `SHChangeNotify`. It is best effort: the keys are already written, and Explorer catches up on its next restart.

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

### msu/open-file.ts

Opening a pack file from the desktop. Windows and Linux pass the path in argv; macOS delivers an `open-file` event, at any time. Both dispatch on the extension. A `.msul` music pack goes to the renderer, which owns that import; a `.rsp` character or a `.rlang` language set is imported here through the shared installers. There is no single instance lock (a person's session and an automated one must coexist), so a file association launch is a new process that starts with a path; no attempt is made to find a running instance. Pack paths in argv skip the executable and any `--flags`. A file association launch races window creation, so dispatch waits for the renderer to finish loading.

### msu/optimize-handlers.ts

IPC for normalising a pack to one audio format: measure first, convert second. They are two channels, not one call with a flag: measuring encodes a slice of every candidate, so it wants its own progress and result, and nothing is written until someone has read the numbers and said yes. Both report per file progress on one event. Pack and file names come from the renderer, so they become paths only through `pack-fs/`, which refuses a traversal. Both operations need the encoder, so `requireEncoder` throws when it is missing.

### msu/pack-fs/

Where one pack's files are on disk, and its manifest read and written, over Node fs. Pack and file names come from the renderer, so every name that becomes a path segment is checked for traversal before it is joined (`safeName`). The manifest format comes from `shared/storage/msu-edit`, so the Node handlers and the FileStore backed renderer cannot drift on what a `pack.json` is. A pack installed from the Hookshop is read only (`refuseInstalledPack` throws).

A pack's name is its folder; the name inside its settings follows it on read and on write. `readPackManifest` returns null for a classic pack (no manifest) and for one that is unreadable or of an unknown version. The file inventory uses the same rule as the FileStore side (`shared/storage/msu-inventory`): regular files, manifest excepted. It is read from the folder at write time; a file that vanishes mid listing is skipped.

### msu/resume-handlers.ts

Per save music resume sidecars over Node fs. Each `{save}.msu.json` is written beside the save it belongs to. Quick slots carry no manifest, so a sidecar is the one mechanism that fits all three save kinds. The naming comes from `shared/storage/save-paths`, so the renderer's FileStore path and this one address the same file.

### msu/optimize/analyze.ts

The measured preview: every file the pack would convert, and what each would cost. Every audio file not in the target format is measured, mp3 and ogg included: a pack in one format is the point. An already compressed source will grow, and its row says so. Each measurement encodes a short slice, one encoder run per file; the progress report keeps that from looking like a hang. The list is not "everything outside the target format": an original a previous run already converted sits beside its copy until it is thrown out, and measuring it would promise a second encode. One scratch folder serves the whole pass and is removed whatever happens.

### msu/optimize/audio-source.ts

How one pack file is handed to the encoder, and how long it is. An MSU-1 `.pcm` has no container: the format fixes rate, channels and sample format, so the decoder is told all three before `-i` and the duration follows from the byte count. Everything else carries a container, so a probe identifies it and reports the duration. An empty probe is a file this operation cannot touch; that is the only thing that drops a file from a run. The eight byte MSU-1 header is skipped. It is two whole sample frames, so leaving it in would not shift the channels, only put one click at the very start. Only the raw format carries a repeat point in its header.

### msu/optimize/flac-encode.ts

The encoder invocation lives in one place, so the slice that measures a file and the run that converts it use the same compression level. `-map 0:a:0` takes the first audio stream only, so an mp3 with cover art does not gain a video stream. The sample format is left to the encoder, not pinned to 16 bit: a 24 bit source pinned to 16 would silently stop being lossless. `FLAC_COMPRESSION_LEVEL` is the encoder effort on a 0 to 12 scale; above 5 saves about 2% more for several times the time. An encode uses the encode time budget, not the probe one, since a long track legitimately runs for minutes. A failure throws the encoder's last line, so it names the file's own problem.

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

### tools/ffmpeg-install.ts

Installs the optional ffmpeg tool on request: resolve the current release asset, download it, verify it, keep the two binaries. The order is the security property: the checksum is checked while the download is still an inert file in temp. One install runs at a time; a second request joins the running one.

### tools/ipc-handlers.ts

IPC for the optional ffmpeg tool: query, install, probe. The probe takes a Data root relative POSIX path, not an absolute one, so the renderer never names a path outside the app's own storage. Traversal out of the root is refused the same way the generic file store refuses it.

### tools/ffmpeg-locate/

Finds a usable ffmpeg and ffprobe pair without installing anything: the managed install under the app's data root, then (on a platform with no download) PATH. A PATH folder must hold both binaries; one alone is no use. A system copy is never checksum verified: it is the user's own and the app did not fetch it. `ffmpegState` reports the result as ready, installable, or not served here (on Linux it names the package to install).

### tools/ffmpeg-paths/

Where the optional ffmpeg binaries live, and which platforms the app installs for (Windows only, `canDownload`). The tool folder is `<data>/tools/ffmpeg`, under the app's own data root, so an isolated `--user-data` launch gets its own copy and the real profile is never touched. Only the two binaries are kept; everything else in the archive is discarded. `managedBinaries` returns the two paths a managed install occupies, whether or not they exist yet.

### tools/ffmpeg-release.ts

Resolves the pinned ffmpeg asset name against BtbN's `latest` release right before every install, since that release's bytes (and so its checksum) change whenever BtbN rebuilds it. The GitHub REST API returns the asset's own published sha256 digest alongside its size and download URL in one call. Nothing here computes or guesses a checksum: it relays what BtbN published for the exact bytes about to be fetched.

### tools/ffmpeg-run/

Runs the optional ffmpeg tool. Arguments are always an array, never a shell string: paths contain spaces on Windows, and a shell makes every file name an injection site.

- `PROBE_TIMEOUT_MS` (30 s) is long enough for a probe of a large file on a cold disk and short enough not to hang the UI.
- `ENCODE_TIMEOUT_MS` (10 min) exists because a long track at a real compression level can run for minutes, and killing it mid write leaves a truncated output. The probe timeout once silently turned long encodes into failures.
- `probeFile` returns what ffprobe says about one media file, or null when the tool is not installed, the file is not media, or the probe failed. Null is a normal answer, not an error. Each file is asked once (see `probe-cache/`).

### tools/ffmpeg-verify.ts

The checksum gate for a downloaded tool archive. It runs before anything is extracted: an archive that has not been verified must never become an executable that then runs. The expected size and digest come from `ffmpeg-release.ts`, resolved fresh against the current release right before the download, never a build time constant. A download that fails any check is deleted so a bad archive cannot be reused. `sha256File` reads the file as a stream, so a large archive is not buffered.

### tools/ffprobe-parse.ts

Reads ffprobe's JSON report into the fields kept. ffprobe emits numbers as strings and "N/A" for anything unstated, so every value becomes a finite number or null, never NaN. The per stream figure wins and the container's is the fallback (VBR streams often omit theirs).

### tools/probe-cache/

Remembers what ffprobe said about a file, so it is asked once per file, not once per draw of the files list (a native process launch per encoded file, per redraw). Entries are keyed on path, size and mtime, so a rewritten file misses on its own and nothing is invalidated by hand. Only a real answer is kept: a null (tool missing, file unreadable) can change without the file changing, so it is asked again next time. The cache is one JSON file under the app's data root (`cache/audio-probe.json`), written at most once per second. A lost cache write only costs a probe.

## updater

### updater/ (overview)

The updater's IPC surface and its startup check. Velopack owns the download, the verification and the swap. What lives here is the decision to check, the list of versions the picker offers, and the hand off.

### updater/run-check.ts

Without Velopack there is nothing to install with, but the release list still answers the only question the update badge asks (`check-without-velopack.ts`). macOS lives on that path. With Velopack, `AllowVersionDowngrade` also makes its check answer with an older build, so a target that is not newer than the running version is treated as up to date; otherwise a machine on the newest release would be told an earlier version "is available". The version list is fetched alongside a found update so the picker is populated when it opens. Velopack's result carries no asset list, so the save state verdict starts as unverifiable and the release listing fills it in.

### updater/register-updater-handlers.ts

- `updater:capabilities`: the update harness claims the picker so every version can be inspected side by side. Pressing install there still fails at Velopack, which is the truth.
- `updater:openReleasePage` is the way out for a build that can see an update but not apply one.
- `updater:listVersions` is only meaningful when this build can install, or the harness is up to look at choices. The plan is main process detail and is stripped; the renderer picks by version string.
- `updater:setPrefs` refreshes the list, because the pre release preference is part of the update source.
- `updater:apply` takes null for the newest release (resolved from the same list the picker shows) or a version string for that exact build.

### updater/apply-update.ts

Downloading and applying, for the newest release or a version the user picked. The download runs here so its progress shows in the app's own UI; the swap runs in Velopack's Update.exe after the app exits, which is what lets it replace the files the app runs from. The apply is silent (no Velopack UI, the app already showed its own progress) and restarts the app once the swap is done.

The plan from the feed is handed over in Velopack's own shape: the base release and the ordered deltas that walk to the target, or an empty list when the plan decided a full install is the only option. This once passed no deltas at all, so every explicitly picked version downloaded a whole package while the picker advertised the delta size; both now read the same plan. There is deliberately no separate "install the newest" path. That one asked Velopack to work out the target itself, which could answer nothing while the picker's list was fully populated, and reported that as "there is no newer version to install".

### updater/latest-release.ts

The newest published version, read straight from the release page. This is the check for platforms that cannot install an update themselves. It needs nothing but the release list, so it works wherever the app runs, and asks the same question the in app updater asks: is there something newer than this build? `release-page-url.ts` is where someone is sent when the app cannot install the update for them.

### updater/target-format.ts

Whether a version being offered reads the save states this build writes. The format id travels in the asset file name (`state-format-<id>.json`), so the release listing the updater already fetches answers for every version at once; the file's contents are for a human reading the release page. A version that publishes no such asset is unverifiable, never "compatible": guessing optimistically is how save states get lost without warning. An asset that is present but unparseable is a stronger signal than a missing one (something published a format and it could not be read). Releases from before the id was published are not unknown: every build then wrote the baseline format. Without that rule every historical version would show a warning.

### updater/update-manager/

The Velopack `UpdateManager` is built on demand. It throws when the app was not installed by Velopack (every dev run and portable copy), and the pre release preference is part of the source, so switching it builds a new one. `getUpdateManager` returns null when this build cannot update itself (a dev run, a portable copy, anything Velopack does not recognise, or a system Velopack cannot load on); callers treat null as "not available", not an error. Downgrades are allowed because the version picker offers older builds on purpose; without that, stepping back off a bad release is refused.

- `--update-source=<dir>` points the updater at a local folder of packed releases, so the install and update path can be exercised before anything is published.
- `isUpdateHarness` is true when a developer pointed the updater at a fixture origin (`ROTP_UPDATE_API_ORIGIN`). A dev run then behaves like a packaged one for checking and listing, so the dialog can be looked at without publishing. Applying still goes through Velopack and still fails there.
- `canCheckForUpdates` is true for any packaged build, including ones that cannot install what they find: knowing an update exists is useful even when applying means the release page.

### updater/updater-prefs/

The one updater preference is whether pre releases are offered. It is app level, not per profile, because it decides what the app installs, not how it plays. Stable is the default: anyone who wants pre releases opts in, and a fresh install does not inherit that choice.

### updater/updater.constants.ts

- `API_ORIGIN` is where the release list is read from. It can be overridden so the whole update path can point at a local fixture server; it is unset in every shipped build.
- Releases are tagged `v<version>`, which is how a feed entry finds its release.
- `FIRST_CHECK_DELAY_MS` delays the first check so startup work does not compete with it.
- `FEED_FILE` is the release index Velopack writes next to each release. The channel suffix is the platform name (no build passes `--channel`), so one file lists every version.
- `MAX_DELTAS` is how many deltas Velopack chains before pulling the whole package. The picker's size uses the same number, or the dialog promises 80 KB and fetches 137 MB.

### updater/updater.type.ts

A `VersionCandidate` is a version the picker offers plus how to get there: the base release and the ordered deltas Velopack walks. The plan stays in the main process, since the renderer picks by version string and never sees a feed entry.

### updater/velopack-loader.ts

Velopack is required at runtime, lazily and cached, not imported statically. Velopack loads its native module the moment the package is required (its index lists the loader's keys, which loads the binding), and the prebuilt Linux module needs a recent glibc (2.39 as of 1.2.161). A static import would throw before any app code runs, and the app would never start on older distros. Loaded here, a failure degrades to "no self update".

### updater/version-compare.ts

Version ordering, on its own so the feed and the format check can both use it without importing each other. It compares x.y.z numerically; a build with a pre release suffix sorts below a plain one.

### updater/version-feed.ts

Every installable version, for the picker, newest first. Velopack's own check only reports the newest applicable release, so the list comes from the release index it publishes beside each release. That index carries the checksums, which is why the picker cannot be built from the GitHub API alone: an entry without its hash fails verification at install time. The release page supplies what the index does not: which tags are pre releases and when each was published. The newest index lists every release Velopack knew about when it was packed, so one fetch covers the whole history. The index is accepted as an object with an `Assets` array or as a bare array, so a format change does not take the picker with it. Both the full and delta tables are built before any row is planned, since a chain is only known once every version between here and there has been seen. Each row's save state verdict is read off the release listing already in hand.

`planFor` decides how to get from the current version to a target, in the shape Velopack asks for. Velopack's model is a walk: a base full release plus the ordered deltas that carry it to the target (`UpdateInfo.DeltasToTarget`), and `downloadUpdateAsync` falls back to the full package by itself if preparing any delta fails. This is deliberately the one place that decision is made: the size in the picker and the bytes the download fetches both come from this plan, because computing them separately is how the dialog once promised 80 KB while the code fetched a full package. Deltas are dropped, leaving a plain full install, when the target is not newer (a downgrade or a reinstall, where Velopack only allows full updates), when the installed version is not in the feed (no base to walk from), when any version in between has no delta published, or when the chain is longer than Velopack will chain (`MaximumDeltasBeforeFallback`).

## recommendations

### recommendations/recommendation-handlers.ts

The recommendation store lives in the main process, not in the renderer, because both of its mutating operations are a read, modify, write over a whole collection file. Splitting them across an IPC round trip would put the read and the write on opposite sides of a boundary two callers can interleave on. Keeping the collection on this side means one queue (see `recommendation-files/`) makes every caller's operations sequential, which is what a batch accept relies on.

### recommendations/recommendation-files/

The disk adapter behind `RecommendationStorage`: one file per collection at `Data/recommendations/<kind>.json`. The relative path comes from `recommendationFile`, so the engine stays the single source of truth. Operations on one kind are serialized behind a per kind queue (`queued` runs a task after everything already queued for that kind, failure included). The queue wraps the whole store call, not just the save, or two decisions could read the same snapshot and overwrite each other. Neither half of `recommendationStorage` queues: the handler already holds this kind's turn for the whole operation, and a load or save that tried to take that turn again would wait on itself.

## store (the Hookshop)

### store/install.ts

Installing one item: the API grants a download of an approved version, the bytes land in a temp file with progress, the size and sha256 are checked, the container's installer unpacks them, and the registry records what it wrote. Installing an item that is already installed is an update: the new copy goes in first, profiles that used the old copy are pointed at the new one, the old copy is removed, and the new one moves to its own name now that it is free (`settledName`). A language is baked into the game assets after, the way the language editor's save does it. A cancel is honoured up to the end of verification; after that the files are being written.

### store/ipc-handlers.ts

The Hookshop channels. Every read goes to the store API with the device token from the main process. Install, uninstall and duplicate run here too, so the renderer holds neither the token nor a download URL, and only this process writes into an installed item.

### store/boot/

The Hookshop's part of startup, in the order `main.ts` calls it. Before the app is ready, macOS link events are caught (`listenForOpenUrl`). Once it is ready and before any window, a process the browser started with a link hands it to the player's running app and quits (`quitIfHandedOff`, which returns true while the process is exiting). Once the main window exists, links reach that window, the player's app listens for links other processes hand over, and the install link type is claimed (`bootStoreLinks`). Automation launches skip the hand off, the listening and the claim.

### store/catalog/

The catalogue reads: the home page, every published item, one item. The API pages the item list; `fetchItems` follows the cursor so the tab gets the whole list at once and searches it locally, as the store site does. `MAX_PAGES` is a backstop against a cursor that never ends, far above the catalogue's size. The item id and kind come from the renderer, so both are checked before they reach a URL.

### store/deep-link/

`relic-of-the-past://install` links. The protocol is claimed by the player's own app only: never by an automation launch, and never by a development build, which would take the links away from the installed app. A link arrives three ways: in argv when the browser started this process, as the macOS `open-url` event (possibly before the app is ready, so it is registered early), or over the hand off pipe from a process the browser started. Each one is held until the renderer's shell has painted (`window:shellReady`), then sent as `store:openInstall`, and the window comes forward, since the player just asked for the install in the browser.

### store/duplicate.ts

Duplicating an installed item into one the player can edit. The install record names the item and its licence; a licence that does not allow copies is refused with its reason. Otherwise the kind's duplicate writes the copy through the store's in process file store, crediting the original in `basedOn`. A language copy is baked into the game assets after, the way an install does it.

### store/handoff-message/

What crosses the hand off pipe: one install link on one line, answered with one line. Anything else is refused, since the pipe is open to every process of this user: an oversized message, a second line, or text that is not exactly an install link. An install link is at most 256 characters; `MAX_MESSAGE_CHARS` leaves room for the line end and nothing more. `parseHandoffMessage` returns null while the line is incomplete or when it is refused; `isMessagePending` says whether the text so far can still become a message.

### store/link-handoff/

Brings a store install link to the running app without a single instance lock. The player's app listens on a pipe named after its user data folder (a named pipe on Windows, a socket in that folder elsewhere), so a portable copy and an installed one keep their own. A process the browser started with a link tries the pipe first: when an app answers, it hands the link over and quits; when none does, it starts normally and installs the link itself. Automation launches never listen and never hand off, so a test window and the player's window never trade links. When another copy already listens, it keeps the links. A socket file left by an app that exited is stale (nothing answers on it) and is removed before listening again; Windows pipes never linger.

### store/install-jobs/

The installs running now, one per item. A second request for an item that is already installing is refused (`beginJob` returns null), and cancel finds the install's controller here.

### store/installed-registry/

What the Hookshop installed: `store/installed.json` under the Data root, one record per item. It runs on the `FileStore` port, so a test can drive it on a store in memory. Every change is a read, modify, write in one queue, so two installs finishing together never drop each other's record. `put` adds the record or replaces the one for the same item (an update). A file that does not parse reads as empty, and a record missing a field is skipped, so a damaged file never blocks the tab. A record without a well formed origin (listing name, author as a person, licence id, none empty) is skipped the same way.

### store/store-files/

The Data root the Hookshop installs into, and the one installed registry every install and uninstall shares, so its write queue covers them all.

### store/repoint-profiles.ts

A pack a profile selects is never left dangling. Each kind lives in one field: a music pack in the profile's `msuPack`, a language set in its `language`, a character in its config's `linkSprite`. Every profile is checked, since the library is global. An update points the selection at the new copy; an uninstall passes null, which is each field's default. It returns the ids of the profiles that changed.

### store/run-install/

The install and uninstall channels around `installItem` and `uninstallItem`: the request from the renderer is checked, one install per item runs at a time, each step is sent to the window as `store:installProgress`, and the outcome becomes the channel's answer.

### store/store-client/

One call to the store API as this device. The device token is read here and never leaves the main process. No token, or a 401, reads as signed out so the Hookshop tab can show the sign in card; a 401 also drops the token, the same as the identity check does.

### store/store-result/

Wraps a store call into the answer every read channel gives: its data, or why not.

### store/uninstall/

Removing what the Hookshop installed. The profiles let go of the pack first (`retirePack` points them at the replacement, or null for the default), then its installer removes exactly what it wrote, then the record goes. A language change is baked into the game assets after, the way the language editor's save does it.

### store/verify-download/

The checks a download passes before anything is unpacked. The grant must describe the item that was asked for, in the container its kind ships in, within the kind's size cap, over https, naming its author and licence for the install record. The bytes that arrived must match its size and sha256 exactly.

## hub

### hub/client/

One JSON call to a site's API. The device token rides as a Bearer header when one is given. A non 2xx answer becomes an error carrying the status and the API's own message, so callers can tell a revoked token (401) from a network failure.

### hub/device-auth/

The device code sign in. Begin asks the API for a short user code, hands the code to the renderer, opens the site on the confirm page and polls until the person confirmed (a token comes back once), denied, or the code expired. One sign in runs at a time; cancel ends it. A newer begin may already own the cancel slot, so a run only clears its own handle when it ends. `deviceLabel` is the text the site shows on the confirm page and the devices list, for example "Windows · DESKTOP-4F2".

### hub/endpoints/

Where the sites' APIs live. Each answers under `/api` on its own origin, through its hosting rewrite, so the device token never crosses an origin. The origins are public, the same trust model as the GitHub URL in the updater. Every call names the API it goes to; one device token serves them all. The Hookshop origin is a placeholder until the store's domain exists. A query value that is empty or absent is left out of the URL.

### hub/identity.ts

Who this device is signed in as: `GET /me` with the stored token. A 401 means the token was revoked on the site or the device row is gone, so the token is dropped and the app reads as signed out. Any other failure (offline, 5xx) keeps the token and reports null this time.

### hub/ipc-handlers.ts

The shared account channels: device sign in, cancel, sign out and who am I. The sign in runs against the API of the site that asked, so the confirm page opens on that site; the token it yields serves every site. Anything the renderer sends that is not a known site signs in to the Sanctuary.

### hub/token-store/

The device token, one file in userData, encrypted with the OS keychain through `safeStorage`. One token serves every site's API; the file keeps its first name (`sanctuary-device.token`) so a sign in made before the hub existed still counts. Without a working `safeStorage` the token is never written: a plain text token on disk is worse than asking the person to sign in again next launch. `saveToken` throws then, so the sign in reports it. `readToken` returns null when no token is stored or the stored one can no longer be decrypted.

## sanctuary

### sanctuary/ipc-handlers.ts

The Sanctuary's own channels: filing a report and retrying its zip upload. Signing in belongs to the shared account (`hub/ipc-handlers.ts`).

### sanctuary/report-attachment.ts

The zip a report carries, built with the debug report machinery, plus the counts the Sanctuary shows in its Reports table. The zip is held in the pending report cache under `pendingId` until it is uploaded. Nothing to attach (no saves, no checked recordings) is not a failure: the report files plain.

### sanctuary/submit-report/

Filing a report: build the zip, `POST /reports` (which creates the record and the GitHub issue in one call and answers with a presigned PUT), send the zip straight to the bucket, then `POST /reports/:id/complete`. A failed upload leaves the record with no zip and the zip in the pending cache under the report id, so a retry sends the same bytes again without rebuilding. `uploadUrls` keeps the presigned PUT per report id for that retry. The zip is cached under a local id before the API mints the report id, so it is moved to the report id the renderer holds. Sessions are marked sent only once the upload went through.

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

Mints both halves of a brand new crossing atomically. Every `toConnectionId` is required (`shared/game/data/types/connection.ts`), so a crossing with no partner mints two ids on one allocator turn and writes both halves before either id is observable. When both halves land in one file, it is one edit, so a failure mid write cannot leave a dangling partner. The halves usually belong to different screens, so two files: both edits are validated before either file is touched. If the second `writeFile` fails (a full disk), the first half is rolled back best effort, so a dangling `toConnectionId` cannot survive silently; the error says whether the rollback worked.

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

The single owner of record numbering. Ids are never supplied by a caller: it reads every id in a kind's source tree and hands out the next free `<kind>-NNN` on one serialized queue, so an id cannot be minted twice. Each task starts only after the previous one finished reading and its caller has written, so a concurrent pair cannot both see the same highest id; `withAllocatedIds` runs the scan and the caller's write on that queue. `KIND_ROOTS` lists where each kind's records live, relative to `shared/game/data/records/`; it is a list because a kind may one day spread over more than one folder.

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

### saves/manifest-store.ts

A generic manifest backed save store: `{id}.sav` plus an optional `{id}.png` in a per profile folder, tracked by `manifest.json`. The normal and auto save stores share it; each supplies the folder and the entry to info mapping, and composes overwrite, rename and prune from the returned primitives. A save's music resume sidecar (`{id}.msu.json`) is written by the audio engine but owned by the save. Writing over a save removes its sidecar, because the position belonged to the state that was there before; a caller with a fresh snapshot writes it afterwards. `list` skips orphaned manifest entries whose file is missing and returns the newest first.

### saves/store/

Per profile SRAM and quick save slots. Writing SRAM first moves the existing `sram.dat` to `sram.bak`. A quick slot is written over in place, so its music resume sidecar goes with the state it described; a caller with a fresh snapshot writes it after the call. There are 12 quick slots (`QUICK_SAVE_SLOTS`); slot info lists only the slots that exist.

### saves/auto-store/

Auto saves are pruned oldest first down to the requested count, capped at `ABSOLUTE_MAX_ENTRIES` (20); the default is 5.

## profiles

### profiles/ipc-handlers.ts

`profiles:update` whitelists by design, with the rule shared with the renderer's store (`shared/storage/profile-patch.ts`): an absent field is left alone, null clears it, and of `randomizer` only the connection moves. `updateProfile` in `store/` is a whole profile write; field whitelisting happens in this handler, so `randomizer` stays exactly as loaded and is never patched there.

## roms

### roms/ipc-handlers.ts

A resolved ROM is copied into the roms folder, and the answer says whether it already existed. For a URL import, a download that is not an archive is accepted as a raw ROM when plausible (not empty, at most `RAW_ROM_MAX_BYTES`, 8 MB); a real archive with no ROM falls through to the "no ROM file found" error.

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

### diagnostics/debug-report/build-zip.ts

Assembles one debug report zip from the collected files, what the renderer sent, and the capture sessions the picker checked.

### diagnostics/debug-report/capture-frame-budget/

Frame selection math for downsampling a capture session to fit a byte budget, shared between the video path (budget against the encoded video's own size) and the no ffmpeg fallback (budget against raw PNG bytes). Frames are picked at even intervals across the whole sequence, so downsampling thins detail out evenly and never cuts the start or the end off. `budgetedFrameCount` assumes size scales roughly linearly with frame count; a session already under budget keeps every frame.

### diagnostics/debug-report/capture-manifest/

Tracks which capture sessions have been uploaded in a report, per profile, at `debug-captures/<profileId>/manifest.json`. Nothing else marks a session sent: building a report deletes nothing, so a cancelled dialog or a failed upload leaves every session as selectable as before. `forgetSession` runs when a session is deleted outright, so its manifest entry does not linger.

### diagnostics/debug-report/collect-capture-sessions.ts

Reads what a report ships for each capture session the picker checked: the position timeline plus whatever `finalize-capture-session/` put in `packaged/` (a size budgeted video, or a PNG fallback). Never the unlimited local frames or full video, which stay on disk for review whether or not a report is sent. Which sessions ship is the caller's explicit choice (`sessionKeys`, from the picker); nothing here decides eligibility or changes disk state. A session is marked sent only once the report uploads (`capture-manifest/`).

### diagnostics/debug-report/collect-files.ts

Gathers everything a debug report bundles besides the save state, which the renderer already holds: the profile's settings and randomizer config (read off disk, so the renderer never threads live settings down through the packaging call), plus whichever of the app's always on log files exist for this session.

### diagnostics/debug-report/delete-session.ts

Deletes one capture session outright: frames, both videos, `snapshots.jsonl` and `packaged/`, everything under `debug-captures/<sessionKey>/`. The picker's own delete action confirms in the renderer first; this performs the removal with no further checks.

### diagnostics/debug-report/finalize-capture-session/

Runs the moment a recording stops: writes every raw frame and the position timeline for that session under `profiles/<profileId>/debug-captures/<sessionKey>/`, beside the profile's saves and config. Living under the profile means deleting the profile takes its capture data with it.

Two videos come out, because the local copy and the one a report ships follow different rules. The local recording has no size limit (only the 5 minute time limit the renderer's store enforces), so `video-full.mp4` encodes every captured frame. `packaged/` holds what a report sends: a video downsampled to fit `PACKAGED_BUDGET_BYTES` (2 MB), built by encoding again an evenly spread subset of the same frames once the full video turns out over budget. Without ffmpeg it ships that same evenly spread subset as raw PNGs, sized against their own byte count.

### diagnostics/debug-report/list-sessions.ts

The session listing for the bug report picker: every recorded capture session for a profile, with a small preview and its sent state. Unlike `collect-capture-sessions.ts`, it is not filtered to eligible sessions, since the player picks what ships. Without ffmpeg, `packaged/` holds the evenly spread PNG subset instead of a video, and every one of those frames goes to the picker so it can cycle through them as a stand in video.

### diagnostics/debug-report/pending-reports/

An in memory cache of built but not yet uploaded debug report zips, keyed by the report id made at build time. Building (collecting saves, encoding capture video, zipping) is local and can be slow; sending is the only step that touches the network and can fail on its own, and it happens only once the GitHub issue carrying this id is confirmed created. Splitting them means a failed upload retries only the send, against the same cached zip. Entries older than the TTL (30 minutes) are dropped lazily on lookup, since a report left unsent that long is better rebuilt; the TTL is generous because the id also has to survive however long the user spends filling in the bug report form. A lookup returns the whole entry, because a send also needs the session keys and profile id to mark them sent.

## protocol

### protocol/

`app-sprite://sprites/<romStem>/<file>.png` is served from the data root's `sprites/` folder, the same root the renderer's FileStore lists when it checks whether a set is extracted, so a `--user-data` override moves both together. `app-debug-capture://captures/<profileId>/<sessionKey>/<file>` is served from a profile's `debug-captures/` folder, so the bug report session picker can preview a recording's video (or a frame PNG without ffmpeg) without piping bytes through IPC. The `sprites` and `captures` hosts are labels, unused by code. Both schemes are registered as standard, so Chromium hands the path over percent encoded (spaces, commas and parentheses in a ROM stem included) with dot segments already collapsed; it is decoded and encoded again as a proper file URL, so a stem holding `#` or `%` still resolves. The path functions are pure: the handler supplies the root.

## wasm

### wasm/ipc-handlers.ts

Serves the WASM core bytes to the renderer. In the built app the renderer loads over `file://`, where `fetch()` is blocked, so it asks the main process for the bytes and instantiates them with the non streaming `WebAssembly.instantiate`, which also avoids the `instantiateStreaming` renderer crash. The path mirrors the window's `loadFile('../renderer/index.html')` anchor.

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
