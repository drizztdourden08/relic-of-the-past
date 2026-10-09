/* @layer renderer-app @kind logic */
import type { EntityKind } from '@shared/game/data';
import type { InspectorRow } from '../../DataInspector.type';
import { COLLECTION_SOURCES } from '../collection-sources';
import { rowCache } from './row-cache';

const rowsFor = (kind: EntityKind): ReadonlyMap<string, InspectorRow> => {
  const held = rowCache.get(kind);
  if (held) return held;
  const source = COLLECTION_SOURCES[kind];
  const built = new Map(source.rows.map(row => [source.getId(row), row]));
  rowCache.set(kind, built);
  return built;
};

export { rowsFor };
