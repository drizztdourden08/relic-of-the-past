/* @layer renderer-components @kind logic */
import { getItemSprite } from '@rotp/game-data';
import type { ItemId } from '@rotp/game-data';
import { EVENT_MARK } from '../ChecksTracker.constants';

const cardSpriteOf = (isEvent: boolean, shownId: ItemId | undefined): string | undefined => {
  if (isEvent) return EVENT_MARK;
  return shownId ? getItemSprite(shownId) : undefined;
};

export { cardSpriteOf };
