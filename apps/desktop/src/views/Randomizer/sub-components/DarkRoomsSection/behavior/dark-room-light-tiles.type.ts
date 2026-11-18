/* @layer renderer-components @kind types */
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { DarkRoomLightField } from '@rotp/game-core';

interface DarkRoomLightTileModel {
  field: DarkRoomLightField;
  name: string;
  sprite?: string;
  checked: boolean;
  reason?: Message;
}

export type { DarkRoomLightTileModel };
