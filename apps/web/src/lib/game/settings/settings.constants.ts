/* @layer bridge-wasm @kind constants */
const SIXTEEN_NINE = 16 / 9;
const REDUCED_RATIO_ROUNDING = 0.001;
const MIN_ENHANCED_ASPECT = SIXTEEN_NINE - REDUCED_RATIO_ROUNDING;

const LEGACY_ENHANCED = 'extended';

const REMOVED_SETTING_KEYS = [
  'itemSwitchLR',
  'itemSwitchLRLimit',
  'inventoryReorder',
  'secondaryItemSlots',
  'hudPauseStyle',
  'hudPauseHighlight',
  'controlScheme',
];

const LINK_GRAPHICS_LINE = 'LinkGraphics = /link_sprite.zspr\n';

export { MIN_ENHANCED_ASPECT, LEGACY_ENHANCED, REMOVED_SETTING_KEYS, LINK_GRAPHICS_LINE };
