/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { readJson } from '../json';
import { SPRITE_DEBUG_FILE } from './sprites.constants';

const loadDebug = (files: FileStore) => readJson<Record<string, unknown>>(files, SPRITE_DEBUG_FILE, {});

export { loadDebug };
