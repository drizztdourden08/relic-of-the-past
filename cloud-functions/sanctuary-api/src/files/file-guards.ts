/* @layer root-config @kind logic */
/** The checks every file route repeats: the record exists, is not deleted and
 *  is of a type the caller can see, and the caller owns it or is an admin. An
 *  unseen type answers as missing, so a shelf never shows through an error. */
import type { FileType, SanctuaryFile } from '../../../../shared/sanctuary';
import { forbidden, notFound } from '../http/http-error';
import type { Member } from '../auth/require-access';
import { canSeeType } from '../access/can-see';
import { filesRepo } from '../db/files-repo';

const loadFile = async (id: string): Promise<SanctuaryFile> => {
  const file = await filesRepo.get(id);
  if (!file || file.status === 'deleted') throw notFound('No such file.');
  return file;
};

const loadVisibleFile = async (id: string, { rights }: Member): Promise<SanctuaryFile> => {
  const file = await loadFile(id);
  if (!canSeeType(rights, file.type)) throw notFound('No such file.');
  return file;
};

/** Uploading to or moving into a type is refused the same way as reading one. */
const assertVisibleType = (type: FileType, { rights }: Member): void => {
  if (!canSeeType(rights, type)) throw notFound('Pick a file type you can see.');
};

const isOwnerOrAdmin = (file: SanctuaryFile, { caller, user }: Member): boolean =>
  file.owner.userId === caller.userId || user.access.state === 'admin';

const assertOwnerOrAdmin = (file: SanctuaryFile, member: Member): void => {
  if (!isOwnerOrAdmin(file, member)) throw forbidden('Only the owner or an admin can do that.');
};

const assertOwner = (file: SanctuaryFile, { caller }: Member): void => {
  if (file.owner.userId !== caller.userId) throw forbidden('Only the owner can do that.');
};

export { loadFile, loadVisibleFile, assertVisibleType, isOwnerOrAdmin, assertOwnerOrAdmin, assertOwner };
