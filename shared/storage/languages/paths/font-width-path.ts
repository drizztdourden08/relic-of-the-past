/* @layer shared-storage @kind logic */
import { SET_FILES } from '@rotp/hub-contracts';
import { setFilePath } from './set-file-path';

const fontWidthPath = (id: string): string => setFilePath(id, SET_FILES.fontWidth);

export { fontWidthPath };
