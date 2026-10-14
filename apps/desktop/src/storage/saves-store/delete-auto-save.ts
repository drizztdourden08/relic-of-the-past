/* @layer renderer-lib @kind logic */
import { autoSaves } from '../save-files';
import { platformFiles } from '../platform-files';

const deleteAutoSave = (p: string, id: string): Promise<void> => autoSaves.remove(platformFiles(), p, id);

export { deleteAutoSave };
