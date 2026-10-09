/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { setDir } from '../paths';

const remove = (files: FileStore, id: string): Promise<void> => files.remove(setDir(id));

export { remove };
