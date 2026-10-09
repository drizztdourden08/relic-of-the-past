/* @layer bridge-wasm @kind types */
import type { StoryGateSetting } from '../../world/story-gates/story-gate.type';
import type { DarkRoomSetting } from '@rotp/game-core';
import type { ItemPowerSetting } from '@rotp/game-core';
import type { RetroBowSetting } from '../../world/retro/retro.type';
import type { RetroShelfStock } from '../../world/retro/retro-shops';
import type {
  ProgressiveModeSetting, ProgressiveSetting,
} from '../../world/progressive/progressive.type';

interface ItemBehaviorPlan {
  tiers: ProgressiveSetting;
  modes: ProgressiveModeSetting;
  itemPower: ItemPowerSetting;
  darkRooms: DarkRoomSetting;
  retroBow: RetroBowSetting;
  storyGates: StoryGateSetting;
  retroShelves: readonly RetroShelfStock[];
  vanilla: boolean;
}

export type { ItemBehaviorPlan };
