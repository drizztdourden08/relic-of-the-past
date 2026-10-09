/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { quickDir } from '../../save-paths';

const readScreenshot = (files: FileStore, p: string, slot: number): Promise<Uint8Array | null> =>
  files.readBytes(`${quickDir(p)}/save${slot}.png`);

export { readScreenshot };
