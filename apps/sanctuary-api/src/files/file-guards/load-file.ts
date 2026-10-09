/* @layer root-config @kind logic */
import type { SanctuaryFile } from '@rotp/hub-contracts';
import { notFound } from '@rotp/hub-server';
import { filesRepo } from '../../db/files-repo';

const loadFile = async (id: string): Promise<SanctuaryFile> => {
  const file = await filesRepo.get(id);
  if (!file || file.status === 'deleted') throw notFound('No such file.');
  return file;
};

export { loadFile };
