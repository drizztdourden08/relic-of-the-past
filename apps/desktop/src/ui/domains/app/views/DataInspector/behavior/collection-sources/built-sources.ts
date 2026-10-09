/* @layer renderer-app @kind logic */
import type { EntityKind } from '@shared/game/data';
import type { InspectorSource } from '../../DataInspector.type';

const builtSources = new Map<EntityKind, InspectorSource>();

export { builtSources };
