/* @layer shared-game @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { RecommendationDetector } from '../detection-types';
import { allDetectors } from './all-detectors';

const detectorsFor = (kind: EntityKind): readonly RecommendationDetector[] =>
  allDetectors().filter(detector => detector.kinds.includes(kind));

export { detectorsFor };
