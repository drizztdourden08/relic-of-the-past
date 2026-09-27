/* @layer renderer-hud @kind component */
/**
 * The three text rows of a message box, in the game's glyphs or the modern face, clipped to the
 * rows in use and shifted up by the engine's own scroll progress so a [Scroll] animates the same
 * way the bitmap does. The item picker's chosen item is a HUD sprite the mirror cannot see, so it
 * is drawn here from the inventory at the spot the engine blits it to.
 */
import type { DialogCell } from '@shared/game/dialog/dialog-frame.types';
import { HudBox } from '../../primitives/HudBox';
import { HudImage } from '../../primitives/HudImage';
import { GlyphRow } from '../../primitives/GlyphRow';
import { ModernRow } from '../../primitives/ModernRow';

const ROW_H = 16;
/** Where RenderText_DrawSelectedYItem lands the 16x16 item in the text area, in game pixels. */
const ITEM_PICK_X = 104;
const ITEM_PICK_Y = 32;
const ITEM_PICK_SIZE = 16;

interface DialogRowsProps {
  rows: DialogCell[][];
  /** CSS pixels per game pixel, magnification included. */
  unit: number;
  /** Text-area width in game pixels. */
  widthPx: number;
  visibleRows: number;
  scrollStep: number;
  font: 'original' | 'modern';
  atlas: HTMLCanvasElement | null;
  /** The primary then the secondary highlight: an atlas each for the game's glyphs, an ink each for the modern face. */
  highlight: DialogHighlight;
  alphabet: readonly string[];
  ink: string;
  stroke: string;
  strokeWidth: number;
  /** Sprite URL of the item the picker has selected, when a message is picking one. */
  itemSprite: string | null;
}

interface DialogHighlight {
  atlases: readonly (HTMLCanvasElement | null)[];
  inks: readonly string[];
}

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
              ? <GlyphRow cells={cells} atlas={atlas as HTMLCanvasElement} highlightAtlases={highlight.atlases} unit={unit} widthPx={widthPx} />
              : <ModernRow cells={cells} alphabet={alphabet} atlas={atlas} unit={unit} ink={ink} highlightInks={highlight.inks} stroke={stroke} strokeWidth={strokeWidth} />}
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
export type { DialogHighlight, DialogRowsProps };
