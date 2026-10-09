/* @layer tests @kind helper */
import { all } from '@rotp/game-data';
import { createRng } from '@rotp/randomizer';
import { ITEM, UNRECORDED } from '@rotp/randomizer';
import { buildFillWorld } from '@rotp/randomizer';
import { fillOptionsFromSnapshot } from '@rotp/randomizer';
import { rollPrices } from '@rotp/randomizer';
import { pondDemandsOfSnapshot } from '@rotp/randomizer';
import { actTokensOf } from '@rotp/randomizer';
import type { Holding } from '@rotp/randomizer';
import type { World } from '@rotp/randomizer';
import type { OptionValue } from '@rotp/randomizer';
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
