/* @layer renderer-components @kind constants */
const HUD_MODE_OPTIONS = [
  { value: 'original', label: 'Original' },
  { value: 'enhanced', label: 'Enhanced' },
];

const ASPECT_OPTIONS = [
  { value: '4:3', label: '4:3' },
  { value: '3:2', label: '3:2' },
  { value: '16:9', label: '16:9' },
  { value: '16:10', label: '16:10' },
  { value: 'custom', label: 'Custom' },
];

const HEART_OPTIONS = [
  { value: 'original', label: 'Original' },
  { value: 'smooth', label: 'Smooth' },
];

const MAGIC_OPTIONS = [
  { value: 'original', label: 'Original' },
  { value: 'accurate', label: 'Accurate' },
];

const COUNT_LAYOUT_OPTIONS = [
  { value: 'centered', label: 'Centered' },
  { value: 'original', label: 'Original' },
];

const COUNTDOWN_STYLE_OPTIONS = [
  { value: 'pixel', label: 'Pixel' },
  { value: 'smooth', label: 'Smooth' },
];

const ENHANCED_PARTS_OPTIONS = [
  { value: 'main', label: 'Main' },
  { value: 'pause', label: 'Pause' },
];

const SCREEN_OPTIONS = [
  { value: 'original', label: 'Original' },
  { value: 'reimagined', label: 'Reimagined' },
];

const MOTION_OPTIONS = [
  { value: 'still', label: 'Still' },
  { value: 'drifting', label: 'Drifting' },
];

const TITLE_SETTING_KEYS = new Set(['titleScreen', 'titleMotion', 'titleFollowsProgress', 'titleSword']);

const BOX_OPTIONS = [
  { value: 'original', label: 'Original' },
  { value: 'enhanced', label: 'Enhanced' },
];

const FONT_OPTIONS = [
  { value: 'original', label: 'Original' },
  { value: 'modern', label: 'Modern' },
];

const FIT_OPTIONS = [
  { value: 'full', label: 'Full' },
  { value: 'message', label: 'Message' },
  { value: 'fit', label: 'Fit' },
];

const MODERN_ONLY_KEYS = new Set(['dialogFontScale', 'dialogInkColor', 'dialogStrokeColor', 'dialogStrokeWidth']);

const EITHER_BOX_KEYS = new Set(['dialogBox', 'hudHighlightPrimary', 'hudHighlightSecondary']);

const BORDER_OPTIONS = [
  { value: 'original', label: 'Original' },
  { value: 'none', label: 'None' },
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
];

const THICKNESS_OPTIONS = [
  { value: 'thin', label: 'Thin' },
  { value: 'medium', label: 'Medium' },
  { value: 'thick', label: 'Thick' },
];

const CORNER_OPTIONS = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'chamfered', label: 'Chamfered' },
];

const MARK_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
  { value: 'triforce', label: 'Triforce' },
];

const DIALOG_TEXTURE_SCALES = [0.5, 0.75, 1, 1.5, 2] as const;

const TEXTURE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'triforce-outline', label: 'Triforce' },
  { value: 'triforce-filled', label: 'Triforce Filled' },
  { value: 'hex', label: 'Hex' },
  { value: 'scanlines', label: 'Scanlines' },
  { value: 'stripes', label: 'Stripes' },
];

const ANIMATION_OPTIONS = [
  { value: 'none', label: 'Still' },
  { value: 'scroll', label: 'Scroll' },
  { value: 'drift', label: 'Drift' },
  { value: 'twinkle', label: 'Twinkle' },
  { value: 'pulse', label: 'Pulse' },
];

const SPEED_OPTIONS = [
  { value: 'slow', label: 'Slow' },
  { value: 'normal', label: 'Normal' },
  { value: 'fast', label: 'Fast' },
];

export {
  ANIMATION_OPTIONS, ASPECT_OPTIONS, BORDER_OPTIONS, BOX_OPTIONS, CORNER_OPTIONS,
  COUNT_LAYOUT_OPTIONS, COUNTDOWN_STYLE_OPTIONS, DIALOG_TEXTURE_SCALES, EITHER_BOX_KEYS,
  ENHANCED_PARTS_OPTIONS, FIT_OPTIONS, FONT_OPTIONS, HEART_OPTIONS, HUD_MODE_OPTIONS,
  MAGIC_OPTIONS, MARK_OPTIONS, MODERN_ONLY_KEYS, MOTION_OPTIONS, SCREEN_OPTIONS,
  SPEED_OPTIONS, TEXTURE_OPTIONS, THICKNESS_OPTIONS, TITLE_SETTING_KEYS,
};
