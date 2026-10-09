/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { LanguageSet } from '../../messages';
import { writeJson } from '@drizztdourden08/brock-core';
import { variablesPath } from '../paths';
import { variablesOf } from './variables-of';
import { writeHeader } from './write-header';

const writeContent = async (files: FileStore, set: LanguageSet): Promise<void> => {
  await writeHeader(files, set);
  await writeJson(files, variablesPath(set.id), variablesOf(set));
};

export { writeContent };
