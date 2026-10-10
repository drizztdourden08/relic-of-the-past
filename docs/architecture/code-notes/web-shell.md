<!-- @layer docs @kind doc -->
# Web shell code notes

Notes for the renderer shell: `apps/desktop/src/` outside `lib/` and `ui/`. That covers `App/`, `hooks/`, `stores/`, `platform/`, `utils/`, `main.tsx` and `env.d.ts`. Each heading names a file. The code carries no comments, so the facts a reader cannot get from the code live here.

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
- `STUB_RETURNS` covers the invoke methods whose callers read a property of the result straight away, where a bare `null` would throw. They return an empty object shaped like the contract in `apps/desktop/src/ipc/invoke-contract.ts`, so the renderer boots.
- `SCREEN_EDITOR_STUB`: editing the dataset needs a repo on disk, so every editor channel refuses here instead of reporting a false success. Each channel is spelled out by name and typed against `ScreenEditorApi`, so a channel added to the contract fails to compile until it refuses here too.
- `readNativeAppVersion`: a native host (Capacitor) reports the real app version, the Android `versionName`, which itself comes from the repo root `package.json`. The plain web has no native App plugin, so `getInfo()` throws and the version falls back to `0.0.0`.

## platform/hosts/electron-factory.ts

The Electron host adapter. It fulfills the platform ports by delegating to the `window.api` that the preload injects.

- The device port stays inert. Desktop handles keeping the screen awake and saving on close through its own window lifecycle, and the controllers carry desktop haptics.
- There is no display or controller port: the refresh rate comes from the Brock display module and the controllers from the Brock input module, on every host.

## platform/hosts/web-factory.ts

The plain browser host adapter, for a renderer opened over http with neither Electron nor Capacitor. It is also the fallback when host detection finds nothing. No window chrome and no persistent storage.

- The device port is best effort: the wake lock, `navigator.vibrate` and page visibility.
- `saveFile`: a browser cannot tell whether a download completed, and there is no cancel signal to tell apart. A started download is reported as saved.

## platform/hosts/capacitor-factory.ts

The Capacitor host adapter for Android and iOS. Window controls do nothing, since mobile has no window chrome. Files go through the Filesystem plugin. Controllers come from the Brock input module's `BrockInput` plugin through `inputApi()`, the same API as on desktop, and the refresh rate from the Brock display module's `BrockDisplay` plugin, which asks Android for a rate that divides evenly into 60. Any `window.api` call that has no port yet hits the boot-safe shim in `platform/api-shim`.

## platform/hosts/capacitor/device.ts

The Capacitor `DevicePort`: keep the screen awake during play (`@capacitor-community/keep-awake`), device haptics (`@capacitor/haptics`), and an app-backgrounded hook (`appStateChange` from `@capacitor/app`) used to save when the app goes to the background. Haptics buzz the phone on game events, since most Bluetooth pads expose no rumble through the WebView.

`onBackButton`: `MainActivity` intercepts Back and dispatches a `rotpback` window event carrying the swipe edge (it reads `BackEventCompat.getSwipeEdge`). The `backButton` event of `@capacitor/app` is not used because it cannot tell left from right.

## platform/hosts/capacitor/file-picker.ts

The Capacitor file picker, through `@capawesome/capacitor-file-picker`, which reads bytes as base64.

Saving goes to the device's Documents directory, not through a share sheet. The project does not depend on `@capacitor/share`, and a file written where the user's own file manager can reach it needs no extra plugin.

`extToMime` maps picker extensions to MIME types the Android document picker accepts. `.sfc` and `.smc` have no registered type, so they resolve to `application/octet-stream`.

## platform/hosts/capacitor/file-store.ts

The Capacitor `FileStore`, backed by app-private storage through the Filesystem plugin (`Directory.Data`). Paths are the same logical paths used on Electron, relative to the data root. Binary data crosses the bridge as base64. Removing a missing file and creating a folder that already exists both do nothing.

## platform/hosts/capacitor/storage.ts

The Capacitor `StoragePort`: an app-private location and per-domain usage through the Filesystem plugin. There is no reveal on mobile (`revealDataFolder` is false), so the home page shows the path read-only. A missing folder counts as zero bytes.

## stores/tracker-presence-store

Whether the checks tracker widget is on screen right now. The widget reports it while it is mounted, and the check toasts read it to follow their own "also while it is closed" setting. Never persisted: it is a fact about this moment.

## stores/exclusive-insets-store

Broadcasts the room docked widgets take around the game, to the consumers that need it (GameLayer, overlays). Tessera's WidgetManager reports the main view's rectangle through `onMainRect`; AppMain turns that rectangle into the four insets and writes them here, so the store stays out of the Tessera parts.

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

`staleGeneration` is the mirror generation seen at the load. The mirror is trusted again once it moves on: a box that closes, or a message the engine started after the load, is seen again.

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

## stores/hub-session

Who the app is signed in as, on the shared accounts. One store, because two surfaces read it at once: the account card (sign in, the code, sign out) and the bug report forms (the reporter line, and whether an email is asked). `refresh` runs at boot and after every sign-in or sign-out. A token the site revoked reads as signed out on the next refresh. `userCode` is the code to type on the site while waiting, `null` otherwise. `signIn` opens the confirm page on the given site, or on the Sanctuary when none is given. The sign in itself runs on the Brock secrets module's sign-in store (`useSignInStore`); this store adds the account the site answers with.

## bug-report/

The renderer's half of the Sanctuary bug report; the dialog is Brock's and the transport runs in the main process (`electron/sanctuary/bug-report/`). `useReportSnapshotOnOpen` sends the report context, the active profile and a live save state the moment the dialog opens, because only the renderer can read the running game. `useSignedOutIssueFallback` swaps in a transport that opens a prefilled GitHub issue while nobody is signed in, so a signed out player can still report.

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

`enhancedPauseDrawn` answers whether `EnhancedPauseView` will be on screen. It mirrors the render condition of GameOverlay term for term, and it has to: the takeover parks the native pause menu (no input handling, no cursor, no redraw), so arming it while nothing is drawn on top hands the player a blank, frozen screen. Both host-drawn styles (Enhanced and Modern) render it. The Original style does not, and there the native menu is left to draw and close itself.

`migratedAssignments` returns the settings' assignment table keyed by slot number. A table written before contract section 19 is keyed by ids derived from position (`slot:NORTH`), and turning those into numbers needs the slot list, which lives on the input profile, not in settings. So the fast path comes first: a table that is already all numbers needs no list and no work, which is every table after the first save. Only an old one waits for bindings, and it is read again the moment they arrive (see `syncControlBindings`). `migrateScheme` throws on a key it cannot read instead of dropping it, so a table that cannot be migrated fails loudly instead of silently losing rows.

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

## hooks/useAppVersion.ts

Fetches the app version through IPC. It lives in the renderer hooks layer, which may use `window.api`, so presentational components receive the version as a prop.

## hooks/useRefreshRateTitleBarItem.ts

The title bar's incompatible refresh rate tag, shown while the FPS readout is on and the rate is not a whole multiple of 60. The rate itself comes from the Brock display module (`useRefreshRate`, `effectiveHz`, `isSyncedRate`), which also owns the synced rate and its Display tab; the tag opens that tab.

## hooks/useInstalledPacks.ts

What the Hookshop installed on this computer, read from the Brock catalog module's installed record (`useCatalogInstalled`) and turned into `InstalledPack`s. One record serves the Hookshop tab and every editor, so an install, an update, an uninstall or a duplicate shows its lock everywhere at once. The first caller starts the record's watch.

## hooks/useInstalledKind.ts

The installed items of one kind, for an editor that locks them. `pack` is the install record of the selected item, or `null` for the player's own, and `packFor` answers the same for any row of the list. It reads `useInstalledPacks`, so the first editor opened loads the record.

## hooks/useWidgetPref.ts

