/* @layer shared-types @kind logic */
import type { FunctionMapping } from './controls';

/** Haptic feedback configuration — controls vibration/rumble for game events */
interface HapticSettings {
  enabled: boolean;
  intensity: number; // 0–100 global multiplier
  swordSwing: boolean;
  swordHitEnemy: boolean;
  swordClink: boolean;
  damageTaken: boolean;
  itemUse: boolean;
  dashVibration: boolean;
  environmentalEffects: boolean;
}

/** Per-profile game settings — mirrors zelda3 config.h / zelda3.ini fields */
interface GameSettings {
  // ─── General ───
  autosave: boolean; // Legacy: C-level autosave (slot 0 save/restore) — kept for INI compat
  autoSaveEnabled: boolean;
  autoSaveIntervalSeconds: number; // 60-1800, default 300
  autoSaveMaxEntries: number; // 1-20, default 5
  saveOnQuit: boolean;
  displayPerfInTitle: boolean;
  // Legacy: only read by the native SDL main loop, which is not part of the WASM build — kept so
  // existing profiles and the INI round-trip unchanged. Superseded by `vsync` below.
  disableFrameDelay: boolean;
  // Drive the core's frame loop from the display's vertical blank (requestAnimationFrame) instead of
  // a free-running timer, and gate the game step on a 60.0988 Hz accumulator so the speed stays right
  // on any refresh rate. Off = the timer pacing the app has always used. Live-togglable.
  vsync: boolean;
  // While in fullscreen, switch the display to a refresh rate that is a whole multiple of the
  // game's 60 steps a second, and put the original back on leaving fullscreen or quitting.
  // Only meaningful on desktop, and only where the platform can change modes at all.
  syncedRefreshRate: boolean;
  // Target rate in Hz. 0 means "the highest multiple of 60 this display offers", which is what
  // a fresh profile gets — a stored rate the display later stops offering falls back to that.
  syncedRefreshRateHz: number;

  // ─── Aspect Ratio & Display ───
  // Master gate — off: the engine always runs 4:3 vanilla and no sub-settings appear in the UI.
  // On: the aspect ratio selector and all extended-rendering options become available.
  extendedRendering: boolean;
  // 'auto' = current app viewport (notch-aware); 'screen' = full device screen; a preset string
  // ('4:3'…'32:9') = fixed; 'custom' = the W:H below. Re-resolved on every game start.
  // Only applied when extendedRendering is true; otherwise the engine always receives 4:3.
  aspectRatio: 'auto' | 'screen' | '4:3' | '3:2' | '16:9' | '16:10' | '21:9' | '32:9' | '4:5' | '3:4' | 'custom';
  customAspectW: number; // ratio width when aspectRatio === 'custom'; 0 = auto-detect from screen
  customAspectH: number; // ratio height; 0 = auto-detect
  extendY: boolean;
  // Extend sprite spawn/despawn ranges so enemies/objects revealed by the wider view behave correctly.
  // Positive opt-in (replaces the old inverted `unchangedSprites`). Default on; only relevant when wide.
  widescreenSprites: boolean;
  // Apply the widescreen graphics corrections (edges/sprites that assume a 4:3 screen). Positive opt-in
  // (replaces the old inverted `noVisualFixes`). Default on; only relevant when wide.
  widescreenVisualFixes: boolean;
  // Uses a clamped linear BG fetch instead of the wrapping 512px SNES tilemap — prevents tile
  // garbage at edges in wide views. Required for any ratio above ~19:9. Memory cost: one world
  // tile buffer per BG layer. Default true (auto-enabled with extended rendering).
  linearWorldTilemap?: boolean;
  // Unlocks ratios above 19:9 up to 32:9 (the engine's full 1024px budget).
  // Requires linearWorldTilemap. Default true when linear tilemap is on.
  ultrawideRendering?: boolean;
  // Allow ratios taller than 4:3 — adds extra rows above/below the game image. Symmetric with
  // wide rendering but independent (a ratio can be both wide and tall). Default false.
  tallRendering?: boolean;
  // Lock the overworld camera to the wide/tall view so its edges stop at the area boundary (no
  // out-of-area black band); Link still walks to the screen edge. Off = original 224x256 camera.
  cameraLockToViewport: boolean;
  // Pan through area transitions via a 2-area world tilemap instead of the wrapping 512px stock
  // tilemap — removes the wrapped-edge slice at screen seams. Requires cameraLockToViewport.
  smoothTransitions?: boolean;
  // Pause sprite AI while the sprite is in the wide/tall extra band but outside the stock 256px
  // screen — prevents guards reacting or alarms firing from off screen. Off = stock behavior.
  pauseOffscreenAI?: boolean;

  // ─── Graphics ───
  windowScale: number; // 1-5 (legacy, unused in Electron)
  fullscreen: 0 | 1 | 2; // legacy INI field
  newRenderer: boolean;
  enhancedMode7: boolean;
  noSpriteLimits: boolean;
  linearFiltering: boolean;
  dimFlashes: boolean;
  // Custom Link sprite: id/filename of a sprite in the global library (%AppData%/.../sprites), or null for
  // the original. Applied at game start — the bridge writes the .zspr to MEMFS and sets the LinkGraphics key.
  linkSprite: string | null;
  outputMethod: 'SDL' | 'SDL-Software' | 'OpenGL' | 'OpenGL ES'; // legacy, unused in Electron

