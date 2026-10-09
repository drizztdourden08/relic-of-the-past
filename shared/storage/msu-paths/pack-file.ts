/* @layer shared-storage @kind logic */
import { assertSafeName } from './assert-safe-name';
import { packDir } from './pack-dir';

const packFile = (pack: string, fileName: string): string => {
  assertSafeName(fileName);
  return `${packDir(pack)}/${fileName}`;
};

export { packFile };
