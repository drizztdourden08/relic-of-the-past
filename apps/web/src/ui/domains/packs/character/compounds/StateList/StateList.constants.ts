/* @layer renderer-components @kind constants */
import type { StateGroup } from '@shared/game/data/native-tables/player-state-labels';

const GROUP_ORDER: readonly StateGroup[] = ['movement', 'combat', 'carrying', 'water', 'hazard', 'special'];

export { GROUP_ORDER };
