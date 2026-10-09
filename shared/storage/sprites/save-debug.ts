/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { writeJson } from '../json';
import { SPRITE_DEBUG_FILE } from './sprites.constants';

const saveDebug = (files: FileStore, data: unknown) => writeJson(files, SPRITE_DEBUG_FILE, data);

export { saveDebug };
