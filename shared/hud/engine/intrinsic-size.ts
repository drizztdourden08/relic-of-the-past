/* @layer shared-hud @kind logic */
/**
 * The size an element draws itself at before anything above it has a say, and
 * the aspect ratio that size implies.
 *
 * Every number here is MEASURED off what the compound renders, never off the
 * sprite that gives the element its name - the rule `element-sizes.ts` already
 * carries for the four vitals, which this file reads instead of restating.
 *
 * A glyph and an item sprite are one tile pair each. That 16 is declared here
 * instead of imported from anything about the button map: it is the TILE the
 * whole game is drawn from, and the map is one caller of it, not its
 * owner. The computed cluster geometry that used to own it is gone.
 *
 * ASPECT IS NOT A SEPARATE FIELD. An intrinsic size already states it, and a
 * second declaration of the same fact is a second thing to keep in step - so
 * `aspectOf` derives it and nothing stores it.
 */

import { COUNTDOWN_SIZE, HEART_SIZE, MAGIC_SIZE } from '../layouts/element-sizes';
import { resolveTextContent, textIntrinsicSize } from './resolve-text';
import { SPRITE_BOX_BY_FILE } from '../../game/data/sprite-manifest/manifest';
import type { HudElementSpec } from '../../types/hud/hud-node';
import type { MeasureContext } from './engine.type';
import type { Size } from '../layouts/geometry.type';

/** One tile: a control glyph, an item sprite, a decorative sprite. */
const TILE = 16;
const TILE_SIZE: Size = { w: TILE, h: TILE };

/** A heart draws at 8x8 SNES px whatever its fill - see `HudHeart.constants.ts`
 *  (the same square the compound it replaces always drew at). */
const HEART_SHAPE_SIZE: Size = { w: HEART_SIZE, h: HEART_SIZE };

/** A spacer has no art of its own; it is the size it is given and no more. */
const EMPTY_SIZE: Size = { w: 0, h: 0 };

const intrinsicSize = (spec: HudElementSpec, ctx: MeasureContext = {}): Size => {
  switch (spec.type) {
    case 'shape': return spec.shape === 'heart' ? { ...HEART_SHAPE_SIZE } : { ...MAGIC_SIZE };
    case 'sprite': {
      // An explicit `box` on the node is a stored document's own override -
      // kept working for anything that still sets one by hand. Absent, the
      // manifest's own declared box wins over the 16x16 fallback: real
      // numbers from the extraction recipe, not a shape a person had to
      // notice and type.
      const box = spec.box ?? SPRITE_BOX_BY_FILE[spec.file];
      return box ? { ...box } : { ...TILE_SIZE };
    }
    case 'glyph':
    case 'slot':
    case 'button': return { ...TILE_SIZE };
    case 'spacer': return { ...EMPTY_SIZE };
    // The full pie, whatever it reads: a countdown that is not running is not
    // measured at all, because it is not visible (`resolve-box.ts`).
    case 'countdown': return { ...COUNTDOWN_SIZE };
    case 'text': return textIntrinsicSize(resolveTextContent(spec, ctx.scope ?? {}), spec.face);
    // Unreachable once `expand.ts` has run - every real call path
    // (`layoutHud`) expands the tree before measuring, so
    // neither dynamic kind ever reaches this switch. Answered instead of
    // thrown so a caller that measures a raw, unexpanded document directly
    // still gets a number back, matching this file's own "nothing here
    // throws" rule.
    case 'repeat':
    case 'switch': return { ...EMPTY_SIZE };
  }
};

/**
 * Width over height. One is the honest answer for anything with no height to
 * divide by - a spacer - because a ratio of nothing is not a ratio.
 */
const aspectOf = (spec: HudElementSpec, ctx: MeasureContext = {}): number => {
  const size = intrinsicSize(spec, ctx);
  return size.h > 0 ? size.w / size.h : 1;
};

export { TILE, aspectOf, intrinsicSize };
