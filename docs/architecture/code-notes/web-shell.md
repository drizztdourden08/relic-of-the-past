<!-- @layer docs @kind doc -->
# Web shell code notes

Notes for the renderer shell: `apps/web/src/` outside `lib/` and `ui/`. That covers `App/`, `hooks/`, `stores/`, `platform/`, `utils/`, `main.tsx` and `env.d.ts`. Each heading names a file. The code carries no comments, so the facts a reader cannot get from the code live here.

## platform/install-api-shim.ts

A side-effect module. On every host except Electron it installs the boot-safe `window.api` shim. `main.tsx` imports it first, so it runs before the App import graph reads `window.api`. On Electron the real preload api is already present and the module does nothing.

## platform/usePlatform.ts and platform/useCapability.ts

Renderer access to the platform facade. A component branches on a capability with `useCapability()`. Imperative platform calls go through `usePlatform()`.

## platform/get-platform.ts

A module-level Platform singleton. It resolves once through the same factory map the `PlatformProvider` uses, so hooks (through context) and plain modules (through this accessor) share one instance. Non-React modules reach platform ports, such as files, through it.

## platform/PlatformProvider

Resolves the Platform facade once at mount and provides it through context. The factory map in `get-platform.ts` is the only place hosts are registered. `resolvePlatform` picks one by runtime detection: the Strategy selection, and the composition root.

`usePlatformRootClass` puts `platform-mobile` on the document root. CSS reads it there because portaled modals sit outside the app subtree and still need to branch on the platform, for example for plain full-screen pages on mobile.

## platform/api-shim

A boot-safe `window.api` stub for hosts with no preload to inject one: Capacitor and the plain browser. It is generated from the IPC channel maps, so every method exists. Events return a no-op unsubscribe, sends do nothing, and invokes resolve to a harmless empty value. Real per-capability implementations replace these stubs as the ports are written.

- `EMPTY_ARRAY_METHODS` lists the invoke methods whose callers expect an array. Every other invoke resolves to `null`.
- `STUB_RETURNS` covers the invoke methods whose callers read a property of the result straight away, where a bare `null` would throw. They return an empty object shaped like the contract in `shared/ipc/invoke-contract.ts`, so the renderer boots.
- `SCREEN_EDITOR_STUB`: editing the dataset needs a repo on disk, so every editor channel refuses here instead of reporting a false success. Each channel is spelled out by name and typed against `ScreenEditorApi`, so a channel added to the contract fails to compile until it refuses here too.
- `readNativeAppVersion`: a native host (Capacitor) reports the real app version, the Android `versionName`, which itself comes from the repo root `package.json`. The plain web has no native App plugin, so `getInfo()` throws and the version falls back to `0.0.0`.

## platform/hosts/electron-factory.ts

The Electron host adapter. It fulfills the platform ports by delegating to the `window.api` that the preload injects.

- The device port stays inert. Desktop handles keeping the screen awake and saving on close through its own window lifecycle, and the controllers carry desktop haptics.
- The display port: the OS knows the rate of the display the window sits on, and the renderer's measurement refines it. Modes stay empty because Electron cannot enumerate them.
- The controller host: raw HID enumeration, reads and writes went away with node-hid. SDL3 claims every controller directly and reports state that is already decoded (`onControllerState`). The host keeps the full shape of the port, because the Android USB OTG plugin on Capacitor still fulfills it, and turns those methods into the plain browser no-ops. Only `vibratePattern` and `onControllerState` are real on desktop.

## platform/hosts/web-factory.ts

The plain browser host adapter, for a renderer opened over http with neither Electron nor Capacitor. It is also the fallback when host detection finds nothing. No window chrome and no persistent storage.

- The device port is best effort: the wake lock, `navigator.vibrate` and page visibility.
- The display port reports nothing. A browser has no standard refresh rate API, so the renderer's frame timing measurement is the only signal, and the port reports nothing instead of guessing.
- `saveFile`: a browser cannot tell whether a download completed, and there is no cancel signal to tell apart. A started download is reported as saved.

## platform/hosts/capacitor-factory.ts

The Capacitor host adapter for Android and iOS. Window controls do nothing, since mobile has no window chrome. Files go through the Filesystem plugin. Controllers go through the ControllerSdl3 plugin, which runs the SDL3 gamepad backend inside the app's own WebView process (see `createCapacitorControllerHost`). On iOS, or on an Android build with no matching native library, that plugin is missing and the host reports zero controllers. Any `window.api` call that has no port yet hits the boot-safe shim in `platform/api-shim`.

## platform/hosts/capacitor/controller-host.ts

The Capacitor `ControllerHost`. The ControllerSdl3 plugin (`apps/mobile/android/.../controllersdl3/ControllerSdl3Plugin.java`) runs the SDL3 gamepad backend inside the app's own WebView process on Android. This host starts the plugin once, decodes its added, removed and state events into a live device map (`controller-sdl3-store.ts`), and answers decoded button and axis state and rumble through the `ControllerHost` port, like the desktop SDL3 addon. The raw HID members of the port (`write`, `onReport`, `onDeviceOpened`, `getOpenKeys`, `onMainPerf`) have no SDL3 equivalent and do nothing, the same as on desktop.

