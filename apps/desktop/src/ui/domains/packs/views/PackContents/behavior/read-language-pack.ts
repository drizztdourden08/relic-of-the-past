/* @layer renderer-components @kind logic */
import { readRlangBytes } from '@shared/storage/languages/read-rlang-bytes';
import { setFontAssets } from '../../../language/behavior/set-font-assets';
import type { PackSource } from '../../../pack-source.type';
import type { LanguagePack } from '../PackContents.type';

const readLanguagePack = async (source: PackSource): Promise<LanguagePack> => {
  const { set, font } = await readRlangBytes(await source.range(0, source.bytes));
  return { set, font: font ? setFontAssets(font, set.base) : null };
};

export { readLanguagePack };
