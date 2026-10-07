/* @layer renderer-components @kind logic */
/** A language pack's set and its drawable font, opened in memory. */
import { readRlangBytes } from '@shared/storage/languages/read-rlang-bytes';
import type { LanguageSet } from '@shared/game/language';
import { setFontAssets } from '../../../language/behavior/set-font-assets';
import type { SetFontAssets } from '../../../language/behavior/set-font-assets';
import type { PackSource } from '../../../pack-source.type';

type LanguagePack = {
  set: LanguageSet;
  font: SetFontAssets | null;
};

const readLanguagePack = async (source: PackSource): Promise<LanguagePack> => {
  const { set, font } = await readRlangBytes(await source.range(0, source.bytes));
  return { set, font: font ? setFontAssets(font, set.base) : null };
};

export { readLanguagePack };
export type { LanguagePack };
