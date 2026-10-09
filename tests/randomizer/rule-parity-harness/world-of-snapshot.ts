/* @layer tests @kind helper */
import { all } from '@shared/game/data';
import { createRng } from '@shared/randomizer/rng';
import { ITEM, UNRECORDED } from '@shared/randomizer/world/item-ids.data';
import { buildFillWorld } from '@shared/randomizer/world/fill/fill-world';
import { fillOptionsFromSnapshot } from '@shared/randomizer/world/fill/fill-options-from-snapshot';
import { rollPrices } from '@shared/randomizer/world/fill/roll-placement-prices';
import { pondDemandsOfSnapshot } from '@shared/randomizer/world/fill/pond-demands-of-snapshot';
import { actTokensOf } from '@shared/randomizer/world/events/event-gates';
import type { Holding } from '@shared/randomizer/world/collection-state';
import type { World } from '@shared/randomizer/world/world.type';
import type { OptionValue } from '@shared/randomizer/world/options.type';
import { SEED } from './rule-parity-harness.constants';
import { snapshotOf } from './snapshot-of';

const worldOfSnapshot = (over: Record<string, OptionValue>): { world: World; items: Holding[] } => {
  const snapshot = snapshotOf(over);
  const fillOptions = fillOptionsFromSnapshot(snapshot, {}, {}, SEED);
  const shopPrices = rollPrices({ values: snapshot.values, options: fillOptions, rng: createRng(SEED) });
  const pondDemands = pondDemandsOfSnapshot(snapshot, SEED);
  const fillWorld = buildFillWorld({ ...fillOptions, shopPrices, pondDemands });
  const { pool } = fillWorld;
  const universe = new Set<Holding>([
    ...Object.values(ITEM), ...Object.values(UNRECORDED), ...pool.pool, ...pool.prizes,
    ...[...pool.dungeonItems.values()].flat(), ...fillWorld.lockedVanilla.values(),
    ...actTokensOf(all('check').map((check) => check.id)),
  ]);
  return { world: fillWorld.world, items: [...universe].sort() };
};

export { worldOfSnapshot };
