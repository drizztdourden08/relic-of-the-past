/* @layer shared-game @kind logic */
import type { PresenceGameState, PresenceStateInput, StoryStatus } from '../presence.type';
import {
  FOLLOWER_INDICATOR_SLOT,
  PROGRESS_FLAGS_SLOT,
  PROGRESS_INDICATOR_3_SLOT,
  PROGRESS_INDICATOR_SLOT,
} from '../presence.constants';

const storyStatusOf = (bytes: ArrayLike<number>): StoryStatus => ({
  darkWorld: (bytes[0] ?? 0) !== 0,
  bunny: (bytes[1] ?? 0) !== 0,
  crystalSwitchFlipped: (bytes[2] ?? 0) !== 0,
  desertStatuesMoved: (bytes[3] ?? 0) !== 0,
});

const buildPresenceState = ({ progress, owEventInfo, roomState, inventory, statusBytes }: PresenceStateInput): PresenceGameState => ({
  progressFlags: progress[PROGRESS_FLAGS_SLOT] ?? 0,
  progressIndicator: progress[PROGRESS_INDICATOR_SLOT] ?? 0,
  progressIndicator3: progress[PROGRESS_INDICATOR_3_SLOT] ?? 0,
  followerIndicator: progress[FOLLOWER_INDICATOR_SLOT] ?? 0,
  inventory,
  owEventInfo,
  roomState,
  ...(statusBytes !== undefined ? { status: storyStatusOf(statusBytes) } : {}),
});

export { buildPresenceState };
