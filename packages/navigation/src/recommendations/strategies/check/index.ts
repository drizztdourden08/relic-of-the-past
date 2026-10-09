/* @layer shared-game @kind barrel */
import { registerStrategy } from '../../compare';
import { checkStrategy } from './check-strategy';

registerStrategy(checkStrategy);

export { checkStrategy } from './check-strategy';
