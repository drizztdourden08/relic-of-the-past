/* @layer root-config @kind logic */
/** The checks every file route repeats: the record exists and is not deleted,
 *  and the caller owns it or is an admin. */
import type { SanctuaryFile } from '../../../../shared/sanctuary';
import { forbidden, notFound } from '../http/http-error';
import type { Member } from '../auth/require-access';
import { filesRepo } from '../db/files-repo';

const loadFile = async (id: string): Promise<SanctuaryFile> => {
  const file = await filesRepo.get(id);
  if (!file || file.status === 'deleted') throw notFound('No such file.');
  return file;
};

const isOwnerOrAdmin = (file: SanctuaryFile, { caller, user }: Member): boolean =>
  file.owner.userId === caller.userId || user.access.state === 'admin';

const assertOwnerOrAdmin = (file: SanctuaryFile, member: Member): void => {
  if (!isOwnerOrAdmin(file, member)) throw forbidden('Only the owner or an admin can do that.');
};

const assertOwner = (file: SanctuaryFile, { caller }: Member): void => {
  if (file.owner.userId !== caller.userId) throw forbidden('Only the owner can do that.');
};

export { loadFile, isOwnerOrAdmin, assertOwnerOrAdmin, assertOwner };
