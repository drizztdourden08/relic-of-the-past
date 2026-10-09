/* @layer shared-game @kind logic */
import type { EntityKind, EntityOf } from '../types';
import { registryState } from './registry-state';

const all = <K extends EntityKind>(kind: K): readonly EntityOf<K>[] =>
  Array.from(registryState.store[kind].values());

export { all };
