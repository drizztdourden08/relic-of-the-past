/* @layer bridge-wasm @kind logic */
/** Bitflag builders for live WASM settings. Values must match features.h / ppu.h. */
import type { GameSettings } from '@shared/types/settings';
import { BUNDLE_FIXES } from '@shared/features/bundle-fixes.generated';
import { effectiveFeatureIds } from './live-settings-gate';
import { offscreenAiMode } from './settings';

// Feature flag enum values, which must match features.h
const FEATURE_FLAGS = {
  extendScreen64:         1,
  switchLR:               2,
  turnWhileDashing:       4,
  mirrorToDarkworld:      8,
  collectItemsWithSword:  16,
  breakPotsWithSword:     32,
  disableLowHealthBeep:   64,
  skipIntroOnKeypress:    128,
  showMaxItemsInYellow:   256,
  moreActiveBombs:        512,
  widescreenVisualFixes:  1024,
  carryMoreRupees:        2048,
  miscBugFixes:           4096,
  cancelBirdTravel:       8192,
  gameChangingBugFixes:   16384,
  switchLRLimit:          32768,
  dimFlashes:             65536,
  disableTelepathy:       131072,
  cameraLockToViewport:   262144,
  perGroupVolume:         524288,
  haptics:                1048576,
  pauseOffscreenAI:       2097152,
  extendedRendering:      4194304,
  linearWorldTilemap:     8388608,
  ultrawide:              16777216,
  tallRender:             33554432,
  smoothTransitions:      67108864,
  inventoryReorder:       134217728,
  secondaryItemSlots:     268435456,
  autoSkipDialog:         536870912,
  developerTools:         1073741824,
} as const;

// When non-null, forces the auto-skip-dialog bit to this value in the pushed features word regardless of
// the user's setting; null defers to the setting. Used by the gameplay simulator during its runs.
let autoSkipDialogOverride: boolean | null = null;

const setAutoSkipDialogOverride = (on: boolean | null): void => {
  autoSkipDialogOverride = on;
};

// When non-null, ORs the developer-tools bit into the pushed features word regardless of the user's
// setting; null defers to the setting. Safe because the gate only unlocks read-only instrumentation
// queries, so the simulator (itself a developer tool) may switch it on for a headless run.
let developerToolsOverride: boolean | null = null;

const setDeveloperToolsOverride = (on: boolean | null): void => {
  developerToolsOverride = on;
};

// Hand-authored features2 bits, allocated downward from bit 24; the generated bug-fix catalog
// (BUNDLE_FIXES) owns features2 upward from bit 0. Values must match features.h.
const FEATURES2_FLAGS = {
  widescreenPlayArea: 16777216, // kFeatures2_WidescreenPlayArea = 1 << 24
  widescreenIdleAI: 33554432, // kFeatures2_WidescreenIdleAI = 1 << 25
} as const;

// Word 3 (features3) bit values; must match kRam_Features3 in features.h. The four category bits are
// PERMISSIONS: each lets its cheat family run at all. The per-cheat on/off lives elsewhere (e.g.
// ignore-collision's real state is WRAM byte 0x37F, set by its own WasmCheat* export), so granting all
// four alongside the master is safe and is the only way any cheat can activate.
const FEATURE_FLAGS_3 = {
  cheatsEnabled:         1,
  cheatIgnoreCollision:  2,
  cheatItemGrant:        4,
  cheatStats:            8,
  cheatCombat:           16,
  vanillaSafe:           32,
  itemOverrides:         64,
  trackerNotifications:  128,
  playerSpriteOverride:  256,
  hudOverride:           512,
  trackerQueries:        1024,
  navigationQueries:     2048,
  renderQueries:         4096,
  overlayQueries:        8192,
  deliveryQueries:       16384,
} as const;

// Whether the randomizer's chest-override table currently has entries. randomizer.ts flips this (and
// re-pushes word 3) around WasmSetItemOverride/WasmClearItemOverrides, so the gate is only open while
// the table has something to apply; a stale table from an earlier session can never start substituting
// items again (see the "leftover override table" note in core/game-hooks/item_overrides.c). No user
// setting exists for this yet; the randomizer client is still unwired (see randomizer.ts).
let itemOverridesActive = false;

