/* @layer root-config @kind logic */
import type { SanctuaryFile } from '@rotp/hub-contracts';
import type { Member } from '../../../../hub-core/auth/require-member';

const isOwnerOrAdmin = (file: SanctuaryFile, { caller, access }: Member): boolean =>
  file.owner.userId === caller.userId || access.state === 'admin';

export { isOwnerOrAdmin };