The device snapshot (`controller:list`, `controller:devices`, `controller:removed`) is not part of this port. The device list and calibration screens read those off `window.api`, so creating this host also installs real implementations for those three channels (`install-controller-api.ts`).

When the native library fails to load (wrong ABI, missing `.so`) or SDL fails to start, the plugin's `start()` resolves `{ ok: false }` instead of throwing (see `Sdl3Bridge.java`). The host then never starts listening, so every surface reports zero controllers, like a desktop build with no SDL3 addon.

The `appStateChange` listener mirrors the device port's own `onAppPause` listener: it stops polling for gamepad events while the app is in the background and restarts on return, so the native subsystem does not run while the app is hidden.

## platform/hosts/capacitor/controller-sdl3-device-key

Assigns and frees `vid:pid` device keys for connected Android SDL3 gamepads, keyed by SDL joystick id. Bindings, profiles and calibration are keyed by a `vid:pid` string (4 lowercase hex digits each), and that must keep working for the common case of one device per `vid:pid`. A second device with the same `vid:pid` gets a `#N` suffix, so two physical pads never collide on one key. The slot is freed when its device is removed, so a later connect can reuse it without disturbing a device still connected.

This is a deliberate copy of the same rule in `apps/desktop/electron/input/sdl3-device-key.ts`. That module lives in the Electron main process zone, not in `shared/`, and the renderer's module graph cannot reach it.

## platform/hosts/capacitor/controller-sdl3-plugin

The Capacitor bridge to the ControllerSdl3 native plugin: start the SDL3 gamepad subsystem, stop it, rumble a device by its SDL joystick id, and listen for the `controllerEvent` notification that each added, removed or state event arrives as.

`start()` resolves `{ ok: false }` instead of throwing when the native library cannot load or `SDL_Init` fails. Callers treat that like a desktop build with no SDL3 addon: report no controllers, never crash.

`onControllerSdl3Event` returns a synchronous unsubscribe. `addListener` itself resolves later, which is the bridge idiom for plugin listeners.

## platform/hosts/capacitor/controller-sdl3.type.ts

The event shapes carried by the plugin's `controllerEvent` notification. They match the `added`, `removed` and `state` members of `Sdl3Event` (`apps/desktop/electron/input/native/sdl3/sdl3.type.ts`) field for field, checked against `controller_sdl3_jni.c`, which writes this exact JSON, so nothing needs reshaping. They are declared here because that desktop type file lives inside the Electron app's own module graph.

Only these three event types exist on Android. The native layer never emits `error`, `raw`, `joystick` or `gamepad-hold`, which back diagnostics wizard features with no Android UI.

- `hasButton` is indexed by the `SDL_GamepadButton` enum, from `SDL_GamepadHasButton`.
- `hasAxis` is indexed by the `SDL_GamepadAxis` enum, from `SDL_GamepadHasAxis`.
- `buttonLabels` is indexed like `hasButton`: the label this pad prints on that button, or an empty string when unknown.
- `LiveDevice.name` is SDL's own name for the device. It is carried in the snapshot because the connect event fires once and a listener that subscribes later misses it.

## platform/hosts/capacitor/controller-sdl3-snapshot.ts

Builds the `DeviceEntry` snapshot (the `controller:list` and `controller:devices` shape, see `shared/ipc/controller-contract.ts`) for the Android SDL3 transport. Every entry is `ready`. Unlike the desktop transport, this plugin has no separate raw HID enumeration that could report a device SDL failed to claim, so there is no `unavailable` half to build: every device in the store is one SDL has open. There is no raw HID product string on this platform either, so `product` repeats SDL's own name, which is what the device list shows.

## platform/hosts/capacitor/controller-sdl3-store.ts

The live SDL3 controller tracker for the Android plugin. It starts and stops the native gamepad subsystem, decodes the added, removed and state events into a map of every open gamepad keyed by device key, and serves that map as decoded button and axis state (`onControllerState`), rumble, and the `DeviceEntry` snapshot that the device list and calibration screens read (see `install-controller-api.ts`).

A device that has connected but that nobody has touched yet still shows up. The map is built only from `added` and `removed` events, never inferred from `state` traffic, so an untouched pad is never mistaken for a disconnected one.

`start()` does nothing, and logs once, when the plugin is not registered or the native library failed. It subscribes to events before it starts the plugin, never after. The native side begins polling the moment `start()` is called and announces pads that are already connected on its very first tick, well before an `await` resolves. A later subscription drops those announcements, and a pad that is already plugged in never announces itself again, so it would stay invisible for the whole session.

`rescan()` broadcasts the current snapshot again. Android has no separate raw HID lister to scan again, so this is the closest honest match for the desktop "look again" action.

## platform/hosts/capacitor/controller-sdl3-vibrate.ts

