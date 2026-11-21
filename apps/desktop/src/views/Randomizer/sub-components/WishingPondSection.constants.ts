/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { POND_INSTANCES } from '@rotp/randomizer';
import type { PondId } from '@rotp/randomizer';

const NOTICE = msg('views-randomizer:ponds.notice');

const SHARE_LABEL = msg('views-randomizer:ponds.share');

const NO_FROZEN: readonly PondId[] = [];

const NO_NOTES: readonly string[] = [];

const POND_TABS = POND_INSTANCES.map((pond) => ({ id: pond.id, label: pond.label }));

export { NOTICE, SHARE_LABEL, NO_FROZEN, NO_NOTES, POND_TABS };
