/* @layer renderer-lib @kind types */
import type { AccessibilityMode } from '@shared/randomizer/world/accessibility/accessibility.type';
import type { CapacityBonusSetting, CapacityProfile } from '@shared/randomizer/world/capacity';
import type { DifficultySetting } from '@shared/randomizer/world/difficulty/difficulty.type';
import type { DungeonItemMode } from '@shared/randomizer/world/dungeon-items/dungeon-item.type';
import type { ItemPowerSetting } from '@rotp/game-core';
import type { ProgressiveModeSetting, ProgressiveSetting } from '@shared/randomizer/world/progressive/progressive.type';
import type { RetroBowSetting } from '@shared/randomizer/world/retro/retro.type';
import type { OptionValue } from '@shared/randomizer/world/options.type';
import type { PondProfiles } from '@shared/randomizer/world/pond/pond-profiles.type';
import type { ShopScope } from '@shared/randomizer/world/shops/shop-scope.type';
import type { StoryGateSetting } from '@shared/randomizer/world/story-gates/story-gate.type';

interface RandomizerOptionChoices {
  keyDropShuffle: boolean;
  includeNpcChecks: boolean;
  includeWorldItems: boolean;
  bigKeyShuffle: DungeonItemMode;
  smallKeyShuffle: DungeonItemMode;
  compassShuffle: DungeonItemMode;
  mapShuffle: DungeonItemMode;
  shops: ShopScope;
  shopPrices: Readonly<Record<string, OptionValue>>;
  shufflePrizes: boolean;
  capacityEnabled: boolean;
  capacity: CapacityProfile;
  capacityProgressive: boolean;
  capacityBonus: CapacityBonusSetting;
  ponds: PondProfiles;
  pondShare?: boolean;
  progressiveTiers: ProgressiveSetting;
  progressiveModes: ProgressiveModeSetting;
  retroBow: RetroBowSetting;
  difficulty: DifficultySetting;
  itemPower: ItemPowerSetting;
  storyGates: StoryGateSetting;
  accessibility: AccessibilityMode;
  darkRoomLightRequired: boolean;
  darkRoomLightLamp: boolean;
  darkRoomLightFireRod: boolean;
  darkRoomLightBombos: boolean;
  darkRoomLightRedCane: boolean;
}

type ChoiceField = Exclude<
  keyof RandomizerOptionChoices,
  'capacity' | 'capacityBonus' | 'capacityEnabled' | 'capacityProgressive' | 'difficulty' | 'itemPower' | 'ponds'
  | 'pondShare' | 'progressiveTiers' | 'progressiveModes' | 'retroBow' | 'shopPrices' | 'shops' | 'storyGates'
>;

export type { ChoiceField, RandomizerOptionChoices };
