/* @layer shared-storage @kind logic */
import { SET_FILES } from '@rotp/hub-contracts';
import { setFilePath } from './set-file-path';

const dialoguePath = (id: string): string => setFilePath(id, SET_FILES.dialogue);

export { dialoguePath };