Turns a timed pattern of `{ durationMs, intensity }` segments into a sequence of rumble calls, one per segment, `gapMs` apart. It is the same sequencing that `apps/desktop/electron/input/haptic-pattern-player.ts` runs in the Electron main process. Android has no separate main process (the plugin runs inside the app's own WebView), so the timing lives in the renderer and runs on plain `setTimeout`. Starting a new pattern on a device cancels whatever was still playing on it, so overlapping haptic events never interleave on one motor.

The opening zero-length rumble only silences whatever the motor was doing. Its result is ignored on purpose: a backend that declines a zero-length rumble would otherwise cancel the whole pattern before a single real segment ran, and the caller that resolves the device id already knows whether the device exists.

## platform/hosts/capacitor/device.ts

The Capacitor `DevicePort`: keep the screen awake during play (`@capacitor-community/keep-awake`), device haptics (`@capacitor/haptics`), and an app-backgrounded hook (`appStateChange` from `@capacitor/app`) used to save when the app goes to the background. Haptics buzz the phone on game events, since most Bluetooth pads expose no rumble through the WebView.

`onBackButton`: `MainActivity` intercepts Back and dispatches a `rotpback` window event carrying the swipe edge (it reads `BackEventCompat.getSwipeEdge`). The `backButton` event of `@capacitor/app` is not used because it cannot tell left from right.

## platform/hosts/capacitor/display.ts

Android reports its supported rates and lets an app state the rate it intends to present at, which the platform then uses to pick a display mode. That request is made once per session, at startup, and is not exposed as a setting: there is no mode for the user to choose between, and the platform may decline anyway. Repeating it on every status read would be pointless churn.

A failed request means an older build without the plugin, or a platform that declined. The measured rate still drives the advisory, so there is nothing to recover.

Every reported mode is marked `sameResolution`, because Android switches modes itself and every reported rate is reachable at the current resolution. The synced rate calls report unsupported: there is no user-facing switch on Android, since the platform owns mode selection and only takes a hint.

## platform/hosts/capacitor/file-picker.ts

The Capacitor file picker, through `@capawesome/capacitor-file-picker`, which reads bytes as base64.

Saving goes to the device's Documents directory, not through a share sheet. The project does not depend on `@capacitor/share`, and a file written where the user's own file manager can reach it needs no extra plugin.

`extToMime` maps picker extensions to MIME types the Android document picker accepts. `.sfc` and `.smc` have no registered type, so they resolve to `application/octet-stream`.

## platform/hosts/capacitor/file-store.ts

The Capacitor `FileStore`, backed by app-private storage through the Filesystem plugin (`Directory.Data`). Paths are the same logical paths used on Electron, relative to the data root. Binary data crosses the bridge as base64. Removing a missing file and creating a folder that already exists both do nothing.

## platform/hosts/capacitor/frame-rate-plugin

The bridge to the Android FrameRate plugin. It asks the platform for a refresh rate that divides evenly into the game's 60 frames a second. Android decides whether to honour it, so nothing here reports the display as definitely changed: only what was requested and what the display says it is doing. `supportedHz` arrives comma separated, because Capacitor bridges float arrays poorly. `parseSupportedHz` drops anything unusable.

## platform/hosts/capacitor/install-controller-api.ts

Replaces the boot-safe `window.api` channels for the controller device list (see `platform/api-shim`) with real implementations backed by the SDL3 store. It covers the three that the device list and calibration screens call directly, outside the `ControllerHost` port: `controller:list`, `controller:devices` and `controller:removed`. `controller:rescan` has no raw HID lister to scan again on this platform, so it emits the current snapshot again. Everything else on `window.api` that concerns controllers (`listHidDevices`, `addControllerMapping`, the raw HID diagnostics wizard) keeps the shim's empty default, because that wizard has no Android UI.

The invoke and event members of `window.api` are typed read-only, a side effect of the homomorphic mapped type over the `as const` channel maps (see `shared/ipc/api.ts`). So the override replaces the whole object instead of assigning into it.

## platform/hosts/capacitor/storage.ts

The Capacitor `StoragePort`: an app-private location and per-domain usage through the Filesystem plugin. There is no reveal on mobile (`revealDataFolder` is false), so the home page shows the path read-only. A missing folder counts as zero bytes.

## stores/tracker-presence-store

Whether the checks tracker widget is on screen right now. The widget reports it while it is mounted, and the check toasts read it to follow their own "also while it is closed" setting. Never persisted: it is a fact about this moment.

## stores/exclusive-insets-store

Broadcasts the insets of docked widgets, computed by the Widget layout system, to the consumers that need them (GameLayer, overlays). The Widget composite stays presentational and emits insets through a callback. Views wire that callback to this store, which keeps store ownership out of the bare design-system tier.

## stores/profile-connection-store

The randomizer config each profile was last saved with from a connection edit, by profile id. The app's profile object is a snapshot from when it was loaded, so every screen that shows or edits a connection (the Randomizer page, the profile's Online settings) reads the saved config through here and sees the same values the moment one of them saves. Never persisted: the profile file is the record, and the next load reads it from there.

## stores/hud-countdown-store

The HUD countdown as the overlay draws it: the live reading plus the length it started from. It lives in a store so the length outlasts the HUD, which unmounts on the map screens. `advance` feeds one reading, and the track object changes only when the reading moved it.

## stores/boot-progress-store

Broadcasts the background warmup progress of the game core (glue script, then the `.wasm` fetch, then compile) to the BootProgressBar view. The warmup facade (`lib/game/wasm-warmup`) reports here and the bar observes, which keeps warmup logic out of React and the bar presentational. `ratio` runs from 0 to 1 for a determinate bar; `null` draws an indeterminate sweep.

## stores/store-link