  // ─── Window (Electron-managed) ───
  windowMode: 'default' | 'borderless';
  startFullscreen: boolean;
  viewportConstraint: 'none' | 'fit' | 'fill';
  // Snap the canvas to a whole number of source pixels, measured in DEVICE pixels so display scaling
  // can't reintroduce uneven pixel sizes. Trades a little image size for a scroll that never shimmers.
  // Renderer-only (not serialized to the INI). Only meaningful when viewportConstraint is 'none' —
  // the other modes bypass the fit math entirely. Forces linearFiltering off while enabled.
  pixelPerfect: boolean;

  // ─── Mobile display ───
  // true (default): render under the camera cutout (full-bleed). false: keep UI +
  // canvas inside the usable screen. Renderer-only (not serialized to the INI).
  renderIntoNotch: boolean;

  // ─── Gameplay features ───
  itemSwitchLR: boolean;
  itemSwitchLRLimit: boolean;
  // Split out of itemSwitchLR (snesrev bundled them): reorder items in the inventory with Y + arrows,
  // and assign separate items to the X / L / R buttons. Both non-vanilla, opt-in.
  inventoryReorder: boolean;
  secondaryItemSlots: boolean;
  // Render dialog instantly and auto-advance message-box waits; choice prompts stay interactive. Non-vanilla.
  autoSkipDialog: boolean;
  turnWhileDashing: boolean;
  mirrorToDarkworld: boolean;
  collectItemsWithSword: boolean;
  breakPotsWithSword: boolean;
  disableLowHealthBeep: boolean;
  skipIntroOnKeypress: boolean;
  disableTelepathy: boolean;
  showMaxItemsInYellow: boolean;
  moreActiveBombs: boolean;
  carryMoreRupees: boolean;
  miscBugFixes: boolean; // legacy bundle master — enables all MiscBugFixes-origin split fixes unless overridden
  gameChangingBugFixes: boolean; // legacy bundle master — enables GameChangingBugFixes-origin split fixes
  cancelBirdTravel: boolean;
  // Granular per-fix overrides for the 42 split bug-fixes, keyed by feature id (see shared/features).
  // Unset ⇒ inherit the legacy bundle master above; explicit true/false ⇒ override it.
  bugFixToggles?: Record<string, boolean>;

  // ─── Audio ───
  enableAudio: boolean;
  masterVolume: number; // 0-100
  // Explicit opt-in for the per-group (music vs SFX) DSP mix. Off = bit-identical stock audio mix and the
  // Music/SFX sliders are inert; on = the sliders take effect. Master volume is unaffected either way.
  perGroupVolume: boolean;
  musicVolume: number; // 0-100
  musicMuted: boolean;
  sfxVolume: number; // 0-100
  sfxMuted: boolean;
  audioFreq: number;
  audioChannels: 1 | 2;
  audioSamples: number;
  enableMSU: 'false' | 'true' | 'deluxe' | 'opuz' | 'deluxe-opuz';
  resumeMSU: boolean;
  msuVolume: number; // 0-100

  // ─── Post-Processing ───
  overworldEdgeEffect: boolean;
  postProcessingShadows: boolean;
  forceBackdropBlack: boolean;

  // ─── HUD ───
  hudMode: 'original' | 'enhanced';
  hudStyle: 'vanilla' | 'modern';
  hudRatio: 'match' | '4:3' | '3:2' | '16:9' | '16:10' | 'custom';
  customHudAspectW: number; // ratio width when hudRatio === 'custom'; 0 = auto-detect from screen
  customHudAspectH: number; // ratio height; 0 = auto-detect
  hudEnhancedParts: ('main' | 'pause')[];
  hudHeartMode: 'original' | 'smooth';
  hudMagicMode: 'original' | 'accurate';
  hudCountLayout: 'centered' | 'original';
  hudPauseStyle: 'vanilla' | 'enhanced';
  hudPauseHighlight: 'box' | 'glow' | 'none';

  // ─── Controls ───
  activeInputProfileId: string | null;
  functionMappings?: FunctionMapping[];
  enhancedSaveSlotShortcut: boolean;
  saveHoldDuration: number; // seconds, 1-5

  // ─── Haptics ───
  haptics: HapticSettings;
  // Whether this profile routes rumble to its own controllers at all. When on,
  // every device the profile uses gets the signal; there is no per-device list
  // to curate — see allowedDevices in lib/input/profile-devices.ts.
  hapticsEnabled: boolean;

  // ─── Developer ───
  // Master gate for developer-only instrumentation (transition-settled events, and any future dev-only
  // GameHook). Off by default: the C hook that would fire these makes zero host-calls when this is off,
  // same contract as haptics.enabled. Purely observational, never changes gameplay.
  developerToolsEnabled: boolean;
}

export type { GameSettings, HapticSettings };
