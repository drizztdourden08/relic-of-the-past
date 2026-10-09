/* @layer shared-game @kind types */
import type { ItemId } from '@rotp/game-data';

interface StoryStatus {
  darkWorld: boolean;
  bunny: boolean;
  crystalSwitchFlipped: boolean;
  desertStatuesMoved: boolean;
}

interface PresenceGameState {
  progressFlags: number;
  progressIndicator: number;
  progressIndicator3: number;
  followerIndicator: number;
  inventory: ReadonlySet<ItemId>;
  owEventInfo: ArrayLike<number>;
  roomState: ArrayLike<number>;
  status?: StoryStatus;
}

interface PresenceStateInput {
  progress: ArrayLike<number>;
  owEventInfo: ArrayLike<number>;
  roomState: ArrayLike<number>;
  inventory: ReadonlySet<ItemId>;
  statusBytes?: ArrayLike<number>;
}

export type { StoryStatus, PresenceGameState, PresenceStateInput };
