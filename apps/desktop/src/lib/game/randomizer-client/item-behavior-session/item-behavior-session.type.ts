/* @layer bridge-wasm @kind types */
import type { StoryGateSetting } from '@shared/randomizer/world/story-gates/story-gate.type';
import type { DarkRoomSetting } from '@rotp/game-core';
import type { ItemPowerSetting } from '@rotp/game-core';
import type { RetroBowSetting } from '@shared/randomizer/world/retro/retro.type';
import type { RetroShelfStock } from '@shared/randomizer/world/retro/retro-shops';
import type {
  ProgressiveModeSetting, ProgressiveSetting,
} from '@shared/randomizer/world/progressive/progressive.type';

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
