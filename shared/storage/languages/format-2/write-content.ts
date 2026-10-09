/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import type { LanguageSet } from '@shared/game/language';
import { writeJson } from '../../json';
import { variablesPath } from '../paths';
import { variablesOf } from './variables-of';
import { writeHeader } from './write-header';

const writeContent = async (files: FileStore, set: LanguageSet): Promise<void> => {
  await writeHeader(files, set);
  await writeJson(files, variablesPath(set.id), variablesOf(set));
};

export { writeContent };
