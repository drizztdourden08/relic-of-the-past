/* @layer renderer-widgets @kind barrel */
/**
 * Importing this barrel installs the `connection` comparison strategy —
 * together with `nav.probe.ts`'s tile-data fix, it replaces `connection-shape.ts`
 * (deleted). The `dir:` tag detector that used to ride alongside it is gone:
 * the connection-model migration retired the whole `dir:*` tag namespace, so
 * there is no longer a tag to backfill (direction is derived from `canExit`,
 * see `data/connections/derive.ts`).
 */
import { registerStrategy } from '@shared/game/recommendations/compare';
import { connectionStrategy } from './connection.strategy';

registerStrategy(connectionStrategy);

export { connectionStrategy } from './connection.strategy';
