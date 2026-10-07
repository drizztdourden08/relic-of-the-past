/* @layer shared-types @kind types */
/**
 * The layout document: what a built-in JSON file holds, and what the editor
 * saves. There is deliberately nothing to tell those two apart but a flag.
 *
 * A layout is ONE TREE, hanging off the screen. It used to be two positioning
 * systems side by side - a `screen` container AND a `regions[]` array of nine
 * named anchors - and the anchors were a 3x3 grid wearing nine words:
 * `top-left` is cell (1,1) hugging start/start, `center` is (2,2), and
 * `bottom-right` is (3,3) hugging end/end. §42 folded them in: the screen is a
 * grid, a former region is an ordinary child with a `place`, and the whole
 * document is one tree the editor already knew how to walk.
 *
 * What that bought is the thing the anchors could never do. A region could only
 * ever be one of nine places; a child of a grid can be in any cell of any
 * template the author writes, can span, and can share a cell with its
 * neighbour. Moving the wallet is picking a cell.
 *
 * Anchoring still happens exactly once, at the screen, and everything below it
 * is in the flow - so a layout can never grow an absolute escape hatch halfway
 * down, and the numbers inside it are distances and relationships, not
 * screen coordinates. That is what lets one document read correctly at 16:9,
 * at 21:9 and in 240-line mode.
 */

import type { HudContainer } from './hud-node';

/**
 * THE SCREEN: the document's one root, and the only node whose size is not a
 * question.
 *
 * It is an ordinary `HudContainer` - the same base component as every other box
 * in the document, with the same background, border, radius, shadow, opacity,
 * padding and animation, AND the same choice of engine - held apart only
 * because its RECTANGLE is not authored. The screen is always exactly the view,
 * at every aspect and every resolution, so `size`, `min`, `max`, `margin`,
 * `scale` and the child-placement fields are refused on it
 * (`validate-layout.ts`). Locking that in the validator instead of in the type
 * is deliberate: a hand-edited file gets the same loud, named error every other
 * bad field gets, instead of a silently ignored key.
 *
 * ITS ENGINE, COLUMNS AND ROWS ARE THE AUTHOR'S (§42, reversing §38.4). The
 * lock on those existed only while the screen was a `stack` pretending not to
 * be a grid; a screen that IS a grid has a template worth editing, and the
 * default one - `[auto, fill, auto]` each way, the middle track eating the free
 * space so the outer bands hug the edges - is exactly the nine anchors.
 *
 * Its `padding` is the one inset every child sits inside, which is what makes a
 * safe-area margin one number in one place instead of nine margins that drift
 * apart.
 */
type HudScreenRoot = HudContainer;

/**
 * When the button map is on screen during play. It is a property of the whole
 * map, not of any node in it. "Show this only while something has just
 * changed" is a statement about a group of controls over time, which no single
 * box can make, so it sits on the document.
 */
type HudClusterReveal = 'always' | 'on-change' | 'never';

/**
 * TWO DISPLAY FIELDS OUTLIVED THE OLD `HudButtonsOptions`, and they are here
 * instead of on a node because neither is about one box. `shape`, `rowOrder`
 * and `spriteOffset` were cluster GEOMETRY and the tree authors that directly;
 * these two are not, and dropping them would have taken a shipped feature each
 * with them.
 */
interface HudLayout {
  id: string;
  name: string;
  builtIn: boolean;
  /** The layout this one was forked from, for the editor's "start from" list. */
  basedOn?: string;
  /**
   * Which pack every glyph in this layout draws from, or 'auto' to follow the
   * device family. Default 'auto'; a glyph element's own `pack` wins over it.
   *
   * It cannot live only on the nodes: the pause menu's nav legend draws glyphs
   * that belong to no node at all, and it has to draw them from the same pack
   * the button map beside it does.
   */
  glyphPack?: string;
  /** Default 'always'. */
  inGameplay?: HudClusterReveal;
  /** The whole document. Required: a layout with no screen has nowhere to
   *  draw, and `migrate-screen.ts` gives one to every document written before
   *  §42 - including the ones that only ever had `regions[]`. */
  screen: HudScreenRoot;
}

export type { HudClusterReveal, HudLayout, HudScreenRoot };
