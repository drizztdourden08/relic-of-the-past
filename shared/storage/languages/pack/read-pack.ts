/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { LanguagePack } from '@rotp/asset-extraction';
import { parseDialogueText } from '@rotp/asset-extraction';
import { fontPath, legacyDialoguePath } from '../paths';
import { readLegacyMeta } from './read-legacy-meta';

const readPack = async (files: FileStore, id: string): Promise<LanguagePack | null> => {
  const meta = await readLegacyMeta(files, id);
  if (!meta) return null;
  const text = await files.readText(legacyDialoguePath(id));
  const font = await files.readBytes(fontPath(id));
  if (text == null || !font) return null;
  return { meta, lines: parseDialogueText(text), font: { tiles: Array.from(font), glyphCount: meta.glyphCount } };
};

export { readPack };
