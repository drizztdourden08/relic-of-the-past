/* @layer renderer-hud @kind component */
/**
 * One row in the app's dialogue font. Every glyph sits at the pen x the engine gave it, in its own
 * width, so the modern face keeps the game's layout and only the letterforms change. Picture glyphs
 * have no face in the font and come from the glyph atlas instead.
 */
import type { CSSProperties } from 'react';
import type { DialogCell } from '@shared/game/dialog/dialog-frame.types';
import { isPictureGlyph } from '@shared/game/dialog/picture-glyph';
import { GlyphRow } from '../GlyphRow';

const CELL_H = 16;

interface ModernRowProps {
  cells: DialogCell[];
  alphabet: readonly string[];
  atlas: HTMLCanvasElement | null;
  /** CSS pixels per game pixel, magnification included. */
  unit: number;
  ink: string;
  stroke: string;
  /** Outline thickness in game pixels; 0 draws none. */
  strokeWidth: number;
}

const textStyle = (unit: number, ink: string, stroke: string, strokeWidth: number): CSSProperties => {
  // The face is drawn for a 16px em box; the edge is the chosen thickness in game pixels, at least one screen pixel.
  const edge = strokeWidth > 0 ? Math.max(1, Math.round(strokeWidth * unit)) : 0;
  return {
    position: 'absolute',
    top: 0,
    height: CELL_H * unit,
    fontFamily: 'var(--font-game)',
    fontSize: CELL_H * unit,
    lineHeight: `${CELL_H * unit}px`,
    color: ink,
    WebkitTextStroke: edge > 0 ? `${edge}px ${stroke}` : undefined,
    paintOrder: 'stroke fill',
    textShadow: edge > 0 ? `${edge}px 0 0 ${stroke}, -${edge}px 0 0 ${stroke}, 0 ${edge}px 0 ${stroke}, 0 -${edge}px 0 ${stroke}` : undefined,
    WebkitFontSmoothing: 'none',
    whiteSpace: 'pre',
    letterSpacing: 0,
  };
};

const ModernRow = (props: ModernRowProps) => {
  const { cells, alphabet, atlas, unit, ink, stroke, strokeWidth } = props;
  const base = textStyle(unit, ink, stroke, strokeWidth);
  return (
    <>
      {cells.map((cell, index) => {
        const entry = alphabet[cell.glyph] ?? '';
        const key = `${index}-${cell.x}`;
        if (isPictureGlyph(entry) && atlas) {
          const single = [{ ...cell, x: 0 }];
          return (
            <span key={key} style={{ position: 'absolute', top: 0, left: cell.x * unit }}>
              <GlyphRow cells={single} atlas={atlas} unit={unit} widthPx={cell.w} />
            </span>
          );
        }
        return (
          <span key={key} style={{ ...base, left: cell.x * unit, width: cell.w * unit }}>{entry}</span>
        );
      })}
    </>
  );
};

export { ModernRow };
export type { ModernRowProps };
