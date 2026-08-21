/* @layer shared-asset-extraction @kind logic */
import { decompressGbaLz77 } from '../../compression/gba-lz77';
import type {
  DungeonEntityRecord,
  DungeonInteractionCell,
  DungeonInteractionKind,
  DungeonRoomHeader,
  DungeonRoomRecord,
  DungeonSecretRecord,
  DungeonTopologyEdge,
  NativeDungeonLayer,
} from '../../dungeon/model';
import { convertGbaMapWordToSnes } from '../../graphics/gba-native';
import { gbaAddressToOffset } from '../../rom/gba-rom';
import type { GbaRomReader } from '../../rom/gba-rom';

const PALACE_ROOM_IDS = [0x69, 0x78, 0x79, 0x88, 0x9a, 0xad, 0xbd, 0xcd, 0xdd, 0xe9, 0xec, 0xfc] as const;
const ROOM_COUNT = 320;
const HEADER_POINTER_TABLE = 0x08164020;
const LAYER_POINTER_TABLES = [0x081618d8, 0x08161d98, 0x08162258] as const;
const ENTITY_POINTER_TABLE = 0x08228df0;
const SECRET_POINTER_TABLE = 0x082264c8;
const TILE_ATTRIBUTE_BANK_POINTERS = 0x0815e794;
const TILE_ATTRIBUTE_BANK_SIZE = 0x80;

const INTERACTION_ATTRIBUTES: Readonly<Record<number, DungeonInteractionKind>> = {
  0x08: 'deep-water',
  0x09: 'shallow-water',
  0x20: 'pit',
  0x22: 'stair',
  0x68: 'conveyor-up',
  0x69: 'conveyor-down',
  0x6a: 'conveyor-left',
  0x6b: 'conveyor-right',
};

const readRoomPointer = (rom: GbaRomReader, table: number, roomId: number): number => {
  if (roomId < 0 || roomId >= ROOM_COUNT) throw new Error(`Dungeon room ${roomId} is out of range`);
  const pointer = rom.romUint32(table + roomId * 4);
  gbaAddressToOffset(pointer);
  return pointer;
};

const parseHeader = (rom: GbaRomReader, address: number): DungeonRoomHeader => {
  const raw = rom.romSlice(address, 14);
  const flags = raw[0];
  const quadrants = [raw[7] & 3, (raw[7] >>> 2) & 3, (raw[7] >>> 4) & 3, raw[7] >>> 6, raw[8] & 3];
  return {
    bg2: flags >>> 5,
    collision: (flags >>> 2) & 7,
    lightsOut: Boolean(flags & 1),
    palette: raw[1],
    blockset: raw[2],
    enemyBlockset: raw[3],
    effect: raw[4],
    tags: [raw[5], raw[6]],
    hole: { roomId: raw[9], quadrant: quadrants[0] },
    stairs: [
      { roomId: raw[10], quadrant: quadrants[1] },
      { roomId: raw[11], quadrant: quadrants[2] },
      { roomId: raw[12], quadrant: quadrants[3] },
      { roomId: raw[13], quadrant: quadrants[4] },
    ],
    nativeBytes: Buffer.from(raw),
  };
};

const parseLayer = (rom: GbaRomReader, address: number, attributes: Buffer): NativeDungeonLayer => {
  const decompressed = decompressGbaLz77(rom, gbaAddressToOffset(address));
  if (decompressed.data.length !== 0x2000) throw new Error(`Room layer at 0x${address.toString(16)} is not 64x64`);
  const gbaWords = new Uint16Array(4096);
  const snesWords = new Uint16Array(4096);
  const collision = new Uint8Array(4096);
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const screenBlock = (y >>> 5) * 2 + (x >>> 5);
      const source = screenBlock * 1024 + (y & 31) * 32 + (x & 31);
      const destination = y * 64 + x;
      const gbaWord = decompressed.data.readUInt16LE(source * 2);
      const snesWord = convertGbaMapWordToSnes(gbaWord);
      // Dungeon graphics are assembled from 64-tile sheets whose collision
      // meanings share one 128-entry bank selected by the room blockset.
      let attribute = attributes[gbaWord & 0x7f];
      if (attribute >= 0x10 && attribute < 0x1c) attribute |= snesWord >>> 14;
      gbaWords[destination] = gbaWord;
      snesWords[destination] = snesWord;
      collision[destination] = attribute;
    }
  }
  return { width: 64, height: 64, gbaWords, snesWords, collision, sourceAddress: address };
};

