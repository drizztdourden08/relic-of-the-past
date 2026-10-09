/* @layer shared-game @kind logic */
import type { RecommendationDetector } from '../detection-types';

const registeredDetectors = new Map<string, RecommendationDetector>();

export { registeredDetectors };
