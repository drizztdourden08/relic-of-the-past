/* @layer shared-game @kind types */
import type { EntityKind, EntityOf } from '../types';

type Store = { [K in EntityKind]: Map<string, EntityOf<K>> };

type RecordModule = Record<string, unknown>;

interface RegistryState {
  store: Store;
}

export type { RecordModule, RegistryState, Store };
