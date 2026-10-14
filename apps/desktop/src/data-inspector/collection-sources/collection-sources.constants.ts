/* @layer renderer-app @kind constants */
import type { EntityKind } from '@rotp/game-data';
import { ENTITY_KINDS } from '@app/views/DataInspector/DataInspector.constants';
import type { InspectorSource } from '@app/views/DataInspector/DataInspector.type';
import { collectionSource } from './collection-source';

const COLLECTION_SOURCES = Object.defineProperties(
  {},
  Object.fromEntries(ENTITY_KINDS.map(kind => [kind, {
    get: () => collectionSource(kind),
    enumerable: true,
    configurable: true,
  }])),
) as Record<EntityKind, InspectorSource>;

export { COLLECTION_SOURCES };
