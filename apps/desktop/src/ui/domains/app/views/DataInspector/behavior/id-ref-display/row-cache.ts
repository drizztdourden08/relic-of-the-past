/* @layer renderer-app @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { InspectorRow } from '../../DataInspector.type';

const rowCache = new Map<EntityKind, ReadonlyMap<string, InspectorRow>>();

export { rowCache };
