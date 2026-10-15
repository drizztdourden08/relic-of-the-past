/* @layer scripts @kind test */
import assert from 'node:assert/strict';
import test from 'node:test';
import { parseDungeonRoomHeader } from '../lib/dungeon-room-header.mjs';

test('decodes the 14-byte GBA dungeon room header layout', () => {
  const parsed = parseDungeonRoomHeader(
    Buffer.from([0xe9, 0x0f, 0x15, 0x2c, 7, 8, 9, 0xe4, 2, 0x10, 0x11, 0x12, 0x13, 0x14]),
    0,
  );
  assert.equal(parsed.bg2, 7);
  assert.equal(parsed.collision, 2);
  assert.equal(parsed.lightsOut, true);
  assert.equal(parsed.palette, 0x0f);
  assert.deepEqual(parsed.tags, [8, 9]);
  assert.deepEqual(parsed.destinations.hole, { roomId: 0x10, quadrant: 0 });
  assert.deepEqual(parsed.destinations.stairs, [
    { roomId: 0x11, quadrant: 1 },
    { roomId: 0x12, quadrant: 2 },
    { roomId: 0x13, quadrant: 3 },
    { roomId: 0x14, quadrant: 2 },
  ]);
});

test('rejects truncated GBA dungeon room headers', () => {
  assert.throws(() => parseDungeonRoomHeader(Buffer.alloc(13), 0), /out of range/);
});
