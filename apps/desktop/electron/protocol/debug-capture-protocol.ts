/* @layer electron-main @kind logic */
/**
 * Serves `app-debug-capture://captures/<profileId>/<sessionKey>/<file>` from a profile's
 * debug-captures/ folder, so the session picker (BugReportDialog) can preview a recording's
 * video (or a frame PNG, no-ffmpeg fallback) without piping bytes through IPC.
 */
import { net, protocol } from 'electron';
import { getUserDataPath } from '../lib/paths';
import { captureFileUrlOf } from './debug-capture-file-path';

const registerDebugCaptureProtocol = (): void => {
  protocol.handle('app-debug-capture', (request) => net.fetch(captureFileUrlOf(getUserDataPath('profiles'), request.url)));
};

export { registerDebugCaptureProtocol };
