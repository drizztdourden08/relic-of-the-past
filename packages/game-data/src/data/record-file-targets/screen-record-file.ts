/* @layer shared-game @kind logic */
import type { FileTarget, ScreenHome } from './record-file-targets.type';
import { fileInRecordRoot } from './file-in-record-root';

const screenRecordFile = (screen: ScreenHome): FileTarget => fileInRecordRoot('screens', screen);

export { screenRecordFile };
