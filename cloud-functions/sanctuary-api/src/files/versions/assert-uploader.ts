/* @layer root-config @kind logic */
import type { FileVersion } from '@rotp/hub-contracts';
import { forbidden } from '@rotp/hub-server';
import type { Member } from '@rotp/hub-server';

const assertUploader = (version: FileVersion, { caller }: Member): void => {
  if (version.by.userId !== caller.userId) throw forbidden('Only the person uploading this version can do that.');
};

export { assertUploader };
