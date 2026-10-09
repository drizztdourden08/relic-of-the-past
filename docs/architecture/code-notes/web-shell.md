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
