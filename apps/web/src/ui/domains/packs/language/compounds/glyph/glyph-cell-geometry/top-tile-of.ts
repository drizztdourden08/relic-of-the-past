/* @layer renderer-components @kind logic */
import { TILES_PER_CHAR_ROW } from '../glyph.constants';

const topTileOf = (glyph: number): number =>
  (glyph >> 4) * TILES_PER_CHAR_ROW + (glyph & 15);

export { topTileOf };
