/* @layer shared-game @kind constants */
import { AP_ITEM_NAMES, AP_LOCATION_NAMES } from '../ap-ids.constants';

const TAKEN_NAMES: ReadonlySet<string> = new Set([...Object.values(AP_LOCATION_NAMES), ...Object.values(AP_ITEM_NAMES)]);

export { TAKEN_NAMES };
