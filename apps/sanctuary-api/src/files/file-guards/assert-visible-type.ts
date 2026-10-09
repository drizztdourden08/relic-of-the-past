/* @layer root-config @kind logic */
import { canSeeType } from '@rotp/hub-contracts';
import type { FileType } from '@rotp/hub-contracts';
import { notFound } from '@rotp/hub-server';
import type { Member } from '@rotp/hub-server';

const assertVisibleType = (type: FileType, { rights }: Member): void => {
  if (!canSeeType(rights, type)) throw notFound('Pick a file type you can see.');
};

export { assertVisibleType };
