/* @layer shared-storage @kind logic */
import { SET_FILES } from './paths.constants';
import { setFilePath } from './set-file-path';

const legacyDialoguePath = (id: string): string => setFilePath(id, SET_FILES.legacyDialogue);

export { legacyDialoguePath };
