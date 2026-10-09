/* @layer renderer-components @kind types */
import type { ImpactCell } from '@domains/app/compounds/PoolImpactCell';
import type { DarkRoomLightField, DarkRoomSetting } from '@rotp/game-core';

interface DarkRoomsSectionProps {
  setting: DarkRoomSetting;
  impact?: ImpactCell;
  forced?: ReadonlyMap<DarkRoomLightField, string>;
  onChange?: (next: DarkRoomSetting) => void;
}

export type { DarkRoomsSectionProps };
