<!-- @layer docs @kind doc -->
# Code notes: packages/features

Facts about `packages/features` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## packages/features/src/controls/functions/functions.constants.ts

- Function actions are shortcuts and cheats.
- Every default mapping is unbound (`{ type: 'none' }`) on purpose. The project no longer inherits snesrev's legacy defaults, so every binding is user assigned through the controls UI. This also removes a real collision: cheat-health used to default to KeyW, the same key the keyboard gameplay preset assigns to the SNES Y button.
- `toggle-debug-capture` is the only default that ships bound (Tab). The debug report tool is off by default (`allowDebugLogging`), so it costs a normal player nothing, and a contributor who turns it on gets a working shortcut at once. It can be rebound or cleared like any other entry.

## packages/features/src/feature-registry/

The registry lists every feature that departs from vanilla, one data file per settings group, joined in a fixed order by `features.constants.ts`. `FEATURES_BY_ID` indexes the joined list.

The 42 split bug fix toggles come from `bundle-fixes.constants.ts`, written by `tooling/bundle-flags/gen-bundle-flags.mjs` from `tooling/bundle-flags/bundle-settings.json`, so they stay in step with the C gate sites.

The rendering dependency chain is: extended rendering, then linear world tilemap, then ultrawide or tall. Camera lock needs extended rendering, and smooth transitions need camera lock.

Hiding the native HUD is not a registry feature. It runs through `g_hud_hide_mask` via `WasmSetHudHidden` and follows the HUD style setting, so it owns no features0 bit.

`offscreenAI` is a three way setting, but a registry entry carries one bit. The entry is the idle bit, the default. Paused maps to the older `kFeatures0_PauseOffscreenAI` bit, and vanilla sets neither. See `offscreenAiMode` in `packages/game-core/src/settings`.

`allowDiving` is not a Vanilla Safe casualty on purpose. It rides with the extra dungeon, which is added content and not a parity question, and the room it exists for cannot be crossed without it.

The two bug fix bundle masters (`miscBugFixes`, `gameChangingBugFixes`) have no active C read site. Their behaviour moved to the features1 and features2 split gates.

`developerToolsEnabled` only observes, but its hook is compiled into the vendored `misc.c`. Touching vendored code is the line Vanilla Safe draws, so it counts as parity affecting.

`devNavigationData` is dead under Vanilla Safe anyway, since it requires developer tools, which are masked. It is flagged so it sits under the same lock and does not look toggleable next to a locked control.

`trackerEnabled` is a player feature, not a developer one: the checks tracker polls inventory and save flags out of the running game. It sits with the player toggles for that reason.

## packages/features/src/feature.type.ts

One `FeatureDef` per toggle that departs from vanilla zelda3. The C flag, the INI key, the TS flag map, the settings UI and the dependency rules all derive from these entries.

`FeatureKind` says how the engine enforces a feature:

- `features0-bit`: a bit in `enhanced_features0`, or in a later gate word once a word is full.
- `render-geometry`: a `g_config` value such as `extended_aspect_ratio`, applied at restart.
- `ppu-render-flag`: a bit in `ppu->renderFlags`.
- `host-event`: a gated host callback, haptics for example.
- `cheat`: a cheat that is neutral by default.
- `dev`: developer only, compiled out of a release.

`FeatureOrigin` names who introduced the change. A `snesrev` feature is already gated upstream and the app only exposes it. A `relic` feature is this project's own.

Field meanings:

- `userMessage`: the settings copy shown to the player, with its requirements and any parity disclaimer.
- `bundleOrigin`: for a split bug fix, the snesrev bundle it came from. An unset toggle follows its bundle switch.
- `flag`: the C symbol that gates it, for example `kFeatures0_CameraLockToViewport`. Absent for render geometry and cheats.
- `word`: the gate word holding the bit. 0 is `enhanced_features0`, 1 is features1, 2 is features2 (split bug fixes).
- `bit`: the bit value (`1 << n`) inside its word. The registry owns the allocation.
- `requires`: hard dependencies. The resolver turns the feature off unless every one of them is on.
- `suggests`: soft companions the suggestion card offers when the feature is turned on, without forcing them.
- `affectsVanillaParity`: true when the feature shifts render output or RAM. It gets the parity disclaimer and Vanilla Safe forces it off.
- `live`: false when the feature needs a restart to take effect.