A `useState` drop-in whose value belongs to the profile instead of the component. Point it at a widget id and the value survives the widget being unmounted by an open screen, a profile switch and a restart. Pass `null` and it degrades to plain local state with no store write and no disk read, the same bargain `useViewState` makes for a composite used without a ViewKey.

The value must survive a JSON round trip; see `widget-prefs.ts` for why that is the only constraint. The cast to `T` is the one place the `unknown` storage shape meets a caller's type. A pref written by an older build with another shape lands there; the widget reads it as `T` and the next write corrects it.

## hooks/useIsNarrow.ts

Whether an element is narrower than a width given in rem. It is measured on the element itself, so a pane squeezed by its neighbours answers the same as a small window. A layout that changes shape when narrow (a side pane becoming a tab) reads it; one that only restyles uses a container query instead. With no ResizeObserver (a test without a DOM) nothing is measured and the answer stays wide. An element of no width has not been laid out yet and says nothing about the window, so it is skipped.

## hooks/useImportProgress.ts

Subscribes to the main process `import:progress` event and reduces the stream for one import kind (rom, msu, language, sprite) to a simple state a spinner or progress bar can draw. The state is determinate (`percent`) when `loaded` and `total` are both present, and indeterminate otherwise.

## hooks/useInstalledActions.ts

What an editor can do with an installed item: uninstall it, make an editable copy, or update it to the store's live version. Uninstall and update go through the Brock catalog module the Hookshop tab uses, the copy through `store:duplicate`, and each then reloads the module's installed record so every lock follows. Each answers what the editor selects next: the copy's name, the updated item's name, or whether the uninstall went through. A cancelled update wrote nothing, so there is nothing to report.

## hooks/useSafeAreaInsets

The device's safe area insets (notch, display cutout), in CSS px. The Android shell runs edge to edge and consumes the window insets so the WebView fills the whole screen. That zeroes the page's `env(safe-area-inset-*)`, so the native side forwards the cutout sizes as CSS custom properties on `<html>` (`--sai-top`, `--sai-right`, `--sai-bottom`, `--sai-left`) and fires a `rotpinsets` event, which this hook reads. On hosts that do not inject them the values are 0 (no notch).

`applyNotchMode` reflects the notch render mode on `<html>`, so CSS, portaled dialogs included, can branch on it.

## hooks/useCanvasFit.ts

`bufW` and `bufH` are the canvas backing store size: twice the source resolution, because the core presents at 2x (`BUFFER_OVERSAMPLE`). `stretch` fills the container outright and ignores the source proportions. `pixelPerfect` snaps to a whole number of source pixels so none of them come out a different size.

`fitWholePixels` returns the largest size in whole source pixels that still fits. It is measured in device pixels, not CSS pixels: at 125% or 150% display scaling, a size that looks like a clean multiple in CSS units lands on a fractional number of real pixels, and the uneven pixel sizes it is meant to remove come straight back. It returns a CSS size for layout. The scale never drops below 1, so a container too small for even 1:1 gets the smallest honest size and overflows instead of collapsing to nothing.

`fitProportional` returns the largest size that keeps the source proportions, filling one axis exactly.

Moving the window to a monitor with another display scaling changes the device pixel ratio without changing the container's CSS size, so the resize observer never fires; the `resolution` media query does. It is armed again on each change, because a query only matches the ratio it was built with. Only pixel-perfect mode depends on the ratio, so nothing else pays for the listener.

## hooks/useTrackerData

Everything the checks tracker needs, subscribed live (`useLiveTrackerInputs`): the player's inventory, the checks they completed, the derived reachability snapshot, and, when a randomizer session is loaded, what each check holds this seed plus the sphere it belongs to.

