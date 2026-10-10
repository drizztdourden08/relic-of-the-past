/* @layer renderer-lib @kind logic */
import type { NormalSaveInfo } from '@rotp/game-core';
import { saves } from '@rotp/game-core';
import { platformFiles } from '../platform-files';
import { saveBytes } from './save-bytes';

const createNormalSave = async (p: string, name: string, data: ArrayBuffer, screenshot?: ArrayBuffer): Promise<NormalSaveInfo> =>
  saves.createNormalSave(platformFiles(), p, name, { data: await saveBytes.stamped(data), screenshot: saveBytes.optional(screenshot) });

export { createNormalSave };
