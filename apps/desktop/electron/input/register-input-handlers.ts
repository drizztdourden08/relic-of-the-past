/* @layer electron-main @kind logic */
import { handle } from '@drizztdourden08/brock-electron/main';
import { writeDebugCapture } from './write-debug-capture';

const registerInputHandlers = (): void => {
  handle('controller:write-debug-capture', (_event, name: string, data: unknown) => writeDebugCapture(name, data));
};

export { registerInputHandlers };