const parseEntities = (rom: GbaRomReader, address: number): { sortMode: number; records: DungeonEntityRecord[] } => {
  let cursor = gbaAddressToOffset(address);
  const sortMode = rom.byte(cursor++);
  const records: DungeonEntityRecord[] = [];
  while (rom.byte(cursor) !== 0xff) {
    if (records.length >= 64) throw new Error(`Unterminated entity list at 0x${address.toString(16)}`);
    const y = rom.byte(cursor);
    const x = rom.byte(cursor + 1);
    const type = rom.byte(cursor + 2);
    const nativeBytes = rom.slice(cursor, 3);
    if (type === 0xe4 && (y === 0xfd || y === 0xfe)) {
      records.push({ kind: 'death-marker', x: 0, y: 0, floor: 0, subtype: 0, type, action: y === 0xfe ? 1 : 2, nativeBytes });
    } else {
      records.push({
        kind: x >= 0xe0 ? 'overlord' : 'entity',
        x: (x & 0x1f) << 4,
        y: (y & 0x1f) << 4,
        floor: y >>> 7,
        subtype: ((y & 0x60) >>> 2) | (x >>> 5),
        type,
        nativeBytes,
      });
    }
    cursor += 3;
  }
  return { sortMode, records };
};

const parseSecrets = (rom: GbaRomReader, address: number): DungeonSecretRecord[] => {
  let cursor = gbaAddressToOffset(address);
  const records: DungeonSecretRecord[] = [];
  while (rom.word(cursor) !== 0xffff) {
    if (records.length >= 64) throw new Error(`Unterminated secret list at 0x${address.toString(16)}`);
    const position = rom.word(cursor);
    const cell = position >>> 1;
    records.push({ x: cell % 64, y: Math.floor(cell / 64), type: rom.byte(cursor + 2), nativeBytes: rom.slice(cursor, 3) });
    cursor += 3;
  }
  return records;
};

class GbaAlttpDungeonSource {
  readonly rom: GbaRomReader;

  constructor(rom: GbaRomReader) {
    this.rom = rom;
  }

  dungeonTileAttributes(blockset: number): Buffer {
    const bankPointer = this.rom.romUint32(TILE_ATTRIBUTE_BANK_POINTERS + (blockset + 1) * 4);
    return this.rom.romSlice(bankPointer, TILE_ATTRIBUTE_BANK_SIZE);
  }

  room(roomId: number): DungeonRoomRecord {
    const headerAddress = readRoomPointer(this.rom, HEADER_POINTER_TABLE, roomId);
    const entityAddress = readRoomPointer(this.rom, ENTITY_POINTER_TABLE, roomId);
    const secretAddress = readRoomPointer(this.rom, SECRET_POINTER_TABLE, roomId);
    const layerAddresses = LAYER_POINTER_TABLES.map(table => readRoomPointer(this.rom, table, roomId));
    const entities = parseEntities(this.rom, entityAddress);
    const header = parseHeader(this.rom, headerAddress);
    const attributes = this.dungeonTileAttributes(header.blockset);
    return {
      id: roomId,
      header,
      layers: layerAddresses.map(address => parseLayer(this.rom, address, attributes)),
      entitySortMode: entities.sortMode,
      entities: entities.records,
      secrets: parseSecrets(this.rom, secretAddress),
      provenance: {
        romSha256: this.rom.sha256,
        headerAddress,
        layerAddresses,
        entityAddress,
        secretAddress,
        tileAttributesAddress: this.rom.romUint32(TILE_ATTRIBUTE_BANK_POINTERS + (header.blockset + 1) * 4),
      },
    };
  }

  palaceRooms(): DungeonRoomRecord[] {
    const rooms = PALACE_ROOM_IDS.map(roomId => this.room(roomId));
    for (const room of rooms) {
      if (room.header.blockset !== 21) throw new Error(`Palace room 0x${room.id.toString(16)} does not use blockset 21`);
    }
    return rooms;
  }

  palaceTopology(): DungeonTopologyEdge[] {
    const rooms = this.palaceRooms();
    const palaceIds = new Set<number>(PALACE_ROOM_IDS);
    const edges: DungeonTopologyEdge[] = [];
    for (const room of rooms) {
      const destinations: { kind: 'hole' | 'stair'; slot: number; value: { roomId: number; quadrant: number } }[] = [
        { kind: 'hole', slot: 0, value: room.header.hole },
        ...room.header.stairs.map((value, slot) => ({ kind: 'stair' as const, slot, value })),
      ];
      for (const destination of destinations) {
        if (destination.value.roomId === 0xff) continue;
        edges.push({
          fromRoomId: room.id,
          kind: destination.kind,
          slot: destination.slot,
          toRoomId: destination.value.roomId,
          quadrant: destination.value.quadrant,
          insidePalace: palaceIds.has(destination.value.roomId),
        });
      }
    }
    return edges;
  }

  roomInteractions(room: DungeonRoomRecord): DungeonInteractionCell[] {
    const result: DungeonInteractionCell[] = [];
    room.layers.forEach((layer, layerIndex) => {
      layer.collision.forEach((attribute, index) => {
        const kind = INTERACTION_ATTRIBUTES[attribute];
        if (kind) result.push({
          roomId: room.id,
          layer: layerIndex + 1,
          x: index % 64,
          y: Math.floor(index / 64),
          attribute,
          kind,
        });
      });
    });
    return result;
  }
}

export {
  GbaAlttpDungeonSource,
  INTERACTION_ATTRIBUTES,
  PALACE_ROOM_IDS,
  TILE_ATTRIBUTE_BANK_POINTERS,
};
