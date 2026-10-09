/* @layer renderer-app @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { IdRefTargetField } from '@drizztdourden08/tessera/composites';

const fieldCache = new Map<EntityKind, readonly IdRefTargetField[]>();

export { fieldCache };