## packages/features/src/gba-differences.constants.ts

A read only catalogue of everything the Game Boy Advance release changes. It is `@kind data`, which is why the game's own proper names are allowed in it while code, labels and comments elsewhere stay neutral.

`evidence` records how far the project got: `in-progress` means the project's own tooling pulled it from the cartridge and can cite an address or a table; `documented` means it is well attested but not yet reproduced locally.

## packages/features/src/hud-style/

The HUD style is the one choice the player makes. Everything the control scheme used to ask separately derives from it here.

- `vanilla` is the game's own HUD, drawn by the core.
- `enhanced` has the app draw the HUD and own the pause menu.
- `modern` is everything Enhanced does, plus the modern control scheme.

The values are the words shown on screen.

`hostDrawnHud` answers whether the app draws the HUD and owns the pause menu, which is true for every style but the original. `controlSchemeOf` is all that the old `GameSettings.controlScheme` setting used to store: the scheme is never stored, it is what the Modern style means.

## packages/features/src/msu-auto-config/

Works out the technical side of a music pack from the pack itself. Each pack shape (standard or extended numbering, PCM or Opus, the layered format) has exactly one correct format, sample rate and channel count, and a wrong one is audible. Auto reads them off the files; Manual overrides them.

`MsuPackProfile` fields:

- `isDeluxe`: the pack carries tracks past the vanilla music slots, so the extended remap applies.
- `hasOpuz`: the pack holds Opus audio, which is 48 kHz where raw PCM is 44.1 kHz.
- `isLayered`: the pack carries a `pack.json`, so slots can stack scheduled layers. This decides how playback works (the other two only describe the audio), so it is the reported format. It comes from the manifest existing, which the caller has already looked up.

`DEFAULT_BUFFER` is a middle ground between latency and stability. It is a trait of the host, not of the pack.

`modeForPack` picks the format matching a pack's shape. A layered pack reports as `msul` whatever its audio is, because the manifest governs playback; track numbering is carried separately. `isDeluxeMode` is true for the modes that use the extended per area and per entrance numbering. `requiredSampleRate` is null when there is no single answer: MSU off, or a layered pack whose files are resampled anyway.

`resolveAudioConfig` in Auto derives everything: the mode from the pack shape, the rate from its audio format, stereo (MSU always is), and the buffer at a safe default since it depends on the machine. Manual passes the player's values through, wrong combinations included, and `detectMsuMismatch` warns about them (the old C player only reported this on stderr). Vanilla Safe suppresses replacement music entirely.

`resolveMsuPlayback` reads `isDeluxe` off the pack's own track numbers when it has them: a layered pack reports as `msul` but can still hold the extended slots, and dropping the remap would silence them.

## packages/features/src/resolve-features/resolve-features.ts

`resolveFeatures` prunes a requested set to a consistent one: a feature stays on only while every id in its `requires` is on. It runs to a fixpoint, since turning one off can invalidate a dependent. Ids with no registry entry pass through untouched, so a newer id never breaks an older registry. `autoDisabled` records what was pruned and which requirements were missing, so the UI can explain the change.

`requirementClosure` lists every transitive requirement that turning a feature on would also need, limited to those not already on. It feeds the "this will also turn on" confirmation. `suggestionsFor` lists the soft companions to offer, never force, when a feature is newly turned on.

The shipping settings screen still cascades inline in its own view code; this resolver is the general replacement and is read by the registry tests and by `resolveGates`.

## packages/features/src/resolve-gates.ts

The Vanilla Safe entry point of the resolver. With `vanillaSafe` on, every requested id whose entry has `affectsVanillaParity: true` is stripped first, with no exemptions, and the requires fixpoint then removes their dependents too, so no second list is needed. Ids with no registry entry are left alone, the same contract as `resolveFeatures`.

This is the TS settings pipeline. The C side mirror that cannot be bypassed is `SyncGateWords` in `zelda_rtl.c` (`kGateWordParityMask`).

## packages/features/src/scheme/remap.type.ts

- ControlSchemeId mirrors the settings field of the same name, declared here so the scheme layer never reaches into the settings type.
- activeItem is a HUD item id from 1 to 24, or 0 to leave the core's equipped item alone.

## packages/features/src/settings/aspect-settings.type.ts

