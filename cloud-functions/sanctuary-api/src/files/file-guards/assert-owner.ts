/* @layer root-config @kind logic */
import type { SanctuaryFile } from '../../../../../shared/sanctuary';
import { forbidden } from '../../../../hub-core/http/http-error';
import type { Member } from '../../../../hub-core/auth/require-member';

const assertOwner = (file: SanctuaryFile, { caller }: Member): void => {
  if (file.owner.userId !== caller.userId) throw forbidden('Only the owner can do that.');
};

export { assertOwner };
