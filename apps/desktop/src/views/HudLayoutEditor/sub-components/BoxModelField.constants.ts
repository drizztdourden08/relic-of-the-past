/* @layer renderer-components @kind constants */
import type { Side } from './BoxModelField.type';

const SIDES: readonly Side[] = ['top', 'right', 'bottom', 'left'];
const OFFSET_SIDES: readonly Side[] = ['left', 'top'];

export { OFFSET_SIDES, SIDES };
