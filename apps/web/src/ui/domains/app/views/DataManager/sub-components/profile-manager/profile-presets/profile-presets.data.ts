/* @layer renderer-components @kind data */
import type { GameSettings } from '@shared/types/settings';

const VANILLA_CONFIG_OVERRIDES: Partial<GameSettings> = {
  aspectRatio: '4:3',
  vanillaSafe: true,
};

const ENHANCED_CONFIG_OVERRIDES: Partial<GameSettings> = {
  autoSaveEnabled: true,
  displayPerfInTitle: true,
  vsync: true,
  syncedRefreshRate: true,
  extendedRendering: true,
  linearWorldTilemap: true,
  ultrawideRendering: true,
  tallRendering: true,
  cameraLockToViewport: true,
  smoothTransitions: true,
  widescreenPlayArea: true,
  pixelPerfect: true,
  turnWhileDashing: true,
  collectItemsWithSword: true,
  breakPotsWithSword: true,
  skipIntroOnKeypress: true,
  showMaxItemsInYellow: true,
  moreActiveBombs: true,
  carryMoreRupees: true,
  miscBugFixes: true,
  gameChangingBugFixes: true,
  itemSheen: true,
  archeryNeedsBow: true,
  prefillFileName: true,
  hudMode: 'enhanced',
  hudHeartMode: 'smooth',
  hudMagicMode: 'accurate',
  saveHoldDuration: 1,
  cheatsEnabled: true,
};

export { ENHANCED_CONFIG_OVERRIDES, VANILLA_CONFIG_OVERRIDES };
