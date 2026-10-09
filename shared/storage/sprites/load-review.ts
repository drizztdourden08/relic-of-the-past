/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { readJson } from '../json';
import { SPRITE_REVIEW_FILE } from './sprites.constants';

const loadReview = (files: FileStore) => readJson<Record<string, unknown>>(files, SPRITE_REVIEW_FILE, {});

export { loadReview };
