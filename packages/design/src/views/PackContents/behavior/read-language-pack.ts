/* @layer renderer-components @kind logic */
import { readRlangBytes } from '@rotp/languages';
import type { PackSource } from '../../../packs/pack-source.type';
import type { LanguagePack } from '../PackContents.type';

const readLanguagePack = async (source: PackSource): Promise<LanguagePack> => {
  const { set } = await readRlangBytes(await source.range(0, source.bytes));
  return { set, font: null };
};

export { readLanguagePack };
