/* @layer electron-main @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { Recommendation } from '@rotp/navigation';
import { readJsonFile } from '@drizztdourden08/brock-electron/node';
import { recommendationFilePath } from './recommendation-file-path';

const loadRecommendationFile = (kind: EntityKind): Promise<readonly Recommendation[]> =>
  readJsonFile<readonly Recommendation[]>(recommendationFilePath(kind), []);

export { loadRecommendationFile };
