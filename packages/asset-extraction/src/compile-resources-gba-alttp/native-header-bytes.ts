/* @layer shared-asset-extraction @kind logic */
import type { DungeonRoomRecord } from '../dungeon/model';
import { EXTRA_DUNGEON_PALINFO } from '../extensions/second-cartridge-palette';
import { AUX_TILE_THEME } from '../sources/gba-alttp';
import { assertTravelStaysInDungeon } from './assert-travel-stays-in-dungeon';
import {
  CARTRIDGE_WATER_EFFECT,
  EFFECT_BYTE,
  ENGINE_EFFECT_COUNT,
  ENGINE_EFFECT_FLOWING_WATER,
  HEADER_LIGHTS_OUT,
  OPAQUE_LAYER_DESIGNATION,
  TRANSLUCENT_LAYER_DESIGNATION,
} from './compile-resources-gba-alttp.constants';

const nativeHeaderBytes = (room: DungeonRoomRecord, rooms: ReadonlySet<number>): Buffer => {
  const bytes = Buffer.from(room.header.nativeBytes);
  bytes[0] &= ~HEADER_LIGHTS_OUT;
  const nativeEffect = bytes[EFFECT_BYTE];
  if (nativeEffect === CARTRIDGE_WATER_EFFECT) {
    bytes[EFFECT_BYTE] = ENGINE_EFFECT_FLOWING_WATER;
    bytes[0] = (bytes[0] & 0x1f) | (TRANSLUCENT_LAYER_DESIGNATION << 5);
  } else {
    if (nativeEffect >= ENGINE_EFFECT_COUNT) bytes[EFFECT_BYTE] = 0;
    bytes[0] = (bytes[0] & 0x1f) | (OPAQUE_LAYER_DESIGNATION << 5);
  }

  bytes[1] = EXTRA_DUNGEON_PALINFO;
  bytes[2] = AUX_TILE_THEME;
  assertTravelStaysInDungeon(bytes, room.id, rooms);
  return bytes;
};

export { nativeHeaderBytes };
