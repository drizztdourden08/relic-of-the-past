/* @layer shared-storage @kind logic */
import { createMemFileStore } from '@shared/platform/mem-file-store';
import { importRlang } from './import-rlang';
import { getSet, getSetFont } from './read';
import type { RlangContents } from './read-rlang-bytes.type';

const readRlangBytes = async (bytes: Uint8Array): Promise<RlangContents> => {
  const files = createMemFileStore();
  const { id } = await importRlang(files, bytes);
  const set = await getSet(files, id);
  if (!set) throw new Error('This language set was unpacked but could not be opened.');
  return { set, font: await getSetFont(files, id) };
};

export { readRlangBytes };
export type { RlangContents };
