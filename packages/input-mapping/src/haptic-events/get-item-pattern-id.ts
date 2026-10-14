/* @layer shared-input @kind logic */
import { ITEM_PATTERN_IDS } from './haptic-events.constants';
import type { HapticPatternId } from '../data/haptics';

const getItemPatternId = (itemId: number): HapticPatternId | null => ITEM_PATTERN_IDS[itemId] ?? null;

export { getItemPatternId };
