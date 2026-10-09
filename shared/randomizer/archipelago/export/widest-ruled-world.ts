/* @layer shared-game @kind logic */
import { buildWorld } from '../../world/build-world';
import { registerRules } from '../../world/rules/register';
import { widestWorldOptions } from './widest-world-options';
import type { World } from '../../world/world.type';

const widestRuledWorld = (): World => {
  const world = buildWorld(widestWorldOptions());
  registerRules(world);
  world.seedValues.clear();
  return world;
};

export { widestRuledWorld };
