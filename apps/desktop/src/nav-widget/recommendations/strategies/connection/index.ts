/* @layer renderer-widgets @kind barrel */
import { registerStrategy } from '@rotp/navigation';
import { connectionStrategy } from './connection-strategy';

registerStrategy(connectionStrategy);

export { connectionStrategy } from './connection-strategy';
