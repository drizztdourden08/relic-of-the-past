/* @layer renderer-hud @kind constants */
import type { HudFontFamily, HudTextAlign, HudTextStroke } from '@rotp/hud';

const FONT_VARS: Record<HudFontFamily, string> = {
  game: 'var(--font-game)', sans: 'var(--font-sans)', mono: 'var(--font-mono)',
};

const JUSTIFY_BY_ALIGN: Record<HudTextAlign, string> = {
  start: 'flex-start', center: 'center', end: 'flex-end',
};

const DEFAULT_GAME_STROKE: HudTextStroke = { width: 1, color: 'var(--game-stroke)' };

export { DEFAULT_GAME_STROKE, FONT_VARS, JUSTIFY_BY_ALIGN };
