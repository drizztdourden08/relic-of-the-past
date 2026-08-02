/* @layer shared-game @kind logic */
import type { EntityKind, EntityOf } from './types';

type Store = { [K in EntityKind]: Map<string, EntityOf<K>> };

let store: Store = {
  screen: new Map(), connection: new Map(), check: new Map(), item: new Map(),
  dungeon: new Map(), area: new Map(), location: new Map(), actor: new Map(),
  tag: new Map(), 'item-group': new Map(), enumeration: new Map(),
};

const replaceAll = <K extends EntityKind>(kind: K, records: readonly EntityOf<K>[]): void => {
  const next = new Map<string, EntityOf<K>>();
  for (const record of records) next.set((record as { id: string }).id, record);
  store = { ...store, [kind]: next };
};

const get = <K extends EntityKind>(kind: K, id: string): EntityOf<K> | undefined =>
  store[kind].get(id) as EntityOf<K> | undefined;

const all = <K extends EntityKind>(kind: K): readonly EntityOf<K>[] =>
  Array.from(store[kind].values()) as EntityOf<K>[];

export { all, get, replaceAll };
