/* @layer renderer-hud @kind hook */
import { useMemo } from 'react';
import { GEAR_LADDER_KINDS, arrowTypeOf, gearTierCells, getItem, spriteFilename } from '@rotp/game-data';
import { ownedMax } from '@app/game/gear-ownership';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { GEAR_LABELS, PASSIVE_RECORDS, SECTION_OF } from '../EnhancedPauseView.constants';
import type { GearLadderKind } from '@rotp/game-data';
import type { GearModel } from '../EnhancedPauseView.type';

const spriteOf = (recordId: string): string => spriteFilename(getItem(recordId).spriteId) ?? '';

const passiveSprite = (records: readonly string[], level: number): string => {
  const record = records[Math.min(Math.max(level, 1), records.length) - 1];
  if (record === undefined) throw new Error(`passive item ladder has no record for level ${level}`);
  return spriteOf(record);
};

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
    const passives = PASSIVE_RECORDS.map((records, index) => {
      const level = held[index];
      if (level === undefined) throw new Error(`no equipment level for passive item ${index}`);
      return { sprite: passiveSprite(records, level), owned: level > 0 };
    });

    return { ladders, passives };
  }, [equipment, items]);
};

export { useGearModel };
