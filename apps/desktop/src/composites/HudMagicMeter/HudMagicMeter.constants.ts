/* @layer renderer-hud @kind constants */
const MAGIC_GREEN = '#00d800';
const MAGIC_WHITE = '#f8f8f8';

const MAGIC_CAP_SPRITES = {
  top: ['hud-magic-tl', 'hud-magic-top', 'hud-magic-tr'],
  bottom: ['hud-magic-bl', 'hud-magic-bottom', 'hud-magic-br'],
} as const;

export { MAGIC_CAP_SPRITES, MAGIC_GREEN, MAGIC_WHITE };
