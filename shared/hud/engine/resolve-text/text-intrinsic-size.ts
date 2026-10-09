/* @layer shared-hud @kind logic */
import { columnsForSpriteChar } from './columns-for-sprite-char';
import { snapGameFontSize } from './snap-game-font-size';
import { FONT_ADVANCE_RATIO, FONT_LINE_HEIGHT_RATIO, SPRITE_GLYPH_SIZE } from './resolve-text.constants';
import type { HudTextFace } from '../../../types/hud/hud-text';
import type { Size } from '../../layouts/geometry.type';

const textIntrinsicSize = (text: string, face: HudTextFace): Size => {
  if (face.from === 'sprite') {
    const cols = (text || ' ').split('').reduce((sum, ch) => sum + columnsForSpriteChar(ch), 0);
    return { w: Math.max(1, cols) * SPRITE_GLYPH_SIZE, h: SPRITE_GLYPH_SIZE };
  }
  const size = face.family === 'game' ? snapGameFontSize(face.size) : face.size;
  const chars = Math.max(1, text.length);
  return { w: chars * size * FONT_ADVANCE_RATIO, h: size * FONT_LINE_HEIGHT_RATIO };
};

export { textIntrinsicSize };
