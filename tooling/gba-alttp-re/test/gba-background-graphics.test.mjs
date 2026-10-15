/* @layer scripts @kind test */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  decodeGba4bppTile,
  decodeGbaColor,
  renderBackgroundRegion,
} from '../lib/gba-background-graphics.mjs';

test('decodes packed GBA 4bpp pixels low nibble first', () => {
  const raw = Buffer.alloc(32);
  raw[0] = 0x21;
  raw[3] = 0x87;
  raw[4] = 0x43;
  const pixels = decodeGba4bppTile(raw);
  assert.deepEqual([...pixels.subarray(0, 8)], [1, 2, 0, 0, 0, 0, 7, 8]);
  assert.deepEqual([...pixels.subarray(8, 10)], [3, 4]);
});

test('converts GBA BGR555 colors to RGBA', () => {
  assert.deepEqual(decodeGbaColor(0x001f), [255, 0, 0, 255]);
  assert.deepEqual(decodeGbaColor(0x03e0), [0, 255, 0, 255]);
  assert.deepEqual(decodeGbaColor(0x7c00), [0, 0, 255, 255]);
});

test('stitches a map tile with its horizontal flip and palette', () => {
  const tile = new Uint8Array(64);
  tile[0] = 1;
  const cells = [[{ tile: 9, horizontalFlip: true, verticalFlip: false, palette: 2 }]];
  const rendered = renderBackgroundRegion({
    layers: [{ cells }],
    tiles: new Map([[9, tile]]),
    palettes: new Map([[2, [[0, 0, 0, 255], [10, 20, 30, 255]]]]),
    x: 0,
    y: 0,
    width: 1,
    height: 1,
  });
  assert.deepEqual([...rendered.pixels.subarray(7 * 4, 7 * 4 + 4)], [10, 20, 30, 255]);
  assert.deepEqual([...rendered.pixels.subarray(0, 4)], [0, 0, 0, 255]);
});
