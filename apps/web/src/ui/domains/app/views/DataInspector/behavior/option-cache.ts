/* @layer renderer-app @kind logic */
import type { EntityKind } from '@shared/game/data';
import type { IdRefOption } from '@ds/composites/RecordEditor';

const optionCache = new Map<EntityKind, readonly IdRefOption[]>();

export { optionCache };
