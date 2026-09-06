/* @layer renderer-components @kind logic */
/**
 * A run of typed text, cut into the CELLS the game would draw it in.
 *
 * The face the editor types in is one fixed cell per character; the game's own
 * font advances 1 to 8 pixels per glyph from a table in the pack. So a line
 * typed here reads about a third longer than it will be on screen, and the row's
 * edge rule stops meaning anything, since that rule is drawn at the row's real
 * interior width. Each character has to be billed its own advance instead.
 *
 * This is the same walk the read-only card does, with one difference that
 * matters: it reports OFFSETS, not substrings, because the caller styles
 * ranges of a live document instead of building elements of its own.
 *
 * Matching is greedy longest-first, exactly as the encoder and the row
 * measurement do it, so a multi-character alphabet entry is ONE cell with ONE
 * advance and not several. A bracketed picture name and the ellipsis run are
 * both such entries.
 */
import { glyphIndexOf, widthOf } from '@shared/game/language';
import type { GlyphMetrics } from '@shared/game/language';

/** One character of a run, as a range of it and the pixels it advances. */
type CharCell = {
  /** Offset into the run where this cell starts. */
  at: number;
  /** Characters the cell covers. More than one for a multi-character entry. */
  length: number;
  /** Advance in game pixels, or null when this language cannot draw it. */
  widthPx: number | null;
};

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
export type { CharCell };
