/* @layer shared-game @kind logic */
/**
 * The primitive helpers: the questions no tree of primitive ops can ask, because each one does
 * arithmetic over raw state (a capacity ladder climbed, the magic meter times the bottles, the
 * hearts summed). This list is exactly what another implementation of the rules has to write
 * for itself; everything else a rule asks is a tree.
 */
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
    // A heart price must leave the player standing, so the capacity has to exceed it.
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
