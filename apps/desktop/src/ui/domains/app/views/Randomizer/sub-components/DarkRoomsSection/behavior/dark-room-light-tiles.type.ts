/* @layer renderer-components @kind types */
import type { DarkRoomLightField } from '@rotp/game-core';

interface DarkRoomLightTileModel {
  field: DarkRoomLightField;
  name: string;
  sprite?: string;
  checked: boolean;
  reason?: string;
}

export type { DarkRoomLightTileModel };
