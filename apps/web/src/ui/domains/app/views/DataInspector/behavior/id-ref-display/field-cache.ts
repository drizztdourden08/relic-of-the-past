/* @layer renderer-app @kind logic */
import type { EntityKind } from '@shared/game/data';
import type { IdRefTargetField } from '@ds/composites/DataTable';

const fieldCache = new Map<EntityKind, readonly IdRefTargetField[]>();

export { fieldCache };
