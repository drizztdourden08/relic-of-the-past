/* @layer electron-main @kind logic */
/**
 * The language extras one asset-blob compile bakes in, on the desktop host:
 * read every stored language set (its edited dialogue/glossary/name payload
 * plus its font pair) straight off the Data directory, then compile each into
 * a packed entry. A set that fails to compile is warned about and skipped, so
 * one broken translation never blocks the blob.
 */
import type { PackedLangEntry } from '@shared/asset-extraction/text/build-language-entry';
import { compileSets } from '@shared/game/language';
import { readLanguageSets } from '@shared/storage/assets';
import { createNodeFileStore } from '../lib/node-file-store';
import { logToRenderer } from '../lib/renderer-log';

const loadCompiledLanguages = async (): Promise<PackedLangEntry[]> => {
  const inputs = await readLanguageSets(createNodeFileStore());
  return compileSets(inputs, (message) => logToRenderer('app', 'warn', message));
};

export { loadCompiledLanguages };
