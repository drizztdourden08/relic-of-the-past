/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { LanguageSet } from '../../messages';
import { screensPath } from '../paths';
import { encodeScreens } from '../screens-codec';

const writeScreens = async (files: FileStore, set: LanguageSet): Promise<void> => {
  if (set.screens) await files.writeText(screensPath(set.id), encodeScreens(set.screens));
};

export { writeScreens };
