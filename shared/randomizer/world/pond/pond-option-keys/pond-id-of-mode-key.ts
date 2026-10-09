/* @layer shared-game @kind logic */
import { POND_ID_BY_MODE_KEY } from './pond-option-keys.constants';
import type { PondId } from '../pond-instance.type';

const pondIdOfModeKey = (key: string): PondId | undefined => POND_ID_BY_MODE_KEY.get(key);

export { pondIdOfModeKey };
