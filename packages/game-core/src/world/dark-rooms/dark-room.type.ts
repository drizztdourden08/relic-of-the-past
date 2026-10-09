/* @layer shared-game @kind types */

type DarkRoomLightField = 'lamp' | 'fireRod' | 'bombos' | 'redCane';

type DarkRoomLights = Readonly<Record<DarkRoomLightField, boolean>>;

interface DarkRoomSetting {
  requireLight: boolean;
  lights: DarkRoomLights;
}

export type { DarkRoomLightField, DarkRoomLights, DarkRoomSetting };
