/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { fontPath, fontWidthPath } from '../paths';
import type { RomFontBytes } from '../types';

const writeRomFont = async (files: FileStore, code: string, font: RomFontBytes): Promise<void> => {
  await files.writeBytes(fontPath(code), font.fontData);
  await files.writeBytes(fontWidthPath(code), font.fontWidth);
};

export { writeRomFont };
