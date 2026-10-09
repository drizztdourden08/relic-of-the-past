/* @layer renderer-components @kind constants */
import { POND_INSTANCES } from '@shared/randomizer/world/pond/pond-instances';
import type { PondId } from '@shared/randomizer/world/pond/pond-instance.type';

const NOTICE = 'The fairy ponds could not be planned from these settings.';

const SHARE_LABEL = 'One set of settings for all three ponds';

const NO_FROZEN: readonly PondId[] = [];

const NO_NOTES: readonly string[] = [];

const POND_TABS = POND_INSTANCES.map((pond) => ({ id: pond.id, label: pond.label }));

export { NOTICE, SHARE_LABEL, NO_FROZEN, NO_NOTES, POND_TABS };
