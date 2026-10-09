/* @layer renderer-components @kind constants */
import type { ListItemShape } from '@drizztdourden08/tessera/composites';
import type { StateGroup } from '@shared/game/data/native-tables/player-state-labels';

const GROUP_ORDER: readonly StateGroup[] = ['movement', 'combat', 'carrying', 'water', 'hazard', 'special'];

const ROW_SHAPE: ListItemShape = { icon: false, columns: 1, action: false };

export { GROUP_ORDER, ROW_SHAPE };
