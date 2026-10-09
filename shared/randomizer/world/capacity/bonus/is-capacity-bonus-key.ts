/* @layer shared-game @kind logic */
import { CAPACITY_BONUS_KEYS } from './capacity-bonus-keys.constants';

const isCapacityBonusKey = (key: string): boolean => CAPACITY_BONUS_KEYS.includes(key);

export { isCapacityBonusKey };
