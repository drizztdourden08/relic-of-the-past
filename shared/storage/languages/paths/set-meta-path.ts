/* @layer shared-storage @kind logic */
import { SET_FILES } from './paths.constants';
import { setFilePath } from './set-file-path';

const setMetaPath = (id: string): string => setFilePath(id, SET_FILES.meta);

export { setMetaPath };
