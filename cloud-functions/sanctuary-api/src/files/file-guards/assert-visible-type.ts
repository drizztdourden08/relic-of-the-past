/* @layer root-config @kind logic */
import { canSeeType } from '@rotp/hub-contracts';
import type { FileType } from '@rotp/hub-contracts';
import { notFound } from '../../../../hub-core/http/http-error';
import type { Member } from '../../../../hub-core/auth/require-member';

const assertVisibleType = (type: FileType, { rights }: Member): void => {
  if (!canSeeType(rights, type)) throw notFound('Pick a file type you can see.');
};

export { assertVisibleType };
