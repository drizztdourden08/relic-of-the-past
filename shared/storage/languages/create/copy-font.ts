/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { getSetFont } from '../read';
import { writeSetFont } from '../write';

const copyFont = async (files: FileStore, fromId: string, toId: string): Promise<void> => {
  const font = await getSetFont(files, fromId);
  if (!font) throw new Error(`Language set "${fromId}" has no font files to copy.`);
  await writeSetFont(files, toId, font);
};

export { copyFont };
