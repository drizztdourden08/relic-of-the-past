/* @layer shared-game @kind logic */
import type { RecommendationDetector } from '../detection-types';
import { registeredDetectors } from './registered-detectors';

const allDetectors = (): readonly RecommendationDetector[] => [...registeredDetectors.values()];

export { allDetectors };
