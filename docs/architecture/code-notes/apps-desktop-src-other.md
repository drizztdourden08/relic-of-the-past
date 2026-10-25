<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src (smaller areas)

Facts about the smaller areas of `apps/desktop/src/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/bug-report/

The renderer's half of the Sanctuary bug report; the dialog is Brock's and the transport runs in the main process (`apps/desktop/electron/sanctuary/bug-report/`). `useReportSnapshotOnOpen` sends the report context, the active profile and a live save state the moment the dialog opens, because only the renderer can read the running game. `useSignedOutIssueFallback` swaps in a transport that opens a prefilled GitHub issue while nobody is signed in, so a signed out player can still report; it puts `rotpBugReport` (the recordings section) back when it lets go. `useDefaultReportTitle` fills the title with the app version and the current screen each time the dialog opens, unless the caller passed its own title to `bugReport.open`. The dialog's recordings section is `views/BugReportRecordings`, shown only while debug logging is on and a game session has set the snapshot.

## apps/desktop/src/controller-report/

The app's side of the Controllers screens, which live in `@drizztdourden08/brock-input`. `rotp-controllers-module.ts` is a Brock renderer module whose provider mounts `ControllerReportHost`, the one place the report dialog (`apps/desktop/src/views/InputTester/`) is rendered, driven by `useControllerReportStore` (`open(deviceKey)` and `close`). `register-controller-hooks.ts` hands brock-input the three things only the game knows, at boot (`apps/desktop/src/boot/controller-hooks.task.ts`): the per-device "report this controller" action (`DEVICE_CARD_ACTIONS`), the "Sword Hit" rumble test (`RUMBLE_TESTS`, which plays through the game's haptic preview) and the glyph source that gives the pad overlay the app's button and controller art (`GLYPH_SOURCE`).

## apps/desktop/src/credits/

The project credits. Keep them in step with `CREDITS.md` at the repository root.

## apps/desktop/src/debug-report/debug-report.type.ts

- Types for the debug report tool (Contributor tab, gated by `GameSettings.allowDebugLogging`).
- `DebugCaptureSnapshot` is one sample of where Link and the game were, taken while capture is running. `session` numbers the start and stop cycle it belongs to (1, 2, ...), so several recordings in one report stay distinguishable.
- `DebugCaptureScreenshot` is one frame grabbed alongside a snapshot, only while capture is running.
- `DebugCaptureFinalizeInput` is what the renderer hands off the moment a recording stops: the raw frames and the position timeline for that one session, keyed by `sessionKey` (its own folder under `debug-captures/<profileId>/`). Finalizing writes both to disk and encodes them into a video at once; packaging a report never waits on this, it zips whatever session folders exist.
- `DebugCaptureSessionSummary` is one recorded capture session as the picker lists it. `sentAt` comes from the profile's capture manifest, not the session folder (see apps/desktop/electron/diagnostics/debug-report/capture-manifest). `previewKind: 'images'` (no ffmpeg, PNG fallback) carries every packaged frame in `previewFrameUrls` so the picker can cycle through them as a fake video.
- The report zip (saves, profile files, logs and capture sessions) is built and uploaded by the bug report transport in the main process (`apps/desktop/electron/sanctuary/bug-report/`), so no report shape crosses IPC.

## apps/desktop/src/diagnostics-types/diagnostics.type.ts

- The host hardware and OS readout behind the debug info block, collected in the main process (none of it is reachable from the renderer sandbox).
- It is kept free of anything identifying (host name, user name, file path) because it is meant to be pasted into a public bug report.
- `DisplayDiagnostics.bounds` is the logical (DIP) bounds in the virtual desktop, as the window manager sees them. `nativeSize` is the logical size multiplied by the scale factor.
- `GpuDiagnostics.features` maps each feature to its acceleration status (`enabled`, `disabled_software`, ...).
- `OsDiagnostics.version` is the human readable OS name, such as the edition string on Windows.

## apps/desktop/src/diagnostics/

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
  on change, so an untouched pad would be missing). Names come from brock-input's controller name
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

## apps/desktop/src/diagnostics/crash-dump.ts

When the core crashes, the log buffer is written to `debug/crash-<stamp>.log` in the user's
data folder, so a crash report is a file to attach. Writing the dump is best effort: a
failed dump never makes a crash worse, and the in-app log still has everything.

## apps/desktop/src/ffmpeg-tool/ffmpeg-tool.constants.ts

- `FFMPEG_TOOL_ID` is the id ffmpeg is registered under in the Brock tools module, shared so the main process and the renderer name the same tool. ffmpeg is not bundled: it is fetched on request into the app's data root, so a user who never asks never downloads 140 MB.

## apps/desktop/src/studio/

What the three studios (character, language, music) share. Each studio is a `ListDetailLayout`, the same as every other list screen: the item list on the left, folding to the dark rail, and the work area as the detail. The work area is Tessera's `StudioLayout` inside a `StudioPane`.

- `StudioPane` is the work area's column: an optional banner (an origin bar or a notice), then one compact row of action groups with a small status at its end, then the body. A studio builds its actions as `StudioActionGroup` data, and each action becomes one small Button. The group names are read by a screen reader and not drawn. There is no title row and no hint line, so the body keeps the height.
- The body is `StudioLayout` with `compactToolbar` and `editorMinWidth={STUDIO_EDITOR_MIN_WIDTH}`: an optional start panel, the editor in a `ToolFrame` with one compact toolbar row on its top edge, and an optional end panel. It stacks its columns only when the open panels, the folded rails and the editor's minimum width do not fit. A studio passes its toolbar as `ToolGroup` data (`viewerToolGroups`, `sectionToolGroups`, `fileToolGroups`, `soundToolGroups`).
- `StudioPanelContent` makes the content of a side panel compact (`DensityScope`).
- `StudioSection` is one titled section of a side panel, with a rule between sections.

A toolbar search box is a plain `<SearchInput grow={false} />`.

## apps/desktop/src/hookshop-reads/

The Hookshop's catalogue reads (the home page, every item, one item) through the Brock catalog
module, typed with the store API's own shapes. Without the module (a host with no main process)
each read answers `NO_CATALOG`, a failure the tab shows like any other.

## apps/desktop/src/index.html

The `booting` class on `<html>` suppresses the entrance animations of whatever the app lands on. They are polish for opening a page mid-session; during boot they would mean the window is revealed partway through a fade and scale, so the screen finishes appearing after the window is already visible. `useShellReady` removes the class.

`#boot-splash` paints at once, with no bundle, JS or WASM needed. React replaces `#root` on first render, so the splash tears itself down for free. Desktop no longer relies on it: it has its own splash window and keeps this one invisible until the shell settles. It stays for web and Android, where nothing else covers the gap before React mounts.

