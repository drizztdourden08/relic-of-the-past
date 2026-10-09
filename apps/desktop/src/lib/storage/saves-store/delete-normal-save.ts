/* @layer renderer-lib @kind logic */
import { saves } from '@rotp/game-core';
import { platformFiles } from '../platform-files';

const deleteNormalSave = (p: string, id: string): Promise<void> => saves.deleteNormalSave(platformFiles(), p, id);

export { deleteNormalSave };
