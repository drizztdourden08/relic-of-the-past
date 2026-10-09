/* @layer shared-game @kind logic */
import { heartCount } from './heart-count';
import type { CollectionState } from '../collection-state.type';

const hasHearts = (state: CollectionState, count: number): boolean => heartCount(state) >= count;

export { hasHearts };
