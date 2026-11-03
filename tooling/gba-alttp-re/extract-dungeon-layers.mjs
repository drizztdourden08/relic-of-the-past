#!/usr/bin/env node
/* @layer scripts @kind tooling */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { hashBuffer } from './lib/common.mjs';
import { decodeDungeonLayers } from './lib/decode-dungeon-layers.mjs';
import { formatGbaPointer } from './lib/gba-room-pointer.mjs';
import { loadRoomRom } from './lib/load-room-rom.mjs';
import { writeJsonArtifact } from './lib/write-json-artifact.mjs';

const { args, roomId, romPath, rom } = loadRoomRom();
const outPath = resolve(args.out ?? `tooling/gba-alttp-re/artifacts/room-${roomId.toString(16).padStart(3, '0')}-layers.json`);
const layers = decodeDungeonLayers(rom, roomId).map(decoded => {
  const { address, fileOffset } = formatGbaPointer(decoded.source);
  return {
    layer: decoded.layer,
    pointer: address,
    fileOffset,
    compressedSize: decoded.compressedSize,
    raw: decoded.raw,
    ...decoded.map,
  };
});

const result = {
  format: 'alttp-gba-dungeon-layers-v1',
  source: { romPath, sha256: hashBuffer(rom, 'sha256') },
  roomId,
  layers: layers.map(({ raw, ...layer }) => ({ ...layer, rawHex: raw.toString('hex') })),
};

writeJsonArtifact(outPath, result);
for (const layer of layers) {
  writeFileSync(resolve(dirname(outPath), `room-${roomId.toString(16).padStart(3, '0')}-layer-${layer.layer}.bin`), layer.raw);
}
console.log(JSON.stringify({
  outPath,
  roomId,
  layers: layers.map(layer => ({
    layer: layer.layer,
    pointer: layer.pointer,
    compressedSize: layer.compressedSize,
    decompressedSize: layer.raw.length,
  })),
}, null, 2));
