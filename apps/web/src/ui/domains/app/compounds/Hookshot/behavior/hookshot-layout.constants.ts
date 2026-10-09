/* @layer renderer-components @kind constants */
import { HOOKSHOT_PARTS } from '../Hookshot.constants';

const DEG = 180 / Math.PI;
const PITCH = HOOKSHOT_PARTS.linkFace.pinB[0] - HOOKSHOT_PARTS.linkFace.pinA[0];

export { DEG, PITCH };
