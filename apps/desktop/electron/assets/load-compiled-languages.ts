/* @layer electron-main @kind logic */
import type { PackedLangEntry, RomData } from '@rotp/asset-extraction';
import { compileSets, readLanguageSets } from '@rotp/languages';
import { createNodeFileStore } from '../lib/node-file-store';
import { logToRenderer } from '../lib/renderer-log';
import { ensureRomFont } from './ensure-rom-font';

const loadCompiledLanguages = async (rom: RomData): Promise<PackedLangEntry[]> => {
  const files = createNodeFileStore();
  const lacking = await ensureRomFont(files, rom);
  if (lacking.length > 0) {
    logToRenderer('app', 'warn', `Language sets on ${lacking.join(', ')} skipped: that base font is missing. Import that language's ROM first.`);
  }
  const inputs = await readLanguageSets(files);
  return compileSets(inputs, (message) => logToRenderer('app', 'warn', message));
};

export { loadCompiledLanguages };