- `extendedRendering` is the master gate. Off: the engine always runs 4:3 vanilla and no sub settings appear in the UI. On: the aspect ratio selector and all extended rendering options become available.
- `aspectRatio`: `auto` is the current app viewport (notch aware); `screen` is the full device screen; a preset (`4:3` through `32:9`) is fixed; `custom` uses `customAspectW` and `customAspectH`. It is re-resolved on every game start, and applied only when `extendedRendering` is on; otherwise the engine receives 4:3. A custom width or height of 0 means auto detect from the screen.
- `widescreenSprites` extends sprite spawn and despawn ranges so enemies and objects revealed by the wider view spawn and act as they would on screen. Default on; only relevant when wide.
- `widescreenVisualFixes` applies the widescreen graphics corrections (edges and sprites that assume a 4:3 screen). Default on; only relevant when wide.
- `linearWorldTilemap` uses a clamped linear BG fetch in place of the wrapping 512px SNES tilemap, which prevents tile garbage at edges in wide views. Required for any ratio above about 19:9. Memory cost: one world tile buffer per BG layer. Default true (auto enabled with extended rendering).
- `ultrawideRendering` unlocks ratios above 19:9 up to 32:9 (the engine's full 1024px budget). Requires `linearWorldTilemap`. Default true when the linear tilemap is on.
- `tallRendering` allows ratios taller than 4:3 (extra rows above and below the game image). It is symmetric with wide rendering but independent: a ratio can be both wide and tall. Default false.
- `cameraLockToViewport` locks the overworld camera to the wide or tall view so its edges stop at the area boundary (no out of area black band); Link still walks to the screen edge. Off is the original 224x256 camera.
- `smoothTransitions` pans through area transitions using a 2 area world tilemap in place of the wrapping 512px tilemap, which removes the wrapped edge slice at screen seams. Requires `cameraLockToViewport`.
- `widescreenPlayArea` extends hazards, spawns and clear room checks to the whole wide or tall view. Off means the extra width is scenery only. It changes gameplay; default off.
- `offscreenAI` sets how sprites in the wide or tall extra band behave before reaching the stock 4:3 screen: `idle` (move and animate but cannot act on the player), `vanilla` (full behaviour, matches the original) or `paused` (frozen). Default `idle`.

## packages/features/src/settings/audio-settings.type.ts

- `masterVolume`, `musicVolume`, `sfxVolume` and `ambientVolume` range 0 to 100.
- `masterMuted` silences the whole mix without touching `masterVolume`, so unmuting returns to the chosen level. The title bar volume control and the Audio page both write it.
- `perGroupVolume` is the explicit opt in for the per group (music and SFX) DSP mix. Off gives the bit identical stock audio mix and the Music and SFX sliders are inert; on makes them take effect. Master volume is unaffected either way.
- `ambientVolume` and `ambientMuted` govern the replacement ambient bed only. The sound chip cannot split its ambience out of its mix, so they govern replacement audio, which is where a bed loud enough to fight the music comes from.
- `msuConfigMode`: `auto` (default) derives `enableMSU`, `audioFreq` and `audioChannels` from the assigned pack's contents (packages/features/src/msu-auto-config), not user edited. `manual` leaves the three free form.
- `enableMSU` names the pack format. `msul` is this project's layered container, whose manifest decides what each slot plays in place of one file per slot.
- `resetMSUAtTitle` makes reaching the title screen forget every remembered position. Resuming is meant for a run in progress; carried across runs it starts the opening in the middle of itself and drops a fresh file into the last file's music.
- `packReplaceAmbient` and `packReplaceSfx`: a pack may replace ambient beds and sound effects, not only music. They are separate switches because someone may want an authored rain bed while keeping every native effect. Off means the core never reports those sounds to the app, so an unused group costs nothing.
- There is no separate MSU volume: MSU replaces the music channel, so `musicVolume` governs both (serializeToIni writes MSUVolume from musicVolume).

## packages/features/src/settings/control-settings.type.ts

- `mapOnSelect` is a classic only convenience: open the map from the select or map verb in place of the pause menu.
- `modernScheme` is what each modern slot fires. Host only, because the core is told the resulting item id per frame, not the table, so it never reaches the INI.
- `saveHoldDuration` is in seconds, 1 to 5.
- `hapticsEnabled` says whether the profile routes rumble to its own controllers at all. When on, every device the profile uses gets the signal; there is no per device list (see allowedDevices in packages/input-mapping/src/runtime/profile-devices/allowed-devices.ts).
- `cheatsEnabled` is the master gate for all cheat effects. Off by default: the C side no ops every cheat call while it is off, the same contract as `haptics.enabled` and `developerToolsEnabled`.
- `vanillaSafe` keeps cheat effects to changes that stay comparable to a vanilla run (the VanillaSafe bit in kRam_Features3). Off by default alongside `cheatsEnabled`.

## packages/features/src/settings/developer-settings.type.ts

- `developerToolsEnabled` is the master gate for developer only instrumentation (transition settled events and any future dev only GameHook). Off by default: the C hook makes zero host calls while off. Observational only.
- `devNavigationData` gates the navigation and room data reads that feed the Location and Navigation widget, the flood fill and the simulator. It is separate from `developerToolsEnabled` so the dev surface can be on while the heaviest per frame reads are off; both must be on for the core to answer (NavQueryGate).
- `allowDebugLogging` is the master gate for the debug report tooling: verbose main process and performance logging, the titlebar capture recorder (Tab shortcut) and the floating send debug report button. Off by default; none of that code path runs while it is off.
- `trackerEnabled`: the checks tracker polls inventory and save flags out of the running game. It changes nothing, but it is a host feature reading emulated state, so it gets its own switch (TrackerQueryGate).

## packages/features/src/settings/dialog-settings.type.ts

- `dialogSpeed`, `dialogHoldSpeed`, `dialogHoldToAccelerate`, `dialogFillOnB` and `dialogTypewriter` are Gameplay tab behaviour that runs in the core under either HUD. The other fields are the HUD tab dialog box look, independent of `hudMode`.
- `dialogSpeed`: 1 is the game's pacing, 0 is instant (the ROM's own Speed 00 convention). `dialogHoldSpeed` is the multiplier while A is held.
- `dialogFillOnB`: B completes the current box and the next press advances. `dialogTypewriter`: a line the game shows at once types one glyph per step.
- `dialogButtonPrompts` shows the buttons that act on a message, under the box. `dialogFont` applies to the enhanced box only; `dialogFontScale`, `dialogInkColor` (hex) and `dialogStrokeWidth` apply to the modern font only. `dialogStrokeWidth` is in game pixels around each modern glyph; 0 is none.
- `hudHighlightPrimary` (hex) colours item names in randomizer messages, in either box. `hudHighlightSecondary` (hex) colours player names.
- `dialogBoxOpacity` is 0 to 1, the enhanced box ground. `dialogFloatingGround` draws the ground behind borderless messages such as telepathy. `dialogIntroTelepathyGround` draws it behind Zelda's telepathy in the opening at Link's house. `dialogGroundFade` fades the ground out toward its edges.
- `dialogBoxFit`: `message` sizes the frame once to the whole message; `fit` follows the rows in use.
- `dialogGroundColor` is the hex ground behind the text. `dialogBorder` is the game's tiles, none, one line, or a thin line inside a thicker one. `dialogBorderColor` (hex) colours drawn borders and corner marks.
- `dialogCornerMarkAngle` is the degrees the top left mark turns; the others mirror it.
- `dialogTexture` is the pattern on the ground. `dialogTextureColor` is hex, `dialogTextureOpacity` 0 to 1, `dialogTextureScale` a cell size multiplier, `dialogTextureDensity` 0 to 100 (how close cells sit), `dialogTextureScatter` 0 to 100 (how far cells stray from the grid).

