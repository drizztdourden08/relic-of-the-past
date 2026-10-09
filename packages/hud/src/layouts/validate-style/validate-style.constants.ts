/* @layer shared-hud @kind constants */
const BORDER_STYLES = ['solid', 'dashed', 'dotted'] as const;
const TINT_MODES = ['multiply', 'replace'] as const;
const REPEATS = ['none', 'repeat', 'repeat-x', 'repeat-y'] as const;
const IMAGE_SIZES = ['contain', 'cover', 'tile'] as const;
const GRADIENTS = ['linear', 'radial'] as const;
const BORDER_SIDES = ['top', 'right', 'bottom', 'left'] as const;
const SHADOW_KEYS = ['x', 'y', 'blur', 'spread', 'color', 'inset'] as const;
const STYLE_KEYS = ['background', 'border', 'radius', 'shadow', 'outline', 'tint', 'clip'] as const;

export {
  BORDER_SIDES, BORDER_STYLES, GRADIENTS, IMAGE_SIZES, REPEATS, SHADOW_KEYS, STYLE_KEYS, TINT_MODES,
};
