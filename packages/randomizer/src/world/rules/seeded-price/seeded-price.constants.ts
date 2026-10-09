/* @layer shared-game @kind constants */
import type { HelperName } from '../rule-node.type';

const COUNTED_CURRENCY_HELPERS: readonly (readonly [string, HelperName])[] = [
  ['rupees', 'walletAtLeast'],
  ['arrows', 'projectilesAtLeast'],
  ['bombs', 'explosivesAtLeast'],
  ['hearts', 'heartCapacityAbove'],
];

export { COUNTED_CURRENCY_HELPERS };
