/* @layer shared-game @kind constants */
import { WORLD_EVENT_IDS } from './story-events.data';
import type { CheckId } from '@rotp/game-data';

const WORLD_EVENTS: ReadonlySet<CheckId> = new Set(WORLD_EVENT_IDS);

export { WORLD_EVENTS };
