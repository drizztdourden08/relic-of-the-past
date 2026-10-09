/* @layer renderer-lib @kind logic */
import type { NormalSaveInfo } from '@shared/types/saves';
import * as saves from '@shared/storage/saves';
import { platformFiles } from '../platform-files';
import { saveBytes } from './save-bytes';

const createNormalSave = async (p: string, name: string, data: ArrayBuffer, screenshot?: ArrayBuffer): Promise<NormalSaveInfo> =>
  saves.createNormalSave(platformFiles(), p, name, await saveBytes.stamped(data), saveBytes.optional(screenshot));

export { createNormalSave };
