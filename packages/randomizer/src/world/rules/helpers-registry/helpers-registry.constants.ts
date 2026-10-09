/* @layer shared-game @kind constants */
import { PRIMITIVE_HELPERS } from '../primitive-helpers.constants';
import { GEAR_HELPERS } from '../gear-helpers.constants';
import { COMBAT_HELPERS } from '../combat-helpers.constants';
import type { HelperDefinition } from '../helper-definition.type';
import type { HelperName } from '../rule-node.type';

const HELPERS: ReadonlyMap<HelperName, HelperDefinition> = new Map(
  [...PRIMITIVE_HELPERS, ...GEAR_HELPERS, ...COMBAT_HELPERS].map((definition) => [definition.name, definition]),
);

export { HELPERS };
