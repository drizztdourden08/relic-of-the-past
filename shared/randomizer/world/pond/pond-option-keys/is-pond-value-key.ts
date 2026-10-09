/* @layer shared-game @kind logic */
import { POND_VALUE_KEYS } from './pond-option-keys.constants';

const isPondValueKey = (key: string): boolean => POND_VALUE_KEYS.has(key);

export { isPondValueKey };
