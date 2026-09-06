/* @layer renderer-widgets @kind barrel */
/**
 * Importing this barrel installs the `connection` comparison strategy.
 * Direction is derived from `canExit` (`data/connections/derive.ts`), so
 * there is no `dir:` tag left to backfill.
 */
import { registerStrategy } from '@shared/game/recommendations/compare';
import { connectionStrategy } from './connection.strategy';

registerStrategy(connectionStrategy);

export { connectionStrategy } from './connection.strategy';
