/* @layer renderer-components @kind logic */
import type { InputItem } from '../hid-calibration.type';

const isItemDone = (it: InputItem): boolean => it.status === 'captured' || it.status === 'skipped';

export { isItemDone };
