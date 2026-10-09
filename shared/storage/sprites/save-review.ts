/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { writeJson } from '@drizztdourden08/brock-core';
import { SPRITE_REVIEW_FILE } from './sprites.constants';

const saveReview = (files: FileStore, data: unknown) => writeJson(files, SPRITE_REVIEW_FILE, data);

export { saveReview };