## packages/features/src/settings/gameplay-settings.type.ts

- `autoSkipDialog` renders dialog instantly and auto advances message box waits; choice prompts stay interactive. Non vanilla.
- `prefillFileName` names a new file Link with the naming strip parked on End. Non vanilla.
- `allowDiving` lets B while swimming duck under for a moment, as the handheld port allows. Non vanilla. The extra dungeon forces it on, because its water room is built around it.
- `miscBugFixes` and `gameChangingBugFixes` are bundle masters that enable all split fixes of the MiscBugFixes and GameChangingBugFixes origin unless overridden.
- `bugFixToggles` holds per-fix overrides for the 42 split bug fixes, keyed by feature id (see packages/features/src). Unset inherits the bundle master; an explicit true or false overrides it.
- `archeryNeedsBow` lets the archery host refuse the fee when the shots it buys could not be fired.
- `extraDungeon` says whether the optional extra dungeon carried by the second cartridge is offered. It is separate from whether its data is present: owning the cartridge and leaving this off must give an untouched overworld. Off by default, so a profile that never sets it behaves like the base game.

## packages/features/src/settings/general-settings.type.ts

- `autoSaveIntervalSeconds` ranges 60 to 1800, default 300. `autoSaveMaxEntries` ranges 1 to 20, default 5.
- `vsync` drives the core's frame loop from the display's vertical blank (requestAnimationFrame) and gates the game step on a 60.0988 Hz accumulator, so the speed stays right on any refresh rate. Off is the timer pacing the app always used. It can be toggled live.
- `turboEnabled` runs the game faster than real time while the Turbo shortcut is held. Off means the core never leaves real time. It can be toggled live. `turboSpeed` is the multiplier, one of the rungs in packages/game-core/src/turbo-speed.

