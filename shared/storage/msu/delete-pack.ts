/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { packDir } from '../msu-paths';

const deletePack = (files: FileStore & { trash?: (path: string) => Promise<void> }, pack: string): Promise<void> =>
  (files.trash ? files.trash(packDir(pack)) : files.remove(packDir(pack)));

export { deletePack };
