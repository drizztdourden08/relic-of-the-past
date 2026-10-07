/* @layer shared-game @kind logic */
/**
 * Where the message box sits, in game pixels, from the BG3 word address the engine chose.
 *
 * The frame is 24 tiles wide and 8 tall (RenderText_DrawBorderRow writes 24 entries per row over
 * 8 rows). The text area starts one tile in and one tile down and spans 21 by 6 tiles: three glyph
 * rows of 16 px each, 168 px wide. The tilemap is 32 entries per row from word 0x6000, so 0x6125 is
 * column 5, row 9 (the top slot) and 0x6244 is column 4, row 18 (the bottom slot).
 */
import type { DialogCell } from './dialog-frame.types';

const BG3_TILEMAP_BASE = 0x6000;
const TILEMAP_COLS = 32;
const TILE_PX = 8;
const FRAME_COLS = 24;
const FRAME_ROWS = 8;
const TEXT_ROW_PX = 16;
const TEXT_ROWS = 3;
const SCREEN_W = 256;
const SCREEN_H = 224;
/** The glyph bitmaps leave more blank rows under their ink than above it; a pixel down evens the look. */
const INK_OPTICAL_OFFSET_Y = 1;

interface GameRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The box as the game draws it: frame and text origin, in game pixels. */
interface BoxLayout {
  frame: GameRect;
  /** Where the text block starts: centred in the frame, so a wide box holds its text in the middle. */
  textOrigin: { x: number; y: number };
  /** Width of the text block in game pixels at 1x, magnification excluded. */
  textWidth: number;
  /** Rows the layout shows; the frame is sized to them in fit and message mode. */
  visibleRows: number;
}

/** Full keeps the game's frame; message sizes it once to the whole message; fit follows the rows in use. */
type BoxSizeMode = 'full' | 'message' | 'fit';
/** How a layout is placed: the player's size mode, or the game's own frame and text origin. */
type BoxPlacement = BoxSizeMode | 'native';

const frameRectOf = (topleft: number): GameRect => {
  const index = topleft - BG3_TILEMAP_BASE;
  const col = index % TILEMAP_COLS;
  const row = Math.floor(index / TILEMAP_COLS);
  return { x: col * TILE_PX, y: row * TILE_PX, w: FRAME_COLS * TILE_PX, h: FRAME_ROWS * TILE_PX };
};

/** Right edge of the widest row, in text-area pixels at 1x. */
const rowsExtent = (rows: DialogCell[][]): number =>
  rows.reduce((widest, row) => row.reduce((edge, cell) => Math.max(edge, cell.x + cell.w), widest), 0);

/** Index of the last row holding a glyph, plus one; at least one row. */
const rowsInUse = (rows: DialogCell[][]): number => {
  let last = 0;
  rows.forEach((row, index) => { if (row.length > 0) last = index + 1; });
  return Math.max(1, last);
};

const clamp = (value: number, low: number, high: number): number => Math.min(Math.max(value, low), high);

interface LayoutOptions {
  mode: BoxPlacement;
  /** Text magnification: 1 draws the rows at the game's size. */
  fontScale: number;
  /** Game pixels between the frame's side edges and the text; the game's own box keeps one tile. */
  padX: number;
  /** Game pixels above and below the text. */
  padY: number;
  /** The whole message's extent, for message mode; 0 falls back to the rows in use. */
  messageWidth: number;
  messageRows: number;
}

/**
 * The content the frame wraps in game pixels at 1x: the widest row and the rows shown. Full and
 * message mode take the whole message's measure when the engine has one, so the block does not
 * grow, and the text does not creep, while the message types; fit mode follows the rows drawn.
 */
const contentOf = (rows: DialogCell[][], options: LayoutOptions): { width: number; rows: number } => {
  const { mode, messageWidth, messageRows } = options;
  const measured = messageWidth > 0 && messageRows > 0;
  if (mode === 'full') return { width: measured ? messageWidth : rowsExtent(rows), rows: measured ? messageRows : TEXT_ROWS };
  if (mode === 'message' && measured) return { width: messageWidth, rows: messageRows };
  return { width: rowsExtent(rows), rows: rowsInUse(rows) };
};

/**
 * The frame the host draws. Full mode keeps the vanilla frame and only grows when magnified text
 * would not fit. Message and fit mode shrink the frame to their content, centred on the vanilla
 * frame's centre both ways, so the box stays where the game placed it.
 */
const layoutBox = (topleft: number, rows: DialogCell[][], options: LayoutOptions): BoxLayout => {
  const { mode, fontScale, padX, padY } = options;
  const vanilla = frameRectOf(topleft);
  // A screen the game lays out around the text (a cursor beside each row) needs the text where it drew it.
  if (mode === 'native') {
    return { frame: vanilla, textOrigin: { x: vanilla.x + TILE_PX, y: vanilla.y + TILE_PX }, textWidth: 21 * TILE_PX, visibleRows: TEXT_ROWS };
  }
  const content = contentOf(rows, options);
  const contentW = Math.max(TILE_PX, content.width) * fontScale;
  const contentH = content.rows * TEXT_ROW_PX * fontScale;
  const shrink = mode !== 'full';
  const w = shrink ? contentW + 2 * padX : Math.max(vanilla.w, contentW + 2 * padX);
  const h = shrink ? contentH + 2 * padY : Math.max(vanilla.h, contentH + 2 * padY);
  const x = clamp(vanilla.x + (vanilla.w - w) / 2, 0, Math.max(0, SCREEN_W - w));
  const y = clamp(vanilla.y + (vanilla.h - h) / 2, 0, Math.max(0, SCREEN_H - h));
  // The block sits in the middle of the frame both ways; in a frame sized to it that is the pad.
  return {
    frame: { x, y, w, h },
    textOrigin: { x: x + Math.round((w - contentW) / 2), y: y + Math.round((h - contentH) / 2) + INK_OPTICAL_OFFSET_Y },
    textWidth: Math.max(TILE_PX, content.width),
    visibleRows: content.rows,
  };
};

export { frameRectOf, layoutBox, rowsExtent, rowsInUse, TEXT_ROW_PX, TEXT_ROWS, TILE_PX, SCREEN_W, SCREEN_H };
export type { BoxLayout, BoxPlacement, BoxSizeMode, GameRect, LayoutOptions };
