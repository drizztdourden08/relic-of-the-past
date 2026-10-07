/* @layer scripts @kind test */
import assert from 'node:assert/strict';
import test from 'node:test';
import { decompressGbaLz77 } from '../lib/gba-lz77.mjs';

test('decompresses GBA LZ77 literals', () => {
  const source = Buffer.from([0x10, 0x04, 0, 0, 0, 1, 2, 3, 4]);
  assert.deepEqual(decompressGbaLz77(source).output, Buffer.from([1, 2, 3, 4]));
});

test('decompresses overlapping GBA LZ77 back-references', () => {
  // Literal A, then copy five bytes from one byte behind.
  const source = Buffer.from([0x10, 0x06, 0, 0, 0x40, 0x41, 0x20, 0x00]);
  assert.equal(decompressGbaLz77(source).output.toString('ascii'), 'AAAAAA');
});

test('rejects a back-reference before the output start', () => {
  const source = Buffer.from([0x10, 0x03, 0, 0, 0x80, 0, 0]);
  assert.throws(() => decompressGbaLz77(source), /displacement/);
});
