/* @layer shared-game @kind barrel */
/**
 * Importing this barrel is what installs these built-in detectors: each is
 * registered as a side effect, exactly like the renderer-side adapters'
 * barrel does for `connection-add`/`connection-remove`/`connection-shape`/
 * `screen-identity`. This one lives in `shared/` rather than next to those
 * because none of these wrap an existing renderer-only helper — they are
 * new pure logic over `DetectionContext`, so nothing here needs to reach up
 * into `@app/*`.
 */
import { registerDetector } from '../registry';
import { actorCombatDetector } from './actor-combat';
import { actorSpawnsDetector } from './actor-spawns';
import { checkPresenceDetector } from './check-presence';
import { dungeonRoomsDetector } from './dungeon-rooms';
import { itemGrantsDetector } from './item-grants';

registerDetector(actorSpawnsDetector);
registerDetector(actorCombatDetector);
registerDetector(checkPresenceDetector);
registerDetector(dungeonRoomsDetector);
registerDetector(itemGrantsDetector);

export { actorCombatDetector } from './actor-combat';
export { actorSpawnsDetector } from './actor-spawns';
export { checkPresenceDetector } from './check-presence';
export { dungeonRoomsDetector } from './dungeon-rooms';
export { itemGrantsDetector } from './item-grants';
