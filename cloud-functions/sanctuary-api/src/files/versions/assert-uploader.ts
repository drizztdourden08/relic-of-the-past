/* @layer root-config @kind logic */
import type { FileVersion } from '@rotp/hub-contracts';
import { forbidden } from '../../../../hub-core/http/http-error';
import type { Member } from '../../../../hub-core/auth/require-member';

const assertUploader = (version: FileVersion, { caller }: Member): void => {
  if (version.by.userId !== caller.userId) throw forbidden('Only the person uploading this version can do that.');
};

export { assertUploader };
