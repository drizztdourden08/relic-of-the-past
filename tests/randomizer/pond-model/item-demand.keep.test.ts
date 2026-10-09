/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import type { ItemKey } from '@shared/randomizer/world/item-ids.data';
import { itemKeyOfName } from '@shared/randomizer/world/display-names/item-key-name';
import { ITEM } from '@shared/randomizer/world/item-ids.data';
import { pondPlanOf } from '@shared/randomizer/world/pond/pond-plan';
import { isDemandableItem } from '@shared/randomizer/world/pond/pond-demand-eligibility';
import { DEMAND_ITEM_ORDER } from '@shared/randomizer/world/pond/pond-demand-order.data';
import { demandCandidatesOf } from '@shared/randomizer/world/pond/pond-demand-item';
import { rollPondDemands } from '@shared/randomizer/world/pond/pond-demand-roll';
import { pondRupeesOnlyAsk } from '@shared/randomizer/world/pond/pond-ask.data';
import { POND_INSTANCE_BY_ID } from '@shared/randomizer/world/pond/pond-instances';
import { REFERENCE_CAPACITY_PROFILE } from '@shared/randomizer/world/capacity/capacity-profile-defaults';
import { all } from '@shared/game/data';
import { createRng } from '@shared/randomizer/rng';
import { CUSTOM } from './pond-model.constants';

describe('pond item demand', () => {
  const ITEM_ONLY = { ...pondRupeesOnlyAsk(100, 300), rupees: { enabled: false, min: 100, max: 300 }, item: { enabled: true } };
  const plan = pondPlanOf({ ...CUSTOM, items: 5 }, POND_INSTANCE_BY_ID.wishing);
  const roll = (pool: readonly ItemKey[], ask = ITEM_ONLY, seed = 'demand') =>
    rollPondDemands(plan, ask, { curve: 'equal' }, createRng(seed), REFERENCE_CAPACITY_PROFILE, pool);

  it('names only items the player holds and the core can test', () => {
    const held: readonly string[] = [
      'Hookshot', 'Ether', 'Moon Pearl', 'Progressive Sword', 'Progressive Glove', 'Red Pendant', 'Crystal 3',
    ];
    const never: readonly string[] = [
      'Rupees (20)', 'Rupee (1)', 'Rupees (300)', 'Bombs (3)', 'Arrows (10)', 'Single Arrow', 'Piece of Heart',
      'Boss Heart Container', 'Sanctuary Heart Container', 'Progressive Bomb Capacity', 'Progressive Wallet',
      'Progressive Magic Capacity', 'Magic Upgrade (1/2)', 'Bottle', 'Bottle (Fairy)', 'Small Key (Ice Palace)',
      'Big Key (Desert Palace)', 'Map (Eastern Palace)', 'Compass (Turtle Rock)', 'Triforce Piece',
      'Master Sword', 'Titans Mitts', 'Silver Bow', 'Silver Arrows', 'Shovel', 'Flute', 'Mushroom', 'Blue Boomerang',
    ];
    for (const name of held) expect(isDemandableItem(itemKeyOfName(name)), name).toBe(true);
    for (const name of never) expect(isDemandableItem(itemKeyOfName(name)), name).toBe(false);
  });

  it('orders every eligible record, and orders nothing ineligible', () => {
    for (const item of DEMAND_ITEM_ORDER) expect(isDemandableItem(item), item).toBe(true);
    const eligible = new Set(all('item').map((item) => item.id).filter(isDemandableItem));
    for (const item of eligible) expect(DEMAND_ITEM_ORDER, item).toContain(item);
  });

  it('ranks the pool early to late, once each, and climbs that ranking', () => {
    const pool: readonly ItemKey[] = [
      ITEM.rupees20, ITEM.rupees20, ITEM.caneOfByrna, ITEM.lamp, ITEM.hammer, ITEM.pieceOfHeart,
      ITEM.moonPearl, ITEM.lamp,
    ];
    expect(demandCandidatesOf(pool)).toEqual([ITEM.lamp, ITEM.moonPearl, ITEM.hammer, ITEM.caneOfByrna]);
    for (let seed = 0; seed < 50; seed += 1) {
      const view = roll(pool, ITEM_ONLY, `climb-${seed}`);
      const names = plan.locations.map((rung) => view[rung]);
      expect(names[0]).toEqual({ currency: 'item', itemName: 'Lamp' });
      expect(names[names.length - 1]).toEqual({ currency: 'item', itemName: 'Cane of Byrna' });
    }
  });

  it('with nothing eligible, falls back to another ticked kind, then to a free rung', () => {
    const bare: readonly ItemKey[] = [
      ITEM.rupees20, ITEM.rupee1, ITEM.pieceOfHeart, itemKeyOfName('Progressive Wallet'),
    ];
    expect(roll(bare)).toEqual({});
    const withBombs = roll(bare, { ...ITEM_ONLY, bombs: { enabled: true, min: 1, max: 5 } });
    expect(Object.values(withBombs).map((demand) => demand.currency)).toEqual(plan.locations.map(() => 'bombs'));
  });
});
