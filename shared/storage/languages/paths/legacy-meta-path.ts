/* @layer shared-storage @kind logic */
import { SET_FILES } from './paths.constants';
import { setFilePath } from './set-file-path';

const legacyMetaPath = (id: string): string => setFilePath(id, SET_FILES.legacyMeta);

export { legacyMetaPath };