A store install link waiting for the Hookshop tab. The shell puts it here and opens the tab. The tab takes it once, selects the item and starts the install. It is a store because the link can arrive while any page is open, before the tab is mounted. `take` returns the pending link and clears it, so it installs once.

## stores/title-settings-store

The title screen's look, mirrored from the profile settings so the overlay reads it live. `dimFlashes` is the game's own dim flashes switch, so the clang flash is as soft as the player asked for.

## stores/game-ui-store

Real-time game UI state, updated every frame by the ui-bridge polling loop. `_setState` replaces the whole state, and ui-bridge calls it on a change.

## stores/dialog-store

The message box as the core's dialog mirror reports it, updated by the dialog bridge whenever it changes. `stale` is raised on a save-state load that brought no dialog hook state: the mirror cannot see what the loaded WRAM put on screen, so the host box holds back until the next message clears it. A load that put the mirror back (`state-dialog.ts`) lowers it instead through `markRestored`, so the next frame read is the loaded message as it was saved.

`staleGeneration` is the mirror generation seen at the load. The mirror is trusted again once it moves on: a box that closes, or a message the engine started after the load, is clearly seen again.

## stores/sprite-availability-store

Tracks whether the active ROM has extracted HUD sprites. The enhanced Vanilla HUD style rebuilds the SNES look from these PNGs, served over the `app-sprite://` protocol. When they are missing, the settings lock Vanilla and the overlay shows a notice instead of broken images. It is updated whenever the active ROM changes (see `applySpritesForRom`).

- `romFile` is the ROM the flag refers to, `null` until the first check runs.
- `available` is true when at least one sprite PNG is extracted for the active ROM.
- `revision` counts the times the ROM's set has been rewritten this session; 0 means as it was found. It covers what the boolean cannot say: a set that was already available and has since been rewritten in place by a background extraction. The flag does not move on that, so nothing keyed on it would render again, and every image loaded during the rewrite would keep the failure it latched. Bumping the revision is the one signal that the files behind the same names are new.

## stores/hud-settings-store

`customW` and `customH` are the ratio width and height used when `ratio` is `custom`. A value of 0 means detect it automatically.

## stores/widget-ui-store

The live tier of every widget's content prefs: the tab it is on, the filter it shows, the view mode it is in.

A widget is unmounted the moment any screen opens, which is intended, so nothing a widget wants to keep can live in its own component state. It lives here, where it outlasts the unmount, and is written through to the profile so it also outlasts the app. This is the reasoning of `navigation-overlay-store`, applied to every widget.

- `profileId` is the profile these prefs belong to. Writes are dropped until one is known.
- `hydrated` stays false until the profile's saved prefs have arrived. A consumer that must apply a pref exactly once (the navigation mode) waits on it, so it applies the saved value and not the fallback before it.
- `hydrate` replaces everything with what the profile had saved. `setPref` updates one key of one widget and writes the whole set back to the profile.

## stores/location-notification-store

Screen and transition notification state, fed by a subscription to map changes in `game-ui-store`. A `null` screen or transition means that notification is hidden. `showScreen` and `showTransition` say whether each kind is turned on.

## stores/refresh-rate-store

One reading of the display, shared by everything that shows it. It is a store, not a hook per consumer, because the rate can change while the app runs: the player switches it from the settings panel, or the OS switches it on entering fullscreen. Two independent hooks would each hold a stale copy, so the title bar could still claim 144 Hz while the settings panel that just changed it says 120.

`reading` is true while a read is in flight, so overlapping calls do not stack measurements. `refresh` reads the host value again and measures again, and is safe to call repeatedly. The host value lands first and is usually enough. The measurement refines it, and is the only source at all on web and mobile. When the host cannot answer (`readHostRefreshRate`), the measurement still runs.

## stores/installed-store

What the Hookshop installed on this computer, read from the main process's record. One store serves the Hookshop tab and every editor, so an install, an update, an uninstall or a duplicate shows its lock everywhere at once.

`reload` reads the record again. Off Electron there is no record, so the list stays empty. `watch` loads the record and starts listening to install progress; later calls do nothing. The last unpack step of any install schedules a reload `RECORD_SETTLE_MS` later, because the main process writes the record just after the last unpack report.

`installedFor` returns the install record of one item, by its kind and the name it has on disk, or `null` for the player's own.

## stores/hub-session

Who the app is signed in as, on the shared accounts. One store, because two surfaces read it at once: the account card (sign in, the code, sign out) and the bug report forms (the reporter line, and whether an email is asked). `refresh` runs at boot and after every sign-in or sign-out. A token the site revoked reads as signed out on the next refresh. `userCode` is the code to type on the site while waiting, `null` otherwise. `signIn` opens the confirm page on the given site, or on the Sanctuary when none is given.

## stores/hud-layout-store

The HUD layout in force right now: the document the enhanced HUD draws, with every region, container and element in it.

The active control scheme chooses it. `ModernBindings.layoutId` names the arrangement a scheme wears, and `followSchemeLayout` subscribes to the resolved bindings (the same broadcast the control scheme store listens to). Switching the active control profile from the keyboard to a pad swaps the slot list, the assignments and the HUD layout together, in one step. There is no global HUD setting for it any more, because a layout that did not follow the scheme could only ever be right for one of the player's devices.

