/* @layer renderer-lib @kind logic */
import type { NormalSaveInfo } from '@rotp/game-core';
import { normalSaves } from '../save-files';
import { platformFiles } from '../platform-files';
import { saveBytes } from './save-bytes';

const overwriteNormalSave = async (p: string, id: string, data: ArrayBuffer, screenshot?: ArrayBuffer): Promise<NormalSaveInfo | null> =>
  normalSaves.overwrite(platformFiles(), p, id, { data: await saveBytes.stamped(data), screenshot: saveBytes.optional(screenshot) });

export { overwriteNormalSave };
