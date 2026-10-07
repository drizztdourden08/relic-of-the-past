/* @layer shared-storage @kind logic */
/**
 * Opens a `.rlang` archive in memory: the set and its font, with no disk behind them. It runs
 * the ordinary import into a throwaway in-memory store and reads the set back through the
 * ordinary readers, so the archive is checked and upgraded exactly as an install would do it.
 */
import { createMemFileStore } from '@shared/platform/mem-file-store';
import type { LanguageSet } from '@shared/game/language';
import { importRlang } from './import-rlang';
import { getSet, getSetFont } from './read';
import type { SetFontBytes } from './types';

type RlangContents = {
  set: LanguageSet;
  /** The glyph tiles and widths; null when the archive carries none. */
  font: SetFontBytes | null;
};

/** The set inside `bytes`. Throws the import's own messages for an archive that is not a set. */
const readRlangBytes = async (bytes: Uint8Array): Promise<RlangContents> => {
  const files = createMemFileStore();
  const { id } = await importRlang(files, bytes);
  const set = await getSet(files, id);
  if (!set) throw new Error('This language set was unpacked but could not be opened.');
  return { set, font: await getSetFont(files, id) };
};

export { readRlangBytes };
export type { RlangContents };
