/* @layer renderer-widgets @kind logic */
import { registerDetector, detectorFromStrategy } from '@rotp/navigation';
import { connectionStrategy } from './connection-strategy';
import { onUnresolvableConnection } from './unresolvable-screen';

registerDetector(detectorFromStrategy(connectionStrategy, onUnresolvableConnection));
