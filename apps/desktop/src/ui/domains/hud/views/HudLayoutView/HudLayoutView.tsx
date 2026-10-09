/* @layer renderer-hud @kind component */
import { useMemo } from 'react';
import { hudDataScope } from '@shared/hud/data';
import { AUTO_PACK_ID } from '@shared/input/glyphs';
import { HudBox } from '../../primitives/HudBox';
import { HudNodeRenderer } from '../../compounds/HudNodeRenderer';
import { useHudLayoutStore } from '@app/stores/hud-layout-store';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { useClusterVisibility } from './behavior/useClusterVisibility';
import { useCountdownContent } from './behavior/useCountdownContent';
import { useHudViewport } from './behavior/useHudViewport';
import { usePlacedLayout } from './behavior/usePlacedLayout';
import { useSlotContent } from './behavior/useSlotContent';
import { useVitalsContent } from './behavior/useVitalsContent';
import { CLUSTER_FADE } from './HudLayoutView.constants';
import type { HudLayoutViewProps } from './HudLayoutView.type';

const HudLayoutView = (props: HudLayoutViewProps = {}) => {
  const { showAllChips = false, slideTransform, slideTransition } = props;

  const layout = useHudLayoutStore((s) => s.layout);
  const menuHolding = useGameUIStore((s) => s.hostMenu.holding && s.mode === 'paused_menu');
  const { containerRef, scale, view } = useHudViewport();

  const slots = useSlotContent(layout.glyphPack ?? AUTO_PACK_ID);
  const { vitals, hearts, spritesBase } = useVitalsContent(scale);
  const visible = useClusterVisibility(layout.inGameplay, slots.signature, showAllChips);
  const countdown = useCountdownContent();

  const slotCount = Object.keys(slots.slots).length;
  const dataScope = useMemo(
    () => hudDataScope(vitals, slotCount, countdown.source),
    [vitals, slotCount, countdown.source],
  );
  const ctx = useMemo(
    () => ({ hearts, filledSlots: slots.filledSlots, scope: dataScope }),
    [dataScope, hearts, slots.filledSlots],
  );
  const placed = usePlacedLayout(layout, view, ctx);
  const content = useMemo(
    () => ({ vitals, slots: slots.slots, glyph: slots.glyph, countdown: countdown.countdown }),
    [countdown.countdown, slots.glyph, slots.slots, vitals],
  );

  return (
    <HudBox
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        transform: slideTransform,
        transition: slideTransition,
      }}
    >
      <HudNodeRenderer nodes={placed.rest} scale={scale} content={content} spritesBase={spritesBase} dataScope={dataScope} />

      {!menuHolding && (
        <HudBox style={{ position: 'absolute', inset: 0, opacity: visible ? 1 : 0, transition: CLUSTER_FADE }}>
          <HudNodeRenderer nodes={placed.buttons} scale={scale} content={content} spritesBase={spritesBase} dataScope={dataScope} />
        </HudBox>
      )}
    </HudBox>
  );
};

export { HudLayoutView };
