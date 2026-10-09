/* @layer renderer-hud @kind component */
import type { DialogCell } from '@rotp/game-data';
import { isPictureGlyph } from '@rotp/game-data';
import { GlyphRow } from '../GlyphRow';
import { typefaceTextStyle } from './behavior/typeface-text-style';
import type { TypefaceRowProps } from './TypefaceRow.type';

const inkOf = (cell: DialogCell, ink: string, highlightInks: readonly string[] | undefined): string =>
  (cell.highlight ? highlightInks?.[cell.highlight - 1] ?? ink : ink);

const TypefaceRow = (props: TypefaceRowProps) => {
  const { cells, alphabet, atlas, unit, ink, highlightInks, stroke, strokeWidth } = props;
  const base = typefaceTextStyle(unit, ink, stroke, strokeWidth);
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
          <span key={key} style={{ ...base, left: cell.x * unit, width: cell.w * unit, color: inkOf(cell, ink, highlightInks) }}>{entry}</span>
        );
      })}
    </>
  );
};

export { TypefaceRow };