const setItemOverridesActive = (on: boolean): void => {
  itemOverridesActive = on;
};

const buildFeatureWord3 = (s: GameSettings): number => {
  let flags = 0;
  if (s.vanillaSafe) flags |= FEATURE_FLAGS_3.vanillaSafe;
  // Vanilla Safe forces every cheat off regardless of cheatsEnabled: cheats are the textbook divergence.
  if (s.cheatsEnabled && !s.vanillaSafe) {
    flags |=
      FEATURE_FLAGS_3.cheatsEnabled |
      FEATURE_FLAGS_3.cheatIgnoreCollision |
      FEATURE_FLAGS_3.cheatItemGrant |
      FEATURE_FLAGS_3.cheatStats |
      FEATURE_FLAGS_3.cheatCombat;
  }
  // Randomizer chest-item substitution is a parity-affecting divergence. The C-side kGateWordParityMask
  // (zelda_rtl.c) already forces this bit off under Vanilla Safe; kept honest here too.
  if (itemOverridesActive && !s.vanillaSafe) flags |= FEATURE_FLAGS_3.itemOverrides;
  // TrackerNotifications never changes emulated state, but its call site (GameHook_NotifyItemReceived
  // in vendored player.c) counts as a divergence, so it is in the C-side parity mask and stripped here
  // too. The tracker's item log and the simulator's onItemReceived depend on it; neither needs its own
  // setting, so it's on whenever Vanilla Safe allows it.
  if (!s.vanillaSafe) flags |= FEATURE_FLAGS_3.trackerNotifications;
  // Custom player sprite follows whether one is configured, same as the INI's LinkGraphics key
  // (settings.ts serializeToIni), and is stripped under Vanilla Safe (also enforced by the C-side mask).
  if (s.linkSprite && !s.vanillaSafe) flags |= FEATURE_FLAGS_3.playerSpriteOverride;
  // HUD override follows whether the enhanced overlay hides any native part (live-settings.ts computes
  // the same hideHud/hidePause conditions for WasmSetHudHidden/WasmSetPauseHidden). Stripping it under
  // Vanilla Safe is what restores the native HUD/pause menu mid-session (HudOverride_Restore in
  // core/game-hooks/hud_override.c, called when this bit clears in WRAM).
  const hudOverrideWanted = s.hudMode === 'enhanced' && (s.hudEnhancedParts.includes('main') || s.hudEnhancedParts.includes('pause'));
  if (hudOverrideWanted && !s.vanillaSafe) flags |= FEATURE_FLAGS_3.hudOverride;

  // Host-data gates feed host systems (tracker, navigation, renderer, overlay UI, delivery queue), not
  // the game, so Vanilla Safe never strips them. They are still gated: an export nobody enabled returns
  // nothing.
  if (s.trackerEnabled) flags |= FEATURE_FLAGS_3.trackerQueries;
  // Navigation data is dev-surface data, so it needs BOTH the dev master and its own toggle. Resolved
  // here, not at 30-odd call sites.
  if (s.developerToolsEnabled && s.devNavigationData) flags |= FEATURE_FLAGS_3.navigationQueries;
  // Delivery readiness is only meaningful while something can actually deliver an item: a cheat grant,
  // or the randomizer's override table. No new setting needed, the condition already exists.
  if ((s.cheatsEnabled && !s.vanillaSafe) || itemOverridesActive) flags |= FEATURE_FLAGS_3.deliveryQueries;
  // Renderer and overlay reads have no meaningful "off": the app cannot draw a frame without them, so a
  // user toggle would only break the window. They are still declared and gate-checked so a future
  // embedder or headless build can withhold them, and so the audit can prove they were classified.
  flags |= FEATURE_FLAGS_3.renderQueries | FEATURE_FLAGS_3.overlayQueries;
  return flags;
};

// PPU render flag values, which must match ppu.h
const PPU_FLAGS = {
  newRenderer:    1,
  mode7_4x4:     2,
  height240:     4,
  noSpriteLimits: 8,
} as const;

