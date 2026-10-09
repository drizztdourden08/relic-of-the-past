/* @layer electron-main @kind logic */
import { createRendererLogger, getMainWindow } from '@drizztdourden08/brock-electron/main';

const logToRenderer = createRendererLogger(getMainWindow);

export { logToRenderer };
