/* @layer shared-game @kind constants */
import {
  explosivesCapacity, projectilesCapacity, walletCapacity,
} from '../state-helpers-capacity';
import { canExtendMagic, hasHearts } from '../state-helpers';
import { heartCapacity } from './heart-capacity';
import type { HelperDefinition } from './helper-definition.type';

const PRIMITIVE_HELPERS: readonly HelperDefinition[] = [
  {
    name: 'explosivesAtLeast',
    params: ['amount'],
    body: (state, amount) => explosivesCapacity(state) >= Number(amount),
  },
  {
    name: 'projectilesAtLeast',
    params: ['amount'],
    body: (state, amount) => projectilesCapacity(state) >= Number(amount),
  },
  {
    name: 'walletAtLeast',
    params: ['amount'],
    body: (state, amount) => walletCapacity(state) >= Number(amount),
  },
  {
    name: 'heartCapacityAbove',
    params: ['amount'],
    body: (state, amount) => heartCapacity(state) > Number(amount),
  },
  {
    name: 'hasHearts',
    params: ['count'],
    body: (state, count) => hasHearts(state, Number(count)),
  },
  {
    name: 'canExtendMagic',
    params: ['smallmagic'],
    body: (state, ...args) => canExtendMagic(state, ...(args as [number?])),
  },
];

export { PRIMITIVE_HELPERS };