There are two ways in, and they differ:

- `setLayoutId` names a shipped layout, and the store resolves it through the built-in registry, synchronously. It is the fallback path.
- `setLayout` hands over a whole document. The editor commits a custom layout this way, and the scheme follower hands over a stored layout the registry has never heard of. `layoutId` follows the document it was given, so the two fields can never disagree about which layout is showing.

An unknown id falls back to the shipped default instead of blanking the HUD: a stale id in a profile is a far likelier cause than a real request for no interface at all.

`followSchemeLayout`: a scheme that names no layout reads as the shipped default, so an old profile draws something with no migration. The read is asynchronous because a custom layout lives in the profile's own file. A resolution that lands after a further profile switch is discarded by comparing it against the id still wanted, so a fast switch cannot leave the previous device's HUD on screen. The subscription fires at once with whatever the input engine resolved at boot, so a late import of this module still gets the layout the active scheme asked for.

## stores/game-assets-store

Whether the running game is playing the text that is currently on disk.

The assets blob reaches the emulator once: a profile load reads it from disk and the game boots with it. Nothing reads it again afterwards, and loading a save state restores emulated memory, not the blob, so an edit saved while a game runs stays invisible until the profile is loaded again.

It counts bakes instead of comparing files. Every rebuild bumps `bakedGeneration`, a boot records the generation it took in `bootedGeneration` (`null` while nothing runs), and the two drifting apart is the signal (`useAssetsOutOfDate`). Hashing a blob of several megabytes on every save would learn nothing a counter does not already know.

The reload is a capability the app shell lends, because the shell owns the profile and the game lifecycle (`registerReload`). It is kept beside the store, like the opener of the data view store, so registering it again costs no subscriber a render. `reload` loads the profile again, which reads the blob again and reboots the core. `runningProfileName` names the profile whose text the running game took, for the warning.

`markAssetsBaked` can be called outside React, so the storage layer bumps the generation after a rebake.

## stores/search-store

The global search palette: its open and query state, a bridge to read and write settings registered by whichever view currently owns `GameSettings` (ProfileHub), and a pending deep-link anchor that the settings screen consumes once after navigation lands. `pendingTab` is a pending ProfileHub tab switch, consumed once the same way, so a deep link can land on another tab before it scrolls to its anchor.

`SETTINGS_TARGETS` gives the tab and anchor for every setting a DisabledOverlay can link to, keyed by the setting's `GameSettings` key, so every overlay (widgets, Controls bindings, locked settings controls) lands on the same spot for a given cause. The two Gameplay toggles share a tab. The HUD style has its own, and the Controls tab's banner links to it because the Modern control scheme is the Modern HUD style.

`openSettingsTarget` queues a ProfileHub tab switch plus the anchor scroll and flash, consumed by the `pendingAnchor` effect in ProfileHub. A caller already on the profile page needs only this; a caller elsewhere switches the app to the profile page first. An id with no entry falls back to the Vanilla Safe target. `openVanillaSafeSettings` is the shortcut for the one setting every SettingsLayout lock can be caused by.

## stores/dialog-settings-store

The message box look, mirrored from the profile settings so the overlay reads it live.

- `highlightPrimary` and `highlightSecondary` colour item names and player names in randomizer messages, as hex.
- `buttonPrompts` shows which buttons act on the message, under the box. `prompts` holds the pacing controls that are on, which the prompts describe.
- `autoSkipDialog`: skipped messages never show, so the overlay only draws a box that waits on a choice.

## stores/navigation-overlay-store

Everything a flood produces lives here, not in the widget. The navigation widget is `game-only`, so opening the hub unmounts it and takes any component state with it. That is how the minimap used to vanish while the overlay survived. A flood result outlives the panel that asked for it, so this store owns all of it and the widget only reads.

- `mode`: `manual` floods on demand; `auto` floods again on room, quadrant and inventory changes. It is kept here so it survives the widget unmounting, and `clear` leaves it alone on purpose: clearing is about the data, not how the next flood gets triggered.
- `screenBundle` is the screen or room group the minimap draws, kept beside the results it describes. `null` drops a stale one.
- `result` is the current flood fill result to draw. `results` holds the results for every visible loaded screen.
- `fallHoleSpawns` are the fall hole landing positions in the current room. `respawnEntIds` are the entrance ids classified as respawn points, not physical doors.
- `crossings`: every way on or off each flooded screen, from the crossings facade. One entry per screen, in the order the flood reached them.
- `annotations`: what the simulator knows about each flooded screen (chests, locks, triggers, exits and their state), one entry per screen. A multi-screen area annotates all of them. They are fed separately from the flood, so the overlay, the minimap and the widget panel all read one description.
- `hiddenKinds` are the annotation kinds the viewer switched off in the legend.
- `lockedTarget` and `lockedPath` are the locked target tile from the overlay path debug, and the last A* path computed to it, with tile attributes.
- `clear` drops every flood product: overlay, minimap group and annotations.

## stores/data-view-store

The session tier of a view shaped like the Data Inspector: scroll position, expanded group rows, the selected record and any unsaved editor draft. In memory only: it survives switching collections but not an app restart. It is keyed like the durable snapshots (`ViewKey`), so the two line up under `useViewState`.

