/* @layer root-config @kind logic */
import type { SanctuaryFile } from '@rotp/hub-contracts';
import type { Member } from '@rotp/hub-server';

const isOwnerOrAdmin = (file: SanctuaryFile, { caller, access }: Member): boolean =>
  file.owner.userId === caller.userId || access.state === 'admin';

export { isOwnerOrAdmin };
