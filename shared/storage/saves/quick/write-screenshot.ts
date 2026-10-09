/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { quickDir } from '../../save-paths';

const writeScreenshot = (files: FileStore, p: string, slot: number, data: Uint8Array): Promise<void> =>
  files.writeBytes(`${quickDir(p)}/save${slot}.png`, data);

export { writeScreenshot };
