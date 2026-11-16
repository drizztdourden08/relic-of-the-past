/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { SetBakeInput } from '../messages';
import { getRomFont, getSet, list as listSets } from '../sets';

const readLanguageSets = async (files: FileStore): Promise<SetBakeInput[]> => {
  const out: SetBakeInput[] = [];
  for (const { id } of await listSets(files)) {
    const set = await getSet(files, id);
    const font = set ? await getRomFont(files, set.base) : null;
    if (!set || !font) continue;
    out.push({ set, fontData: font.fontData, fontWidth: font.fontWidth });
  }
  return out;
};

export { readLanguageSets };