const buildFeatureFlags = (s: GameSettings): number => {
  let flags = 0;
  // Registered ids go through the Vanilla Safe resolver (shared/features/resolve-gates.ts), not a
  // hand-checked "er && ..." chain: it strips every parity-affecting id, then the requires-fixpoint
  // cascades to every dependent (extendedRendering -> linearWorldTilemap -> {ultrawide, tallRender}).
  const effective = effectiveFeatureIds(s);
  const isOn = (id: string): boolean => effective.has(id);
  // widescreenSprites/widescreenVisualFixes also need a wide ratio; that condition isn't part of the
  // requires graph (it depends on aspectRatio, not another feature id).
  const wide = isOn('extendedRendering') && s.aspectRatio !== '4:3';
  if (isOn('extendedRendering')) flags |= FEATURE_FLAGS.extendedRendering;
  if (isOn('linearWorldTilemap')) flags |= FEATURE_FLAGS.linearWorldTilemap;
  if (isOn('ultrawideRendering')) flags |= FEATURE_FLAGS.ultrawide;
  if (isOn('tallRendering')) flags |= FEATURE_FLAGS.tallRender;
  if (wide && isOn('widescreenSprites')) flags |= FEATURE_FLAGS.extendScreen64;
  if (wide && isOn('widescreenVisualFixes')) flags |= FEATURE_FLAGS.widescreenVisualFixes;
  if (isOn('cameraLockToViewport')) flags |= FEATURE_FLAGS.cameraLockToViewport;
  if (isOn('smoothTransitions')) flags |= FEATURE_FLAGS.smoothTransitions;
  // Off-screen behaviour is three-way, so the pause bit answers to the mode, not a boolean: 'idle'
  // carries its own features2 bit (buildFeatureWords) and 'acting' sets neither.
  if (isOn('pauseOffscreenAI') && offscreenAiMode(s) === 'paused') flags |= FEATURE_FLAGS.pauseOffscreenAI;
  if (isOn('inventoryReorder')) flags |= FEATURE_FLAGS.inventoryReorder;
  if (isOn('secondaryItemSlots')) flags |= FEATURE_FLAGS.secondaryItemSlots;
  if (autoSkipDialogOverride === null ? isOn('autoSkipDialog') : autoSkipDialogOverride)
    flags |= FEATURE_FLAGS.autoSkipDialog;
  // Not yet registered as FeatureDefs (the 16 snesrev quality-of-life flags in feature-registry.ts),
  // so the resolver can't reach them; gated inline until that lands. The C-side mask (zelda_rtl.c
  // kGateWordParityMask) already covers every one of these regardless.
  if (!s.vanillaSafe && s.itemSwitchLR) flags |= FEATURE_FLAGS.switchLR;
  if (!s.vanillaSafe && s.itemSwitchLRLimit) flags |= FEATURE_FLAGS.switchLRLimit;
  if (!s.vanillaSafe && s.turnWhileDashing) flags |= FEATURE_FLAGS.turnWhileDashing;
  if (!s.vanillaSafe && s.mirrorToDarkworld) flags |= FEATURE_FLAGS.mirrorToDarkworld;
  if (!s.vanillaSafe && s.collectItemsWithSword) flags |= FEATURE_FLAGS.collectItemsWithSword;
  if (!s.vanillaSafe && s.breakPotsWithSword) flags |= FEATURE_FLAGS.breakPotsWithSword;
  if (!s.vanillaSafe && s.disableLowHealthBeep) flags |= FEATURE_FLAGS.disableLowHealthBeep;
  if (!s.vanillaSafe && s.skipIntroOnKeypress) flags |= FEATURE_FLAGS.skipIntroOnKeypress;
  if (!s.vanillaSafe && s.showMaxItemsInYellow) flags |= FEATURE_FLAGS.showMaxItemsInYellow;
  if (!s.vanillaSafe && s.moreActiveBombs) flags |= FEATURE_FLAGS.moreActiveBombs;
  if (!s.vanillaSafe && s.carryMoreRupees) flags |= FEATURE_FLAGS.carryMoreRupees;
  if (!s.vanillaSafe && s.miscBugFixes) flags |= FEATURE_FLAGS.miscBugFixes;
  if (!s.vanillaSafe && s.gameChangingBugFixes) flags |= FEATURE_FLAGS.gameChangingBugFixes;
  if (!s.vanillaSafe && s.cancelBirdTravel) flags |= FEATURE_FLAGS.cancelBirdTravel;
  if (!s.vanillaSafe && s.dimFlashes) flags |= FEATURE_FLAGS.dimFlashes;
  if (!s.vanillaSafe && s.disableTelepathy) flags |= FEATURE_FLAGS.disableTelepathy;
  // Per-group volume is an explicit opt-in. Off ⇒ the DSP mix stays bit-exact to the original and the
  // Music/SFX sliders are inert; the user must enable it before those sliders take effect.
  if (isOn('perGroupVolume')) flags |= FEATURE_FLAGS.perGroupVolume;
  // Haptics and developer tools only observe, but both touch vendored game code (GameHook_Notify* in
  // ancilla.c/player.c/sprite.c/overworld.c; GameHook_ModuleFrameEnd in misc.c), and touching the code
  // is the Vanilla Safe line, harmless or not. "Purely observational" was tried as the exemption test
  // and left two features wrongly exempt. The C-side kGateWordParityMask (zelda_rtl.c) enforces the
  // same thing; gating the live push too keeps this file's "wanted" bits honest.
  if (!s.vanillaSafe && s.haptics?.enabled) flags |= FEATURE_FLAGS.haptics;
  const devWanted = developerToolsOverride === null ? s.developerToolsEnabled : developerToolsOverride;
  if (devWanted && !s.vanillaSafe)
    flags |= FEATURE_FLAGS.developerTools;
  return flags;
};

