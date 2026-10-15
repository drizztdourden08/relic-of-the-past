/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { Variable } from '../../messages';
import { nameTablesFromVariables } from '../../messages';
import { readJson } from '@drizztdourden08/brock-core';
import { variablesPath } from '../paths';
import { asStructure } from './as-structure';
import type { SetContent } from './format-2.type';
import { readHeader } from './read-header';

const readContent = async (files: FileStore, id: string): Promise<SetContent> => {
  const header = await readHeader(files, id);
  const variables = await readJson<Variable[]>(files, variablesPath(id), []);

  return { variables, structure: asStructure(header.structure), ...nameTablesFromVariables(variables) };
};

export { readContent };