## apps/desktop/src/log-bus/

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

## apps/desktop/src/main.tsx

- `installSessionLogTap()` runs on every launch: it streams the log bus (ring-evicted entries included) to `Data/debug/session.log` through the main process, which Brock's session log handles.
- `window.__trackerBridge` exposes the tracker bridge functions for live integration tests.
- `window.__deliveryApi` exposes the delivery path the same way, so live tests can drive a real queued delivery and watch it complete instead of poking the core directly. `triggerNpcCheck` replays a giver's vanilla grant through the queue (the cheat trigger), which is how a live test exercises the npc override seam. `deliverNpcCheck` enqueues the assigned-form trigger for a scripted giver, the exact action a session's poller enqueues, so a live test can prove the delivery path without cheats end to end.

## apps/desktop/src/platform/api-shim/

A boot-safe `window.api` stub for hosts with no preload to inject one: Capacitor and the plain browser. It is generated from the IPC channel maps, so every method exists. Events return a no-op unsubscribe, sends do nothing, and invokes resolve to a harmless empty value. Real per-capability implementations replace these stubs as the ports are written.

- `EMPTY_ARRAY_METHODS` lists the invoke methods whose callers expect an array. Every other invoke resolves to `null`.
- `STUB_RETURNS` covers the invoke methods whose callers read a property of the result straight away, where a bare `null` would throw. They return an empty object shaped like the contract in `apps/desktop/src/ipc/invoke-contract.type.ts`, so the renderer boots.
- `SCREEN_EDITOR_STUB`: editing the dataset needs a repo on disk, so every editor channel refuses here instead of reporting a false success. Each channel is spelled out by name and typed against `ScreenEditorApi`, so a channel added to the contract fails to compile until it refuses here too.
- `readNativeAppVersion`: a native host (Capacitor) reports the real app version, the Android `versionName`, which itself comes from the repo root `package.json`. The plain web has no native App plugin, so `getInfo()` throws and the version falls back to `0.0.0`.

