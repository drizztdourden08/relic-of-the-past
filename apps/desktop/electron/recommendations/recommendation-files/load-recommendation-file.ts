/* @layer electron-main @kind logic */
import type { EntityKind } from '@shared/game/data';
import type { Recommendation } from '@shared/game/recommendations';
import { readJsonFile } from '@drizztdourden08/brock-electron/main';
import { recommendationFilePath } from './recommendation-file-path';

const loadRecommendationFile = (kind: EntityKind): Promise<readonly Recommendation[]> =>
  readJsonFile<readonly Recommendation[]>(recommendationFilePath(kind), []);

export { loadRecommendationFile };
