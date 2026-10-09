/* @layer shared-game @kind logic */
import type { ItemId } from '@rotp/game-data';
import type { PresenceGameState } from '../presence.type';

const emptyPresenceState = (): PresenceGameState => ({
  progressFlags: 0,
  progressIndicator: 0,
  progressIndicator3: 0,
  followerIndicator: 0,
  inventory: new Set<ItemId>(),
  owEventInfo: [],
  roomState: [],
});

export { emptyPresenceState };
