/* @layer shared-hud @kind logic */
import { GAME_FONT_DESIGN_SIZE } from './resolve-text.constants';

const snapGameFontSize = (size: number): number => (
  Math.max(GAME_FONT_DESIGN_SIZE, Math.round(size / GAME_FONT_DESIGN_SIZE) * GAME_FONT_DESIGN_SIZE)
);

export { snapGameFontSize };
