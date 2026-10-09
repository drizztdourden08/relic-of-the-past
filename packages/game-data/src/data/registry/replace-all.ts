/* @layer shared-game @kind logic */
import type { EntityKind, EntityOf } from '../types';
import { registryState } from './registry-state';

const replaceAll = <K extends EntityKind>(kind: K, records: readonly EntityOf<K>[]): void => {
  const next = new Map<string, EntityOf<K>>();
  for (const record of records) next.set((record as { id: string }).id, record);
  registryState.store = { ...registryState.store, [kind]: next };
};

export { replaceAll };
