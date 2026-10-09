/* @layer renderer-components @kind logic */
import { inputApi } from '@drizztdourden08/brock-input/renderer';

const restoreHold = (): Promise<boolean> => inputApi()?.capture.restoreHold() ?? Promise.resolve(false);

export { restoreHold };
