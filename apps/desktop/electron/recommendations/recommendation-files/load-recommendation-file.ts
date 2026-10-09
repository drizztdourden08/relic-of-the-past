/* @layer electron-main @kind logic */
import type { EntityKind } from '@shared/game/data';
import type { Recommendation } from '@shared/game/recommendations';
import { readJson } from '../../lib/json-store';
import { recommendationFilePath } from './recommendation-file-path';

const loadRecommendationFile = (kind: EntityKind): Promise<readonly Recommendation[]> =>
  readJson<readonly Recommendation[]>(recommendationFilePath(kind), []);

export { loadRecommendationFile };
