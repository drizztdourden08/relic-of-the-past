/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { HudImage } from '../../primitives/HudImage';
import { GlyphRow } from '../../primitives/GlyphRow';
import { TypefaceRow } from '../../primitives/TypefaceRow';
import { ITEM_PICK_SIZE, ITEM_PICK_X, ITEM_PICK_Y, ROW_H } from './DialogRows.constants';
import type { DialogRowsProps } from './DialogRows.type';

const DialogRows = (props: DialogRowsProps) => {
  const { rows, unit, widthPx, visibleRows, scrollStep, font, atlas, highlight, alphabet, ink, stroke, strokeWidth, itemSprite } = props;
  const rowH = ROW_H * unit;
  const original = font === 'original' && atlas !== null;

  return (
    <HudBox style={{ position: 'absolute', overflow: 'hidden', width: widthPx * unit, height: visibleRows * rowH }}>
      <HudBox style={{ position: 'absolute', inset: 0, transform: `translateY(${-scrollStep * unit}px)` }}>
        {rows.map((cells, r) => (
          <HudBox key={r} style={{ position: 'absolute', top: r * rowH, left: 0, width: widthPx * unit, height: rowH }}>
            {original
              ? <GlyphRow cells={cells} atlas={atlas} highlightAtlases={highlight.atlases} unit={unit} widthPx={widthPx} />
              : <TypefaceRow cells={cells} alphabet={alphabet} atlas={atlas} unit={unit} ink={ink} highlightInks={highlight.inks} stroke={stroke} strokeWidth={strokeWidth} />}
          </HudBox>
        ))}
        {itemSprite && (
          <HudImage
            src={itemSprite}
            style={{ position: 'absolute', left: ITEM_PICK_X * unit, top: ITEM_PICK_Y * unit, width: ITEM_PICK_SIZE * unit, height: ITEM_PICK_SIZE * unit, imageRendering: 'pixelated' }}
          />
        )}
      </HudBox>
    </HudBox>
  );
};

export { DialogRows };
