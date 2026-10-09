/* @layer renderer-hud @kind hook */
import { useMemo } from 'react';
import { GEAR_LADDER_KINDS, arrowTypeOf, gearTierCells } from '@shared/game/logic/pause';
import { getItem } from '@shared/game/data';
import { spriteFilename } from '@shared/game/logic/queries/item-sprites';
import { ownedMax } from '@app/lib/game/gear-ownership';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { GEAR_LABELS, PASSIVE_RECORDS, SECTION_OF } from '../EnhancedPauseView.constants';
import type { GearLadderKind } from '@shared/game/logic/pause';
import type { GearModel } from '../EnhancedPauseView.type';

const spriteOf = (recordId: string): string => spriteFilename(getItem(recordId).spriteId) ?? '';

const passiveSprite = (records: readonly string[], level: number): string =>
  spriteOf(records[Math.min(Math.max(level, 1), records.length) - 1]);

const useGearModel = (): GearModel => {
  const equipment = useGameUIStore((s) => s.equipment);
  const items = useGameUIStore((s) => s.inventory.items);

  return useMemo(() => {
    const highest = ownedMax();
    const worn: Record<GearLadderKind, number> = {
      sword: equipment.sword, shield: equipment.shield, mail: equipment.armor,
      bow: arrowTypeOf(items[0] ?? 0),
    };

    const ladders = GEAR_LADDER_KINDS.map((kind) => ({
      kind,
      section: SECTION_OF[kind],
      label: GEAR_LABELS[kind],
      cells: gearTierCells(kind, highest[kind]).map((tier) => ({
        sprite: tier.sprite,
        owned: tier.owned,
        equipped: tier.tier === worn[kind],
      })),
    }));

    const held = [equipment.gloves, equipment.boots, equipment.flippers, equipment.moonPearl];
    const passives = PASSIVE_RECORDS.map((records, index) => ({
      sprite: passiveSprite(records, held[index]),
      owned: held[index] > 0,
    }));

    return { ladders, passives };
  }, [equipment, items]);
};

export { useGearModel };
