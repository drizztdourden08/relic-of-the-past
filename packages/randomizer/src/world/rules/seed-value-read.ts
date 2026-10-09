/* @layer shared-game @kind logic */
import type { SeedValue, World } from '../world.type';

const readSeedValue = (world: World, key: string): SeedValue => {
  const value = world.seedValues.get(key);
  if (value === undefined) throw new Error(`seed table has no value: ${key}`);
  return value;
};

export { readSeedValue };
