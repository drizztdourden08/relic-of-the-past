/* @layer renderer-app @kind constants */
import type { EntityKind } from '@shared/game/data';
import { ENTITY_KINDS } from '../../DataInspector.constants';
import type { InspectorSource } from '../../DataInspector.type';
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
