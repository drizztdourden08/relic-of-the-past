/* @layer shared-types @kind types */
/**
 * The recursive HUD document model.
 *
 * One node type with two shapes. A CONTAINER has children and lays them out;
 * an ELEMENT draws one thing and has an intrinsic size. Both carry the same box
 * properties, so a container can be sized, moved and scaled exactly like a leaf
 * and the editor needs one inspector, not two.
 *
 * THE ASPECT RATIO IS LOAD-BEARING. An element is never stretched: `contain` is
 * the only fit there is, so a box larger than the content letterboxes it and a
 * smaller one scales it down. There is no code path in the engine that writes a
 * width and a height independently of one another.
 *
 * TWO WAYS TO CHANGE A SIZE, and they mean different things:
 *
 *  - `scale` multiplies a node's own coordinate system - its content, its
 *    padding, its gaps and everything below it - by one factor. It is how a
 *    whole subtree gets bigger or smaller (the compact preset is the baseline
 *    at 0.75), and it is what a ratio-locked resize handle writes.
 *  - `size` sets the BOX. For an element the content is contained inside that
 *    box; for a container the box is the field its children flow in, so spare
 *    main-axis space feeds `justify` and `fill` and spare cross-axis space
 *    feeds `align`. Children are never stretched to fill it, because there is
 *    no 'stretch' alignment to ask for in FLEX - a grid's `alignItems` is the
 *    one place 'stretch' is a real answer, because a grid cell is a real box
 *    with no content to letterbox against.
 *
 * BINDABLE BOXES (phase 2 of `plans/hud-data-binding.html`). `size`, `scale`,
 * `opacity`, either axis of a container's `gap` and `visible` all take a `Value` - typed
 * in, or read from the data scope through an expression
 * (`shared/hud/data/resolve-value.ts`). The engine resolves every one of them
 * BEFORE measuring (`shared/hud/engine/measure.ts` / `place.ts`), so a document
 * with no bound values measures exactly as it always has and a bound one is
 * just as real to the flow. `visible` keeps its boolean shorthand - the common
 * case - and gains the `Value` form beside it, resolved truthy when non-zero.
 *
 * Numbers are SNES pixels in the coordinate system of the node's PARENT, the
 * same unit the rest of the HUD layer speaks. The renderer multiplies by its
 * own display scale; nothing in this model knows about screen pixels.
 */

import type { SdlAxisName, SdlButtonName } from '../../input/sdl-buttons';
import type { HudButtonSpec } from './hud-button';
import type { HudAnimation, HudTransition } from './hud-motion';
import type { HudShapeSpec } from './hud-shape';
import type { HudBoxStyle } from './hud-style';
import type { HudTextSpec } from './hud-text';
import type { Value } from './hud-value';

/**
 * A length. `auto` = intrinsic, `fill` = take the remaining main-axis space
 * (or, in a grid, the remaining track space), `pct` is measured against the
 * parent's content box on the same axis. `px` and `pct` read from the data
 * scope like any other `Value`.
 *
 * A bare EXPRESSION is `px` shorthand - `{ from: 'data', expr: '...' }` alone
 * means the same as `{ px: { from: 'data', expr: '...' } }`, which is how the
 * plan's own worked examples write a bound size. A bare NUMBER is not offered
 * the same shorthand: `{ w: 40 }` stays refused (`validate-box.ts`'s own
 * test), because it is indistinguishable from the mistake of forgetting the
 * `px` wrapper entirely, and only an author who reached for the data picker -
 * never one who typed a plain number - produces this shape by hand.
 */
type Extent = { px: Value } | { pct: Value } | { from: 'data'; expr: string } | 'auto' | 'fill';

/** Any edge may be negative: that is how a sprite hangs OUTSIDE the box it
 *  belongs to, which is what the cluster's radial item offsets are. */
interface Edges { top?: number; right?: number; bottom?: number; left?: number }

/**
 * Which glyph an element draws.
 *
 * A pack is keyed by SDL position, and "the whole d-pad" is not a position -
 * no device reports one - so `DPAD` is a synthetic name for the one cross that
 * stands for all four directions. It resolves to the group artwork instead of
 * to a pack entry, exactly as `group-glyph-art.ts` does today.
 */
type HudGlyphPosition = SdlButtonName | SdlAxisName | 'DPAD';

/**
 * What an element draws.
 *
 * A glyph names EITHER a fixed `position` - a picture of one control, whatever
 * is bound to it - OR a `slot`, meaning "the glyph of whatever slot N is bound
 * to right now", which is the binding-first rule a chip already follows. Never
 * both: a layout that said both would be asking for two different pictures in
 * one box.
 */
