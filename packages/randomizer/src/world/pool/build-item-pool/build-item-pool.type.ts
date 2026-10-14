/* @layer shared-game @kind types */
import type { CapacityProfile } from '../../capacity/capacity-profile.type';
import type { DifficultySetting } from '../../difficulty/difficulty.type';
import type { DungeonItemSetting } from '../../dungeon-items/dungeon-item.type';
import type { LocationKey } from '../../location-key';
import type { RetroBowSetting } from '../../retro/retro.type';
import type { BottlePicker, FillerPicker, WeaponPicker } from '../pool.type';

interface PoolLocks {
  scope?: ReadonlySet<LocationKey>;
  capacity?: ReadonlySet<LocationKey>;
}

interface PoolPickers {
  pickBottle?: BottlePicker;
  pickWeapon?: WeaponPicker;
  pickFiller?: FillerPicker;
}

interface PoolSettings {
  includeNpcChecks: boolean;
  includeWorldItems: boolean;
  capacity: CapacityProfile;
  capacityProgressive: boolean;
  dungeonItemSetting: DungeonItemSetting;
  difficulty: DifficultySetting;
}

interface UncleInput {
  pickWeapon: WeaponPicker | undefined;
  lockedScope: ReadonlySet<LocationKey>;
  capacity: CapacityProfile;
  retro: RetroBowSetting | undefined;
}

export type { PoolLocks, PoolPickers, PoolSettings, UncleInput };
