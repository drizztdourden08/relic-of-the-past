/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { readJson } from '@drizztdourden08/brock-core';
import { SPRITE_REVIEW_FILE } from './sprites.constants';

const loadReview = (files: FileStore) => readJson<Record<string, unknown>>(files, SPRITE_REVIEW_FILE, {});

export { loadReview };
