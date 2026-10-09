/* @layer electron-main @kind logic */
import type { RecommendationStorage } from '@rotp/navigation';
import { writeJsonFile } from '@drizztdourden08/brock-electron/main';
import { loadRecommendationFile } from './load-recommendation-file';
import { recommendationFilePath } from './recommendation-file-path';

const recommendationStorage: RecommendationStorage = {
  load: (kind) => loadRecommendationFile(kind),
  save: (kind, entries) => writeJsonFile(recommendationFilePath(kind), entries),
};

export { recommendationStorage };
