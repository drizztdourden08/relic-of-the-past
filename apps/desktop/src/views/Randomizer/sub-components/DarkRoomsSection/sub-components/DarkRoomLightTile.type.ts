/* @layer renderer-components @kind types */
import type { DarkRoomLightField } from '@rotp/game-core';
import type { DarkRoomLightTileModel } from '../behavior/dark-room-light-tiles.type';

interface DarkRoomLightTileProps {
  tile: DarkRoomLightTileModel;
  disabled: boolean;
  readout?: boolean;
  onChange?: (field: DarkRoomLightField, checked: boolean) => void;
}

export type { DarkRoomLightTileProps };
