/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { drawOrigin } from './behavior/draw-origin';
import { HudNodeArt } from './sub-components/HudNodeArt';
import { useHudNodeMotion } from './behavior/useHudNodeMotion';
import { resolveNodeStyle } from './behavior/resolve-node-style';
import { EMPTY_SCOPE, ORIGIN } from './HudNodeRenderer.constants';
import type { HudNodeRendererProps } from './HudNodeRenderer.type';
import type { HudNode } from '@rotp/hud';
import type { SlotIndex } from '@rotp/game-data';

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
  const motion = useHudNodeMotion(nodes, dataScope, scale, clockOverrideMs);

  return (
    <>
      {motion.renderNodes.map((placed) => {
        if (placed.node.kind !== 'element') return null;
        const slot = slotOf(placed.node);
        const press = slot !== null && onSlotPress ? () => onSlotPress(slot) : undefined;
        const at = drawOrigin(placed);

        return (
          <HudBox
            key={placed.id}
            onClick={press}
            style={{
              position: 'absolute',
              left: (at.x - origin.x) * scale,
              top: (at.y - origin.y) * scale,
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
