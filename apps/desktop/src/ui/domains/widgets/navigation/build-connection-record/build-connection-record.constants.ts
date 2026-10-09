/* @layer renderer-widgets @kind constants */
import type { ConnectionTag } from '@rotp/game-data';

const RETIRED_TRANSIT: ReadonlySet<ConnectionTag> = new Set<ConnectionTag>([
  'transit:door', 'transit:stairs', 'transit:hole', 'transit:warp',
  'transit:mirror', 'transit:walk', 'transit:swim',
]);

export { RETIRED_TRANSIT };
