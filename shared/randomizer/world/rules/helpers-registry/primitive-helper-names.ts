/* @layer shared-game @kind logic */
import { HELPERS } from './helpers-registry.constants';
import type { HelperName } from '../rule-node.type';

const primitiveHelperNames = (): HelperName[] =>
  [...HELPERS.values()].filter((definition) => definition.expand === undefined).map((definition) => definition.name);

export { primitiveHelperNames };
