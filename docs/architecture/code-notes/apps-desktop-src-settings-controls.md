<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/settings-controls

Facts about `apps/desktop/src/settings-controls/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/settings-controls/AspectRatioControl/AspectRatioControl.tsx

The aspect ratio picker has two modes. Legacy (HUD) passes `presetOptions` and shows a single Preset tab. Split (game) passes `widePresets` and/or `tallPresets` and shows Wide and Tall tabs (omit `tallPresets` when tall rendering is off). The other tabs (Auto, Screen, Custom) are always rendered from `options`. `descriptions` holds per-mode text, and `recommendedNote` appears in gold when the selected mode matches `recommendedValue`. The current value is resolved to the top-level tab it belongs to.

## apps/desktop/src/settings-controls/audio/is-audio-disabled.ts

- The pack-dependent switches only mean something while a pack plays at all. Only Manual mode's own switch can turn them off: in Auto, whether a pack plays is decided by the pack being assigned, so a stale `enableMSU` from a profile saved before that change must not grey them out.
- The Music, Ambience and SFX sliders only act once the independent-mix toggle is on.

## apps/desktop/src/settings-controls/audio/MsuDetectedSummary.tsx

The read-only Auto mode row of the Audio tab: the format read off the assigned pack, and the audio settings that follow from it. `pack` is null when no pack is assigned. `MODE_LABELS` names the pack formats the way the wider MSU community names them.

## apps/desktop/src/settings-controls/audio/MsuMismatchCallout.tsx

Warns that manual audio settings disagree with the chosen pack format, so music will play at the wrong speed. The old core only ever reported this to stderr.

## apps/desktop/src/settings-controls/audio/pack-detail.ts

What else is true about the pack beyond its format name. A layered pack reports as MSUL, but its track numbering and audio format still matter and would otherwise go unmentioned.

## apps/desktop/src/settings-controls/audio/useMsuPackProfile.ts

Detects the assigned MSU pack's contents for the Audio tab's Auto mode. It reads the profile fresh from storage instead of trusting the profile object passed down from the app shell, because that object is a snapshot from profile load time and a pack assigned in Data Manager afterwards never reaches it. AudioSettings mounts again on every tab activation, so the read is current whenever the tab opens. The manifest is read too, because it is what makes a pack layered: track names alone cannot tell a layered pack from a classic one.

## apps/desktop/src/settings-controls/bugfixes/build-bug-fix-section.ts

The Bug Fixes section is generated from the registry (the 42 split bug fixes). It has no JSX, so non-React consumers can import it. The widescreen corrections are not here: they are one switch on the Display tab, which covers the core bit and the fix split from that bundle together.

## apps/desktop/src/settings-controls/bugfixes/bundle-master.ts

A fix with no explicit toggle inherits the bundle master it belongs to.

## apps/desktop/src/settings-controls/contributing/SanctuaryAccount.tsx

The Sanctuary account row of the Contributor tab: the shared account card, given the Sanctuary's wording and wired to the session store. `window.open` on an external URL is routed to the system browser by the main process.

## apps/desktop/src/settings-controls/display/is-display-disabled.ts

Extend Y only applies to Original, because every other ratio is served at 240 lines, so the row idles for the rest. Widescreen Sprites and Extend Play Area idle until the view is wider than the base picture (`rendersWide`), which is also true for a fixed 4:3 at 240 lines.

## apps/desktop/src/settings-controls/display/refresh-advisory.ts

The game advances exactly 60 times a second, so a display running at a whole multiple of 60 shows every frame for the same length of time. One that does not holds some frames longer than others, and no pacing on our side can even that out. The V-Sync description says so and names the rate that would help, so the player is not left wondering why V-Sync did nothing.

## apps/desktop/src/settings-controls/gameplay/DialogHoldRow.tsx

The hold-to-accelerate row: one setting item with two values. The toggle on the left turns the hold on, and the slider to its right picks the speed the hold plays at, dimmed while the toggle is off.

## apps/desktop/src/settings-controls/gameplay/DialogStopSlider.tsx

One slider over a ladder of stops. The stops are not evenly spaced (1x, 1.5x, 2x, then instant), so the range input walks the ladder by index and the label shows the stop at that index. An off-ladder stored value snaps to the nearest stop. `formatStop` defaults to the pacing form: Original, Instant, or "1.5x". Shared by the text speed, hold speed and font size rows.

## apps/desktop/src/settings-controls/gameplay/is-gameplay-disabled.ts

Under Modern the map is a core verb of its own, so Open Map with Select has nothing to do. It is greyed and kept in place, like every other gated setting in the app: an option that vanishes when a neighbouring one changes reads as a bug.

## apps/desktop/src/settings-controls/graphics/is-graphics-disabled.ts

- Pixel Perfect promises whole, identical source pixels, and bilinear interpolation would break that before anything else runs, so the core is handed Linear Filtering off and the control follows.
- Enhanced Mode 7 and No Sprite Limit are not registered feature definitions yet, so the DisabledOverlay lock (driven by `packages/features/src/feature-registry`) cannot reach them. They are locked by hand under Vanilla Safe, matching how `buildPpuFlags` forces both off. Optimized PPU stays enabled on purpose: it is a pure engine swap, not a divergence from stock rendering.

## apps/desktop/src/settings-controls/haptics/is-haptics-disabled.ts

Every haptic setting except the master switch is disabled while haptics is off.

## apps/desktop/src/settings-controls/hud/hud-ratio-options.ts

Fixed HUD ratio presets wider than the screen are disabled, since the HUD clamps to the screen anyway. The screen ratio is the one the profile renders (`allowedRatio`), so Original and ratios the capabilities pull back are measured at their real shape. Match and Custom stay open.

## apps/desktop/src/settings-controls/hud/is-border-disabled.ts

Thickness and colour describe a drawn line, so the game's tiles and no border leave them idle.

## apps/desktop/src/settings-controls/hud/is-dialog-disabled.ts

`EITHER_BOX_KEYS` act on both boxes, so the original box leaves them live. Every other row describes the enhanced box, so the original box idles them all.

## apps/desktop/src/settings-controls/hud/is-hud-disabled.ts

The Title Screen and Dialog Box sections carry dependent rows. Every other HUD row is always live.

## apps/desktop/src/settings-controls/hud/is-texture-disabled.ts

Only the rows the texture subsection owns get an answer. The Dialog Box section runs every one of its keys through this rule, so claiming a key that belongs to another subsection would idle that row too.

## apps/desktop/src/settings-controls/hud/is-title-disabled.ts

Every title row but the switch describes the reimagined title, so the original one idles them.

## apps/desktop/src/settings-controls/HudStyleControl/HudStyleControl.tsx

- Original, Enhanced and Modern all rebuild the SNES HUD from the active ROM's extracted sprites, so all three are locked when none exist. The two app-drawn styles also need a 16:9 or wider display, because their groups and their host-drawn menu live in the side bands a narrower view does not have. Modern is Enhanced plus the modern control scheme, so it has exactly Enhanced's requirements. When sprites are missing a notice offers a one-click extract that unlocks every style once it succeeds.
- Availability is checked again on mount, since sprites may have been extracted from the Data Manager.
- The notice names only the condition the user can act on, one fix at a time: missing sprites is the blocking one (it locks all three styles), and the aspect rule is only raised once the sprites are there. When neither applies there is no notice.

## apps/desktop/src/settings-controls/PlayerSpriteSelector/PlayerSpriteSelector.tsx

A card grid picker for the profile's player sprite. It reads the global player sprite library, and Original is the default. Each card is a `SpriteChoiceCard`.
