/* @layer shared-storage @kind logic */
import { SET_FILES } from './paths.constants';
import { setFilePath } from './set-file-path';

const namesPath = (id: string): string => setFilePath(id, SET_FILES.names);

export { namesPath };
