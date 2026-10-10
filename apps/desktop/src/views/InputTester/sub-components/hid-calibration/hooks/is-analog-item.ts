/* @layer renderer-components @kind logic */
import { STICK_IDS, TRIGGER_IDS } from '../hid-calibration.constants';
import type { InputItem } from '../hid-calibration.type';

const isAnalogItem = (item: InputItem | undefined): boolean =>
  item !== undefined && (STICK_IDS.has(item.id) || TRIGGER_IDS.has(item.id));

export { isAnalogItem };
