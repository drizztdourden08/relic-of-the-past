/* @layer renderer-components @kind logic */
/**
 * Splits a run of text into cells carrying each character's REAL advance.
 *
 * The face we draw with is monospaced; the game's is not — it advances 1 to 8
 * pixels per glyph from a table in the ROM. Printing the text as-is therefore
 * overstates every narrow letter, which is why a line can look like it runs past
 * the edge of the box while actually fitting inside it.
 *
 * Giving each character its own advance costs one element per character, which
 * is why it is done here, where the text is read rather than typed. Inside an
 * editable surface the same trick would put a box around every keystroke.
 */
import { glyphIndexOf, widthOf } from '@shared/game/language';
import type { GlyphMetrics } from '@shared/game/language';

/** One character, and the pixels it takes on the row. */
type TextCell = {
  ch: string;
  /** Advance in game pixels, or null when this language cannot draw it. */
  widthPx: number | null;
};

/**
 * Walks the string the way the encoder does — longest alphabet entry first, so
 * a multi-character entry is one cell with one advance, not several.
 */
const textCells = (text: string, metrics: GlyphMetrics | null): TextCell[] => {
  if (!metrics) return [...text].map((ch) => ({ ch, widthPx: null }));

  const cells: TextCell[] = [];
  let at = 0;
  while (at < text.length) {
    const match = glyphIndexOf(text, at, metrics);
    if (!match) {
      cells.push({ ch: text[at], widthPx: null });
      at += 1;
      continue;
    }
    cells.push({
      ch: text.slice(at, at + match.length),
      widthPx: widthOf(match.index, metrics),
    });
    at += match.length;
  }
  return cells;
};

export { textCells };
export type { TextCell };
