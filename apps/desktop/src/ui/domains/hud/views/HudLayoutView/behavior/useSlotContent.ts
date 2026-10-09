/* @layer renderer-hud @kind hook */
import { useMemo } from 'react';
import { AUTO_PACK_ID } from '@shared/input/glyphs';
import { buildSlotContent } from '@app/lib/hud/slot-content';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { useControlSchemeStore } from '@app/stores/control-scheme-store';
import { declaredDeviceFamily } from './declared-family';
import { deviceFamilyOf } from './device-family';
import { useGlyphPacks } from './useGlyphPacks';
import type { ModernSlot } from '@rotp/game-data';
import type { SlotContent } from '@app/lib/hud/slot-content';
import type { ControlSchemeSlice } from '../HudLayoutView.type';

const useSlotContent = (packId: string = AUTO_PACK_ID): SlotContent => {
  const bindings = useControlSchemeStore((s: ControlSchemeSlice) => s.bindings);
  const assignments = useControlSchemeStore((s: ControlSchemeSlice) => s.assignments);
  const items = useGameUIStore((s) => s.inventory.items);
  const bottles = useGameUIStore((s) => s.inventory.bottles);
  const swordTier = useGameUIStore((s) => s.equipment.sword);
  const packs = useGlyphPacks();

  return useMemo(() => {
    const slots: readonly ModernSlot[] = bindings?.slots ?? [];
    return buildSlotContent({
      slots,
      assignments,
      items,
      bottles,
      swordTier,
      packId,
      packs,
      family: deviceFamilyOf(slots, declaredDeviceFamily()),
    });
  }, [assignments, bindings, bottles, items, packId, packs, swordTier]);
};

export { useSlotContent };
