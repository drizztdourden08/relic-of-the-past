/* @layer renderer-app @kind logic */
import { buildSchema } from '@drizztdourden08/tessera/data';
import type { EntityKind } from '@rotp/game-data';
import { COLLECTION_SOURCES, peekCollectionSource } from '@app/data-inspector/collection-sources';
import type { InspectorSource, KindData } from '../DataInspector.type';

const built = new WeakMap<InspectorSource, KindData>();

const peekKindData = (kind: EntityKind): KindData | undefined => {
  const source = peekCollectionSource(kind);
  return source ? built.get(source) : undefined;
};

const loadKindData = (kind: EntityKind): KindData => {
  const source = COLLECTION_SOURCES[kind];
  const ready = built.get(source);
  if (ready) return ready;
  const data: KindData = { source, schema: buildSchema(source.rows, source.config) };
  built.set(source, data);
  return data;
};

export { loadKindData, peekKindData };
