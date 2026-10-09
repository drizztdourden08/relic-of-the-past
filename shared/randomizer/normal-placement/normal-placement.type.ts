/* @layer shared-game @kind types */
import type { DarkRoomSetting } from '../world/dark-rooms/dark-room.type';
import type { StoryGateSetting } from '../world/story-gates/story-gate.type';
import type { WorldOptions } from '../world/world.type';

interface NormalPlacementParams {
  storyGates?: StoryGateSetting;
  world?: Partial<WorldOptions>;
}

interface NormalStatsParams {
  darkRooms: DarkRoomSetting;
  storyGates: StoryGateSetting | undefined;
  locationCount: number;
  sphereCount: number;
}

type DungeonItemField = 'smallKey' | 'bigKey' | 'map' | 'compass';

export type { DungeonItemField, NormalPlacementParams, NormalStatsParams };
