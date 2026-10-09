/* @layer renderer-lib @kind logic */
import { saves } from '@rotp/game-core';
import { platformFiles } from '../platform-files';

const deleteAutoSave = (p: string, id: string): Promise<void> => saves.deleteAutoSave(platformFiles(), p, id);

export { deleteAutoSave };
