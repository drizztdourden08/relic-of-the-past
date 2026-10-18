/* @layer renderer-app @kind logic */
import { buildSchema } from '@drizztdourden08/tessera/data';
import type { EntityKind } from '@rotp/game-data';
import { COLLECTION_SOURCES } from '@app/data-inspector/collection-sources';
import type { KindData } from '../DataInspector.type';
import { builtKindData } from './kind-data-cache.constants';

const loadKindData = (kind: EntityKind): KindData => {
  const source = COLLECTION_SOURCES[kind];
  const ready = builtKindData.get(source);
  if (ready) return ready;
  const data: KindData = { source, schema: buildSchema(source.rows, source.config) };
  builtKindData.set(source, data);
  return data;
};

export { loadKindData };
