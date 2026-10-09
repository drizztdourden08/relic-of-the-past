/* @layer root-config @kind logic */
import { canSeeType } from '@rotp/hub-contracts';
import type { SanctuaryFile } from '@rotp/hub-contracts';
import { notFound } from '@rotp/hub-server';
import type { Member } from '@rotp/hub-server';
import { loadFile } from './load-file';

const loadVisibleFile = async (id: string, { rights }: Member): Promise<SanctuaryFile> => {
  const file = await loadFile(id);
  if (!canSeeType(rights, file.type)) throw notFound('No such file.');
  return file;
};

export { loadVisibleFile };
