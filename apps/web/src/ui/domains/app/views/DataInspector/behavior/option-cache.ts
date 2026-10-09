/* @layer renderer-app @kind logic */
import type { EntityKind } from '@shared/game/data';
import type { IdRefOption } from '@drizztdourden08/tessera/composites';

const optionCache = new Map<EntityKind, readonly IdRefOption[]>();

export { optionCache };
