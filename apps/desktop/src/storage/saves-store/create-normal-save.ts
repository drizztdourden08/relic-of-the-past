/* @layer renderer-lib @kind logic */
import type { NormalSaveInfo } from '@rotp/game-core';
import { normalSaves } from '../save-files';
import { platformFiles } from '../platform-files';
import { saveBytes } from './save-bytes';

const createNormalSave = async (p: string, name: string, data: ArrayBuffer, screenshot?: ArrayBuffer): Promise<NormalSaveInfo> =>
  normalSaves.create(platformFiles(), p, name, { data: await saveBytes.stamped(data), screenshot: saveBytes.optional(screenshot) });

export { createNormalSave };
