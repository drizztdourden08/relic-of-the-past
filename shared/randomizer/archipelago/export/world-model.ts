/* @layer shared-game @kind logic */
import { UNCLE_LOCATION } from '../../world/pool/standard-escape.data';
import { PRIZE_ITEMS } from '../../world/pool/prize-items.data';
import { VANILLA_PRIZES } from '../../world/scope-tables';
import { ruleOptionsOfWorld } from '../../world/rules/rule-options';
import { progressiveSettingOf, progressiveTierMapOf } from '../../world/progressive/progressive-reach';
import { specializeNode } from './specialize-node';
import { readItemsOf } from './read-items';
import { primitiveDataOf } from './primitive-data';
import { itemHalfOf } from './model-items';
import type { FillWorld } from '../../world/fill/fill-world.type';
import type { LocationKey } from '../../world/location-key';
import type { RuleNode, RuleOptionKey } from '../../world/rules/rule-node.type';
import type { WorldModel, WorldModelInput } from './export.type';

const lockedOf = (fillWorld: FillWorld): Record<string, string> => {
  const locked: Record<string, string> = Object.fromEntries(fillWorld.lockedVanilla);
  if (fillWorld.pool.uncleWeapon !== undefined) locked[UNCLE_LOCATION] = fillWorld.pool.uncleWeapon;
  return locked;
};

const specializedTrees = (fillWorld: FillWorld): RuleNode[] => {
  const { world } = fillWorld;
  const readings = ruleOptionsOfWorld(world);
  const reader = {
    option: (key: string) => readings[key as RuleOptionKey],
    seed: (key: string) => {
      const value = world.seedValues.get(key);
      if (value === undefined) throw new Error(`seed table has no value: ${key}`);
      return value;
    },
  };
  const roots = [...world.locationRules.values(), ...world.eventRules.values(), ...world.rules.values()]
    .map((rule) => rule.node);
  return roots.map((node) => specializeNode(node, world, reader));
};

const worldModelOf = (input: WorldModelInput): WorldModel => {
  const { fillWorld, options, shufflePrizes } = input;
  const { world, pool } = fillWorld;
  const locked = lockedOf(fillWorld);
  const primitives = primitiveDataOf(world);
  const fillable = [...world.locationsByKey.values()]
    .filter((location) => !location.prize && locked[location.key] === undefined)
    .map((location): LocationKey => location.key);
  const items = itemHalfOf({
    fillWorld,
    fillable,
    fixedProgression: new Set<string>([...PRIZE_ITEMS, ...pool.prizes]),
    read: readItemsOf(specializedTrees(fillWorld), primitives),
    locked: Object.values(locked),
  });
  return {
    options,
    present: [...world.locationsByKey.keys()],
    locked,
    prizes: { shuffle: shufflePrizes, vanilla: Object.fromEntries(VANILLA_PRIZES), items: [...pool.prizes] },
    ...items,
    locationDungeon: Object.fromEntries(fillWorld.locationDungeon),
    readings: ruleOptionsOfWorld(world),
    seedValues: Object.fromEntries(world.seedValues),
    tiers: Object.fromEntries(progressiveTierMapOf(progressiveSettingOf(world))),
    primitives,
  };
};

export { worldModelOf };