## apps/desktop/src/platform/api-shim/install-app-shim.ts

A side-effect module. On every host except Electron it installs the boot-safe `window.api` shim. `main.tsx` imports it first, so it runs before the App import graph reads `window.api`. On Electron the real preload api is already present and the module does nothing.

## apps/desktop/src/platform/hosts/capacitor/sprites.ts

The Capacitor sprites port: the base URL of a ROM's extracted sprites, `Capacitor.convertFileSrc` over the app's Data directory, ending with `/` and empty when the folder cannot be resolved.

The rest of the phone host is Brock's: the file picker (the ROM and SRAM pickers pass `anyType` on a phone, because Android's picker greys out `.sfc` and `.srm` files it has no type for), the Back gesture (`MainActivity` dispatches `brock:back` with the swipe edge and `useMobileBack` listens through `device.onBackButton`) and the Storage page (`<BrockApp dataDomains>` takes `ROTP_DATA_DOMAINS`, the same list the main process uses).

## apps/desktop/src/profiles/connection-patch/randomizer-connection-patch.ts

- The only edit a randomizer profile allows after creation is the connection of an online profile. A patch naming any other key (the seed, the options, a pinned setting) is refused whole, so nothing that shaped the seed can drift.

## apps/desktop/src/profiles/storage/index.ts

- The on-disk layout (`app.json` at the root, `profiles/<id>/{profile.json,config.json,saves/}`) and the 2-space JSON match the original Electron stores, so existing desktop data is read unchanged.
- Profile updates are a whitelist: of `randomizer`, only the connection is patchable. A refused patch throws before anything is written.

## apps/desktop/src/profiles/storage/profile-patch.ts

- A key that is absent leaves the field alone, null clears it, a value sets it. A clear written as `undefined` could not be told from absent once the patch crossed a process boundary.
- The randomizer config is frozen except for its connection. The profile is mutated and returned; the call throws when the connection part is refused.

## apps/desktop/src/profiles/types/profile.type.ts

- `ProfileRandomizerConfig` is recorded on a profile at creation time. The seed, options and any settings it pins are frozen from then on. Only the connection (server, slot, password, DeathLink, tracking) can change afterwards, through a `RandomizerConnectionPatch`, so a wrong password never strands a run.
- `options` is the full frozen catalog snapshot (schema `ap-options-v2`). Readers go through normalizeRandomizerOptions (packages/randomizer/src/options-snapshot), which lays it over the catalog baselines.
- `trackOtherPlayers` opens a tracker connection per other player for their checks count; it is on unless false.
- `frozenSettings` are settings pinned by the randomizer; the settings UI locks these keys.
- `deliverable` holds the npc, pond and world spots the capability probes proved deliverable at creation (online mode), so the player file randomizes the same spots a local seed does. A profile from before this field keeps those spots vanilla.
- `Profile.language` is a language code such as `en`, `de`, `fr`. `msuPack` is the MSU pack directory name.
- `Profile.automation` marks a profile created by `rotp worktree create` for a named instance, not a person, so it is safe to prune.
- `Profile.randomizer` is set at creation; only its connection is patched afterwards.
- `CreateProfileOptions` is accepted by every createProfile implementation (shared store, IPC, renderer). `initialConfig` holds the config values a creation form preset seeds the profile with, freely editable after.
- `CreateProfileResult` is the outcome of the app level create flow, surfaced to the creation form.
- `ProfilePatch` has three cases per field: an absent key leaves the field alone, null clears it, a value sets it. Clearing used to be written as `undefined`, which cannot be told apart from absent once the patch has crossed a process boundary, so choosing None for a pack or a language kept whatever was assigned.
- `randomizerConnection` is an online profile's connection; any other randomizer key is refused. In `RandomizerConnectionPatch`, an empty or null password clears it.

