/* @layer shared-storage @kind logic */
import { SET_FILES } from './paths.constants';
import { setFilePath } from './set-file-path';

const textPath = (id: string): string => setFilePath(id, SET_FILES.text);

export { textPath };
