/* @layer scripts @kind test */
import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeDungeonSecretRecord, parseDungeonSecretList } from '../lib/dungeon-secrets.mjs';

test('decodes the SNES-compatible dungeon secret position', () => {
  assert.deepEqual(decodeDungeonSecretRecord(0x0106, 0x03), {
    position: 0x0106,
    type: 0x03,
    x: 3,
    y: 2,
  });
});

test('parses secret records through the 0xFFFF terminator', () => {
  const bytes = Buffer.from([0x06, 0x01, 0x03, 0x80, 0x00, 0x07, 0xff, 0xff, 0xaa]);
  const parsed = parseDungeonSecretList(bytes, 0);
  assert.equal(parsed.records.length, 2);
  assert.deepEqual(parsed.records[1], { position: 0x0080, type: 0x07, x: 0, y: 1 });
  assert.deepEqual(parsed.raw, bytes.subarray(0, 8));
  assert.equal(parsed.endOffset, 8);
});

test('rejects unterminated secret lists', () => {
  assert.throws(() => parseDungeonSecretList(Buffer.from([0, 0, 1]), 0), /terminator/);
});
