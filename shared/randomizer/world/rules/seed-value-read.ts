/* @layer shared-game @kind logic */
/**
 * One value of a world's seed table, as a seeded rule reads it. A tree names a value the table
 * does not hold only when the table was never filled for that world, which is a wiring error,
 * so it throws at once instead of answering a guess.
 */
import type { SeedValue, World } from '../world.type';

const readSeedValue = (world: World, key: string): SeedValue => {
  const value = world.seedValues.get(key);
  if (value === undefined) throw new Error(`seed table has no value: ${key}`);
  return value;
};

export { readSeedValue };
