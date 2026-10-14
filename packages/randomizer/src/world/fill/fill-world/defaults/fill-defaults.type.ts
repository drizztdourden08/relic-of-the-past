/* @layer shared-game @kind types */
import type { FillWorldOptions } from '../../fill-world.type';

type ScopeDefaults = Required<Pick<
  FillWorldOptions, 'includeNpcChecks' | 'includeWorldItems' | 'capacity' | 'capacityProgressive' | 'capacityBonus'
>>;

type ShopPondDefaults = Required<Pick<
  FillWorldOptions, 'shops' | 'shopPrices' | 'ponds' | 'pondSlotsFollowMode' | 'darkRooms' | 'storyGates'
>>;

type ItemDefaults = Required<Pick<
  FillWorldOptions,
  'progressiveTiers' | 'progressiveModes' | 'itemPower' | 'retroBow' | 'dungeonItems' | 'accessibility' | 'difficulty'
>>;

type FillDefaults = ScopeDefaults & ShopPondDefaults & ItemDefaults;

export type { FillDefaults, ItemDefaults, ScopeDefaults, ShopPondDefaults };
