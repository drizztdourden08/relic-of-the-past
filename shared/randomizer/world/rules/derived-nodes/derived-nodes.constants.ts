/* @layer shared-game @kind constants */
import { ITEM } from '../../item-ids.data';
import type { MedallionId } from '../../item-groups';

const GATE_MEDALLIONS: readonly MedallionId[] = [ITEM.bombos, ITEM.ether, ITEM.quake];

const MIN_ARROWS_ASKED = 1;

const DEFAULT_ENEMY_COUNT = 5;

export { DEFAULT_ENEMY_COUNT, GATE_MEDALLIONS, MIN_ARROWS_ASKED };
