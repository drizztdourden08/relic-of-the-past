/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { packDir } from '../msu-paths';

const deletePack = (files: FileStore, pack: string): Promise<void> =>
  (files.trash ? files.trash(packDir(pack)) : files.remove(packDir(pack)));

export { deletePack };
