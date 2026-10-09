/* @layer renderer-lib @kind types */
import type { AccessibilityMode } from '@rotp/randomizer';
import type { CapacityBonusSetting, CapacityProfile } from '@rotp/randomizer';
import type { DifficultySetting } from '@rotp/randomizer';
import type { DungeonItemMode } from '@rotp/randomizer';
import type { ItemPowerSetting } from '@rotp/game-core';
import type { ProgressiveModeSetting, ProgressiveSetting } from '@rotp/randomizer';
import type { RetroBowSetting } from '@rotp/randomizer';
import type { OptionValue } from '@rotp/randomizer';
import type { PondProfiles } from '@rotp/randomizer';
import type { ShopScope } from '@rotp/randomizer';
import type { StoryGateSetting } from '@rotp/randomizer';

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
