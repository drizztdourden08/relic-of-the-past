/* @layer shared-hud @kind logic */
/**
 * Natural (unscaled) size of every HUD element, in SNES pixels.
 *
 * "Natural" means the size the element draws itself at before a placement's
 * scale is applied, measured off what the COMPOUND actually renders rather
 * than off the sprite that gives the element its name.
 *
 * The life block is HEARTS AND NOTHING ELSE. It used to carry nine px for the
 * console's LIFE caption, because `HudLife` drew one at every heart count;
 * the enhanced style does not use a caption, so `HudLife` now draws it only for
 * the callers that ask (the vanilla-styled top bar and the pause status panel),
 * and neither of those is placed from here. Nine px that no longer exist would
 * open a gap under the hearts exactly as reliably as nine px that were missing
 * closed one. The rule is the same either way: measure what the component
 * renders.
 *
 * ONE OF THEM IS NOT CONSTANT: the life block grows a row for every ten heart
 * containers, so it is a function of the save, not a table entry. The
 * engine asks for it through its `MeasureContext`.
 *
 * These are the DATA behind `shared/hud/engine/intrinsic-size.ts`, which is the
 * only caller. There is no `naturalSize(id)` any more - it answered a closed
 * union of five element ids, and an element is an open spec now.
 */

import type { Size } from './geometry.type';

const HEART_SIZE = 8;
const HEARTS_PER_ROW = 10;
const DEFAULT_HEARTS = 20;

/** Two rows of hearts - the block at the usual twenty containers, and the
 *  tallest the element ever gets. */
const LIFE_SIZE: Size = {
  w: HEART_SIZE * HEARTS_PER_ROW,
  h: HEART_SIZE * 2,
};

/**
 * The meter: 80x16, a 5:1 bar inside a 1px frame. It is exactly as wide as a
 * full heart row on purpose, so the two share an edge down the left of the
 * vitals column.
 *
 * This is the meter AT FULL, and it is deliberately NOT a function of the
 * magic the player is holding, even though the bar's own width is. A natural
 * size is the space an element reserves, and the reserve is taken at the
 * element's largest for exactly the reason the life block reserves two heart
 * rows: the offsets around it are fixed, so a size that shrank with the value
 * would make every element near it shuffle every time a spell was cast.
 * `HudMagicBar` draws a shorter bar inside this same 80x16 box.
 */
const MAGIC_FRAME = 1;
const MAGIC_SIZE: Size = { w: 80, h: 16 };
/**
 * Three icon+digits rows stacked: a 12px icon gutter, a 2px gap and two
 * digit tiles across, by three 8px rows down. The key row is reserved even
 * when the game hides the counter, so the block never changes height.
 */
const CONSUMABLES_SIZE: Size = { w: 30, h: 24 };

const WALLET_SIZE: Size = { w: 48, h: 16 };

/**
 * The countdown pie: 44x44, the pixel pie's own grid (`HudPixelPie`'s
 * `GRID_SIZE`), one cell per game pixel. The smooth pie draws a hair larger
 * (`countdownSize(1)`, about 44.4) with the same disc, so the renderer centres
 * it across this box and keeps its top edge, which puts both discs on the same
 * centre and the same bottom line. `tests/hud/hud-countdown-node.keep.test.ts`
 * pins the two numbers against each other, since `shared/` cannot import them.
 */
const COUNTDOWN_SIZE: Size = { w: 44, h: 44 };

/**
 * What life, magic and consumables occupy together, once stacked at the shipped
 * offsets, lives in `vitals-reserve.ts` - DERIVED from those offsets and these
 * sizes, not written down beside them. A second hand-kept copy of that
 * block is what the pause menu's tab strip was positioned against, and it is
 * why the strip stayed at the old block's bottom edge when the block grew.
 */

/** The life block at a given container count - one row of hearts per ten. */
const lifeSize = (hearts: number): Size => ({
  w: LIFE_SIZE.w,
  h: Math.max(1, Math.ceil(hearts / HEARTS_PER_ROW)) * HEART_SIZE,
});

export {
  CONSUMABLES_SIZE,
  COUNTDOWN_SIZE,
  DEFAULT_HEARTS,
  HEARTS_PER_ROW,
  HEART_SIZE,
  LIFE_SIZE,
  MAGIC_FRAME,
  MAGIC_SIZE,
  WALLET_SIZE,
  lifeSize,
};
