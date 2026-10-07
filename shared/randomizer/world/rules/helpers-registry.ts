/* @layer shared-game @kind logic */
/**
 * Every helper a rule tree may name, by name. The primitives (helpers-primitive.ts) are the
 * questions only code can answer; the rest (helpers-derived-*.ts) carry their own expansion,
 * so an exporter can inline them down to primitive ops.
 */
import { PRIMITIVE_HELPERS } from './helpers-primitive';
import { GEAR_HELPERS } from './helpers-derived-gear';
import { COMBAT_HELPERS } from './helpers-derived-combat';
import type { HelperDefinition } from './helper-definition.type';
import type { HelperName } from './rule-node.type';

const HELPERS: ReadonlyMap<HelperName, HelperDefinition> = new Map(
  [...PRIMITIVE_HELPERS, ...GEAR_HELPERS, ...COMBAT_HELPERS].map((definition) => [definition.name, definition]),
);

const helperDefinition = (name: HelperName): HelperDefinition => {
  const definition = HELPERS.get(name);
  if (definition === undefined) throw new Error(`unknown rule helper: ${name}`);
  return definition;
};

/** The helpers with no expansion: what another implementation of the rules must write itself. */
const primitiveHelperNames = (): HelperName[] =>
  [...HELPERS.values()].filter((definition) => definition.expand === undefined).map((definition) => definition.name);

export { HELPERS, helperDefinition, primitiveHelperNames };
