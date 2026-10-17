<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/views/ProfileHub

Facts about `apps/desktop/src/views/ProfileHub/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/views/ProfileHub/

- `PROFILE_HUB_TABS` is the single registry of every ProfileHub tab: icons, label, and (when the tab is a SettingsLayout screen) the function that builds its sections from the current settings. It is a `Record<ProfileHubTab, ...>`, so adding a tab to the union without describing it here is a compile error. That keeps it in sync with the hub's nav, its search results and the search palette's catalog with no manual bookkeeping.
- The GBA tab is a read-only reference catalogue, not a SettingsLayout screen, so it has no sections to index.
- `PROFILE_HUB_NAV_GROUPS` are the nav's groups in order. Home is not in a group: it is pinned above them.

- The `settings` tab is Display: screen geometry and performance. The `online` tab is for Archipelago profiles only.
- `ProfileHubTabSpec`: `icon` is the emoji for the search palette's rows and `navIcon` the line icon for the hub's nav and page headers. `sections` is omitted for tabs with no SettingsLayout (Home, and the custom binding UI of Controls). `mobileOnly` tabs are listed only on the mobile form factor and `onlineOnly` tabs only for an online (Archipelago) profile.

- The profile window's body. Its title bar belongs to the host layer, which shows the game controls there off the home tab.
- The per-profile notch preference is reflected on the html element whenever it changes.
- Search palette bridge: while this profile's hub is mounted it is the only reader and writer of GameSettings, so it registers them and lets the palette show and flip inline toggles.
- A pending tab switch (for example from a DisabledOverlay's "Open Settings" action) is consumed before the anchor effect runs, so the scroll happens on the tab it just landed on. A pending search deep link is consumed once the target tab's content is showing.

## apps/desktop/src/views/ProfileHub/ (stylesheets)

- `apps/desktop/src/views/ProfileHub`: the gap between the nav and the content leaves room for the nav's round toggle, which straddles its right edge. The `.settings-tab` rules are the generic settings tab layout used by the Audio, Gameplay and Controls tabs, and `.hub-game-controls` is the game controls group rendered in the window title bar.
- `BindingListener.css`: the backdrop opts back into pointer events, because the Portal layer is click-through.
- `OptionsTab.css`: a required input row draws its device icon beside its connected state. The two sections need no wrapper, so they take the same section gap as the Game settings pages.
- `ControlsSettings.css`: the row is the `list-panel-row` container the two ListPanels read, so under 640 px an open panel lies over the bindings instead of squeezing them. The middle takes the rest of the width, and the tab content scrolls in one area under the tab row with the same top padding as a settings page body, so the binding tables keep their rounded corners.
- `DialogHoldRow.css`: the toggle and its speed slider each take half the row, and the slider never collapses.
- `HomeTabColumns.css`: the hero sits flush with the top of the nav. The folder button sits in the info card row and matches the cards' height, not its own. The columns collapse to one when there is no room for two.

## apps/desktop/src/views/ProfileHub/behavior/useGamePause.ts

Tracks the running game's pause state from the InputManager and toggles it.

## apps/desktop/src/views/ProfileHub/sub-components/controls-settings/build-modern-bindings.ts

- The modern bindings a profile starts with, for the device it is assigned to. It is one entry point for the two callers that need it (dropping a controller onto a profile while the modern scheme is active, and switching a profile to the modern scheme for the first time), so they can never disagree about what a fresh modern profile looks like.
- It returns null when there is nothing to build from: a gamepad profile whose device has never been seen (no live capabilities, no remembered SDL type) has no control list, and inventing one would fabricate buttons the pad may not have.
- It prefills two things together on purpose: the slot list and the HUD layout this scheme wears. A dropped controller with a slot list but no layout would have working buttons with nowhere on screen to see them.
- What lands on disk is a prefill, and from then on it is the slot list: every reader reads it back as written (`effectiveSlots`), and the player adds to it, removes from it and binds it again on the controls screen. Nothing derives it again behind them. That is what makes the list open-ended, and it is the reversal contract section 19 records.

## apps/desktop/src/views/ProfileHub/sub-components/controls-settings/controls-settings.constants.ts

`FAMILY_ICON_MAP` holds one brand silhouette per controller family, shared by the required-inputs strip and the per-binding device glyph so both show the same icon for a family. The drag data keys match the ones `apps/desktop/src/views/ProfileHub/sub-components/controls/device-drag-data.ts` writes.

## apps/desktop/src/views/ProfileHub/sub-components/controls-settings/family-icon-map.ts

`resolveLiveFamilyIcon` resolves which family a vid:pid belongs to, preferring this session's remembered SDL type and falling back to a connected device's own live family, the same precedence the required-inputs strip used before it was shared.

## apps/desktop/src/views/ProfileHub/sub-components/controls-settings/listening-label.ts

What the capture modal says it is listening for.

## apps/desktop/src/views/ProfileHub/sub-components/controls-settings/live-device.ts

"Is the pad this binding came from plugged in right now?" for the controls screen. It is shared because several lenses ask it for the same reason: a live device carries an `sdlType`, and that lets `resolveIconByVidPid` answer for a pad this session's family cache has never seen. The SNES mapping rows and the core verb rows both resolve their glyph that way.

## apps/desktop/src/views/ProfileHub/sub-components/controls-settings/modern-slots.ts

- Slot list presentation for the controls screen. Identity is a number now (contract section 19) and `slotName` in `packages/input-mapping/src/scheme` spells it, so the old `slotIdLabel`, which unpicked a position out of a `slot:NORTH` string, is gone with the ids.
- What remains is the one thing only this screen can answer: when the player binds a slot to a different control, which picture the slot should now wear. `position` and `icon` are display only, so they have to follow the binding or the row keeps drawing the artwork of a button that no longer does anything. The live control list is the only place that artwork exists.
- A pad control the device reports brings its own position, artwork and name. A key or a control this pad does not report brings none of the three, on purpose: the glyph chain then draws the binding (a key cap, or the generic button art), which is the control the player presses. Every row still shows a glyph, since `apps/desktop/src/input/binding-display` has no text-only branch for a bound control.

## apps/desktop/src/views/ProfileHub/sub-components/controls-settings/profile-controls.ts

"What does this profile's device physically have?" for the controls screen. The modern scheme prefills its slot list from the device's resolved control list, so the screen needs that list for the profile being edited even while the pad is unplugged, or the slot list would empty itself the moment a controller sleeps. Three sources, in order:

1. A live SDL entry for the profile's assigned vid:pid, which carries the real hasButton and hasAxis, so only what the unit reports appears.
2. This session's remembered SDL type for that vid:pid, expanded through the same synthetic "assume every position present" list the saved binding icon lookup uses. A disconnected pad keeps its slots. The identity's own `sdlType` is the fallback when the cache has none.
3. Nothing, for a keyboard profile (SDL never enumerates one) or a profile with no device assigned. The keyboard's modern bindings come from `keyboardModernBindings()`, which needs no control list.

## apps/desktop/src/views/ProfileHub/sub-components/controls-settings/useBindingState.ts

Rebind listening, capture and clear logic for SNES button mappings, function action mappings, and (under the modern scheme) the ten core verbs and the player's numbered slots. Core and slot captures go straight to useModernScheme's writers: this hook owns what is being listened for, never the shape of what a modern profile stores.

## apps/desktop/src/views/ProfileHub/sub-components/controls-settings/useControlsSettings.ts

- A thin orchestrator composing the focused hooks. Order matters in one place: the resolved control list for the active profile's device feeds both the scheme hook (which owns the slot list) and the drag and drop hook (which builds a dropped device's modern bindings), so it is computed once.
- The HUD layout is a property of the scheme, so it is edited beside the slot list and not in the HUD settings. Switching control profile switches the arrangement with the buttons.
- Both binding tabs draw the core verbs, so each verb's glyph is resolved here and not inside either tab.
- Each scheme greys out the other's binding tab, so a HUD style change (which is what moves the scheme) while that tab is open moves to its counterpart instead of leaving the screen on a disabled tab.

## apps/desktop/src/views/ProfileHub/sub-components/controls-settings/useCoreIcons.ts

- Resolves the device glyph for each of the ten core verbs. The SNES mapping rows have carried a resolved icon since the family layer landed, the core verb rows never did, and passing no icon is not neutral: `getBindingIconUrl` ends its chain on a generic keyed off the binding's shape alone, so on a pad every core button row drew the same generic button. Pause, Map, Confirm, Cancel and the two screen verbs were six identical circles, one tab away from the same buttons drawn as real artwork.
- So this resolves through the same `resolveIconByVidPid` that tab uses (device override, then family, then generic, plus `resolveStickDirectionIcon` for an axis, so the four movement rows get four different glyphs).
- A core binding carries no source vid:pid of its own, so the profile's assigned device supplies it: the same device `controlsForProfile` prefills the slot list from, so the two lists on this tab cannot disagree about which pad they describe.
- Keyboard and unbound verbs resolve to null on purpose: a keyboard glyph comes from its key code further down `getBindingIconUrl`'s chain, and `none` draws nothing.

## apps/desktop/src/views/ProfileHub/sub-components/controls-settings/useDeviceSync.ts

Detects and tracks connected input devices. `devices` and `filteredDevices` stay sourced from the InputManager, because drag and drop preset assignment, haptics and the display mappings lookup all key off that shape. `controllerGroups` is the newer SDL3 device list the device column renders gamepads from (ready or unavailable status, adapter grouping, capabilities), sourced separately so none of the other consumers had to change.

## apps/desktop/src/views/ProfileHub/sub-components/controls-settings/useDisplayMappings.ts

- Derived display data: the required inputs strip and the display mappings.
- When more than one physical controller feeds the profile's bindings, each binding row also shows which one it came from. A single-controller profile never needs that.
- Every binding shape is resolved again, axes included. A stored axis icon can only be a stick's neutral base key, because a family declares one key per stick shared by its X and Y, so honouring it drew the same undeflected stick on all four movement rows. Only `resolveIconByVidPid` knows which end of the axis the binding is, and it reaches `resolveStickDirectionIcon`. `build-console-defaults` no longer stores one, and this also fixes the profiles that already have one.

## apps/desktop/src/views/ProfileHub/sub-components/controls-settings/useDragDrop.ts

- Drag over and drop handling, and applying console defaults. A dropped device carries only its sdlType (plus vid and pid), and there is no per-model preset. The keyboard is the one sentinel case (sdlType `keyboard`, see `packages/input-mapping/src/runtime/device-detector`) still resolved from its hand-authored `KEYBOARD_DEFAULT`. Every gamepad's defaults come from the family layer's console defaults through `buildConsoleDefaultMappings`.
- The dragged card carries its own resolved name, vendor id and product id (`device-drag-data.ts`), and the drop reads them from the drag.
- Icons are never stored on a freshly applied binding, since they resolve live from the source vid and pid plus the binding's index, like any other saved binding.
- Under the modern scheme the same drop also gives the profile its modern bindings, derived from what SDL says the dropped device has. A device with nothing to resolve from yields null and keeps whatever the profile had. The classic console default mappings are written either way: the two live side by side on the profile, so switching schemes back never has to rebuild the other one.

## apps/desktop/src/views/ProfileHub/sub-components/controls-settings/useHapticsToggle.ts

The profile-level haptics switch. When on, every controller the profile uses receives rumble. There is no per-device list to curate here: the routing in `apps/desktop/src/input/haptic-bridge` reads the profile's own device set live.

## apps/desktop/src/views/ProfileHub/sub-components/controls-settings/useModernScheme.ts

- The scheme half of the controls screen. The slot list is the player's, and this is where they build it. It is stored on the profile, prefilled from the device the first time one is dropped on, and from then on added to, removed from and bound here. There is one row per slot, numbered Slot 1, Slot 2 and so on, with no cap and no category filter, so a thirty-button pad is thirty rows and a keyboard is as many as the player wants (contract section 19).
- That reverses the old rule, which derived the list on every read from the live device filtered to two categories. Deriving made the list uneditable: anything the player added was recomputed away on the next render, and anything the device did not report could never be added.
- The HUD layout this scheme wears sits on the same profile beside the slot list (`modern.layoutId`) and is edited by `useSchemeLayout`. Every write here carries it through untouched, so a slot edit can never move the player's HUD back to the default.
- What a slot fires lives in settings (`modernScheme.assignments`), keyed by slot number, and is never pruned here. Removing a slot closes the gap, so the assignments below it move up with the numbering. `remapAssignments` is that move, which is why a removal writes both halves in one call, so the items can never end up one button out of step.
- The scheme is read, never set. It is derived from the HUD style (`controlSchemeOf`), so there is no setter and no moment at which switching to Modern builds a profile's modern bindings. `coreBindings` falls back to the device's defaults and `effectiveSlots` prefills the list from the device, so a profile that never carried a `modern` block lists its slots the first time it is opened.
- With no stored core, the core is the device's defaults. A gamepad with no control list resolves to an all-unbound core instead of borrowing the keyboard's, because an empty list means the pad is unknown.
- `effectiveSlots` is the same function the runtime lens resolves through (`packages/input-mapping/src/runtime/resolve-bindings`), so this screen and the HUD cluster read one list.
- An absent assignment sits on a number the current list does not reach. It is kept, never deleted: a layout may still draw slot 7 for a scheme with five.
- `hasSlotSource` is true once there is anything to build a list from.
- A core rebind writes only the core. Slots no longer move with it: binding a gameplay verb onto a control a slot also reads leaves both rows on screen, so the clash is visible and removing the slot is one click.
- A slot rebind keeps the slot's number and moves only what fires it, and its picture follows the new control. A new slot has a number and no binding, which is what a free button looks like.

## apps/desktop/src/views/ProfileHub/sub-components/controls-settings/useProfileActions.ts

Input profile loading, create, rename, delete, selection and persistence. The profile cycle shortcut (PageUp and PageDown) is reflected into the UI and the settings.

## apps/desktop/src/views/ProfileHub/sub-components/controls-settings/useSchemeLayout.ts

- The HUD layout this control scheme wears, and the list of layouts to choose from (shipped first, then the player's own). It lives on the input profile beside the slot list, not in a global HUD setting, because it is a property of the scheme: switching the active control profile from the keyboard to a pad swaps the slot list, the assignments and the HUD arrangement in one step.
- Two schemes may name the same layout. Editing it edits it for both, and "save a copy" in the editor is how one of them forks. The id is the only join, as the slot number is on the other half of the screen.
- A profile that names nothing reads as the shipped default.
- The layout is written to the profile, so it travels with the control profile. The live HUD follows because the layout store subscribes to the resolved bindings. A profile with no modern block yet is left alone: the scheme is built in `build-modern-bindings`, and a layout without a slot list would be a scheme that draws nothing.

## apps/desktop/src/views/ProfileHub/sub-components/controls/AbsentAssignments.tsx

Lists assignments on a slot number the list does not reach. A number can outrun the list: remove slots until there are four and an assignment on slot seven has nowhere to sit. It is kept anyway, and adding three slots back reattaches it, because assignment and slot are joined by the number alone (contract section 19). They are shown, muted, not hidden: an assignment that exists but does nothing is the kind of state a settings screen should not keep secret.

## apps/desktop/src/views/ProfileHub/sub-components/controls/BindingListener.tsx

- A modal that captures the next key or gamepad button press through the InputManager's raw input events, so every source (keyboard, Web Gamepad API, SDL3 controllers) works the same everywhere. Escape cancels, Delete or Backspace clears the binding, and a bare modifier press waits for the real key.
- The one-shot `captured` guard is a synchronous local, not React state. A stick pushed slightly off-axis crosses two axes' thresholds in the same frame, and the dispatcher fires one event per crossing before React can apply the first capture. Without the flag the second event (often incidental drift on the other axis) overwrites the first, which is how a rebind could point at the wrong axis or two actions end up bound the same.

## apps/desktop/src/views/ProfileHub/sub-components/controls/BindingListHeader.tsx

The five-cell header the four binding lists share. Only the middle column differs (the console button on the classic list, the group on the core list, the assignment on the slot list), so it is the only label a caller passes, and it is omitted for lists whose middle cell stays empty.

## apps/desktop/src/views/ProfileHub/sub-components/controls/BindingRow.tsx

One input mapping row (SNES buttons, shortcuts, cheats): action label, optional middle icon and label, binding icon and binding label. The whole row is clickable to start rebinding. The source controller icon shows only when the profile mixes more than one controller.

## apps/desktop/src/views/ProfileHub/sub-components/controls/CheatBindingsTab.tsx

The cheat bindings, scrimmed while the master cheats toggle is off, since they do nothing then. The overlay is `contained` because the bindings container clips overflow and the header sits flush above it, so the default overhang would bleed onto it or be clipped.

## apps/desktop/src/views/ProfileHub/sub-components/controls/controls.constants.ts

- The ten core verbs fall in three groups because they answer three questions: where do I walk, what opens the two screens, and what drives the menu once one is open. The four menu verbs are live only while the pause menu is open, so they do not take a button out of circulation (contract section 11), and the same physical button can be both a menu verb and a gameplay slot in the Modern Controls tab.
- `SDL_TYPE_ICON` maps a specific SDL type to a more accurate icon than its family default.
- `CANCEL_ARM_DELAY_MS` and `LISTEN_ARM_DELAY_MS` keep the binding listener from capturing stale input right after it opens.

## apps/desktop/src/views/ProfileHub/sub-components/controls/ControlsDevices.tsx

The right ListPanel: one row per detected device, with Rescan at its top. Gamepads come from the SDL3 controller snapshot (ready or unavailable, adapter grouping), and the keyboard entry still comes from the InputManager's device list. Both become one `DeviceEntry` (`keyboard-entry`, `controller-group-entry`), so a row and its folded rail button read the same data. An adapter is one row for the whole device, since every port shares one vendor:product id, and its subtitle counts the ready ports.

## apps/desktop/src/views/ProfileHub/sub-components/controls/ControlsMain.tsx

The centre column: a banner where the scheme control used to be, plus the tabbed binding editor. The scheme is derived from the HUD style, so under Classic the screen says so once and links to where it is set, and under Modern it says nothing. The two binding tabs gate each other by scheme: the inactive one stays visible and greyed with its reason.

## apps/desktop/src/views/ProfileHub/sub-components/controls/ControlsProfiles.tsx

The left ListPanel: the input profiles, folded by default to a rail of their icons. New profile sits at the top of both the panel and the rail; pressed on the rail it opens the panel first, so the new profile shows in its rename field.

## apps/desktop/src/views/ProfileHub/sub-components/controls/CoreBindingsGroup.tsx

The ten core verbs, grouped and rebindable, shown in both binding tabs on purpose: the menu verbs drive the pause menu under either scheme, and movement, pause and map are what the modern scheme subtracts from the slot list. `icons` is not decoration: a row given no icon resolves one from the binding's shape alone, which on a pad is the same generic circle for every button. The device's real artwork comes from `useCoreIcons`.

## apps/desktop/src/views/ProfileHub/sub-components/controls/device-drag-data.ts

Sets the drag payload a device row or rail button uses to hand itself to the binding editor. `useDragDrop` reads the same keys back, and both take them from `controls-settings.constants.ts`, so every device agrees on the wire format.

## apps/desktop/src/views/ProfileHub/sub-components/controls/DeviceRow.tsx

A detected input device as a list row: its controller icon glows while it is ready, and a click or a drag onto the bindings assigns it. An unavailable gamepad shows the same explain and remedy notice as the Input Calibration page under its row and cannot be dragged or assigned: SDL3 never opened it.

## apps/desktop/src/views/ProfileHub/sub-components/controls/GameControlsTab.tsx

The classic per-button mapping list. It carries the core verbs too, because the menu verbs drive the pause menu under the classic scheme as well.

## apps/desktop/src/views/ProfileHub/sub-components/controls/haptics-rows.ts

One switch for the profile's rumble: when on, every controller assigned to the profile receives it. It is a property of the profile's mapping, not of one device, so it sits in the Options tab as a settings row. State lives in `useHapticsToggle`.

## apps/desktop/src/views/ProfileHub/sub-components/controls/OptionsTab.tsx

The Options tab is built from the same settings sections and rows as the Game settings pages. The two sections keep the class names `haptics-toggle` and `controls-settings__used-inputs` because the HUD style spec counts them.

## apps/desktop/src/views/ProfileHub/sub-components/controls/InputProfileList.tsx

The saved input profiles, with the active one highlighted, and create, delete, select and rename. A newly created profile opens straight into rename. Escape in the rename field is consumed there, so the dismiss stack leaves the page alone.

## apps/desktop/src/views/ProfileHub/sub-components/controls/ModernControlsTab.tsx

- The player's own slot list plus the core verbs. The list is built here, not derived: Add slot appends an empty numbered slot, and the minus on a row removes one and closes the gap. There is no cap and no category filter (contract section 19). An empty slot is a row on purpose: it has a number and draws in the HUD.
- The HUD layout sits at the foot of the list because it belongs to the scheme.
- The component name keeps "Modern", the name of the control scheme.

## apps/desktop/src/views/ProfileHub/sub-components/controls/SchemeBanner.tsx

Shown on the Controls screen while the profile is on the Classic scheme. There is no scheme control: the scheme follows the HUD style, and the Modern style turns it on. A control here would be a second switch for one fact that changed the HUD without saying so, so the banner says where the switch is and deep links there (`SETTINGS_TARGETS.hudStyle`, the same link the Cheats lock uses). Under Modern nothing is drawn.

## apps/desktop/src/views/ProfileHub/sub-components/controls/SchemeLayoutRow.tsx

Which HUD arrangement this control scheme wears. It sits on the controls screen because the layout is a property of the scheme. Two schemes may name the same layout, and the picker allows it: editing a shared layout edits it for both, and "save a copy" forks one. It is disabled while the profile has no modern block, since there is no scheme to hang a layout on.

## apps/desktop/src/views/ProfileHub/sub-components/controls/ShortcutsTab.tsx

The app-level shortcut bindings, plus the one reserved key (Esc opens the menu and cannot be rebound).

## apps/desktop/src/views/ProfileHub/sub-components/controls/SlotRow.tsx

One numbered slot under the modern scheme. The row is named for its number because that is the slot's whole identity (contract section 19). The binding is shown as a glyph, never bare text, and an unbound slot draws none. What a slot fires is chosen in the pause menu, so the assignment cell is display only and the row click rebinds. A slot with its binding cleared still exists and keeps its number: an empty numbered slot is how a player sees a free button. Only the remove button takes one out. `assignmentLabel` uses neutral wording, since the item's own name belongs to the data layer and is shown by the pause menu.

## apps/desktop/src/views/ProfileHub/sub-components/ControlsSettings.tsx

The full input mapping UI. The layout is a sidebar (profiles), a main column (the tabbed binding editor) and a devices column, plus the rebind listener and the confirm-preset and delete-profile dialogs. The logic lives in `useControlsSettings` and the columns in `controls/`. `useControlsSettings.ts` beside it re-exports the hook from `controls-settings/` so existing imports keep working.

## apps/desktop/src/views/ProfileHub/sub-components/gba-settings/behavior/useGbaAvailability.ts

Whether a Game Boy Advance supplement cartridge has been imported, so the Extra Dungeon toggle knows whether it has anything to gate.

## apps/desktop/src/views/ProfileHub/sub-components/gba-settings/behavior/useGbaDifferenceFilter.ts

Holds the filter clauses and search text for the tracker table and returns the rows that pass both. The catalogue is a constant, so the schema is built once in the constants file.

## apps/desktop/src/views/ProfileHub/sub-components/gba-settings/GbaDifferenceTable.tsx

The advancement tracker table: a filter bar (search plus per-column filters on Group and Status) over a data table with the columns Feature, Group, Status and Notes. Rows are read-only, and the filter and column state live only for the visit.

## apps/desktop/src/views/ProfileHub/sub-components/gba-settings/GbaSettings.tsx

The GBA page. A danger callout marks it experimental, the Enable section at the top holds the toggles (today the Extra Dungeon toggle, gated on the supplement being imported), and the advancement tracker below is one table of everything the second cartridge changes.

## apps/desktop/src/views/ProfileHub/sub-components/home-tab/build-summary-facts.ts

The home hero's fact rows: the profile row (ROM, dates) and, for a randomized profile only, the run row (seed, connection, session status) in `build-randomizer-facts.ts`, with the per-save-file strips beside it. The mode is the hero's title, so it is not a fact. Checks progress is not a fact either: the live subscription is empty with no game running, so the per-save-file strips carry it from the save on disk.

## apps/desktop/src/views/ProfileHub/sub-components/home-tab/capture-canvas-screenshot.ts

Captures the rendered game frame as a PNG buffer, the same path quick saves use.

## apps/desktop/src/views/ProfileHub/sub-components/home-tab/compute-save-file-checks.ts

The per-save-file checks readout, computed offline from the profile's battery save on disk, with the same taken, available and left counts the Checks widget derives. One row per save file holding a valid game. A seed's saves are rated against its frozen placement and a plain game's against the placement where nothing moved (`packages/randomizer/src/normal-placement`), so both go through the same availability snapshot. An online run has no placement on disk, so it shows nothing.

## apps/desktop/src/views/ProfileHub/sub-components/home-tab/derive-profile-mode.ts

Which play mode a profile is in, for the home summary's badge. The randomizer config wins (it is frozen at creation and cannot be turned off), and the Vanilla Safe setting splits the rest into safe and plain vanilla.

## apps/desktop/src/views/ProfileHub/sub-components/home-tab/ensure-game-running.ts

Resolves once the core can take a command, booting it first if nothing is on its way. `isGameRunning` is the caller's view flag: it says the game view has its asset blob, which happens about two seconds before the core exists. Trusting it let a load fire into a null module and be dropped, so the boot went ahead with no state loaded. The bridge's own state decides here, and the flag only answers whether a boot has been asked for, so a second one is not started.

## apps/desktop/src/views/ProfileHub/sub-components/home-tab/fetch-quick-slots.ts

The Home tab's data fetchers (quick slots, normal saves, auto saves) each return null on error, so the caller keeps its previous state.

## apps/desktop/src/views/ProfileHub/sub-components/home-tab/home-tab.constants.ts

- `BOOT_WAIT_MS` is the ceiling on waiting out a boot. It is long because a first run extracts assets before the core starts.
- `SRAM_BYTES` is the cartridge's fixed SRAM size (`core/zelda3/src/zelda_rtl.c`, line 1345).
- `IMPORT_CONFIRM_WORD` is typed, not the filename, so importing is a deliberate action and not a memory test.
- `RUN_OF_MODE` is the run a profile mode reads its saves as. Vanilla Safe reads none.

## apps/desktop/src/views/ProfileHub/sub-components/home-tab/home-tab.type.ts

- `randomizer` is frozen at profile creation, and its presence marks a randomized playthrough.
- `SummaryFact` is one label and value cell of the home summary, and `title` is the full value for the tooltip when the cell truncates.
- `SaveFileChecks` is the offline checks readout for one battery save file (labelled slot + 1). `name` is the player name stored in the file, null when blank.

## apps/desktop/src/views/ProfileHub/sub-components/home-tab/HomeTabColumns.tsx

The Home tab's two columns: quick saves and play sessions on the left, normal and auto saves on the right. The quick saves are a grid of `SaveSlot` cards, the same cards as the in-game save overlay, and each one's Load and Save are armed by a first press and run by a second.

## apps/desktop/src/views/ProfileHub/sub-components/home-tab/HomeTabDialogs.tsx

The SRAM import dialogs, the only dialogs left on the Home tab. Importing replaces the battery save, which has no undo, so it keeps its typed confirmation.

## apps/desktop/src/views/ProfileHub/sub-components/home-tab/useHomeRandomizerStatus.ts

Live randomizer session status for the home summary. It is a pure subscription: the session store pushes status changes, so the hook adds no polling. Checks progress no longer comes from here, because the live completed-checks subscription is empty while no game runs and showed a false zero.

## apps/desktop/src/views/ProfileHub/sub-components/home-tab/useHomeSaveFileChecks.ts

The per-save-file checks readout for the home hero, computed offline from the battery save on disk, so it never shows the live subscription's false zero. Off for Vanilla Safe. The file on disk is the last in-game save, so reading it mid-session is safe. It is computed again on mount (each time the hub opens), on a profile or mode change, and when a session starts or ends.

## apps/desktop/src/views/ProfileHub/sub-components/home-tab/useHomeTabSaves.ts

All Home tab save and session state, data loading and action handlers. The timer writes auto saves while the tab is open, so the hook follows it and the newest one is listed the moment it exists. The hero's last save is the newest save in the list, and its Load runs at once.

## apps/desktop/src/views/ProfileHub/sub-components/home-tab/useHomeTabSramImport.ts

Picks, validates and imports a raw SRAM save into the profile's `sram.dat`.

## apps/desktop/src/views/ProfileHub/sub-components/home-tab/sections/NormalSavesSection.tsx

Saves and Auto-saves are Tessera ItemLists, one row per save: the screenshot at the full height of the row, the name over the relative date, then Load, Overwrite and Delete (`SaveRowActions`), each armed by a first press and run by a second, as on a quick save card. A click on a row only selects it, and the arrow keys move the selection. There are no dialogs and no Undo. New save opens a name field at the top of the list, filled with the dated default and selected, and stays on screen without a game, greyed out with the reason (`NO_GAME_REASON`) as its hint (`newDisabled`). Rename is F2 or the pencil. Auto-saves have no Overwrite and no rename.

## apps/desktop/src/views/ProfileHub/sub-components/HubGameControls.tsx

The game controls: Play when stopped, otherwise Pause, Stop and Reset. On the home tab they sit in the hero under the mode, and on every other tab in the window's title bar (title bar buttons are small, the hero's are the regular size). Stop is slow (save on quit, then teardown), so it shows progress and ignores repeat clicks until the game has stopped.

## apps/desktop/src/views/ProfileHub/sub-components/OnlineSettings.tsx

The Online tab: the session's two switches (DeathLink, tracking the other players), then which notices of an Archipelago session show as toasts. The switches belong to the profile's connection, not its settings, so they read and save through the profile (`useProfileConnection`), which reconnects a running session on the new values. The same component is the Online tab of the Randomizer page.