## packages/features/src/settings/graphics-settings.type.ts

- `linkSprite` is the id or filename of a custom Link sprite in the global sprite library (under %AppData%), or null for the original. At game start the bridge writes the `.zspr` to MEMFS and sets the LinkGraphics key.
- `windowMode`, `startFullscreen`, `viewportConstraint` and `pixelPerfect` are managed by Electron.
- `displayMonitor`, `syncedRateInFullscreen` and `syncedRateTargetHz` are the Brock display module's keys, read and written by its Display tab: the screen to use, whether to switch to a whole multiple of 60 while in fullscreen, and the target rate (0 for the highest the display offers).
- `pixelPerfect` snaps the canvas to a whole number of source pixels, measured in device pixels so display scaling cannot reintroduce uneven pixel sizes. It trades a little image size for a scroll that never shimmers. Renderer only (not serialized to the INI). Only meaningful when `viewportConstraint` is `none`, because the other modes bypass the fit math. It forces `linearFiltering` off while enabled.
- `renderIntoNotch` (mobile): true (default) renders under the camera cutout, full bleed; false keeps UI and canvas inside the usable screen. Renderer only (not serialized to the INI).
- `hideSpaceBeyondWalls` paints the space past the walls of a house, a cave or the sanctuary black. The core decides per frame (hide_space_beyond_walls.c), so dungeons and the overworld are never touched.
- `coloredRupees` draws a rupee reward lying in the world as the plain coloured gem, not the game's numbered picture. `itemSheen` sweeps a slow glint across a world item's pixels.

## packages/features/src/settings/haptic-settings.type.ts

- Haptic feedback configuration: vibration and rumble for game events. `intensity` is a 0 to 100 global multiplier.

## packages/features/src/settings/hud-settings.type.ts

- `hudStyle`: `vanilla` rebuilds the original look from extracted sprites; `enhanced` is the same sprite set driven by the host (host owned pause menu, free HUD layout) and needs a 16:9 or wider display; `modern` is Enhanced plus the modern control scheme.
- The stored value and the label are the same word on purpose. There is no separate control scheme key; the scheme is derived from this field (see packages/features/src/hud-style).
- `customHudAspectW` and `customHudAspectH` apply when `hudRatio` is `custom`; 0 means auto detect from the screen.
- Title screen fields are on the HUD tab: the host draws the title over the hidden native one. `titleMotion: 'drifting'` adds a slow parallax and drifting clouds while the title idles. `titleFollowsProgress` takes the world, and the sword when it is set to progress, from the most advanced save. `titleSword` is the sword planted in the title, or the save's own.

## packages/features/src/settings/settings.type.ts

- `GameSettings` is the per profile game settings. It mirrors the zelda3 config.h and zelda3.ini fields. The online notice toggles (one `apNotify*` boolean per notice kind) come from packages/features/src/archipelago/online-notice-settings, and the quiet rupees, bombs and arrows switches from packages/game-data/src/quiet-receipts.
- The section interfaces it extends exist only to keep each part readable; settings are stored flat under these exact keys.

## packages/features/src/vanilla-safe-settings/

Settings that Vanilla Safe already neutralizes at runtime but that own no `FeatureDef`. The settings lock reads `affectsVanillaParity` off the registry, which only covers gate word bits. Without this list those controls stayed enabled while doing nothing.

