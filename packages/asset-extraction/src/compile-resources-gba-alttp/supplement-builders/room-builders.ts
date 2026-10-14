/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import { doorListFor } from '../../extensions/second-cartridge-doors';
import { bankedRoomId } from '../../extensions/second-cartridge-bank';
import { nativeHeaderBytes } from '../native-header-bytes';
import { roomPaletteRecord } from '../room-palette-record';
import { serializeEntityList } from '../serialize-entity-list';
import { serializeSecretList } from '../serialize-secret-list';
import type { SupplementBuilders, SupplementContext } from './supplement-builders.type';

const roomBuilders = (context: SupplementContext): SupplementBuilders => {
  const { rom, assets, source, rooms, roomIds, paletteIds, topology, bgTiles } = context;
  return {
    kGbaPalaceRoomIds: () => assets.addUint16('kGbaPalaceRoomIds', rooms.map(room => bankedRoomId(room.id))),
    kGbaPalaceRoomHeaders: () => assets.addPacked('kGbaPalaceRoomHeaders', rooms.map(room => nativeHeaderBytes(room, roomIds))),
    kGbaPalaceRoomEntities: () => assets.addPacked('kGbaPalaceRoomEntities', rooms.map(serializeEntityList)),
    kGbaPalaceRoomSecrets: () => assets.addPacked('kGbaPalaceRoomSecrets', rooms.map(serializeSecretList)),
    kGbaPalaceBgGfxSnes4bpp: () => assets.addUint8('kGbaPalaceBgGfxSnes4bpp', [...bgTiles]),
    kGbaPalacePaletteIds: () => assets.addUint8('kGbaPalacePaletteIds', paletteIds),
    kGbaPalaceBgPalettes: () => assets.addPacked('kGbaPalaceBgPalettes', rooms.map(room => roomPaletteRecord(rom, room, rooms))),
    kGbaPalaceTileAttributes: () => assets.addUint8('kGbaPalaceTileAttributes', [...source.dungeonTileAttributes(itemAt(rooms, 0, 'Palace room').header.blockset)]),
    kGbaPalaceTopology: () => assets.addUint16('kGbaPalaceTopology', topology.flatMap(edge => [
      bankedRoomId(edge.fromRoomId),
      bankedRoomId(edge.toRoomId),
      edge.quadrant,
      edge.kind === 'hole' ? 0 : edge.slot + 1,
    ])),
    kGbaPalaceRoomDoors: () => assets.addPacked('kGbaPalaceRoomDoors', rooms.map(room => doorListFor(room.id))),
    kGbaPalaceCameraBounds: () => assets.addPacked('kGbaPalaceCameraBounds', rooms.map(() => Buffer.alloc(0))),
  };
};

export { roomBuilders };
