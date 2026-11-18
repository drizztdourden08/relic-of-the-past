/* @layer renderer-components @kind types */
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { ImpactCell } from '@app/compounds/PoolImpactCell';
import type { DarkRoomLightField, DarkRoomSetting } from '@rotp/game-core';

interface DarkRoomsSectionProps {
  setting: DarkRoomSetting;
  impact?: ImpactCell;
  forced?: ReadonlyMap<DarkRoomLightField, Message>;
  onChange?: (next: DarkRoomSetting) => void;
}

export type { DarkRoomsSectionProps };
