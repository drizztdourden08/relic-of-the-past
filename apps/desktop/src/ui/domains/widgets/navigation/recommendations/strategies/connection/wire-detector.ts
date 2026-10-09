/* @layer renderer-widgets @kind logic */
import { registerDetector } from '@shared/game/recommendations';
import { detectorFromStrategy } from '@shared/game/recommendations/compare';
import { connectionStrategy } from './connection.strategy';
import { onUnresolvableConnection } from './unresolvable-screen';

registerDetector(detectorFromStrategy(connectionStrategy, onUnresolvableConnection));