## apps/desktop/src/public-asset/public-asset.ts

The packaged renderer loads over `file://`, where a root-absolute path such as
`/buttons/x.svg` points at the filesystem root and fails. Vite's `BASE_URL` is `/` in dev
and `./` in the packaged build, so callers pass a root-relative path.

## apps/desktop/src/randomizer-placement-io/

Typed wrapper around `profiles/<id>/randomizer.json`. The placement is written under a schema
stamp and read back only under that same stamp; a file under any other stamp reads as
absent, so the caller generates a fresh seed. There is no migration and no key map: the
stamp is bumped whenever the placement's shape or its location keys change.

## apps/desktop/src/screens/screens.config.ts

The Data bucket has `requiresProfile: false`, and `brock.config.ts` sets `product.profilesRoute` to `data/profiles`. Together they make Data > Profiles the one profiles screen: the Profiles menu entry, the boot step that finds no profile to start, and the step after the active profile is deleted all land there, and a first run can create a profile there because the Data hub opens with none active. The Data pages are library tools (ROMs, sprites, languages, profiles) and none reads the active profile.

## apps/desktop/src/screens/data/home.hero.tsx

The hero is `compact` (`meta.hero.size`), a short band for a page that is mostly the cards below it. The hero holds the highlights only: the eyebrow, the title, three facts (space on disk, profiles, ROMs), Open data folder and Refresh. Open data folder shows only where the host can reveal a folder (`capabilities.revealDataFolder`), so the phone layout has no such button. Everything else is JSX under the hero in the same file's return, which Brock draws below the hero in the page: the cards for each page of the data area and the storage details. The folder path and the per-folder tiles are not facts of the hero because they overflowed it.

## apps/desktop/src/screens/game/game.backdrop.tsx

The Game bucket's header backdrop: the title scene, drawn still by `SceneBackdrop` behind the header of every Game page. Brock loads it with the bucket's screens, before the header draws, and puts it in the header's backdrop layer. `HEADER_HORIZON` (in `game.backdrop.constants.ts`) sits the water line low, because a page header is short and the castle must stay in view. The Game home is a hero page and draws its own full height scene through the hero's `Backdrop` slot. The other buckets have no backdrop.

## apps/desktop/src/screens/store/

The Hookshop is one hub with a page for each section: Home, then Browse, Music packs, Characters and Languages under Catalogue, then Installed and Updates under On this computer. Every page but Home carries `when: isSignedIn`, so a signed out Hookshop shows Home alone, with no side nav, and the sign in is the whole screen. Once signed in the nav appears with the pages beside it. Signing out while on one of them falls back to Home.
Home shows the sign in while signed out and the store home once signed in. It also takes a waiting install link: signed in, it opens the item on Browse and starts the install; signed out, it says the install waits for the sign in.
The Browse pages take the item to select as the `item` route parameter (`nav.open('store/browse', { item })`), which is how Home and the install link open an item.
Installed lists the packs of this computer, so it needs the account like the rest: it is hidden while signed out, and a pack can still be removed from the Data studios.

## apps/desktop/src/settings-effects/apply-settings-effects.ts

