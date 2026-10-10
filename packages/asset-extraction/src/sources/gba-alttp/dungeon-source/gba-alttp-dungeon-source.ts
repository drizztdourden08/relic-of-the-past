/* @layer shared-asset-extraction @kind logic */
import type {
  DungeonInteractionCell, DungeonRoomRecord, DungeonTopologyEdge,
} from '../../../dungeon/model';
import type { GbaRomReader } from '../../../rom/gba-rom';
import { itemAt } from '../../../checked-read';
import { headerRecordLengths } from '../header-record-length';
import { parseEntities, parseSecrets } from '../room-records';
import {
  ENTITY_POINTER_TABLE, HEADER_POINTER_TABLE, LAYER_POINTER_TABLES, PALACE_BLOCKSET, PALACE_ROOM_IDS, ROOM_COUNT,
  ROOM_POINTER_BYTES, SECRET_POINTER_TABLE, TILE_ATTRIBUTE_BANK_POINTERS, TILE_ATTRIBUTE_BANK_SIZE,
} from './dungeon-source.constants';
import { palaceTopologyEdges } from './palace-topology-edges';
import { parseRoomHeader } from './parse-room-header';
import { parseRoomLayer } from './parse-room-layer';
import { readRoomPointer } from './read-room-pointer';
import { roomInteractionCells } from './room-interaction-cells';

class GbaAlttpDungeonSource {
  readonly rom: GbaRomReader;

  private readonly headerLengths: number[];

  constructor(rom: GbaRomReader) {
    this.rom = rom;
    this.headerLengths = headerRecordLengths(rom, HEADER_POINTER_TABLE, ROOM_COUNT);
  }

  private tileAttributeBankPointer(blockset: number): number {
    return this.rom.romUint32(TILE_ATTRIBUTE_BANK_POINTERS + (blockset + 1) * ROOM_POINTER_BYTES);
  }

  dungeonTileAttributes(blockset: number): Buffer {
    return this.rom.romSlice(this.tileAttributeBankPointer(blockset), TILE_ATTRIBUTE_BANK_SIZE);
  }

  room(roomId: number): DungeonRoomRecord {
    const headerAddress = readRoomPointer(this.rom, HEADER_POINTER_TABLE, roomId);
    const entityAddress = readRoomPointer(this.rom, ENTITY_POINTER_TABLE, roomId);
    const secretAddress = readRoomPointer(this.rom, SECRET_POINTER_TABLE, roomId);
    const layerAddresses = LAYER_POINTER_TABLES.map(table => readRoomPointer(this.rom, table, roomId));
    const entities = parseEntities(this.rom, entityAddress);
    const header = parseRoomHeader(this.rom, headerAddress, itemAt(this.headerLengths, roomId, 'GBA room header length'));
    const attributes = this.dungeonTileAttributes(header.blockset);
    return {
      id: roomId,
      header,
      layers: layerAddresses.map(address => parseRoomLayer(this.rom, address, attributes)),
      entitySortMode: entities.sortMode,
      entities: entities.records,
      secrets: parseSecrets(this.rom, secretAddress),
      provenance: {
        romSha256: this.rom.sha256,
        headerAddress,
        layerAddresses,
        entityAddress,
        secretAddress,
        tileAttributesAddress: this.tileAttributeBankPointer(header.blockset),
      },
    };
  }

  palaceRooms(): DungeonRoomRecord[] {
    const rooms = PALACE_ROOM_IDS.map(roomId => this.room(roomId));
    for (const room of rooms) {
      if (room.header.blockset !== PALACE_BLOCKSET) {
        throw new Error(`Palace room 0x${room.id.toString(16)} does not use blockset ${PALACE_BLOCKSET}`);
      }
    }
    return rooms;
  }

  palaceTopology(): DungeonTopologyEdge[] {
    return palaceTopologyEdges(this.palaceRooms());
  }

  roomInteractions(room: DungeonRoomRecord): DungeonInteractionCell[] {
    return roomInteractionCells(room);
  }
}

export { GbaAlttpDungeonSource };
