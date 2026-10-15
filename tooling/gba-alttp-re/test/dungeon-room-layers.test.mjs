/* @layer scripts @kind test */
import assert from 'node:assert/strict';
import test from 'node:test';
import { parseDungeonRoomLayer } from '../lib/dungeon-room-layers.mjs';

test('decodes 64x64 GBA screen-block ordering into logical rows', () => {
  const bytes = Buffer.alloc(0x2000);
  bytes.writeUInt16LE(0x0123, 0);
  bytes.writeUInt16LE(0x4567, 0x800);
  bytes.writeUInt16LE(0x89ab, 0x1000);
  bytes.writeUInt16LE(0xcdef, 0x1800);
  const parsed = parseDungeonRoomLayer(bytes);
  assert.deepEqual(parsed.cells[0][0], {
    raw: 0x0123,
    tile: 0x123,
    horizontalFlip: false,
    verticalFlip: false,
    palette: 0,
  });
  assert.equal(parsed.cells[0][32].raw, 0x4567);
  assert.equal(parsed.cells[32][0].raw, 0x89ab);
  assert.equal(parsed.cells[32][32].raw, 0xcdef);
});

test('rejects a dungeon layer with the wrong size', () => {
  assert.throws(() => parseDungeonRoomLayer(Buffer.alloc(0x1000)), /0x2000-byte/);
});
