/* @layer renderer-app @kind logic */
import type { EntityKind } from '@rotp/game-data';
import { COLLECTION_SOURCES } from '@app/data-inspector/collection-sources';
import type { KindData } from '../DataInspector.type';
import { builtKindData } from './kind-data-cache.constants';

const peekKindData = (kind: EntityKind): KindData | undefined => builtKindData.get(COLLECTION_SOURCES[kind]);

export { peekKindData };
