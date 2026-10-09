/* @layer shared-storage @kind logic */
import { SET_FILES } from './paths.constants';
import { setFilePath } from './set-file-path';

const variablesPath = (id: string): string => setFilePath(id, SET_FILES.variables);

export { variablesPath };
