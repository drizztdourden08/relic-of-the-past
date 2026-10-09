/* @layer shared-game @kind logic */
import type { FileTarget, ScreenHome } from './record-file-targets.type';
import { screenBucket } from './screen-bucket';
import { worldFolder } from './world-folder';

const fileInRecordRoot = (root: 'screens' | 'connections', screen: ScreenHome): FileTarget => {
  const bucket = screenBucket(screen);
  if (bucket.relativePath === null) return bucket;
  return { relativePath: `${root}/${worldFolder(screen.world)}/${bucket.relativePath}.ts` };
};

export { fileInRecordRoot };