It also carries the one request any surface can make of that view: open this recommendation. A widget cannot reach the page state (`useState` in the app shell), so the shell registers how to bring the inspector to the front, a caller hands over what to show, and the inspector consumes it on arrival. It is the shape of the search palette's `registerSettings` and `pendingAnchor` pair. `openRecommendation` brings the inspector to the front when the shell has registered how, and leaves the request as `pendingRecommendation` until the view has shown it. The opener is called after the request is stored, so a shell that renders the inspector synchronously still finds something waiting.

`pendingRecord` and `openRecord` are the same handoff for a plain record: a widget's Edit button, or a reference it renders, jumps to one exact record.

The inspector opener is kept beside the store, not in it. It is a capability the shell lends, not rendered state, and holding it in the store would render every subscriber again on each registration.

## stores/debug-capture-store

The debug capture recorder. While it runs, it samples exactly where Link and the game are (the same map slice the Navigation widget reads) plus a screenshot, 4 times a second, so a debug report can attach a timeline instead of one instant. A recording stops itself after `MAX_RECORDING_MS`: the local copy has no size limit, only a time limit. The titlebar button and the rebindable function action (`input-manager-debug-capture.ts`) toggle it, and each of those callers gates it on `GameSettings.allowDebugLogging`.

Stopping, by the user or by the time limit, hands the finished session straight to the main process (`finalizeDebugCaptureSession`). The main process writes the raw frames, a local video with no size limit, and a separate video kept within a size budget for shipping in a report, into their own folder under `profiles/<profileId>/debug-captures/`, at once, not when a report gets packaged. The store only ever holds one session's data, the one recording now. Nothing accumulates across sessions, so recording again and again without ever packaging a report cannot grow memory without limit.

`MAX_SNAPSHOTS` is a defensive backstop only. Five minutes at 4 samples a second is 1200 samples, so it is not expected to trigger.

## stores/simulator-store

The simulator run state: status, progress, the full narrative event list, and the artefacts of a finished run (outcome, dataset suggestions, softlock report). The runner (`useSimulatorRun`) writes here and the widget sub-components read.

Events are kept in full: a long run's early history is what makes a log worth reading. The dialog windows the list instead of trimming it (see LogView).

A `TrailStop` is one screen the run entered, in the order it walked the route. `epoch` is the epoch the run was on when it arrived. `checksAt` is the number of checks completed on arrival, so a stop's own haul is the next difference. The trail is derived in `setProgress`, not pushed separately: the engine's own `currentScreen` is the single source, so the route cannot drift from the run.

## stores/shadow-editor-store

The undo history keeps the last `UNDO_DEPTH` screen states before the current one.

## stores/control-scheme-store

The active control scheme, the resolved modern bindings, and what each slot fires.

The two halves are deliberately different things. The bindings say where a slot physically sits, and come from the input profile. The assignments say what it does, and come from the profile's settings. Binding again never disturbs an assignment and assigning never disturbs a binding. That is only possible because assignments are keyed by the slot number (contract section 19), not by the button the slot happens to read. Binding slot 3 from B to X changes what slot 3 is; the item on it does not move, and neither does its place in the HUD layout, which references the same number. `bindings` is `null` under the classic scheme, because the modern lens on the profile is not resolved there.

`setAssignment` writes nothing to the core, and that is not an omission. The input router writes the equipped-item register per frame, on the frame the slot is pressed, so an assignment made in the pause menu changes what a later press will do and nothing about what is equipped right now. `commit` pushes a new table to the store, the per-frame runtime and the profile, in that order.

`persistAssignments` merge-writes the assignment table into the profile's own settings file, through the same `readConfig` and `writeConfig` seam every other setting uses. The writes are serialized, because two assignments made in quick succession would otherwise each read the config from before the change, and the second would drop the first.

`enhancedPauseDrawn` answers whether `EnhancedPauseView` will actually be on screen. It mirrors the render condition of GameOverlay term for term, and it has to: the takeover parks the native pause menu (no input handling, no cursor, no redraw), so arming it while nothing is drawn on top hands the player a blank, frozen screen. Both host-drawn styles (Enhanced and Modern) render it. The Original style does not, and there the native menu is left to draw and close itself.

`migratedAssignments` returns the settings' assignment table keyed by slot number. A table written before contract section 19 is keyed by ids derived from position (`slot:NORTH`), and turning those into numbers needs the slot list, which lives on the input profile, not in settings. So the fast path comes first: a table that is already all numbers needs no list and no work, which is every table after the first save. Only an old one waits for bindings, and it is read again the moment they arrive (see `syncControlBindings`). `migrateScheme` throws on a key it cannot read instead of dropping it, so a table that cannot be migrated fails loudly instead of quietly getting shorter.

`syncControlSettings` carries the settings to everything downstream in one call: the store, the per-frame runtime, and the core's standing takeover request. Vanilla Safe strips the gates in the core, so the request is dropped here too instead of left standing against a gate that will refuse it.

`refreshControlSettings` pulls the settings the live settings layer last pushed, when they are not the ones already applied (`controlSettingsMemo`). Comparing identity is enough, because that layer replaces the whole object on every push and never mutates it. Pulling instead of waiting for a push is deliberate. The settings screen tells the input engine about the two fields it knows belong to input, but the takeover also depends on the HUD style and on Vanilla Safe, which belong to other screens entirely. Reading the whole object here means no caller has to remember the full list.

