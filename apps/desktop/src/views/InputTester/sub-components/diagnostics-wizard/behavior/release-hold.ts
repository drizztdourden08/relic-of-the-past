/* @layer renderer-components @kind logic */
import { inputApi } from '@drizztdourden08/brock-input/renderer';

const releaseHold = (): Promise<boolean> => inputApi().capture.releaseHold();

export { releaseHold };
