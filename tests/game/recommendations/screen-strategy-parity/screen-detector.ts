/* @layer test @kind helper */
import { detectorFromStrategy, screenStrategy } from '@rotp/navigation';

const screenDetector = detectorFromStrategy(screenStrategy);

export { screenDetector };
