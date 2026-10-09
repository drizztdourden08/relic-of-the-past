/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { deleteMsuResume } from '../../msu-resume';
import { quickDir } from '../../save-paths';

const writeState = async (files: FileStore, p: string, slot: number, data: Uint8Array): Promise<void> => {
  await files.writeBytes(`${quickDir(p)}/save${slot}.sav`, data);
  await deleteMsuResume(files, p, 'quick', slot);
};

export { writeState };
