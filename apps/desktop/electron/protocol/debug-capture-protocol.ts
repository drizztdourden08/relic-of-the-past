/* @layer electron-main @kind logic */
import { net, protocol } from 'electron';
import { getUserDataPath } from '@drizztdourden08/brock-electron/main';
import { captureFileUrlOf } from './debug-capture-file-path';

const registerDebugCaptureProtocol = (): void => {
  protocol.handle('app-debug-capture', (request) => net.fetch(captureFileUrlOf(getUserDataPath('profiles'), request.url)));
};

export { registerDebugCaptureProtocol };
