/* @layer shared-game @kind logic */
import { HELPERS } from './helpers-registry.constants';
import type { HelperDefinition } from '../helper-definition.type';
import type { HelperName } from '../rule-node.type';

const helperDefinition = (name: HelperName): HelperDefinition => {
  const definition = HELPERS.get(name);
  if (definition === undefined) throw new Error(`unknown rule helper: ${name}`);
  return definition;
};

export { helperDefinition };
