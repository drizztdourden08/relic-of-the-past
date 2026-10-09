/* @layer renderer-widgets @kind barrel */
import { registerStrategy } from '@shared/game/recommendations/compare';
import { connectionStrategy } from './connection.strategy';

registerStrategy(connectionStrategy);

export { connectionStrategy } from './connection.strategy';
