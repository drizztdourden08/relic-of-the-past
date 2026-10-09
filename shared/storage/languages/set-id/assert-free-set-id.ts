/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { setDir } from '../paths';
import { assertValidSetId } from './assert-valid-set-id';

const assertFreeSetId = async (files: FileStore, id: string): Promise<void> => {
  assertValidSetId(id);
  if (await files.exists(setDir(id))) throw new Error(`A language set with the id "${id}" already exists.`);
};

export { assertFreeSetId };
