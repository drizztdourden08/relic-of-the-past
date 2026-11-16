/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { fontPath, fontWidthPath } from '../paths';
import type { RomFontBytes } from '../types';

const getRomFont = async (files: FileStore, code: string): Promise<RomFontBytes | null> => {
  const fontData = await files.readBytes(fontPath(code));
  const fontWidth = await files.readBytes(fontWidthPath(code));
  return fontData && fontWidth ? { fontData, fontWidth } : null;
};

export { getRomFont };
