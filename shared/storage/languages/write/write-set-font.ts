/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { fontPath, fontWidthPath } from '../paths';
import type { SetFontBytes } from '../types';

const writeSetFont = async (files: FileStore, id: string, font: SetFontBytes): Promise<void> => {
  await files.writeBytes(fontPath(id), font.fontData);
  await files.writeBytes(fontWidthPath(id), font.fontWidth);
};

export { writeSetFont };