/**
 * `repeat` draws its ONE child N times, handing each pass a scoped `index`
 * (0 to count-1), `count` (the repeat's own resolved count) and `item` - the
 * "number from the parent" every worked example reads, e.g. how full ONE
 * heart is. `item` is a bare expression, not a `Value` - it has no meaning
 * outside the child it is handed into, so there is no literal-number shape
 * for it to also accept. There is deliberately no second "repeat mode": a
 * repeat whose child is a `sprite` is what used to be called "repeat
 * sprite", and a repeat whose child is a `switch` is "repeat dynamic object".
 */
interface HudRepeatSpec { type: 'repeat'; count: Value; item?: string; child: HudNode }

/** One arm of a `switch` - first match wins, top to bottom; the ORDER is the
 *  logic, which is why this is an array and not a map. */
interface HudSwitchCase { when: string; node: HudNode }

/** `switch` draws whichever `node` is the first case whose `when` evaluates
 *  truthy (non-zero), or `otherwise` when none do, or nothing at all when
 *  neither exists. */
interface HudSwitchSpec { type: 'switch'; cases: HudSwitchCase[]; otherwise?: HudNode }

type HudElementSpec =
  | { type: 'glyph'; position?: HudGlyphPosition; slot?: number; pack?: string }
  | { type: 'slot'; index: number }
  /**
   * `box` is an EXPLICIT OVERRIDE of the sprite's natural size, SNES px - a
   * stored document's own escape hatch, not something an author is asked to
   * fill in. The real default lives in the sprite manifest itself
   * (`sprite-box.ts`'s `boxForExtract`, keyed by `file` in
   * `SPRITE_BOX_BY_FILE`), derived from the extraction recipe that cut the
   * asset - a strip-extracted HUD icon (the bomb/arrow counters) is 16x8, a
   * single-tile one (the key counter) is 8x8, and 16x16 is the fallback for
   * anything the manifest does not declare a box for. `intrinsic-size.ts`
   * reads `box ?? SPRITE_BOX_BY_FILE[file] ?? 16x16`, in that order.
   */
  | { type: 'sprite'; file: string; box?: { w: number; h: number } }
  | { type: 'spacer' }
  | HudTextSpec
  | HudButtonSpec
  | HudShapeSpec
  | HudRepeatSpec
  | HudSwitchSpec;

/** Where a GRID parent places this child. Meaningless under a flex parent, and
 *  ignored there - the field still round-trips so a node moved between a flex
 *  and a grid parent does not lose it. 1-based, matching how an author counts
 *  columns and rows. Absent = auto-placed, in document order.
 *
 *  TWO CHILDREN MAY NAME THE SAME CELL. That is how every overlay in this
 *  project is written (§42), so an explicit `place` is never refused for
 *  being taken; only AUTO-FLOW skips an occupied cell. Co-placed children
 *  paint in `order`, then document order - the sprite over the glyph. */
interface HudPlace { column?: number; row?: number; colSpan?: number; rowSpan?: number }

/** The per-item alignment every child may override its parent's default with -
 *  meaningful under both engines: a flex container's cross axis, or a grid's
 *  `alignItems`/`justifyItems`. `alignSelf` still speaks for BOTH grid axes
 *  when it is the only one set; `justifySelf` beside it overrides the inline
 *  one on its own, which is what a cell whose two bands disagree needs (§42 -
 *  the screen's top-centre band is `center` across and `start` down). */
type HudAlignSelf = 'start' | 'center' | 'end' | 'stretch';

interface HudBox {
  /** Stable, editor-assigned, unique within the document. */
  id: string;
  size?: { w?: Extent; h?: Extent };
  /** A floor and a ceiling on the RESOLVED size, on top of whatever `size`
   *  says - the fix for a `fill` child that would otherwise collapse to
   *  nothing, or grow without bound. Applies to every extent, however it was
   *  sized: fixed, `pct`, `auto` or `fill` alike. */
  min?: { w?: Value; h?: Value };
  max?: { w?: Value; h?: Value };
  margin?: Edges;
  padding?: Edges;
  /** Uniform multiplier over this node's own coordinate system. Default 1. */
  scale?: Value;
  /** 0.2 to 1, multiplied down the subtree. */
  opacity?: Value;
  /**
   * Default true. An invisible node leaves the flow entirely instead of
   * holding its place open - a hole where an element used to be is the defect
   * the flat model produced, not a feature to reproduce.
   *
   * The `Value` form resolves truthy when non-zero - "hide the arrow counter
   * while there are none" is `{ from: 'data', expr: 'arrow_current > 0' }`.
   */
  visible?: boolean | Value;
  /**
   * Draw dimmed while NONE of these slots holds an assignment.
   *
   * One number for a face button - it dims when its own button is free - and
   * all four for the d-pad's shared cross, which stands for four directions at
   * once and so has nothing to say per direction. The engine only resolves the
   * flag; what "dimmed" looks like is the renderer's.
   */
  dimWhenEmpty?: number[];
  /** This child's cell in a GRID parent. */
  place?: HudPlace;
  /** Paint-order tiebreak within the parent. Higher draws later (on top) and,
   *  for a grid's auto-flow, is visited later. Default 0. */
  order?: number;
  /** Overrides the parent's own item alignment for this one child - both grid
   *  axes at once, or a flex line's cross axis. */
  alignSelf?: HudAlignSelf;
  /** GRID ONLY: the INLINE axis on its own, winning over `alignSelf` there.
   *  Ignored under a flex parent, where the main axis is the container's to
   *  distribute (`justify`) and no child may opt out of it. */
  justifySelf?: HudAlignSelf;
  /** CSS-grade decoration: background, border, radius, shadow, outline, tint,
   *  clip. See `hud-style.ts`. */
  style?: HudBoxStyle;
  /** Self-clocked motion, gated per entry. See `hud-motion.ts`. */
  animation?: HudAnimation[];
  /** Eases THIS node's own bound properties when they change, plus its own
   *  enter/exit. See `hud-motion.ts`. */
  transition?: HudTransition;
}

