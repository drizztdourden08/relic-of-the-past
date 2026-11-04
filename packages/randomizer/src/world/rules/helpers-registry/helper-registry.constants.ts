/* @layer shared-game @kind constants */
import { HELPERS } from './helpers-registry.constants';
import type { KitHelperRegistry } from '@drizztdourden08/brock-randomizer/world';
import type { RotpKeys } from '../../rotp-keys.type';

const registry = (): KitHelperRegistry<RotpKeys> => HELPERS;

const HELPER_REGISTRY: KitHelperRegistry<RotpKeys> = {
  get size() { return registry().size; },
  get: (name) => registry().get(name),
  has: (name) => registry().has(name),
  forEach: (callback, thisArg) => { registry().forEach(callback, thisArg); },
  entries: () => registry().entries(),
  keys: () => registry().keys(),
  values: () => registry().values(),
  [Symbol.iterator]: () => registry()[Symbol.iterator](),
};

export { HELPER_REGISTRY };
