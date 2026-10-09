/* @layer test @kind helper */
import { detectorFromStrategy } from '@rotp/navigation';
import { screenStrategy } from '@rotp/navigation';

const screenDetector = detectorFromStrategy(screenStrategy);

export { screenDetector };
