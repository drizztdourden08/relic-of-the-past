/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { readJson } from '@drizztdourden08/brock-core';
import { SPRITE_DEBUG_FILE } from './sprites.constants';

const loadDebug = (files: FileStore) => readJson<Record<string, unknown>>(files, SPRITE_DEBUG_FILE, {});

export { loadDebug };
