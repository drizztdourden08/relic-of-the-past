/* @layer renderer-hud @kind logic */
import { GLYPH_SIZE } from '../PauseText.constants';
import { columnsOf } from './columns-of';

const pauseTextWidth = (text: string, size: number = GLYPH_SIZE): number =>
  text.split('').reduce((cols, char) => cols + columnsOf(char), 0) * size;

export { pauseTextWidth };