`subscribeControlScheme` wires three sources:

- The UI store publishes only on a changed frame, and the memo check is an identity compare, so each change costs a pointer comparison and a real sync happens only when the settings move.
- Sprite availability is the one term of the takeover condition that is not a setting. It follows the active ROM's extracted art and can flip long after the settings last moved. The identity guard would swallow that, so `reapplyControlSettings` drops the memo before applying again.
- The input engine is the only thing that knows which profile is active and what the device reports, and it already resolves the modern lens on every profile change and every device snapshot (`rebuildSchemeBindings`). Subscribing to that resolution, instead of reading `profile.modern` at three separate call sites, keeps the cluster, the per-frame router and the pause menu looking at one object. The subscription fires at once, so a late import of this module still gets the bindings the engine resolved at boot. Bindings are the slot list an old assignment table is migrated against, so their arrival is a reason to read the settings again even though the settings did not move.

## stores/hud-editor-view-store

View-only state for the chrome of the HUD layout editor. It is never written to a layout document, so nothing here can leak into a saved file. The stage's own drawing and drag code reads the grid overlay and snapping flags. The outline and the panel layout read the outline and inspector widths and the outline's set of collapsed nodes. The store only holds the bits; it draws, snaps and folds nothing itself.

Collapse state lives here, not on the document. Which rows are folded shut is a fact about how someone is looking at a tree, not a fact about the HUD the tree describes. The same reasoning keeps `snappingEnabled` off the document. It survives a render (a `Set` in a store) but is scoped to no particular node. Opening the editor again on another layout starts every row expanded, which is the documented default. An id absent from `collapsedNodeIds` means expanded.

- `snappingEnabled` snaps stage resizes to the 8px game grid and to sibling edges.
- `PANEL_MIN_WIDTH`: neither rail can be dragged narrower, since past it there is no room for what the panel shows. `PANEL_MAX_WIDTH`: nor wider, because a rail is a rail, not half the editor. `PANEL_DEFAULT_WIDTH` is the width both rails opened at before either was resized: 20rem at a 16px root, matching the fixed width `HudLayoutEditor.css` shipped.
- `EDITOR_STEPS` is how far one press of a stepper moves (section 55). It is the editor's own step, chosen once at the bottom of the stage column and obeyed by every stepped field in the panel. A gap is 0, 2, 4 or 8 in every shipped document because the game's own grid is 8px, so stepping it by 1 takes eight presses to reach the number anybody wanted. It is view state and never reaches a document, like `snappingEnabled`: nudging by fours this afternoon is a fact about the person editing, not about the HUD.
- `gridEcho` says which cells the stage is echoing. The grid editor's own selection is published here so `EditorStage` can wash the matching rectangle without threading the selection up through three sections and back down. It is `null` while no grid cell is selected anywhere in the inspector.
- `flexEcho` is the same channel for the flex manipulation section (section 58). It says which children the strip has picked, so the stage can wash the boxes they were placed in. It is a second key instead of a wider one: a grid echo names cells, which exist whether or not a child stands in them, and a flex echo names children, which are all a flex container has. Folding both into one shape would make a cell reference that sometimes means an index, and the stage would have to ask the engine which it was looking at.
- Both echoes are visual only: nothing reads them to edit with (sections 48 and 50).
- `expandNodeIds` folds every id out of the collapsed set, for an ancestor chain being expanded so a row that was hidden and is now selected can be scrolled to. `collapseNodeIds` is the inverse, and it exists for one caller: a drag that spring-opened rows on the way past puts back the ones the drop did not land in (section 45), because a gesture that leaves six folders open behind it has damaged the view to do a move.

## stores/pause-menu-store

The enhanced pause menu's state, and the side effects its reducer refuses to perform.

`reducePause` is pure by design: it decides where the cursor is and never what the game does about it. Everything it declines lands here, because only this layer holds the bridge and the other stores:

- a `slot` press resolves through `assignTargetAt` and becomes an assignment;
- a `confirm` resolves through `planConfirm` and becomes a gear write, a refusal, or nothing. The one confirm that is a state change, a status row, stays with the reducer;
- a `closing` phase becomes the matching core exit, continue or save and quit.

Each of those arrives the same way whoever pressed it. A pad, a keyboard and the menu's own click handlers all raise the same `PauseEvent` at this one door, which is why the view no longer holds the bridge for a gear tier and the mouse no longer has an exit event of its own.

The menu does not decide when it is open; the core does. The host's takeover is armed continuously (byte 129 says only that it is in force), so what marks the menu as on screen is the native menu module running underneath it. Both are watched through the game UI store instead of polled, so a frame that changed nothing costs nothing.

### PauseCursorActions

What the cursor can do where it now stands: the legend's whole content, in three answers, each taken from the rule that performs the thing it describes. `confirm` is what a confirm does here, or `null` where it means nothing. `assign` says whether a slot press here would put something on a button. `back` says whether cancel goes back to the screen's first section instead of out.

