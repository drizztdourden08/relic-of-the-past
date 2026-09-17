/* @layer renderer-components @kind data */
/**
 * Config overrides the two creation-form presets seed a profile with, on top
 * of the app's own DEFAULT_SETTINGS. A preset only touches the profile's own
 * config; the randomizer is a separate choice on the same form and is never
 * part of either preset.
 *
 * Vanilla only pins the two fields default itself does not already give: a
 * 4:3 picture and Vanilla Safe, which forces every non-stock behavior off
 * regardless of what else is stored. Enhanced is every field a reference
 * profile diverges from default on: general/display quality-of-life, every
 * rendering companion, the HUD/world-item presentation features, and the full dialog setup.
 */
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
  hudPauseStyle: 'enhanced',
  saveHoldDuration: 1,
  cheatsEnabled: true,
  // Dialog: pacing, the enhanced box and its look.
  autoSkipDialog: false,
  disableTelepathy: false,
  dialogSpeed: 1,
  dialogHoldSpeed: 2,
  dialogHoldToAccelerate: true,
  dialogFillOnB: true,
  dialogTypewriter: true,
  dialogBox: 'enhanced',
  dialogButtonPrompts: true,
  dialogFont: 'modern',
  dialogFontScale: 1,
  dialogInkColor: '#ffffff',
  dialogStrokeColor: '#000000',
  dialogStrokeWidth: 1,
  dialogBoxOpacity: 0.5,
  dialogFloatingGround: true,
  dialogIntroTelepathyGround: false,
  dialogGroundFade: true,
  dialogBoxFit: 'full',
  dialogGroundColor: '#000000',
  dialogBorder: 'single',
  dialogBorderThickness: 'thin',
  dialogBorderColor: '#a6a6a6',
  dialogCorner: 'chamfered',
  dialogCornerMark: 'none',
  dialogCornerMarkAngle: 315,
  dialogTexture: 'triforce-filled',
  dialogTextureColor: '#ffeb00',
  dialogTextureOpacity: 0.25,
  dialogTextureAnimation: 'drift',
  dialogTextureSpeed: 'normal',
  dialogTextureScale: 0.75,
  dialogTextureDensity: 30,
  dialogTextureScatter: 100,
};

export { ENHANCED_CONFIG_OVERRIDES, VANILLA_CONFIG_OVERRIDES };
