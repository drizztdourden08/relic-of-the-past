/* @layer renderer-components @kind types */
import type { DarkRoomLightField } from '@shared/randomizer/world/dark-rooms/dark-room.type';

interface DarkRoomLightTileModel {
  field: DarkRoomLightField;
  name: string;
  sprite?: string;
  checked: boolean;
  reason?: string;
}

export type { DarkRoomLightTileModel };
