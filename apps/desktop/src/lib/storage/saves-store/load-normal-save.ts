/* @layer renderer-lib @kind logic */
import { saves } from '@rotp/game-core';
import { platformFiles } from '../platform-files';
import { saveBytes } from './save-bytes';

const loadNormalSave = async (p: string, id: string): Promise<ArrayBuffer | null> =>
  saveBytes.toArrayBuffer(await saves.loadNormalSave(platformFiles(), p, id));

export { loadNormalSave };
