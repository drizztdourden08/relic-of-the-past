/* @layer scripts @kind tooling */
import { parseDungeonRoomLayer } from './dungeon-room-layers.mjs';
import { readGbaRoomPointer } from './gba-room-pointer.mjs';
import { decompressGbaLz77 } from './gba-lz77.mjs';

const LAYER_TABLES = [0x1618d8, 0x161d98, 0x162258];

const decodeDungeonLayers = (rom, roomId) => LAYER_TABLES.map((table, index) => {
  const source = readGbaRoomPointer(rom, table, roomId);
  const decompressed = decompressGbaLz77(rom, source.offset);
  return {
    layer: index + 1,
    source,
    compressedSize: decompressed.compressedSize,
    raw: decompressed.output,
    map: parseDungeonRoomLayer(decompressed.output),
  };
});

export { decodeDungeonLayers };
