/* @layer renderer-lib @kind logic */
import { normalSaves } from '../save-files';
import { platformFiles } from '../platform-files';

const deleteNormalSave = (p: string, id: string): Promise<void> => normalSaves.remove(platformFiles(), p, id);

export { deleteNormalSave };
