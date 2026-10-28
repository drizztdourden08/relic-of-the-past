/* @layer renderer-app @kind constants */
const ASPECT_OPTIONS = [
  { value: '4:3', label: '4:3' },
  { value: '3:2', label: '3:2' },
  { value: '16:9', label: '16:9' },
  { value: '16:10', label: '16:10' },
  { value: 'custom', label: 'Custom' },
];

const TITLE_SETTING_KEYS = new Set(['titleScreen', 'titleMotion', 'titleFollowsProgress', 'titleSword']);

const MODERN_ONLY_KEYS = new Set(['dialogFontScale', 'dialogInkColor', 'dialogStrokeColor', 'dialogStrokeWidth']);

const ENHANCED_BOX_KEYS = new Set([
  'dialogBoxFit', 'dialogButtonPrompts', 'dialogFont', 'dialogFontScale', 'dialogInkColor', 'dialogStrokeColor', 'dialogStrokeWidth',
  'dialogBorder', 'dialogBorderThickness', 'dialogBorderColor', 'dialogCorner', 'dialogCornerMark', 'dialogCornerMarkAngle',
  'dialogGroundColor', 'dialogBoxOpacity', 'dialogGroundFade', 'dialogFloatingGround', 'dialogIntroTelepathyGround',
  'dialogTexture', 'dialogTextureColor', 'dialogTextureOpacity', 'dialogTextureAnimation', 'dialogTextureSpeed',
  'dialogTextureScale', 'dialogTextureDensity', 'dialogTextureScatter',
]);

const DIALOG_TEXTURE_SCALES = [0.5, 0.75, 1, 1.5, 2] as const;

const COLOR_KEYS = [
  'dialogBorderColor', 'dialogInkColor', 'dialogStrokeColor', 'dialogGroundColor', 'dialogTextureColor', 'hudHighlightPrimary', 'hudHighlightSecondary',
] as const;

export {
  ASPECT_OPTIONS, COLOR_KEYS, DIALOG_TEXTURE_SCALES, ENHANCED_BOX_KEYS, MODERN_ONLY_KEYS, TITLE_SETTING_KEYS,
};
