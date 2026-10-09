/* @layer electron-main @kind logic */
import type { PackedLangEntry } from '@rotp/asset-extraction';
import { compileSets } from '@shared/game/language';
import { readLanguageSets } from '@shared/storage/assets';
import { createNodeFileStore } from '../lib/node-file-store';
import { logToRenderer } from '../lib/renderer-log';

const loadCompiledLanguages = async (): Promise<PackedLangEntry[]> => {
  const inputs = await readLanguageSets(createNodeFileStore());
  return compileSets(inputs, (message) => logToRenderer('app', 'warn', message));
};

export { loadCompiledLanguages };
