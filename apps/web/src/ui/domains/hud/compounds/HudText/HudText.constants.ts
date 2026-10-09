/* @layer renderer-hud @kind constants */
import type { HudFontFamily, HudTextStroke } from '@shared/types/hud';

const FONT_VARS: Record<HudFontFamily, string> = {
  game: 'var(--font-game)', sans: 'var(--font-sans)', mono: 'var(--font-mono)',
};

const DEFAULT_GAME_STROKE: HudTextStroke = { width: 1, color: 'var(--game-stroke)' };

export { DEFAULT_GAME_STROKE, FONT_VARS };
