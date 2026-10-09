/* @layer electron-main @kind logic */
import type { RecommendationStorage } from '@shared/game/recommendations';
import { writeJson } from '../../lib/json-store';
import { loadRecommendationFile } from './load-recommendation-file';
import { recommendationFilePath } from './recommendation-file-path';

const recommendationStorage: RecommendationStorage = {
  load: (kind) => loadRecommendationFile(kind),
  save: (kind, entries) => writeJson(recommendationFilePath(kind), entries),
};

export { recommendationStorage };
