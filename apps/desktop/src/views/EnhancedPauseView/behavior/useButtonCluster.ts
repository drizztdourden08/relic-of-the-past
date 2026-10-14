/* @layer renderer-hud @kind hook */
import { useMemo } from 'react';
import { hudDataScope } from '@rotp/hud';
import type { Size } from '@rotp/hud';
import { AUTO_PACK_ID } from '@rotp/input-mapping';
import { useHudLayoutStore } from '@app/stores/hud-layout-store';
import { usePlacedLayout } from '../../HudLayoutView/behavior/usePlacedLayout';
import { useSlotContent } from '../../HudLayoutView/behavior/useSlotContent';
import { useVitalsContent } from '../../HudLayoutView/behavior/useVitalsContent';
import type { ButtonCluster } from '../EnhancedPauseView.type';

const useButtonCluster = (scale: number, view: Size): ButtonCluster => {
  const layout = useHudLayoutStore((s) => s.layout);
  const packId = layout.glyphPack ?? AUTO_PACK_ID;
  const slots = useSlotContent(packId);
  const { vitals: nodeVitals, hearts, spritesBase: hudSprites } = useVitalsContent(scale);

  const slotCount = Object.keys(slots.slots).length;
  const dataScope = useMemo(() => hudDataScope(nodeVitals, slotCount), [nodeVitals, slotCount]);
  const ctx = useMemo(
    () => ({ hearts, filledSlots: slots.filledSlots, scope: dataScope }),
    [dataScope, hearts, slots.filledSlots],
  );
  const placed = usePlacedLayout(layout, view, ctx);
  const content = useMemo(
    () => ({ vitals: nodeVitals, slots: slots.slots, glyph: slots.glyph }),
    [nodeVitals, slots.glyph, slots.slots],
  );

  return { packId, placed, content, dataScope, hudSprites };
};

export { useButtonCluster };
