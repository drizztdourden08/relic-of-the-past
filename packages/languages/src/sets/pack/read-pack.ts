/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { LanguagePack } from '@rotp/asset-extraction';
import { parseDialogueText } from '@rotp/asset-extraction';
import { payloadDialoguePath } from '../paths';
import { readPayloadMeta } from './read-payload-meta';

const readPack = async (files: FileStore, id: string): Promise<LanguagePack | null> => {
  const meta = await readPayloadMeta(files, id);
  if (!meta) return null;
  const text = await files.readText(payloadDialoguePath(id));
  if (text == null) return null;
  return { meta, lines: parseDialogueText(text) };
};

export { readPack };
