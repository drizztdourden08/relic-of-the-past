/* @layer shared-game @kind barrel */
import { registerStrategy } from '../../compare';
import { dungeonStrategy } from './dungeon.strategy';

registerStrategy(dungeonStrategy);

export { dungeonStrategy } from './dungeon.strategy';
