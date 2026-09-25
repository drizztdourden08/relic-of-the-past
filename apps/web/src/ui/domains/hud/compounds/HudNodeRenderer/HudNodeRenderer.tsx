/* @layer renderer-hud @kind component */
/**
 * HudNodeRenderer draws a solved layout.
 *
 * It computes NO geometry. Every rectangle arrives from the engine
 * (`layoutHud`) already absolute in SNES pixels, already
 * carrying the scale its own subtree was laid out at and the opacity and dim
 * state it inherited. This component multiplies by the display scale, subtracts
 * the origin it was pinned to, and hands each element to the compound that owns
 * its art. That split is the point of the whole engine: the arrangement is a
 * pure function nothing renders, and the drawing knows nothing about layout.
 *
 * CONTAINERS DRAW NOTHING. They are in the list because the editor selects and
 * drags them, and skipping them here costs one comparison. Their order is kept
 * as the engine emitted it (parents before children, siblings in document
 * order), which is the paint order the document chose, so an item that is meant
 * to sit over the disc beside it still does.
 *
 * ABSOLUTE, ALWAYS. Every node is positioned against this component's own box
 * and never flowed, because the flow already happened. Mount it inside a
 * `position: relative` (or absolutely-filled) parent.
 *
 * IT IS INERT UNLESS ASKED. Without `onSlotPress` nothing here takes a pointer
 * event, which is what lets the gameplay HUD sit over the play field. With it,
 * every node that names a slot becomes that slot's own click target. It is the
 * control that is drawn, not a separate overlay measured against it, which is
 * how the pause menu's targets used to drift from the cluster they covered.
 */
import { HudBox } from '../../primitives/HudBox';
import { HudNodeArt } from './sub-components/HudNodeArt';
import { useHudNodeMotion } from './sub-components/HudNodeMotion';
import { resolveNodeStyle } from './sub-components/HudNodeStyle';
import type { HudNodeRendererProps } from './HudNodeRenderer.type';
import type { HudNode } from '@shared/types/hud';
import type { SlotIndex } from '@shared/types/controls/scheme';

const ORIGIN = { x: 0, y: 0 };
const EMPTY_SCOPE: Readonly<Record<string, number>> = {};

/** The slot this node speaks for, if it is a glyph that draws a slot's
 *  control or the item that slot holds. Both mean the same button. */
const slotOf = (node: HudNode): SlotIndex | null => {
  if (node.kind !== 'element') return null;
  const spec = node.element;
  if (spec.type === 'slot') return spec.index;
  if (spec.type === 'glyph' && spec.slot !== undefined) return spec.slot;
  return null;
};

const HudNodeRenderer = (props: HudNodeRendererProps) => {
  const {
    nodes, scale, content, spritesBase, origin = ORIGIN, onSlotPress, dataScope = EMPTY_SCOPE, clockOverrideMs,
  } = props;
  // Animation's own clock, a transition's CSS string, and any still-fading
  // exit ghost - one hook, so a document with none of the three (every
  // shipped built-in, today) costs nothing beyond one boolean check.
  const motion = useHudNodeMotion(nodes, dataScope, scale, clockOverrideMs);

  return (
    <>
      {motion.renderNodes.map((placed) => {
        if (placed.node.kind !== 'element') return null;
        const slot = slotOf(placed.node);
        const press = slot !== null && onSlotPress ? () => onSlotPress(slot) : undefined;

        return (
          <HudBox
            key={placed.id}
            onClick={press}
            style={{
              position: 'absolute',
              left: (placed.rect.x - origin.x) * scale,
              top: (placed.rect.y - origin.y) * scale,
              opacity: motion.opacityFor(placed),
              ...resolveNodeStyle(placed.node.style, dataScope),
              ...motion.styleFor(placed),
              ...(press ? { pointerEvents: 'auto' as const, cursor: 'pointer' } : {}),
            }}
          >
            <HudNodeArt placed={placed} scale={scale} content={content} spritesBase={spritesBase} dataScope={dataScope} />
          </HudBox>
        );
      })}
    </>
  );
};

export { HudNodeRenderer };
