/* @layer bridge-wasm @kind logic */
/** Bitflag builders for live WASM settings — values must match features.h / ppu.h. */
import type { GameSettings } from '@shared/types/settings';

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
  if (s.aspectRatio !== '4:3' && !s.unchangedSprites) flags |= FEATURE_FLAGS.extendScreen64;
  if (s.aspectRatio !== '4:3' && !s.noVisualFixes) flags |= FEATURE_FLAGS.widescreenVisualFixes;
  if (s.itemSwitchLR) flags |= FEATURE_FLAGS.switchLR;
  if (s.itemSwitchLRLimit) flags |= FEATURE_FLAGS.switchLRLimit;
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
  if (s.cameraLockToViewport) flags |= FEATURE_FLAGS.cameraLockToViewport;
  return flags;
};

const buildPpuFlags = (s: GameSettings): number => {
  let flags = 0;
  if (s.newRenderer) flags |= PPU_FLAGS.newRenderer;
  if (s.enhancedMode7) flags |= PPU_FLAGS.mode7_4x4;
  if (s.extendY) flags |= PPU_FLAGS.height240;
  if (s.noSpriteLimits) flags |= PPU_FLAGS.noSpriteLimits;
  return flags;
};

export { buildFeatureFlags, buildPpuFlags };
