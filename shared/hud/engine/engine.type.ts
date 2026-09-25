/* @layer shared-hud @kind types */
/**
 * What the layout pass is given, and what it hands back.
 *
 * `MeasureContext` carries the facts only the runtime knows - how many heart
 * containers this save holds, which slots currently fire something - so the
 * engine stays pure and one function serves both the live HUD and the editor's
 * preview. Anything the engine has to ASK for belongs here; anything it can
 * work out belongs in the document.
 */

import type { HudNode } from '../../types/hud/hud-node';
import type { Rect } from '../layouts/geometry.type';

interface MeasureContext {
  /** Heart containers owned right now; the life block adds a row per ten.
   *  Absent means the full twenty - the size the layout reserves. */
  hearts?: number;
  /** Slot numbers that hold an assignment right now. A slot that is absent
   *  from this list still draws; it draws dimmed and empty. */
  filledSlots?: readonly number[];
  /**
   * The data scope every bound `Value` on a box resolves against
   * (`shared/hud/data/variables.ts::hudDataScope`). Absent is the same as an
   * empty table: a literal number still resolves (it never reads the scope at
   * all), and an expression that names a variable folds to its documented
   * default instead of throwing, so a caller with no live save can still
   * measure a document, it just cannot answer a bound expression.
   */
  scope?: Readonly<Record<string, number>>;
}

/**
 * One node, solved. Containers are emitted alongside leaves because the editor
 * selects and drags them, and a renderer that only wants ink can filter on
 * `node.kind`. Parents come before their children.
 */
interface PlacedNode {
  id: string;
  node: HudNode;
  /** Where it draws, in SNES px, absolute in the view. For an element this is
   *  the CONTAINED content box, so it always carries the intrinsic aspect. */
  rect: Rect;
  /** SNES px per intrinsic px for an element; the factor its own children are
   *  laid out at for a container. What a renderer multiplies its art by. */
  scale: number;
  /** The node's own opacity, multiplied by every ancestor's. */
  opacity: number;
  /** True when this node's `dimWhenEmpty` slots are all empty, or an ancestor's
   *  were - dimming is inherited the way opacity is. */
  dimmed: boolean;
}

export type { MeasureContext, PlacedNode };
