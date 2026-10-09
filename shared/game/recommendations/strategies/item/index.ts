/* @layer shared-game @kind barrel */
import { registerStrategy } from '../../compare';
import { itemStrategy } from './item.strategy';

registerStrategy(itemStrategy);

export { itemStrategy } from './item.strategy';
