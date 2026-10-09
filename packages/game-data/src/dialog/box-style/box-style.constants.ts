/* @layer shared-game @kind constants */
const DIALOG_BORDERS = ['original', 'none', 'single', 'double'] as const;
const DIALOG_BORDER_THICKNESSES = ['thin', 'medium', 'thick'] as const;
const DIALOG_CORNERS = ['square', 'rounded', 'chamfered'] as const;
const DIALOG_CORNER_MARKS = ['none', 'circle', 'square', 'triforce'] as const;
const DIALOG_TEXTURES = ['none', 'triforce-outline', 'triforce-filled', 'hex', 'scanlines', 'stripes'] as const;
const DIALOG_TEXTURE_ANIMATIONS = ['none', 'scroll', 'drift', 'twinkle', 'pulse'] as const;
const DIALOG_TEXTURE_SPEEDS = ['slow', 'normal', 'fast'] as const;

export {
  DIALOG_BORDERS, DIALOG_BORDER_THICKNESSES, DIALOG_CORNERS, DIALOG_CORNER_MARKS,
  DIALOG_TEXTURES, DIALOG_TEXTURE_ANIMATIONS, DIALOG_TEXTURE_SPEEDS,
};
