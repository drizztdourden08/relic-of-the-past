/* @layer root-config @kind logic */
import type { SanctuaryFile } from '@rotp/hub-contracts';
import { forbidden } from '@rotp/hub-server';
import type { Member } from '@rotp/hub-server';

const assertOwner = (file: SanctuaryFile, { caller }: Member): void => {
  if (file.owner.userId !== caller.userId) throw forbidden('Only the owner can do that.');
};

export { assertOwner };
