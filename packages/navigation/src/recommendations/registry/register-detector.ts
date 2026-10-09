/* @layer shared-game @kind logic */
import type { RecommendationDetector } from '../detection-types';
import { registeredDetectors } from './registered-detectors';

const registerDetector = (detector: RecommendationDetector): void => {
  registeredDetectors.set(detector.id, detector);
};

export { registerDetector };
