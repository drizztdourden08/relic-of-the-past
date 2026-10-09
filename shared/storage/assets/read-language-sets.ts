/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import type { SetBakeInput } from '@shared/game/language';
import { getSet, getSetFont, list as listSets } from '../languages';

const readLanguageSets = async (files: FileStore): Promise<SetBakeInput[]> => {
  const out: SetBakeInput[] = [];
  for (const { id } of await listSets(files)) {
    const set = await getSet(files, id);
    const font = await getSetFont(files, id);
    if (!set || !font) continue;
    out.push({ set, fontData: font.fontData, fontWidth: font.fontWidth });
  }
  return out;
};

export { readLanguageSets };
