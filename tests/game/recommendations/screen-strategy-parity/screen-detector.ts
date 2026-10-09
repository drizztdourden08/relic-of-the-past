/* @layer test @kind helper */
import { detectorFromStrategy } from '@shared/game/recommendations/compare';
import { screenStrategy } from '@shared/game/recommendations/strategies/screen';

const screenDetector = detectorFromStrategy(screenStrategy);

export { screenDetector };