The strip used to be a fixed list of six verbs, filtered by one boolean. Two of the six were wrong wherever it was drawn. The map button raises no menu event at all (`menuEdges` emits none), so the bar advertised a control that does nothing on every screen. And BACK is CLOSE on a screen's first section, so the strip named one action twice in different words. The rest were right but silent about the two things a player wants to know in an inventory: that a button press assigns, and what a confirm is about to do to the gear under the cursor.

`cursorActionsAt` asks each answer of the rule that would perform it. `confirmVerbAt` is the same call `planConfirm` plans from, `assignTargetAt` the one `planAssignment` refuses or accepts, `firstSectionOf` the one `backOut` steps through. Nothing re-derives what the cursor is on, which is the only way the strip and the press stay in step.

### PauseMenuStore fields

- `open` mirrors `state.phase !== 'closed'`, so a view can subscribe to just that.
- `refusals` counts refused slot presses since the menu opened. A count, not a flag, because the view flashes a line for each one and two refusals in a row must read as two answers. Whoever shows it owns how long it stays up; the store only says it happened, so a pad press and a mouse click get the same reply. A fresh open resets it.
- `canConfirm` says whether a confirm would do anything where the cursor stands. The legend reads it and drops its CONFIRM glyph where it would not, because an advertised control that does nothing is worse than one the strip never claimed. It is derived here, not in the view, because only this layer holds the context the rule is asked against. It is kept beside `cursorActions` (it is exactly `confirm !== null`) because the view carries it across the exit slide (see `useVisibleBrowsing`) and a boolean is all that journey needs.
- `cursorActions` is refreshed whenever the cursor or the save moves: taking a blade off changes what confirming that same rung means, and the strip has to say so without the player moving first.

### pauseContext

The live context the reducer and the view both read, built from one snapshot so they can never disagree. `activeItem` prefers what the host last wrote over what the buffer reports: on the frame the menu appears, the buffer may still carry the value the native init replaced, and opening the cursor on that cell is exactly the confusion byte 130 exists to prevent. The bow row gets the arrow type in force, never the raw register: the other half of that byte is ammunition on hand, and the menu has no business reading or writing it.

`pauseContext` stays internal. The reducer and the assignment rule are the only things that need it, and both are reached through `dispatch`. A view that built its own would be a second snapshot of the same save, free to disagree with the one the reducer just used.

### refreshCursorActions

Asks all three answers again and writes only a real change. It holds across `closing`, for the reason `useVisibleBrowsing` holds the cursor: the machine stops standing anywhere the instant the exit begins, but the menu stays on screen for the whole slide out, and a strip that loses two verbs on its way off the top is the same defect as a panel that swaps to the item grid on its way off.

### assignFromCursor and performConfirm

A slot press assigns whatever the cursor is on. `planAssignment` decides what that means for the pad and the mouse alike, and `assignFromCursor` performs it: clear the duplicates the plan names, write the target, and report a refusal so the menu can say why nothing happened.

A confirm activates whatever the cursor is on. `planConfirm` decides what that means for the pad, the keyboard and the mouse alike, and `performConfirm` performs the half the reducer cannot: the gear write. It returns false on a refusal, so the menu can say why the tier it drew faded did not go on. An exit is not performed there: it is a state change, so the reducer moves to `closing` and `performExit` carries it out, the same door a pause uses.

A confirm that wrote moves no cursor, so it reaches the reducer with nothing to set. What the same rung offers has changed, though, and `syncFromGame` asks again once the core reports the write. That is the honest clock for it: the bar changes when the gear does.

### performExit

Entering `closing` is what performs the exit; the core decides when `closed` follows. It returns false when the core refused, so the caller drops the phase change along with the write. A pause pressed during the open animation does nothing at all, and can be pressed again.

`coreWillExit` asks whether the core will accept an exit on this frame. `NATIVE_MENU_OPEN` is the value `WasmGetMenuState` calls open: the native scroll finished and a browse state is running. Both exits hand the native machine back to its own close path, and that path only ends from a menu whose open scroll has finished. `HostMenu_OpenScrollFinished` in `host_menu.c` refuses every other starting point, because closing mid-scroll sends the menu's scroll offset the long way round the 16-bit range instead of to zero. The C side is the guard. This half keeps our own machine honest about it: `closing` accepts no events, so entering it on a request the core just refused would strand the menu in a phase nothing can leave, the same soft lock by another road. It is asked once per exit request, never per frame, and of the machine about to be commanded. The menu's own slide is ours and is driven from this store (see GameOverlay).

### setMenuRouting

Flips the input router. While the menu is open the core is fed nothing the player pressed, and the menu receives rising-edge events instead (see `frame-router.ts`). The sink is wired once, on the first open. The engine itself is not involved, since the router reads the scheme runtime.

### syncFromGame

The core's own view of the menu, once per changed frame: repair any drift in the takeover or the equipped-item register, then open or close on the edge.

The save is half of what the cursor can do. A tier taken off changes what confirming that rung means without the cursor moving, so the strip is asked again on the same edge as everything else about the game. While the menu is closed, which is every frame of ordinary play, that costs one comparison.

The item is asserted again on both edges. On open, because the native menu's init walks the 21-entry grid before the hold matters and replaces any id that grid has no row for. On close, because the exit rebuilds the HUD and derives the register again from whatever it finds there.
