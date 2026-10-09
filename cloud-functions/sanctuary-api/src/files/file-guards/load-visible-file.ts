/* @layer root-config @kind logic */
import { canSeeType } from '@rotp/hub-contracts';
import type { SanctuaryFile } from '@rotp/hub-contracts';
import { notFound } from '../../../../hub-core/http/http-error';
import type { Member } from '../../../../hub-core/auth/require-member';
import { loadFile } from './load-file';

const loadVisibleFile = async (id: string, { rights }: Member): Promise<SanctuaryFile> => {
  const file = await loadFile(id);
  if (!canSeeType(rights, file.type)) throw notFound('No such file.');
  return file;
};

export { loadVisibleFile };
