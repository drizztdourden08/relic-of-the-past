/* @layer root-config @kind logic */
import type { SanctuaryFile } from '@rotp/hub-contracts';
import { forbidden } from '@rotp/hub-server';
import type { Member } from '@rotp/hub-server';
import { isOwnerOrAdmin } from './is-owner-or-admin';

const assertOwnerOrAdmin = (file: SanctuaryFile, member: Member): void => {
  if (!isOwnerOrAdmin(file, member)) throw forbidden('Only the owner or an admin can do that.');
};

export { assertOwnerOrAdmin };
