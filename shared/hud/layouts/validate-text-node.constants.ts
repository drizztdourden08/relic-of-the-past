/* @layer shared-hud @kind constants */
const PAD = ['none', 'zero', 'space'] as const;
const ALIGN = ['start', 'center', 'end'] as const;
const SPRITE_SETS = ['hud-digits', 'pause-letters'] as const;
const FONT_FAMILIES = ['game', 'sans', 'mono'] as const;
const TEXT_KEYS = ['type', 'value', 'format', 'face', 'color', 'stroke', 'align', 'tracking'] as const;

export { ALIGN, FONT_FAMILIES, PAD, SPRITE_SETS, TEXT_KEYS };
