/* @layer shared-game @kind logic */
/**
 * rules.json: the primitive helpers the loader writes itself, by parameter list, and every
 * derived helper call the widest world's trees make, each with the tree it stands for. A
 * derived helper's tree may name other helpers; the loader follows them the same way.
 */
import { PRIMITIVE_HELPERS } from '../../world/rules/helpers-primitive';
import { helperCallsOf } from './helper-calls';
import type { World } from '../../world/world.type';
import type { ExportedRules } from './export.type';

const exportRules = (world: World): ExportedRules => {
  const roots = [...world.locationRules.values(), ...world.rules.values()].map((rule) => rule.node);
  return {
    primitives: Object.fromEntries(PRIMITIVE_HELPERS.map((definition) => [definition.name, definition.params])),
    helpers: helperCallsOf(world, roots),
  };
};

export { exportRules };
