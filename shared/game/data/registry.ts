/* @layer shared-game @kind logic */
/**
 * The store every getter reads, and the one way a record file's array reaches it.
 *
 * `recordsIn` is what each collection's loader calls on its own `import.meta.glob`: the
 * tree under `records/` is hundreds of files deep, so a glob loads them and this flattens
 * the modules into one list. Every module is scanned for array exports instead of one agreed
 * name, because each record file names its array after its own place in the tree
 * (`LW_AREAS`, `NPC_ACTORS`, `LW_OVERWORLD_KAKARIKO_SCREENS`). Vite sorts glob keys by path,
 * so the order is stable across runs; where the order matters a loader sorts by id and says
 * why (see checks/index.ts).
 */
import type { EntityKind, EntityOf } from './types';

type Store = { [K in EntityKind]: Map<string, EntityOf<K>> };

/** A record module exports one or more arrays and nothing else that is an array. */
type RecordModule = Record<string, unknown>;

const recordsIn = <T>(modules: Record<string, unknown>): T[] => {
  const collected: T[] = [];
  for (const module of Object.values(modules)) {
    for (const exported of Object.values(module as RecordModule)) {
      if (Array.isArray(exported)) collected.push(...(exported as T[]));
    }
  }
  return collected;
};

let store: Store = {
  screen: new Map(), connection: new Map(), check: new Map(), item: new Map(),
  dungeon: new Map(), area: new Map(), location: new Map(), region: new Map(),
  actor: new Map(), tag: new Map(), 'item-group': new Map(), enumeration: new Map(),
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

export { all, get, recordsIn, replaceAll };
