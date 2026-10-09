/* @layer renderer-components @kind logic */
import { glyphIndexOf, widthOf } from '@rotp/languages';
import type { GlyphMetrics } from '@rotp/languages';
import type { CharCell } from './char-cells.type';

const charCells = (text: string, metrics: GlyphMetrics | null): CharCell[] => {
  const cells: CharCell[] = [];
  let at = 0;

  while (at < text.length) {
    const match = metrics === null ? null : glyphIndexOf(text, at, metrics);
    if (match === null || metrics === null) {
      cells.push({ at, length: 1, widthPx: null });
      at += 1;
      continue;
    }
    cells.push({ at, length: match.length, widthPx: widthOf(match.index, metrics) });
    at += match.length;
  }

  return cells;
};

export { charCells };
