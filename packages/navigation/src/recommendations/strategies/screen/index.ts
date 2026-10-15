/* @layer shared-game @kind barrel */
import { registerStrategy } from '../../compare';
import { registerDetector } from '../../registry';
import { screenGeographyDetector } from './screen-geography-detector';
import { screenStrategy } from './screen-strategy';

registerStrategy(screenStrategy);
registerDetector(screenGeographyDetector);

export { screenStrategy } from './screen-strategy';
