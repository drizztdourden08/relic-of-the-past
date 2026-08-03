/* @layer renderer-widgets @kind barrel */
/**
 * Importing this barrel is what installs the built-in detectors: each is
 * registered as a side effect, so a consumer only ever calls `runDetection`.
 */
import { registerDetector } from '@shared/game/recommendations';
import { connectionAddDetector } from './connection-add';
import { connectionRemoveDetector } from './connection-remove';
import { connectionShapeDetector } from './connection-shape';
import { screenIdentityDetector } from './screen-identity';

registerDetector(screenIdentityDetector);
registerDetector(connectionAddDetector);
registerDetector(connectionRemoveDetector);
registerDetector(connectionShapeDetector);

export { connectionAddDetector } from './connection-add';
export { connectionRemoveDetector } from './connection-remove';
export { connectionShapeDetector } from './connection-shape';
export { screenIdentityDetector } from './screen-identity';
