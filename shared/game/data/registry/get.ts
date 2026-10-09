/* @layer shared-game @kind logic */
import type { EntityKind, EntityOf } from '../types';
import { registryState } from './registry-state';

const get = <K extends EntityKind>(kind: K, id: string): EntityOf<K> | undefined =>
  registryState.store[kind].get(id) as EntityOf<K> | undefined;

export { get };
