/* @layer bridge-wasm @kind logic */
/** Bitflag builders for live WASM settings — values must match features.h / ppu.h. */
import type { GameSettings } from '@shared/types/settings';
import { BUNDLE_FIXES } from '@shared/features/bundle-fixes.generated';

// Feature flag enum values — must match features.h
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
} as const;

// PPU render flag values — must match ppu.h
const PPU_FLAGS = {
  newRenderer:    1,
  mode7_4x4:     2,
  height240:     4,
  noSpriteLimits: 8,
} as const;

const buildFeatureFlags = (s: GameSettings): number => {
  let flags = 0;
  // Rendering-geometry flags are gated by the extendedRendering master toggle. When off, the INI
  // already forces 4:3, but we also zero these flags so the C side stays fully vanilla.
  const er = !!s.extendedRendering;
  const wide = er && s.aspectRatio !== '4:3';
  if (er) flags |= FEATURE_FLAGS.extendedRendering;
  if (er && s.linearWorldTilemap) flags |= FEATURE_FLAGS.linearWorldTilemap;
  if (er && s.ultrawideRendering) flags |= FEATURE_FLAGS.ultrawide;
  if (er && s.tallRendering) flags |= FEATURE_FLAGS.tallRender;
  if (wide && s.widescreenSprites) flags |= FEATURE_FLAGS.extendScreen64;
  if (wide && s.widescreenVisualFixes) flags |= FEATURE_FLAGS.widescreenVisualFixes;
  if (er && s.cameraLockToViewport) flags |= FEATURE_FLAGS.cameraLockToViewport;
  if (er && s.cameraLockToViewport && s.smoothTransitions) flags |= FEATURE_FLAGS.smoothTransitions;
  if (er && s.pauseOffscreenAI) flags |= FEATURE_FLAGS.pauseOffscreenAI;
  if (s.itemSwitchLR) flags |= FEATURE_FLAGS.switchLR;
  if (s.itemSwitchLRLimit) flags |= FEATURE_FLAGS.switchLRLimit;
  if (s.inventoryReorder) flags |= FEATURE_FLAGS.inventoryReorder;
  if (s.secondaryItemSlots) flags |= FEATURE_FLAGS.secondaryItemSlots;
  if (s.turnWhileDashing) flags |= FEATURE_FLAGS.turnWhileDashing;
  if (s.mirrorToDarkworld) flags |= FEATURE_FLAGS.mirrorToDarkworld;
  if (s.collectItemsWithSword) flags |= FEATURE_FLAGS.collectItemsWithSword;
  if (s.breakPotsWithSword) flags |= FEATURE_FLAGS.breakPotsWithSword;
  if (s.disableLowHealthBeep) flags |= FEATURE_FLAGS.disableLowHealthBeep;
  if (s.skipIntroOnKeypress) flags |= FEATURE_FLAGS.skipIntroOnKeypress;
  if (s.showMaxItemsInYellow) flags |= FEATURE_FLAGS.showMaxItemsInYellow;
  if (s.moreActiveBombs) flags |= FEATURE_FLAGS.moreActiveBombs;
  if (s.carryMoreRupees) flags |= FEATURE_FLAGS.carryMoreRupees;
  if (s.miscBugFixes) flags |= FEATURE_FLAGS.miscBugFixes;
  if (s.gameChangingBugFixes) flags |= FEATURE_FLAGS.gameChangingBugFixes;
  if (s.cancelBirdTravel) flags |= FEATURE_FLAGS.cancelBirdTravel;
  if (s.dimFlashes) flags |= FEATURE_FLAGS.dimFlashes;
  if (s.disableTelepathy) flags |= FEATURE_FLAGS.disableTelepathy;
  // Per-group volume is an explicit opt-in. Off ⇒ the DSP mix stays bit-exact to the original and the
  // Music/SFX sliders are inert; the user must enable it before those sliders take effect.
  if (s.perGroupVolume) flags |= FEATURE_FLAGS.perGroupVolume;
  if (s.haptics?.enabled) flags |= FEATURE_FLAGS.haptics;
  return flags;
};

// The 42 split bug-fix toggles live in two extra bitmask words (features1/features2). Each fix is on when
// its granular toggle is set, falling back to the legacy bundle setting it was extracted from so existing
// profiles keep their behavior. Values come from the generated registry (must match features_bugfixes.h).
const buildFeatureWords = (s: GameSettings): { features1: number; features2: number } => {
  let f1 = 0;
  let f2 = 0;
  for (const fix of BUNDLE_FIXES) {
    const legacy =
      fix.bundleOrigin === 'GameChangingBugFixes'
        ? s.gameChangingBugFixes
        : fix.bundleOrigin === 'WidescreenVisualFixes'
          ? !!s.extendedRendering && s.aspectRatio !== '4:3' && s.widescreenVisualFixes
          : s.miscBugFixes;
    const on = s.bugFixToggles?.[fix.id] ?? legacy;
    if (!on || !fix.bit) continue;
    if (fix.word === 2) f2 |= fix.bit;
    else f1 |= fix.bit;
  }
  return { features1: f1, features2: f2 };
};

const buildPpuFlags = (s: GameSettings): number => {
  let flags = 0;
  if (s.newRenderer) flags |= PPU_FLAGS.newRenderer;
  if (s.enhancedMode7) flags |= PPU_FLAGS.mode7_4x4;
  // extend_y (240 lines) must track the INI serializer, which only emits it when extendedRendering is on.
  // The render-buffer height is baked at init from that INI value; setting the live Height240 flag without
  // it would make the draw loop's botBudget disagree with the allocated texture (ppu.c PpuSetExtraSideSpace).
  if (s.extendedRendering && s.extendY) flags |= PPU_FLAGS.height240;
  if (s.noSpriteLimits) flags |= PPU_FLAGS.noSpriteLimits;
  return flags;
};

export { buildFeatureFlags, buildPpuFlags, buildFeatureWords };