One hook serves both surfaces (the Checks widget and the randomizer page's spoiler tab), so the two can never drift apart on what a check contains.

Reachability comes from one engine in both modes. A seed is judged over its own placement. The plain game is judged over the placement where nothing moved (`normal-placement.ts`), so the engine cannot tell the two apart and cannot disagree with itself. Rows the world holds no location for keep being read from the dataset's own requirements, the same way in both modes (`tracker/tracker-statuses.ts`).

An online multiworld has no placement of its own, so it is judged over that same plain game world, the fullest one the app can build. What it does not do is show the plain game's items: the server hands locations over one at a time, so the run says its contents are not known here (`randomizer-client/run-kind.ts`) and every row shows nothing instead.

- `prefKey` is the widget id the view settings belong to. With one, everything the user arranged (grouping, view mode, filter, open panels, expanded groups) is remembered by the profile and survives the widget being unmounted by an open screen. Without one (the spoiler tab) it is plain local state.
- `DEFAULT_GROUPING` is module level, so an unset pref hands back the same array every render and the group tree is not rebuilt on each one.
- One roster serves every surface that lists rows (`tracker/tracker-roster.ts`): on a seed, the locations it generated plus the events; without a placement, the dataset's own list.
- `mergeStatusOnlyChecks`: a status-only row has no "ever" fact of its own, so its tick is its live status (`story.ts`).
- The placement the rules answer over is the seed's own, or the one where nothing moved, which is also the fullest world an online session can be judged in.
- A swap chest reads the stand-in once its item is held (`liveItems`). Only on the plain game: a seed's chests hold what the seed placed, and online knows none of its contents.
- `countTrackerStats`: the totals follow the Items, Events or Both switch and the shelves rule. The summary counts what the list shows (`isListedRow`), before any search or facet narrows it, so it always equals the sum of the groups. The Items view lists no event, so there a seed's total is its locations (`tracker-count.ts`), the count an Archipelago room keeps.

## hooks/randomizer/usePoolTotals.ts

The fill bar's totals of the live accounting: the same `PoolAccounting` the In Pool column reads, so the bar, the cells and the listing move together on every edit. `null` while the pool cannot be built.

## hooks/randomizer/deliverable-sets.ts

The deliverable sets the live panels hand the pool: the capability probes' own answers, the same sets generation uses, so what a panel shows is exactly what the seed will carry.

## hooks/randomizer/pool-item-sprite.ts and pool-item-sprite-of-key.ts

The extracted PNG of one pool item, by the name the pool carries. A capacity upgrade name resolves to its family's stamped upgrade sprite, any other name goes through its item record, and a name with no art at all resolves to nothing. One lookup is shared by the pool listing and by a price that names an item, so there is no second path to a sprite. It imports the item lookup module directly, not the client barrel, because a sprite needs no session. `poolItemSpriteOfKey` is the same lookup from a pool item, which is what the listing and the plan carry.

## hooks/randomizer/pool-totals-model.ts

The pool accounting split for the fill bar. The items of the pool minus the capacity upgrades and the filler are the items in pool. The upgrades and the filler stand on their own, and the fixed spots and the prizes pass through. Every input is the accounting's own number; this only takes the two segments out of the pool count, so the five segments fill every location of the world exactly, the same total the Checks widget shows.

## hooks/randomizer/usePondDemands.ts

What this seed's ponds ask for, memoized per snapshot and seed. The roll is the generator's own (`fill/pond-demands-of-snapshot.ts`), so the preview and the placement carry the same demands, and the deliverable sets come from the capability probes, the same sets generation is given. A snapshot the pool cannot be built from asks for nothing: the panel then shows the plan's rupee prices, which is what it showed before the demands existed.

## hooks/randomizer/pond-mode-rows

The pond tab's own reading of the catalog's capacity pond mode row: the same entry with its choice list narrowed to the modes the capacity and pond rule still allows. Narrowing the dropdown instead of refusing the pick afterwards is the point: a mode that cannot be honoured is never offered, and the note beside the row says why it is missing. Only that one pond is bound by the rule: it is the game's only source of the two families the rule protects, so the other two ponds keep every mode.

`FROZEN_POND_KEYS` holds the capacity pond's mode row, frozen: the master switch is off, so it is not the player's to set. `pondGroupsFor` returns the tab's groups with the mode row's choices cut down to the allowed modes.

## hooks/randomizer/dark-room-choices

The dark room pair of the creation form's choices, read and written as the one setting the section edits. The five fields stay exactly where they were on the choices object; this only gathers them, so the wiring through `randomizer-choices` (and the snapshot it freezes) is untouched. Both directions are spelled out field by field instead of derived from the key map, so a renamed field fails to compile here instead of resolving to undefined at runtime and freezing a light the player never unticked.

## hooks/randomizer/useProfileConnection.ts

A profile's randomizer config as the screens show it, with the latest connection edit applied. Saving writes the profile (only connection keys pass, `profile-patch.ts`), shares the saved config with every other screen (`profile-connection-store`) and reconnects the session on the new values at once. The app's profile object is left alone: the next boot reads the profile from storage anyway.

## hooks/randomizer/impact-cell.ts and family-impact-cell.ts

The wording of the In Pool cell. A plain option reads as its difference on the fill ("+33 loc · +33 items", and "0 loc · 0 items" too, with the zero muted). A locked row carries its reason, reworded for the player (`NOTE_LABEL` holds the pool accounting's short qualifiers in the player's words). A capacity family reports its spot and its upgrade items separately: upgrades take the place of filler one for one, so the pool does not grow by that many and the cell must not say it does.

A measured zero is still the answer: the row was compared and adds nothing, so it keeps its numbers and takes the muted look every other row that contributes nothing already wears (a locked row's reason, a capacity family planning no upgrade). Muting instead of blanking is what makes the difference visible: an unmuted line is a live contribution, and a muted one is a row that changes the seed without changing the pool.

## hooks/randomizer/useCapacityRows.ts

The four capacity family rows of a profile, derived once per input. The creation panel and the Run tab both draw them through CapacityUpgradesBlock. `forced` carries the sentence a sibling setting put on a family's card (the rule's own reading), so a row the player cannot set right now draws inert with the reason on it. `walletFloor` is what these settings let the seed charge at once, which is where the wallet's final cap stops going down. `bonus` is what each family's pickups hand over.

## hooks/randomizer/item-power-rows.ts

The items tab's own reading of the item power rows: which of them the blade ticks have already decided, and what the seed will be built with.

The rule that decides them is the generator's own (`item-power/`), not a copy written here: the same function the fill and the running game are armed from, so a switch can never show one thing while the seed does another. A masked row shows on and inert with the reason beside it, and the player's stored answer stays exactly where it was: unticking is what gives the question back, not this file.

- `keys` are the rows the blade ticks decided, empty while the family still reaches both readings.
- `notes` hold the sentence to show under each of them.
- `valueOf` gives the value each row shows: on for a forced row, the stored answer otherwise.

## hooks/randomizer/currency-sprites

The extracted PNG that stands for one currency a price may be asked in. The files are the shop block's own symbols (`sprite-manifest/randomizer-sprites.ts`), read through the same sprite query the tracker, the pool listing and the check list already draw from, so every surface shows one set of art and there is no second path to a sprite.

A whole price resolves the same way (`priceSpriteOf`): a counted currency to its symbol, a bottle to the symbol of what is in it (drawn as the shop block draws it), and an item to its own drawing (`pool-item-sprite.ts`), which is the one thing that says which item without spelling the name again. An item with no art at all has no sprite.

## hooks/randomizer/capacity-pond-choices

The capacity and pond rule, applied to the creation form's whole choices object. Two readings, both pure:

- `withCapacityPondRule`: an edit has just landed, so the side the player moved keeps its value and the other is pointed again. A family a sibling setting pinned (retro bow and the projectiles) keeps its stored setting in the choices (`keepingPinned`): the rule masks it on the way to the snapshot, and switching retro off hands it back.
- `capacityPondStateOf`: everything the two tabs need to draw the rule honestly, with the notes binding on the current pair, whether each tab is editable, and the pond modes its dropdown may offer. The choices are already reconciled by the time they are stored, so this never changes a value.

## hooks/randomizer/usePoolListing.ts

The item pool of a snapshot as list groups, memoized per snapshot like the impacts. It uses the same fill world the accounting reads, built with the same scope, so the listing is the multiset the generator would shuffle, never a placement. It is built under the profile's own seed, so a random shop scope opens the shelves this seed will open. A pool that cannot be built lists nothing; the accounting beside it carries the reason.

There is no weapon picker: the listing is the multiset before the mentor draw, and the draw itself is shown as a group of candidates, never as one decided item.

Sprites join the rows only once the set of the ROM the listing is for (the creation form's pick, ahead of any active profile) is extracted. So the listing draws again with art the moment the background extraction lands, and again, with fresh URLs, when that extraction rewrote a set the rows were already drawing. That is why `spriteRevision` is a dependency of the memo without being read in it: it moves when the set behind the URLs was rewritten, and the rows must be rebuilt so they carry the new ones.

## hooks/randomizer/pool-listing-model.ts

The pool builder's own partition as list groups: the global pool by its classification (progression, useful, filler), the assured starting weapon, the restricted sets per dungeon, and the prizes. Each is a multiset of names to counts, largest count first. The categories are read off the built pool, never derived again here. Art comes from the extracted sprite set through the one lookup every surface shares (`pool-item-sprite.ts`). While the set is not extracted yet, no row carries a sprite at all, so the listing shows placeholders instead of asking for files that are not on disk.

## hooks/randomizer/starting-weapon-group

The starting weapon group of the listing in standard mode. The generator draws the mentor check's weapon at random from the assembled pool (`ItemPool.py` lines 294 to 318: the first sword tier found, the first bow, each arsenal item, the bomb pack). So the group names the whole candidate set, exactly one of which leaves the pool for that check, instead of a single stand-in pick that would advertise a weapon the seed may never grant. Rows follow the reference's own list order (swords, bows, arsenal, bombs), not the order the pool is scanned in. The group sets aside exactly one item of the pool.

`withStartingWeaponGroup` inserts the group right after the listing model's own partition of the global pool (`POOL_PARTITION_IDS`), where the model lists the assured weapon.

## hooks/randomizer/usePoolImpacts.ts

The In Pool column, live: the real pool accounting of a snapshot and the worded cell of each option, memoized per snapshot (a full pass takes a few milliseconds, so every edit computes it again). The deliverable sets come from the capability probes, the same sets generation uses, so the column shows exactly what the seed will carry. A pool that cannot be built (more upgrades than the filler can absorb) reports its reason in `error` instead of an accounting.

## hooks/randomizer/choices-of-snapshot.ts

A frozen option snapshot read back as the creation form's choices, so the options panel can draw a profile's stored settings through the very same blocks it draws a new profile with. It is the other direction of `randomizer-choices.ts`: every block is read with the snapshot reader the generator itself uses, so what the read-only panel shows is what the seed was rolled from.

The shop price rows stay empty because the price block reads the snapshot values straight, never the choices. `plainChoicesOf` reads the plain rows off the same key map the snapshot is written through; it casts because the map pairs each key with a field of its own type, while the snapshot holds every value as the catalog's one union. The seed passed in is the profile's own, which a random shop scope drew its shelves from. The lights are read as the generator reads them: masked by the world-item scope.

## hooks/randomizer/pond-ask-rows.ts

The ask block, derived: one pond's demand setting turned into the rows the panel draws for it. The rows have the shape of the shop's own currency rows, because the same component draws them (CurrencyPriceRow), so a demand and a shelf price read alike wherever they appear.

The rupee row is the odd one. Its two thumbs are the pond's own price ladder, so it carries the ladder's stops and the row state's range, and an edit on it moves the ladder itself. Bombs and arrows carry their own stops and write their own amounts, their stops cut at what this profile's bag and quiver reach (`pond-ceilings.ts`). Only the Custom mode cuts a ladder, so in every other mode the rupee row is a tick with no range beside it.

The bottle row counts too: how many bottles of the contents under it she may name, over the four slots a file has.

- `nearestStop` finds the stop nearest an amount, so a stored amount off the ladder still shows a thumb.
- `stopsUnder` keeps the stops up to a ceiling, and keeps the first one so a tiny reach still has a thumb.
- `rangeOnStops` gives both thumbs of one row as indexes into its own stops.

## hooks/randomizer/option-tab-model/option-tab-keys.constants.ts

The option keys a tab claims by name, not by catalog section. The reference project files these rows under sections this app does not follow: the traps sit in its item section, the scenery shuffles in its enemy one, and the doorways, the trick knowledge and the two entrance requirements all sit in its single world one. So the tab that owns each subject names its rows here instead of inheriting a section that would scatter them. Every set is read by one rule (`option-tab-model.ts`) and nothing else, so a row changes tab only by moving between these sets.

- `POND_KEYS`: everything the wishing pond block owns, its mode row included.
- `CAPACITY_BLOCK_KEYS`: the two switches the capacity block owns beside the family rows, and the pickup bonus rows drawn on them.
- `TRAP_KEYS`: rows that turn a pickup into a nasty surprise, wherever the reference files them.
- `ENVIRONMENT_KEYS`: world content shuffles, what the scenery, the floors and the drops hold.
- `ENTRANCE_KEYS`: where the doorways lead. The shuffle itself, the number two players share to get the same doorways, and the hand-written connection list that would override both.
- `GLITCH_KEYS`: how much trick knowledge the seed may expect, and the boots it would hand out for it.
- `ITEM_KEYS`: what the player already holds when the game begins, and what the pool therefore stops holding. The reference files it with the plando rows because all three are written out instead of chosen, but the question it asks is about items, so the items tab claims it by name.
- `SHOP_KEYS`: what a merchant says before you pay. The reference files it with the hints, since both are about text; the thing it changes is a shop.
- `MEDALLION_KEYS`: the medallion each sealed entrance asks for. They read as world rows in the reference, but the thing they gate is a dungeon, so they belong beside the rest of what that dungeon asks of the player.

## hooks/randomizer/pond-preview

The throw prices, as this seed asks for them.

A throw that hands over a prize asks for the demand its rung was rolled with (`pond/pond-demand-seed.ts`), and that is what its chip shows: the currency's own sprite and the amount she wants. A throw that wins nothing still costs its rupee price, so its chip reads as it always did. An item demand carries no amount at all, so its chip is the item's drawing and its name (`chipTextOf`).

The two readouts under the chips follow the same charges. The total (`pondPreviewNote`) counts the rupees the ladder takes, and says how many rungs ask for something else, because a mixed ladder cannot be emptied with rupees alone. The wallet line (`pondWalletNoteOf`) reads the dearest single rupee throw on the way to the last prize, and drops out when no rupee is asked for at all.

Nothing here rolls anything: the demands arrive already settled, so the panel and the seed cannot disagree.

A `PondCharge` is what one throw takes, and in what. `demand` is the demand the throw's rung was rolled with, absent while it only costs its price. `rupees` is what the throw takes out of the wallet, 0 while it asks for something else. `other` means she asks for something the wallet cannot pay.

`pondChargesOf` gives one charge per throw: its rung's demand where it has one, its price where it does not. Only a Custom pond asks for a demand at the water (`randomizer-client/pond-demand-rows.ts`), so a pond at its native economy previews the rupees it charges and nothing else.

## hooks/randomizer/pond-row-model

The pond row, derived: a setting turned into everything the row draws. Pure, so the creation panel and the Run tab show the same thing from the same input, and the preview is the plan the seed will use, not a second description of it.

`settingOfState` is the inverse of `stateOfSetting`. Its ask part is left out while it is the rupees-only reading an absent ask already means, so an untouched block stores exactly what it stored before the block existed.

`pondRowModelOf`: `ceilings` is what the wallet, bag and quiver can hold. No range control offers a stop above its own, so no thumb can ask for more than the profile can ever pay. `demands` is what the profile's own seed rolled (`pond/pond-demand-seed.ts`), so the preview shows the throws as they will be asked for; none leaves every throw reading as its rupee price. `walletNote` is the dearest single rupee throw on the way to the last prize: what the wallet must hold.

## hooks/randomizer/capacity-row-state

The row's state model, in both directions with a family setting. The row works in ladder indexes and dropdown choices (a preset is a choice of its own). The setting is what the snapshot stores. A preset choice writes curve and count and nothing else, and reads back as the preset whenever the curve and count still equal what it would write; editing either detaches it.

- `hiddenPresetsOf`: the wallet has no reference ladder, so the Reference preset is not offered there.
- `customDefaultOf`: the Custom values a family starts from when its mode switches to Custom: the vanilla rung up to the top of the ladder, so switching modes changes nothing until a thumb moves. The empty rung below stays one drag away.
- `rowStateOf`: a family without a curve row (the meter) has no dropdown, so there is no preset to name.
- `settingOfRowState`: the final max may not stop below the family's floor (`capacity/max-floor.ts`: the projectiles must hold the ending's silver shots, and the wallet whatever these settings let the seed charge at once). A thumb dragged under it snaps back onto it, and the start follows if it sat above.
- `detachedFromReading`: a preset choice is an instruction only when it is new. The row hands back the reading it was given with one part changed, so a preset that already named the current curve and count is that reading, not a pick: the edit is to the range or the count, and it goes through as the plain curve with the count as edited. Only a freshly chosen preset writes its own count.
- `applyRowChange` applies one row edit to the profile. Switching the curve to free seeds the chips from the jumps the current curve produces, so the editor starts from a valid sequence instead of from nothing.

## hooks/randomizer/capacity-row-model

A family setting turned into everything its panel row draws: the plan (through the shared derivation, never written again), the formatted ladder preview for the mode, the In Pool cell, the count floor and ceiling, the curve dropdown entries, the free sequence verdict and the pickup bonus. The labels are the words the game itself uses for each family.

- `captionOf.mode` says what the family's modes do, taken from that family's own catalog row instead of written a second time, so the family row explains its dropdown in exactly the words the plain option rows and the Run tab use. `captionOf.bonus` is the bonus base switch's own clarifier: what the percentage is of.
- `previewOf`: under Vanilla, the game's own ladder is exactly what "in pool" would ship as items, so the preview walks it, not the whole grid.
- `floorNoteOf` says where the family's final max may not stop below, as one line: what asks for it and the rung that holds it. Only a Custom row can be set under a floor, so only a Custom row is told about it.
- `CapacityRowInput`: `fillerHeadroom` is the filler still in the pool (`null` when the pool could not be built). `progressive` makes pickups climb the ladder in order. `forced` is the sentence a sibling setting put on this family's card, and the row draws inert with it in red. `walletFloor` is what these settings let the seed charge at once, the one thing that moves the wallet's own floor. `bonus` is what a pickup of this family hands over beside its ceiling.
- `capacityRowModelOf`: the wallet has no spot to hand a location back, so its items only ever displace filler, and its count stops where the filler runs out. The bonus shows whenever the family hands out upgrade items, which Vanilla never does.

## hooks/randomizer/option-tab-model

The option catalog, sorted into the tabs an options panel shows. Pure and data driven: a row lands on a tab from its own catalog entry, its group, or one of the key sets in `option-tab-keys.constants.ts`, so a catalog change moves it on its own with nothing to keep in sync.

The same rule (`tabOfOption`) answers every question a tabbed panel asks: which live groups belong to a tab (so the sections that bubble up keep their real headings inside it), which fixed groups belong to it (so a tab that owns a subject also shows the settings this version does not offer for that subject), and how many of a tab's rows the player has moved off the baseline, which is the count a tab wears so a changed setting is never hidden behind a tab the eye skipped. Values are compared as text because a snapshot may spell a ladder rung as a string where the catalog spells it as a number.

The world tab is the fallback for both, live and fixed alike: a row no subject tab claims lands there instead of on a tab of its own. It once held two switches and read as a shrug of a first page, so the subject that describes the world now opens the panel and takes them with it.

- `OPTION_TAB_IDS` are the faces of the options panel, in the order shown. `LIST_TABS` are the tabs that draw a plain list of live rows.
- `LOCKED_TABS` are the tabs that show fixed rows. Every subject keeps its own fixed rows on its own tab, so everything about that subject is one place to look. There is no catch-all: the rows that once needed one were each a second spelling of a control standing above them, and they are gone from the catalog instead of filed away. The items tab keeps exactly one fixed row, the starting inventory, because nothing above it asks what the player begins holding.
- `tabOfOption` is the one rule every split and the count read. Locked and live rows follow the same path, so the settings this version fixes sit beside the ones it offers. The capacity and pond rows sit in the reference's item section but have tabs of their own, so they are claimed before the section is. Two rows the reference files away from the subject they change are claimed by name (`ITEM_KEYS`, `SHOP_KEYS`), so each sits on the tab that answers for that subject. Whole sections with a tab of their own come next; the environment rows are read first, because the reference files those under its enemy section too. The rows about a session shared with other players describe how the seed is played, not what is in it, so they ride on the tab that opens the panel. Everything left, which is the hints from the reference's own catch-all section, belongs on the world tab.
- `splitUnlockedGroups` splits the live groups across the tabs that show them, keeping each row under its own catalog heading. A group whose rows all moved elsewhere is dropped instead of left as an empty heading. `splitLockedGroups` does the same for the fixed rows, so a tab that has taken a subject over receives that subject's fixed rows too. Neither side filters the other's rows by hand.
- `changedCountsOf` counts how many rows of each tab sit off their baseline, for the tab indicator. Locked rows can never move, so a tab holding only locked rows always counts zero and wears no indicator.

## hooks/randomizer/randomizer-choices

The creation form's randomizer choices, mapped both ways to the catalog option keys they stand for. One reading, shared by the live options panel (which snapshots the choices on every edit to compute the In Pool column and the totals again) and by the profile writer that freezes the same snapshot onto disk.

Keeping both on this module is the point. When each built its own override list, a row added to one and forgotten in the other froze silently: the control moved, the snapshot kept the baseline, and nothing downstream ever saw the change. For the same reason the plain scalar rows are declared as one map from key to field (`PLAIN_FIELD_BY_KEY`) that drives both directions: the panel reads a row's value through it and the snapshot writes that row through it, so there is no second list that could disagree. It is the only place that correspondence is written down: a new plain unlocked option is one line there plus its field on the choices.

The fields of `RandomizerOptionChoices`:

- The four dungeon item families (`bigKeyShuffle`, `smallKeyShuffle`, `compassShuffle`, `mapShuffle`) say how far each may travel. One field per family instead of one object, because the four are separate catalog rows the player sets apart, and each reaches the generator through its own source key.
- `shops` is what the shops are asked for: the shuffle mode, which slots may be shuffled, how many of them a counted mode opens, and how deep each stocks. One field for the whole shop scope, so its 34 or so catalog rows are wired in one line instead of listed twice. `shopPrices` holds the shop price rows by catalog key; the block owns their whole set.
- `capacityEnabled` is the master switch: off leaves all four families vanilla and the pond native. `capacityProgressive` makes pickups climb each Custom family's ladder in order. `capacityBonus` is what a pickup hands over beside its ceiling, one field for all eight rows.
- `ponds` is what each of the three ponds sells; the legacy setting leaves one exactly as it was. `pondShare` is one set of settings across all three ponds; absent reads as three ponds set apart.
- `progressiveTiers` says which tiers of each progressive family exist. One field for the whole set, so its thirteen catalog rows are wired in one line, and unticking every blade rung is what the retired swordless row used to say. `progressiveModes` says how each family's copies arrive: in order, or the rungs themselves in any order, one field for all five rows.
- `retroBow` holds the retro switch and the two per-shot costs, one field for the whole block.
- `difficulty` says how many copies of each tiered family the seed carries and how high the hearts climb, one field for all six rows.
- `itemPower` holds the seven item power switches. `storyGates` says which recorded event each story gate reads and what the counts ask for, one field for all thirteen rows.
- `accessibility` is how much of the seed has to be reachable for it to count as valid.
- `darkRoomLightRequired` asks whether an unlit room must be lit to count as passable. The four lights have one field each; the lamp alone is the reference reading.
- `ChoiceField` names every plain unlocked option that maps to one form field.

`NUMERIC_FIELDS` lists the numeric fields, so a slider row writes a number and a toggle row a boolean. It is empty while every plain row is a toggle, because the shop sliders moved into the shop block, which writes their values through the scope. `CHOICE_FIELDS` lists the fields a select row writes, so its chosen key is stored as the string the catalog offered instead of being coerced to a boolean.

`capacityPondOf` lifts the pair the capacity and pond rule reads off the choices. The rule is about the capacity pond alone, since that pond is the only source of the families it binds. The retro switch rides along because it pins the projectiles family (the rule masks it); a choices object that never carried the retro block reads as off.

`randomizerChoiceOverrides` returns every catalog key these choices decide, with the value chosen for it. Two dependency rules run here instead of at the controls, so a pair the panel somehow left contradicting each other still freezes as a playable seed: the capacity families and the pond are settled together (the upgrades always exist somewhere), and a bottle content whose cauldron went to the shuffle is masked off the player's own price rows. Both are masks, not rewrites: the choices keep what the player asked for, so untying either dependency gives the setting straight back. A choices object that never carried the bonus block reads as the baselines, and one that never carried the story gates reads as the story as the game tells it.

`snapshotOfChoices` is the snapshot these choices freeze: what the panel reads and the profile stores.

## hooks/randomizer/server-setup/server-setup-draft

The Archipelago server setup as its fields show it: host and port, password and slot. The profile keeps one `host:port` string (`server-address.ts`); a `host:port` typed or pasted into the host field moves its port across. The profile creation form and the Randomizer page's Network tab both edit a connection through this one draft, so they check and save alike.

- `DEFAULT_PORT` is Archipelago's own default port, which a room hosted with default settings listens on. `EMPTY_SERVER_SETUP` is the setup a new profile starts on: no host yet, the default port and slot name.
- `absorbPort`: a host that carries its own port hands the port to the port field.
- `withHost`: a paste of `host:port` into the host field splits at once; typing waits for the field to be left.
- `serverUrlOf` gives the address as the profile stores it.

## hooks/randomizer/server-setup/useServerProbe.ts

The server setup's Test connection: the boot's own pre-flight probe (`online-probe.ts`), run on demand against the address in the fields. It only asks the room for its greeting, so it says whether the server answers and hosts this game; the slot and password are checked when the game connects. A result belongs to the address it tested: edit the address and the result goes. `plainReason` puts the probe's reasons in the words a player reads. A later test, or an edit that started one, owns the result, so only the latest run writes it.

## App/App.tsx

A thin tunnel into the renderer. All shell orchestration and layout live in the `app/main` view (`ui/domains/app/views/AppMain`); this entry only mounts it.

## App/types.ts

Re-exports the types of `App.type.ts` under the old path, because views outside the shell still import `@app/App/types`. Code inside `App/` imports `App.type.ts` directly.

## App/PageRouter

`ProfileHub` stays mounted, so it keeps its scroll and state; the other pages render on demand. The hub is hidden while another page shows, instead of unmounted.

`TITLED_PAGES` lists the pages that are one full-screen layer with a title around a view that takes no props. The router looks a page up there, so adding one of these is one entry.

- Creating a profile from the Data Manager only leaves the form on success. A failure keeps it open to show the error.
- The HUD layout editor brings its own FullScreenLayer (title and close), like the sprite studio, because it wants the whole width for a true-scale stage. SpriteDebug also brings its own layer, so both render directly.

## App/behavior/useDumpNav.ts (`--dump-nav=N`)

A debug hook for the `--dump-nav=N` command line flag. It starts the game, loads save state N (a number is a quick slot, a name is a manual save), waits `DUMP_SETTLE_MS`, reads the navigation state from WASM (screen detection, entrances, transitions, exits, stairs), writes it to `debug-output/dump-nav.json`, then closes the window.

`collectNavDump` reads everything in a fixed order. `readNavLocation` reads the UI state buffer at the same offsets `ui-bridge.ts` uses in `parseGameUIBuffer` (`UI_STATE_OFFSETS`, little-endian 16-bit for the indexes). The live dual-layer tables are read before the attribute grid is rebuilt. The rebuild now snapshots and restores WRAM, so the order is no longer load-bearing, but the two describe different things (the live room against the ROM-derived one), and reading the live one first keeps that plain. The toggle floor positions are only populated after `WasmBuildRoomAttrGrid` runs, so they are read after it.

`floodStartOf`: the flood starts on the sub-screen the player is physically on. For a multi-screen area that is not the area index the game reports (the area head). Anchoring the flood to the head measures the position against the wrong origin, pushes the start tile past 63 where it clamps, and seeds the walk in a sealed pocket. The navigation widget derives the live sub-screen the same way (`useNavigation.ts`), and `apps/desktop/tests/e2e/flood-parity.keep.spec.ts` catches drift.

`buildNavDump` assembles the JSON. Its key order is the file's key order, so it is kept stable for baselines. A door of type 22 (`LAYER_TOGGLE_DOOR_TYPE`) toggles the layer, and an attribute byte from 0x90 to 0x97 is a layer toggle tile. `annotations` carries the mechanics with their reachability: a detected check the flood cannot walk to is flagged `blocked`, so a dump says whether a thing is obtainable.

## App/behavior/run-dump-flood.ts

Runs the `--dump-nav` flood and derives its annotations. It is kept apart from the pure builders because it does touch the game: it goes through the same runner the simulator uses (`floodRoomRun`, `floodOneOverworld`), so a dump and a run can never report different reachability for the same screen. The bug this replaced was a hand-built option set with an empty inventory.

`reachableCount` and `totalTiles` describe the whole connected area (`propagateArea`), the same total the widget shows; everything else in the flood dump still describes this screen alone. Without this, a room that only reaches its full extent through a stitched neighbour under-reports next to the widget. `annotations` hold the mechanics with their reachability, where a check the flood cannot reach is `blocked`.

## App/behavior/dump-flood-items.ts

The player's real traversal tokens, for the `--dump-nav` flood. The dump used to flood with an empty inventory, so it reported fewer reachable tiles than the widget for the very same room (590 against 608 in the Jail Cell), and a baseline captured from it could not be compared with anything. It now floods with what the player carries, from the same tracker the simulator reads. `TILE_REQS` are the traversal tokens the flood understands; other reach tokens do not matter here. `lift.1` is always present: lifting bare-handed needs no item.

## App/behavior/compute-flood-fill.ts and compute-overworld-flood-fill.ts

Pure builders for the `--dump-nav` payload: no WASM calls, the data is passed in. The flood itself was already run by the shared runner (`floodRoomRun`).

- `reachableRows` holds 64 rows of 64 base-36 characters, one ReachState digit per tile (0 is unreachable), from `encodeReachableRows`.
- `reachableByLayer` gives the reachability per layer for dual-layer rooms, which reveals tiles reached on both layers.
- `ledges` are the one-way ledge traversals cliff preprocessing produced (start to landing).
- `attrRows` holds the raw attribute grids as 64 rows of 2-character hex bytes, for baselines and diagnosis (`encodeAttrRows`); `layer1` only for dual-layer rooms.
- `scrollBoundary` detects the scroll boundaries of a 2x2, 1x2 or 2x1 room and lists the tiles that cross them.

## App/behavior/useDumpLayers.ts (`--dump-layers=N`, `--hover-tile=col,row`)

A debug hook for the `--dump-layers=N` flag, with `--hover-tile=col,row` as an option. It runs the whole pass itself and exits, dumping the room index and the dual-layer grids (the same data the overlay uses) as JSON. `--hover-tile` also drives the tooltip over the target tile so the screenshot captures it. Usage:

```text
npx electron dist/electron/main.js --muted --dump-layers=6
npx electron dist/electron/main.js --muted --dump-layers=6 --hover-tile=45,31
```

It waits `STATE_SETTLE_MS` for the state to apply and a few frames to render before the first screenshot. The room index comes from the UI state buffer (offset 77, 16-bit little-endian, `readRoomIndex`).

`verifyHoverTile` checks the data at the hovered tile before any UI interaction: whether the two layers split there, and whether layer 1 is an enclosed, reachable interior (`isLayer1Reachable`).

`captureHoverTooltip`: the navigation widget opens on its own through autoFlood, since `--hover-tile` implies autoFlood in the preload. It waits for the flood button (the widget rendered), clicks it, then waits for the TileInspector, which appears once the flood completes and renders the overlay. It then waits a tick so the `useEffect` that registers `window.__debugHoverTile` has run, calls it to set the tooltip state directly, waits for React to render the tooltip, and takes the hover screenshot.

`logHoverVerdict` reports the hovered tile: attribute 0x1C on either layer means normalization failed; otherwise the tile has a legitimate split, or both layers match.

## App/behavior/find-split-tiles.ts and is-layer1-reachable.ts

`findSplitTiles` lists every tile where the two collision layers disagree. `isLayer1Reachable` walks breadth-first from a tile through connected `0x00` tiles on layer 1, and returns true when that region does not touch the grid boundary, meaning layer 1 is an enclosed, reachable interior instead of being open to the edge.

## App/behavior/useAutoTest.ts (`--auto-state`, `--screenshot`, `--auto-start`)

Reacts to the command line arguments `--auto-state=N|NAME` and `--screenshot=NAME`. When either is present it:

1. starts the game with the current profile,
2. loads the requested state (a number is a quick-save slot, a string the name of a manual save),
3. waits `RENDER_SETTLE_MS` for rendering to settle,
4. captures a screenshot through the main process.

`--auto-start` is the third way in: boot the game and stop, with no state and no screenshot. The sequence already separates starting the game from loading a state, so the early guard is the only thing that stood between them.

With a screenshot and no state, it still waits `RENDER_SETTLE_MS`: `running` is reached before the first frame is painted, so a screenshot taken at once catches a black canvas and proves nothing.

## App/behavior/useSimRun.ts (`--sim-run`)

A debug hook for the `--sim-run` flag. It starts the game, optionally loads a save (`state=` by name, `slot=` by quick slot), forces auto-skip-dialog and developer tools on, drives the gameplay simulator headlessly to its stop condition, writes a SimRunReport to `debug-output/sim-run.json`, then exits. It powers the in-chat data correction loop: run, read the suggestions, apply, run again.

Developer tools unlock the combat table queries and the full simulation. The sim run is itself a developer tool, so it may switch the gate on for its own duration without touching the user's saved setting, and it must switch it back off. `setSimulatorSupport(true)` arms the `WasmSim*` mutators (`kHostGate_SimulatorSupport`) for the run; without it every door unlock, kill drop and cell lock trigger silently does nothing. Both are dropped again in the `finally`.

A features word set from here is only wanted until the core latches it on its next frame (`zelda_rtl.c:989`), so the queries the gate unlocks answer with nothing if they run in the same tick. `FEATURE_LATCH_MS` gives the core frames to pick it up.

`runSimDiagnostic` handles the diagnostic modes, which write their own payload and exit instead of running the simulation:

- `floodScreen`: an addressable flood of one screen. It checks that the sim's flood matches the normal in-game flood without running the whole simulation. It seeds from the live player tile only when the game is standing on the flooded overworld screen; otherwise it floods without a seed (a remote screen).
- `scanSprite`: which rooms hold a given sprite? A dataset room index that points at the wrong cave is invisible until you ask the game itself.
- `probeRoom`: why does one room read as a dead end? It dumps the tables that decide it (entrance seeds, fall holes, the exit screen entry, the detected exits).
- `combatSprite` (`simCombatSprite`): one sprite type's resolved combat row plus the shared ancilla and tile combat tables. A `null` query result is flagged explicitly, so developer tools being off is never mistaken for a sprite that deals no damage. The damage rows are unpacked from a compressed asset when a file is loaded (`select_file.c:228`), so this reads all zeros unless the run also loads a state: pair `combat=` with `slot=` or `state=`. A sprite with bit `0x40` of `flags4` set (`ROOM_CLEAR_EXEMPT_BIT`) is left out of a room clear count, per `Sprite_CheckIfRoomIsClear`.

`readWantedFeatures` reads the features word the core has been asked for, which latches on the next frame. `-1` means the module was not reachable, which is not the same as no features; `-2` means the query itself failed.

`runFullSimulation` writes the report. Inventory entries put the id first so each entry is unambiguous and sorts stably, and the name after so a person can read the artifact; the name is resolved there and stored nowhere. `loadout` is what the player holds, read from the save, not tallied from check names: hearts, equipment tiers, and the per-dungeon map, compass and big key state the run does not track.

## App/behavior/useDebugLaunchHooks.ts

Bundles the launch hooks driven by the command line (auto-test, dump-layers, dump-nav, sim-run) behind one call, so the AppMain view stays lean. Each does nothing unless its flag is present.

## App/behavior/useProfileManagement.ts

`useActivateRomSprites`: every path that changes the active profile lands in `setActiveProfile`, so this is the one place the ROM's sprite set is activated (base URL, availability, extraction). With no profile active a ready ROM stands in (`spriteRomOf`), because the creation form draws item art before any profile exists and would otherwise show placeholders over a set that sits on disk.

## App/behavior/useLoadProfileForGame.ts

- The profile is read again from storage for this boot. The caller's object can be a snapshot from an earlier load, and fields edited in the Data Manager since then (`msuPack`, `language`) must reach the game, not the values the snapshot was taken with.
- `setActiveProfile` deliberately gets the caller's object, not the one read again. Automation keys an effect on the identity of `activeProfile` (`useAutoTest.ts`), so handing back a fresh object runs that effect again, and its cleanup cancels the launch already in flight: the run then stops before it loads its save state. Nothing needs the fresh object in state, because the settings UI reads the pack from storage itself.
- There is no MSU path in the ini any more: music packs are played by the app, not the core, so nothing is written into the core's virtual filesystem for it to open.
- Auto-save is configured before the game starts.
- `resetSession()` clears whatever the previous profile left behind, ahead of the gate that may park new material. Its placement is what the tracker builds its roster from, and nothing used to clear it, so a normal profile loaded after a randomized one went on listing the seed's locations instead of the game in front of the player.
- The randomizer gate: a randomized profile only boots when its session can start afterwards (a placement on disk, or a server URL).

## App/behavior/ensure-profile-assets.ts

Extracts the assets when they are missing, or when the cached blob predates the current bake format, then loads the cached asset blob for a ROM. It returns `null` (after logging) when the blob is missing and extraction fails, and the boot aborts on `null`. A stale blob is softer: it still boots the game, so a failed recompile (for example when the ROM file is gone) logs an error and keeps the old blob instead of blocking the boot.

## App/behavior/load-input-profile.ts

`migrateProfilesLoudly` is not a cast: a profile written before slots were numbers is turned into one, and one that cannot be is reported and dropped instead of half loaded. With no saved profiles the InputManager stays on its keyboard default.

## App/behavior/load-player-sprite.ts

Stages the profile's selected player sprite for the next boot; the bridge writes it to MEMFS. It is flattened on the way through, since the core cannot read a sprite pack.

## App/behavior/create-profile-flow.ts

The storage side of profile creation: generate the randomizer placement (local mode), create the profile, pin any frozen settings into its config, save the placement. It is kept apart from `useProfileManagement` so the hook only orchestrates state, and so a generation failure aborts before anything reaches disk: local mode generates before the profile exists, so a failed generation aborts creation instead of leaving a profile with no placement.

The overrides are a creation form preset's config values, then any setting the randomizer pinned on top. The pin always wins, since it is what makes the frozen placement play as stored. They are merged over the freshly written (empty) config, so the values are on disk from day one.

`withDeliverable`: an online profile keeps the probed spots on its config, so the player file written later randomizes the same npc, pond and world spots a local seed of this profile would.

## App/behavior/randomizer-boot-gate.ts

The pre-boot gate for randomized profiles. Local mode needs a placement this build can read, rolled again from the seed when the file is older (`rerollPlacement`, which saves it so the profile boots). Online mode needs a server URL. The live server pre-flight only logs: a server that is down never blocks play, and the session retries it. On success the boot's session material is parked in the pending slot of the session store, where the auto-start hook (`useRandomizerBoot`) consumes it once the game runs. On failure the caller aborts the boot with the returned reason.

## App/behavior/roll-placement.ts

Rolls a local seed's placement from its seed and frozen options. The ported pipeline consumes the frozen snapshot directly. The capability probes name the npc-scope locations and capacity slots the app can physically deliver; the rest stay locked vanilla, so the plan can never carry errors. The same seed and options always roll the same placement.

## App/behavior/buildChromeProps.ts

Builds the prop bag shared by the desktop TitleBar and the touch MobileChrome: the same actions, two views. Pure wiring, taken out of AppMain so that component stays about composition. `onShowDisplaySettings` deep-links the Display tab, so the incompatible refresh rate tag lands on the setting that explains it instead of the hub's front page.

The file keeps its camelCase name because AppMain, outside the shell, imports it by path. It moves to `build-chrome-props.ts` when that import changes.

## App/behavior/useAppMainEffects.ts

- The notch mode defaults to filling the notch until a profile loads, which keeps startup windows clear of a cutout.
- `--auto-flood` opens the navigation widget once, on mount (`window.api.autoFlood`).
- Game input is suppressed while a menu or an overlay is open: input reaches the game only while it runs and no page is open.

## App/behavior/useAppNavigation.ts

A widget that wants to show a recommendation cannot reach page state from where it lives, so the one call it needs is published to the data view store here, next to the state itself, and withdrawn when the hook goes away.

## App/behavior/useAppOverlays.ts

App-level overlay and dialog state: the update dialog, the bug report dialog and the shadow editor. Sprite Debug is a page, handled in PageRouter and `useKeyboardShortcuts`.

## App/behavior/useAppViewCallbacks.ts

App-level glue for view navigation: the Data Manager and ProfileHub tab state, and the callbacks that switch pages. The optional tab lets a caller deep-link straight to the settings it talks about; the incompatible refresh rate tag uses it to land on Display.

## App/behavior/useAudioSettings.ts

A launch flag is applied by using the mute control, not by working around it. The settings push that runs when the game starts applies the profile's volume again, so anything set before that is undone. So the hook waits for the game to run, then presses the mute button once. Nothing new gates the audio. Both flags are honoured, so the result never depends on the volume the profile happens to hold: `--muted` presses it only if sound is on, `--sound` only if it is off. The current volume is read through the state setter, so a stale render's value is never used.

`initFromSettings` takes the volume as loaded. A `--muted` launch is already zero there, because the flag is applied once in `mergeSettings`, where the setting is born. Two earlier attempts set the engine volume (and the mute override) from here instead, and both lost: `pushLiveSettings` applies `settings.masterVolume` again to the gain node and the WASM mixer when the game starts.

## App/behavior/useDevToolsWidgetGate.ts

The master gate for developer-only UI. It reads the live `developerToolsEnabled` setting (registered on the search store by ProfileHub while it is mounted), and the moment it goes off, closes every `devOnly` widget (`Widget.constants.ts`).

WidgetManager's render filter only hides a devOnly widget while the gate is off. It never clears the widget's saved `visible: true`, so a widget left open would silently come back the next time dev tools are turned on again. The gate also sweeps any devOnly widget left visible by a profile saved before it existed.

Ids forced at startup (the `--widgets=` flag) are exempt, matching WidgetManager's render filter. Without that exemption the sweep undoes the flag a frame after it lands, which took every baseline spec driven from the command line down with it.

## App/behavior/useDisplaySettings.ts

The aspect ratio lock follows the fullscreen state and syncs whenever a display setting changes while the game runs. When the game starts it syncs once more as soon as the canvas has buffer dimensions, polling every `CANVAS_POLL_MS` for up to `CANVAS_POLL_ATTEMPTS` tries.

## App/behavior/get-game-ratio.ts and sync-aspect-ratio-lock.ts

The live canvas reflects the rendered width (custom ratios included), so it is preferred. Before a canvas exists the ratio falls back to the viewport, the screen or the named ratio; only the `fit` window lock uses that fallback, and it syncs again once the canvas exists. `TITLEBAR_HEIGHT` is added to the lock in the default window mode outside fullscreen.

## App/behavior/useGameLifecycle.ts

`setGameData` marks the assets as booted: the bytes were just read from disk, so this is the generation the game plays.

## App/behavior/useKeyboardShortcuts.ts

- Alt+Enter toggles fullscreen.
- Ctrl+Shift+D, with developer tools on, toggles Sprite Debug as a full-window page, so it switches and closes by the same logic as every other page.
- The primary modifier with K toggles the search palette.
- Escape: every layered surface answers first. A popover, menu, dialog, full-screen page or search palette that is open has registered with the design system's dismiss stack, and the stack's own listener has already closed exactly one of them. This shortcut is the floor beneath all of it and only acts on an Escape that had nothing above it. Two document listeners cannot order themselves, so neither one tries. It then closes the confirm dialog, else closes the open page, else opens the profile hub from the game view.

## App/behavior/useMsulOpen.ts

Imports a music pack the app was opened with, from the desktop file association. Brock reports the path (`useAppOpen`), and this hook takes only `.msul` files. Reading it needs a trip back through IPC because the renderer cannot open an arbitrary path itself. The import is the one the Data Manager performs, so an opened pack and a dropped pack land the same way.

## App/behavior/useRandomizerBoot.ts

Auto-start for randomizer sessions tied to a profile. A gated boot parks the session material in the pending slot of the session store. When the game reaches `running` with a pending entry for the current profile, the matching session starts with no user action. When the game leaves `running`, the active session stops with it, so a randomized session never outlives its game. It is safe across restarts: every gated boot parks a pending entry again, and the started flag arms again as soon as the game stops.

## App/behavior/useReloadTarget.ts

Publishes how to bring the running game up to date with the text on disk. The assets blob reaches the emulator once, at boot, and loading the same profile again is what reads it again, so that is what gets registered. The data screens cannot reach it on their own, which is why the notice there can offer a button instead of instructions. It is registered from an effect on the active profile, not from inside the loader, because a closure built in there could not name the callback it sits in.

## App/behavior/useShellReady.ts

Tells the main process the UI may be shown. Firing on first mount was too early: the window was revealed while profiles were still resolving, so the shell visibly assembled itself afterwards. The hook waits for startup to settle and then for two frames (the first commits the settled layout, the second proves it painted). It does nothing off Electron, where there is no window to reveal.

The scheduled signal is deliberately not cancelled on cleanup. StrictMode's double invoke would cancel the only scheduled signal, and the second pass would find the ref already set, leaving the window hidden until the main process watchdog fires.

Entrance animations go back to normal (the `booting` class is dropped) only once the shell is done, so the layer the app booted into never plays one. The class is dropped before the signal, in the same frame, so nothing can animate in the gap between the two.

## App/behavior/useStartup.ts

Startup owns which page the app lands on, so it also owns the moment the shell stops moving; `useShellReady` waits for that before it reveals the window. `settled` is set on every exit path, early returns included, because a boot that failed still has to end with a visible window.

Automation launches (`--fresh`, `--sim-run`, `--dump-*`, `--auto-state`, `--auto-start`, `--screenshot`, `--instance`) start straight in the game view: the game only reaches `running` on the game view, which the sim waits for.

A named instance pins its own profile, matched by id first, then by name. An unknown name stops there instead of falling through to the user's profile: a run that silently used the wrong save data is worse than one that fails.

## App/behavior/useStoreLinks.ts

A store install link the browser opened lands on the Hookshop tab whatever page was open: the Brock catalog module delivers it (`useCatalogLinks`), the link waits in the link store and the tab installs it. It does nothing off Electron.

## App/behavior/useWasmWarmup.ts

Starts the background warmup of the game core once the React shell has mounted, piping its progress into the boot progress store (which BootProgressBar observes). `warmWasmCore` runs once at a time, so StrictMode's double invoke in development is harmless.

## App/behavior/useWidgetDisabledGate.ts

The disabled-state wiring for widgets. It reads the live settings snapshot (registered on the search store by ProfileHub while it is mounted, like `useDevToolsWidgetGate`) and builds the callback WidgetManager's overlay uses to open Settings at whichever setting caused a widget to be covered: Vanilla Safe's `readsGameData` lock, or a widget's own `requiresSetting` gate (`Widget.type.ts`). Unlike a settings page control, a widget can be open while the profile page is not showing, so this switches the app there first.

## App/behavior/useWidgetPrefs.ts

Binds the widget prefs store to the active profile: it loads what that profile had saved, and makes sure whatever is still pending reaches disk before the window goes away. The flush covers the layout too, because both halves share one repository and one debounced write. It listens to both `pagehide` and `beforeunload`, because Electron tears the window down without running a `beforeunload` handler that does not call `preventDefault`.

## main.tsx

- `installSessionLogTap()` runs on every launch: it streams the log bus (ring-evicted entries included) to `Data/debug/session.log` through the main process (see `lib/diagnostics/session-log`).
- `window.__trackerBridge` exposes the tracker bridge functions for live integration tests.
- `window.__deliveryApi` exposes the delivery path the same way, so live tests can drive a real queued delivery and watch it complete instead of poking the core directly. `triggerNpcCheck` replays a giver's vanilla grant through the queue (the cheat trigger), which is how a live test exercises the npc override seam. `deliverNpcCheck` enqueues the assigned-form trigger for a scripted giver, the exact action a session's poller enqueues, so a live test can prove the delivery path without cheats end to end.

## env.d.ts

Declares the WebUSB API types (Chromium and Electron) and the renderer's ambient globals (`Profile`, `RomInfo`, `Window.api` and the rest).

## index.html

The `booting` class on `<html>` suppresses the entrance animations of whatever the app lands on. They are polish for opening a page mid-session; during boot they would mean the window is revealed partway through a fade and scale, so the screen finishes appearing after the window is already visible. `useShellReady` removes the class.

`#boot-splash` paints at once, with no bundle, JS or WASM needed. React replaces `#root` on first render, so the splash tears itself down for free. Desktop no longer relies on it: it has its own splash window (`splash.html`) and keeps this one invisible until the shell settles. It stays for web and Android, where nothing else covers the gap before React mounts.

## splash.html

The boot splash, in its own window. No bundle, no preload, no imports: every byte paints on the first frame, which is the whole point of the window.

- The page has no `-webkit-app-region: drag` anywhere. A frameless window with no drag region cannot be moved, which is what a splash should be.
- The status line is out of flow on purpose: the logo and spinner column stays centred exactly where the installer's splash GIF puts it, whatever the status line says. Being anchored to the bottom it grows upwards, so `nowrap` keeps it to one line and the ellipsis absorbs the rest, which keeps the gap below fixed. Its padding is symmetric, so the text stays centred, and wide enough that the longest message can never reach the version stamp in the bottom right.
- The main process drives the status line through the one global `window.__splashStatus` (see `window/boot/splash-window.ts`). It is kept trivial so a failed call costs a message, never the splash itself.
