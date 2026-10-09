/* @layer shared-game @kind logic */
import { findOne } from '../facade';
import type { ScreenId } from '../types';
import type { FileTarget } from './record-file-targets.type';
import { fileInRecordRoot } from './file-in-record-root';

const connectionRecordFile = (screenId: ScreenId): FileTarget => {
  const screen = findOne('screen', s => s.id === screenId);
  if (!screen) return { relativePath: null, unresolved: `unknown screen ${screenId}` };
  return fileInRecordRoot('connections', screen);
};

export { connectionRecordFile };
