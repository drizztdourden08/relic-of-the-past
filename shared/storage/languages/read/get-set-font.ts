/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { fontPath, fontWidthPath } from '../paths';
import type { SetFontBytes } from '../types';

const getSetFont = async (files: FileStore, id: string): Promise<SetFontBytes | null> => {
  const fontData = await files.readBytes(fontPath(id));
  const fontWidth = await files.readBytes(fontWidthPath(id));
  return fontData && fontWidth ? { fontData, fontWidth } : null;
};

export { getSetFont };