/**
 * THE TWO GAPS EVERY CONTAINER HAS, and `x` is ALWAYS horizontal and `y`
 * ALWAYS vertical - whatever the engine, whatever the direction. CSS's own
 * `column-gap` / `row-gap`, and the reason the panel can label them `↔` `↕`
 * without asking which way a flex container happens to flow.
 *
 * A flex row separates its ITEMS by `x` and its WRAPPED LINES by `y`; a flex
 * column does the reverse. A grid separates its columns by `x` and its rows by
 * `y`. The flow engine always had two gaps - it just spent one number on both
 * (§57), which is why a flex `gap: n` migrates to `{ x: n, y: n }` and lays
 * out identically.
 */
interface HudGap { x?: Value; y?: Value }

/** A container's own overlay colour - EDITOR ONLY, never drawn by the game;
 *  lets the editor tell two nested containers' drawings apart. `show` is
 *  written so stored documents stay valid and is read by nothing (§55). */
interface HudGuide { show: boolean; color: string }

/** What is true of ANY container, whichever engine it picks: it holds
 *  children, it separates them on two axes, and the editor may draw it. */
interface HudContainerBase extends HudBox {
  kind: 'container';
  gap?: HudGap;
  guide?: HudGuide;
  children: HudNode[];
}

interface HudFlexBase extends HudContainerBase {
  /** Two, not three. An OVERLAY is a grid whose children share one cell
   *  (§42), which is what `direction: 'stack'` was pretending not to be. */
  direction: 'row' | 'column';
  /** Three POSITIONS and three DISTRIBUTIONS. `between` puts the free space
   *  only between the children, `around` gives each child an equal share with
   *  half of it at either end, and `evenly` makes every gap equal including
   *  the two at the ends. All three degrade to `start` on a line holding one
   *  child, because there is nothing to distribute between. */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** NO `stretch`. An element is never stretched under this engine (see the
   *  head of this file), so a cross-axis `stretch` would be a value that does
   *  nothing, because `place-flow.ts` reads a stray one as `start`. */
  align?: 'start' | 'center' | 'end';
  wrap?: boolean;
}

/** The flow engine that ships today. `layout` is optional and defaults to it,
 *  so no existing document needs the key at all. */
interface HudFlexContainer extends HudFlexBase {
  layout?: 'flex';
}

type HudGridJustifyItems = 'start' | 'center' | 'end' | 'stretch';

/** The second placement engine, beside flex: two axes, position-driven. */
interface HudGridContainer extends HudContainerBase {
  layout: 'grid';
  /** At least one track. Each may be `auto` (sized to its widest/tallest
   *  cell), `fill` (shares the remaining track space), `{ px }` or `{ pct }`. */
  columns: Extent[];
  /** Omitted = as many implicit rows as the auto-flow needs, each `auto`. */
  rows?: Extent[];
  justifyItems?: HudGridJustifyItems;
  alignItems?: HudGridJustifyItems;
}

type HudContainer = HudFlexContainer | HudGridContainer;

interface HudElement extends HudBox {
  kind: 'element';
  element: HudElementSpec;
  /** The only mode there is. Named so the JSON says it out loud. */
  fit?: 'contain';
}

type HudNode = HudContainer | HudElement;

export type {
  Edges, Extent, HudAlignSelf, HudBox, HudContainer, HudContainerBase, HudElement, HudElementSpec,
  HudFlexContainer, HudGap, HudGlyphPosition, HudGridContainer, HudGridJustifyItems, HudGuide, HudNode,
  HudPlace, HudRepeatSpec, HudSwitchCase, HudSwitchSpec,
};