- The side effects of a settings change: persist, parent notifications, HUD sync, live push and toast. A failed save shows a toast so settings never fail to save silently.
- Changing the player sprite swaps the sheet in the running core so the choice shows without a restart.
- Control scheme and slot assignments go to the store and to the scheme runtime, which the per-frame router reads to turn a pressed button into an item id and the Y bit. Pushing here, not leaving it to the store's own game UI subscription, makes an assignment take effect the moment it is made: that subscription only ticks while the core runs.
- A host-drawn HUD style needs a 16:9 or wider display to have room for the HUD and the menu. If the ratio is narrowed while it is active, it drops back to the original style and says why, since a clipped menu would be worse than losing the style. The correction is queued, because this runs inside the `setSettings` updater and feeding a second change straight back would re-enter it. Shrinking the window can do the same with no settings change; that route raises the same request from GameOverlay, so the drop and its wording live in one place.
- When the game is running, settings are pushed live, and a change that needs a restart shows the restart toast once.

## apps/desktop/src/settings-effects/settings-effects.constants.ts

- `HUD_STORE_KEYS` are the keys the HUD render store mirrors. A change to any of them syncs it again.
- `CONTROL_STORE_KEYS` are the keys the control-scheme store and the per-frame input router are derived from. `syncControlSettings` gets the whole settings object, not a patch: the scheme and the takeover it arms are both derived from the HUD style, and Vanilla Safe strips them.
- `ASPECT_KEYS` are the keys that can change the display ratio a host-drawn style is measured against.

## apps/desktop/src/settings-effects/swap-player-sprite.ts

Applies a sprite choice to the running core and stages it again for the next boot. Staging matters even when the live swap succeeds, because the core reads the staged bytes again when the game restarts.

## apps/desktop/src/settings-effects/sync-dialog-store.ts

Mirrors the dialog settings into the overlay's store: the message box look, plus the pacing controls the button prompts describe. Vanilla Safe stands the overlay down the way it does the HUD: it masks the override the enhanced box hides the native one through, so the overlay reads original while the saved preference stays put. It masks the pacing gate too, so none of the pacing controls act and none are prompted.

## apps/desktop/src/settings-effects/sync-hud-store.ts

Vanilla Safe brings the native HUD back in the core (its HudOverride bit is masked), so the host overlay has to stand down at the same moment. Locking the setting only greys the control out: the stored value stays enhanced, and the overlay would keep drawing over the native HUD the core just restored, which is the doubled HUD. Original is the stock HUD here. The saved preference is untouched, so it returns when Vanilla Safe goes off.

## apps/desktop/src/settings-effects/sync-title-store.ts

Mirrors the title screen settings into the overlay's store. Vanilla Safe masks the bit the native title is hidden through, so the overlay reads original while the saved preference stays put.

## apps/desktop/src/shell/show-rules/

Show rules for pages, buckets and menu entries. `isRandomizerProfile` reads the active profile. `isSignedIn` reads the `signedIn` show flag, which `main.tsx` passes to `<BrockApp showFlags>` from the hub session store (`useHubShowFlags`). `show-flags.type.ts` declares the flag on Brock's `ShowFlags`, so `ctx.flags.signedIn` is typed.

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

## apps/desktop/src/widgets/

Every app widget sets `padding: 'none'`. The widget body default adds its own padding around views that already pad themselves, which narrowed the content by about 20 px and truncated rows that fit before.

## apps/desktop/src/widgets/shadow-editor.kit.ts

The Shadow Editor widget kit: the editor for the shadow casting data, docked around a running game. It is dev only and gated on the `game` context, so without a game it opens on its reason card ("Start a game to use the Shadow Editor."). Members: Shadow Editor (right pane) and Shadow Elements (left pane), plus the Shadow drawing overlay. Both widgets use the `compact` chrome, a 21 px title strip, and the editor carries its Preview, Debug, Undo, Redo and Save buttons there. Only one kit is open at a time. The other developer panels (Live Data Inspector, Game State, Music Debugger, Location & Navigation and Simulator) are standalone widgets with `context: 'game'` and `devOnly: true`, so `widgets.open('navigation')`, the `--widgets=` flag and the dump and sim automation open them directly, in the normal layout. Brock 0.57 lists a kit as a submenu of Widgets after the widgets, and has no developer submenu: the developer widgets are plain entries that show while developer tools are on, so the Shadow Editor submenu cannot nest inside one.
