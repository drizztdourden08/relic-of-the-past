/* @layer renderer-components @kind constants */
import type { GameSettings } from '@shared/types/settings';

const HUD_STORE_KEYS: (keyof GameSettings)[] = [
  'hudMode', 'hudStyle', 'hudRatio', 'customHudAspectW', 'customHudAspectH', 'hudEnhancedParts',
  'hudHeartMode', 'hudMagicMode', 'hudCountLayout', 'hudCountdownStyle', 'vanillaSafe',
];

const CONTROL_STORE_KEYS: (keyof GameSettings)[] = [
  'modernScheme', 'mapOnSelect', 'vanillaSafe',
  'hudStyle', 'hudMode', 'hudEnhancedParts',
];

const ASPECT_KEYS: (keyof GameSettings)[] = ['hudStyle', 'aspectRatio', 'customAspectW', 'customAspectH', 'renderIntoNotch'];

const DIALOG_BOX_KEYS = [
  'dialogBox', 'dialogFont', 'dialogFontScale', 'dialogInkColor', 'dialogStrokeColor', 'dialogStrokeWidth',
  'hudHighlightPrimary', 'hudHighlightSecondary', 'dialogBoxOpacity', 'dialogFloatingGround', 'dialogIntroTelepathyGround', 'dialogGroundFade', 'dialogBoxFit', 'dialogGroundColor', 'dialogBorder', 'dialogBorderThickness', 'dialogBorderColor',
  'dialogCorner', 'dialogCornerMark', 'dialogCornerMarkAngle', 'dialogTexture', 'dialogTextureColor', 'dialogTextureOpacity',
  'dialogTextureAnimation', 'dialogTextureSpeed', 'dialogTextureScale', 'dialogTextureDensity', 'dialogTextureScatter',
  'dialogButtonPrompts', 'dialogSpeed', 'dialogHoldSpeed', 'dialogHoldToAccelerate', 'dialogFillOnB',
  'autoSkipDialog', 'vanillaSafe',
] as const;

const TITLE_KEYS = ['titleScreen', 'titleMotion', 'titleFollowsProgress', 'titleSword', 'dimFlashes', 'vanillaSafe'] as const;

const RESTART_TOAST_ID = 'restart-required';

export {
  ASPECT_KEYS, CONTROL_STORE_KEYS, DIALOG_BOX_KEYS,
  HUD_STORE_KEYS, RESTART_TOAST_ID, TITLE_KEYS,
};
