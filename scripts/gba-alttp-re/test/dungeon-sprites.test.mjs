/* @layer scripts @kind test */
import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeDungeonSpriteRecord, parseDungeonSpriteList } from '../lib/dungeon-sprites.mjs';

test('decodes Palace room 0x88 entity coordinates like the GBA loader', () => {
  assert.deepEqual(decodeDungeonSpriteRecord(0x88, 0x08, 0x0c, 0xca), {
    kind: 'entity',
    type: 0xca,
    floor: 0,
    subtype: 0,
    local: { x: 0xc0, y: 0x80 },
    world: { x: 0x10c0, y: 0x1080 },
    raw: { y: 0x08, x: 0x0c, type: 0xca },
  });
});

test('parses sort mode, records, and terminator', () => {
  const bytes = Buffer.from([0, 0x08, 0x0c, 0xca, 0x18, 0x0f, 0xf5, 0xff]);
  const parsed = parseDungeonSpriteList(bytes, 0, 0x88);
  assert.equal(parsed.sortMode, 0);
  assert.equal(parsed.records.length, 2);
  assert.equal(parsed.records[1].type, 0xf5);
  assert.deepEqual(parsed.raw, bytes);
});

test('recognizes dungeon death-marker records', () => {
  assert.equal(decodeDungeonSpriteRecord(0, 0xfe, 0, 0xe4).kind, 'death-marker');
  assert.equal(decodeDungeonSpriteRecord(0, 0xfd, 0, 0xe4).action, 2);
});
