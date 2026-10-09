/* @layer shared-game @kind barrel */
import { registerStrategy } from '../../compare';
import { actorStrategy } from './actor-strategy';

registerStrategy(actorStrategy);

export { actorStrategy } from './actor-strategy';
