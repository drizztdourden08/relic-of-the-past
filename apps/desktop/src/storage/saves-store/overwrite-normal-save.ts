/* @layer renderer-lib @kind logic */
import type { NormalSaveInfo } from '@rotp/game-core';
import { saves } from '@rotp/game-core';
import { platformFiles } from '../platform-files';
import { saveBytes } from './save-bytes';

const overwriteNormalSave = async (p: string, id: string, data: ArrayBuffer, screenshot?: ArrayBuffer): Promise<NormalSaveInfo | null> =>
  saves.overwriteNormalSave(platformFiles(), p, id, await saveBytes.stamped(data), saveBytes.optional(screenshot));

export { overwriteNormalSave };
