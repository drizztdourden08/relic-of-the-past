/* @layer renderer-lib @kind logic */
import type { AutoSaveInfo } from '@rotp/game-core';
import { autoSaves } from '../save-files';
import { platformFiles } from '../platform-files';
import { saveBytes } from './save-bytes';

const createAutoSave = async (p: string, trigger: 'timer' | 'quit', data: ArrayBuffer, screenshot?: ArrayBuffer): Promise<AutoSaveInfo> =>
  autoSaves.create(platformFiles(), p, trigger, { data: await saveBytes.stamped(data), screenshot: saveBytes.optional(screenshot) });

export { createAutoSave };
