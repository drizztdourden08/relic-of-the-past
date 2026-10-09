/* @layer renderer-app @kind constants */
const REQUIRES_LINEAR = new Set(['21:9']);
const REQUIRES_ULTRAWIDE = new Set(['32:9']);
const TALL_PRESET_VALUES = new Set(['4:5', '3:4']);

const TALL_PRESETS = [
  { value: '4:5', label: '4:5' },
  { value: '3:4', label: '3:4' },
];

const ASPECT_DESCRIPTIONS: Record<string, string> = {
  auto: 'Matches the window size, adapting to notch, resize and rotation automatically.',
  screen: 'Matches the full physical screen ratio.',
  wide: 'Choose a standard widescreen preset.',
  tall: 'Choose a tall (portrait-style) preset.',
  custom: 'Set an exact width : height ratio.',
};

const CASCADE_KEYS = new Set(['linearWorldTilemap', 'ultrawideRendering', 'tallRendering']);

export { ASPECT_DESCRIPTIONS, CASCADE_KEYS, REQUIRES_LINEAR, REQUIRES_ULTRAWIDE, TALL_PRESETS, TALL_PRESET_VALUES };
