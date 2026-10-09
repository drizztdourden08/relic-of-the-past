/* @layer root-config @kind logic */
import type { SanctuaryFile } from '../../../../../shared/sanctuary';
import { forbidden } from '../../../../hub-core/http/http-error';
import type { Member } from '../../../../hub-core/auth/require-member';
import { isOwnerOrAdmin } from './is-owner-or-admin';

const assertOwnerOrAdmin = (file: SanctuaryFile, member: Member): void => {
  if (!isOwnerOrAdmin(file, member)) throw forbidden('Only the owner or an admin can do that.');
};

export { assertOwnerOrAdmin };