// The 42 split bug-fix toggles live in two extra bitmask words (features1/features2). Each fix falls
// back to the legacy bundle setting it was extracted from so old profiles keep their behavior. Values
// come from the generated registry (must match features_bugfixes.h). All 42 are affectsVanillaParity,
// so effectiveFeatureIds already drops them under Vanilla Safe.
const buildFeatureWords = (s: GameSettings): { features1: number; features2: number } => {
  const effective = effectiveFeatureIds(s);
  let f1 = 0;
  let f2 = 0;
  for (const fix of BUNDLE_FIXES) {
    if (!effective.has(fix.id) || !fix.bit) continue;
    if (fix.word === 2) f2 |= fix.bit;
    else f1 |= fix.bit;
  }
  // Hand-authored features2 bits. Both are registered ids, so they go through the same Vanilla Safe
  // resolver as the generated fixes; the wide-view condition depends on aspectRatio, not a feature id.
  const wide = effective.has('extendedRendering') && s.aspectRatio !== '4:3';
  if (wide) {
    if (effective.has('widescreenPlayArea')) f2 |= FEATURES2_FLAGS.widescreenPlayArea;
    if (effective.has('offscreenAI') && offscreenAiMode(s) === 'idle') f2 |= FEATURES2_FLAGS.widescreenIdleAI;
  }
  return { features1: f1, features2: f2 };
};

// None of these four are registered FeatureDefs yet, so Vanilla Safe can't reach them through
// effectiveFeatureIds; each is hand-gated below. newRenderer is a pure engine swap ("visually
// identical"), so it stays on under Vanilla Safe. The other three visibly change what's on screen
// (taller area, no OAM sprite flicker, smoothed Mode 7), so they're forced off.
const buildPpuFlags = (s: GameSettings): number => {
  let flags = 0;
  if (s.newRenderer) flags |= PPU_FLAGS.newRenderer;
  if (!s.vanillaSafe && s.enhancedMode7) flags |= PPU_FLAGS.mode7_4x4;
  // extend_y (240 lines) must track the INI serializer, which only emits it when extendedRendering is
  // on and never under Vanilla Safe (see serializeToIni). The render-buffer height is baked at init from
  // that INI value; a live Height240 flag without it makes the draw loop's botBudget disagree with the
  // allocated texture (ppu.c PpuSetExtraSideSpace).
  if (!s.vanillaSafe && s.extendedRendering && s.extendY) flags |= PPU_FLAGS.height240;
  if (!s.vanillaSafe && s.noSpriteLimits) flags |= PPU_FLAGS.noSpriteLimits;
  return flags;
};

export { buildFeatureFlags, buildFeatureWord3, buildPpuFlags, buildFeatureWords, setAutoSkipDialogOverride, setDeveloperToolsOverride, setItemOverridesActive };
