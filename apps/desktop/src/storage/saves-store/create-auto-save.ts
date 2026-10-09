/* @layer renderer-lib @kind logic */
import type { AutoSaveInfo } from '@rotp/game-core';
import { saves } from '@rotp/game-core';
import { platformFiles } from '../platform-files';
import { saveBytes } from './save-bytes';

const createAutoSave = async (p: string, trigger: 'timer' | 'quit', data: ArrayBuffer, screenshot?: ArrayBuffer): Promise<AutoSaveInfo> =>
  saves.createAutoSave(platformFiles(), p, trigger, await saveBytes.stamped(data), saveBytes.optional(screenshot));

export { createAutoSave };
