/* @layer electron-main @kind logic */
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { MSU_SIDECAR_SUFFIX } from '@shared/storage/save-paths';
import { removeIfPresent } from '../remove-if-present';
import { getQuickSavesDir } from './get-quick-saves-dir';

const writeQuickState = async (profileId: string, slot: number, data: Buffer): Promise<void> => {
  const quickDir = getQuickSavesDir(profileId);
  await mkdir(quickDir, { recursive: true });
  await writeFile(join(quickDir, `save${slot}.sav`), data);
  await removeIfPresent(join(quickDir, `save${slot}${MSU_SIDECAR_SUFFIX}`));
};

export { writeQuickState };
