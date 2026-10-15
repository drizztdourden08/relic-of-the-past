/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { LanguagePack } from '@rotp/asset-extraction';
import { parseDialogueText } from '@rotp/asset-extraction';
import { fontPath, payloadDialoguePath } from '../paths';
import { readPayloadMeta } from './read-payload-meta';

const readPack = async (files: FileStore, id: string): Promise<LanguagePack | null> => {
  const meta = await readPayloadMeta(files, id);
  if (!meta) return null;
  const text = await files.readText(payloadDialoguePath(id));
  const font = await files.readBytes(fontPath(id));
  if (text == null || !font) return null;
  return { meta, lines: parseDialogueText(text), font: { tiles: Array.from(font), glyphCount: meta.glyphCount } };
};

export { readPack };
