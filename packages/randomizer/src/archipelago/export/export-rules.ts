/* @layer shared-game @kind logic */
import { PRIMITIVE_HELPERS } from '../../world/rules/primitive-helpers.constants';
import { helperCallsOf } from './helper-calls';
import type { World } from '../../world/world.type';
import type { ExportedRules } from './export.type';

const exportRules = (world: World): ExportedRules => {
  const roots = [...world.locationRules.values(), ...world.eventRules.values(), ...world.rules.values()]
    .map((rule) => rule.node);
  return {
    primitives: Object.fromEntries(PRIMITIVE_HELPERS.map((definition) => [definition.name, definition.params])),
    helpers: helperCallsOf(world, roots),
  };
};

export { exportRules };