Membership is a claim about runtime behaviour: a key belongs here only once something forces it off. `newRenderer` is absent on purpose, since it is a pure engine swap that stays on. Host side preferences (volumes, saves, window, scaling) never reach the emulated game and are absent too.

Why each group is locked:

- `cheatsEnabled`: gate word 3 drops every cheat bit under Vanilla Safe (`buildFeatureWord3`).
- The MSU keys (`enableMSU`, `resumeMSU`, `resetMSUAtTitle`, `packReplaceAmbient`, `packReplaceSfx`): `serializeToIni` writes MSU off and withholds the pack path.
- `linkSprite`: `serializeToIni` withholds `LinkGraphics`, and the override bit is masked.
- The HUD keys (`hudMode` through `hudCountdownStyle`): the `HudOverride` bit is masked, so the native HUD returns and every style option describes an overlay that is no longer drawn.
- `modernScheme`: the `ModernControls` bit is stripped from word 2, so the core keeps its own equipped item register and the slot assignments drive nothing. The scheme has no key of its own any more; it derives from `hudStyle`, which is also locked.
- `enhancedMode7`, `noSpriteLimits`: renderer effects that visibly differ from the cartridge, hand gated in `buildPpuFlags`.
- `hideSpaceBeyondWalls`: `pushLiveSettings` withholds the request under Vanilla Safe.
- `dialogSpeed`, `dialogHoldSpeed`, `dialogHoldToAccelerate`, `dialogFillOnB`, `dialogTypewriter`: the `DialogControls` bit is masked out of gate word 3, so the core plays text at the game's own speed.
- `dialogBox` and the dialog look keys after it: the enhanced dialog box rides the same `HudOverride` bit as the custom HUD, so the native box comes back.
- `hudHighlightPrimary`, `hudHighlightSecondary`: gate word 3 drops the receipt messages bit, so no line carries the highlights.

Haptic settings are nested, so they arrive as dotted keys (`haptics.swordSwing`). The whole haptics group counts as locked: its master flag is stripped from features0 and again by the C side parity mask, so every per event toggle under it is inert.

## packages/features/tests/all-off-vanilla.keep.test.ts

With every enhancement off, the bridge sends all zero feature words so the engine runs the
verbatim vanilla path. `hudStyle: 'vanilla'` is the default Original HUD; a host drawn
style arms the host menu gate bits.

The init time texture height follows the INI `extend_y`, which only applies with
`extendedRendering`. The live Height240 PPU flag must agree, or the draw loop overruns the
buffer. `extendY` defaults to true, so a vanilla profile with extended rendering off must
still render the stock 224 lines.

## packages/features/tests/bundle-flags-parity.keep.test.ts

The split bug fix flags are generated into both the C header and the TS registry from one
catalog (`tooling/bundle-flags/gen-bundle-flags.mjs`). The word 3 gate bits in `features.h` and the
host menu and modern controls bits in word 2 are hand written on both sides, so they are
checked the same way. Word 3 has no free bit left, which is why those two gates live in
word 2, above `kFeatures2_HandAuthoredFloor`.

The C headers mention flag names in prose comments, so the scan strips comments first. An
enum value is either a literal or a shift; anything else is skipped. Both word 2 gates
change what the game computes (the menu takeover and the item register), so both must be
in the Vanilla Safe mask, and they are asserted by name so a removed entry fails.

## packages/features/tests/hud-style-scheme.keep.test.ts

The HUD style is the one choice and the control scheme follows from it. Each style is kept as
stored, the two host drawn styles force the overlay on, and a fresh profile is Original and so
Classic.

## packages/features/tests/resolve-features.keep.test.ts

The rendering requirement tree: `extendedRendering` then `linearWorldTilemap` then
`ultrawideRendering` and `tallRendering`; `cameraLockToViewport` requires
`extendedRendering`; `smoothTransitions` requires `cameraLockToViewport`. A child never
resolves on while its parent is off.

## packages/features/tests/vanilla-safe-lock.keep.test.ts

Vanilla Safe leaves nothing enabled that diverges from the stock cartridge, asked of the
registry so new features are covered. The fixpoint matters more than the per feature flag:
it protects a future feature that depends on a parity feature without being flagged
itself. Haptics and developer tools only observe, but both have `GameHook_*` call sites in
vendored game code, so Vanilla Safe locks them too.
