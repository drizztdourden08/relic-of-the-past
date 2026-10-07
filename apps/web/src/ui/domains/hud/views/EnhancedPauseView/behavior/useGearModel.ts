/* @layer renderer-hud @kind hook */
/**
 * The gear screen's five rows: four ladders and the passives.
 *
 * Selectability is the HIGH-WATER MARK, never the live equipment. That is the whole
 * reason the ladders can be walked down, not only up. The mark lives beside
 * the profile's other JSON instead of in the save, because every byte of a
 * cartridge save already means something and inventing a use for one would
 * corrupt it.
 *
 * Passive sprites resolve through the record dataset instead of a table
 * copied into the renderer, so the game's own item names stay in the data
 * layer where the copyright gate expects them.
 */
import { useMemo } from 'react';
import { GEAR_LADDER_KINDS, arrowTypeOf, gearTierCells } from '@shared/game/logic/pause';
import { getItem } from '@shared/game/data';
import { spriteFilename } from '@shared/game/logic/queries/item-sprites';
import { ownedMax } from '@app/lib/game/gear-ownership';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { GEAR_LABELS } from '../EnhancedPauseView.constants';
import type { GearLadderKind } from '@shared/game/logic/pause';
import type { GearLadder, GearRowCell, GearSection } from '../../../compounds/PauseGearScreen';

interface GearModel {
  ladders: readonly GearLadder[];
  passives: readonly GearRowCell[];
}

/** The ladder each kind draws on, in the order the cursor walks the rows. */
const SECTION_OF: Record<GearLadderKind, GearSection> = {
  sword: 'sword', shield: 'shield', mail: 'mail', bow: 'bow',
};

/**
 * The four passives, each as its own tier list. Only the lifting pair has a
 * second tier; the rest are held or not. An unheld passive still draws its
 * tier-one art as a silhouette, the same rule the item grid follows.
 */
const PASSIVE_RECORDS: readonly (readonly string[])[] = [
  ['item-028', 'item-029'], ['item-076'], ['item-031'], ['item-032'],
];

const spriteOf = (recordId: string): string => spriteFilename(getItem(recordId).spriteId) ?? '';

/** Art for the tier actually held, or tier one when nothing is. */
const passiveSprite = (records: readonly string[], level: number): string =>
  spriteOf(records[Math.min(Math.max(level, 1), records.length) - 1]);

const useGearModel = (): GearModel => {
  const equipment = useGameUIStore((s) => s.equipment);
  const items = useGameUIStore((s) => s.inventory.items);

  return useMemo(() => {
    const highest = ownedMax();
    // The launcher's byte carries which arrows AND whether any are nocked, so the
    // row's rung is the type read back out of it, never the register itself.
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
export type { GearModel };
