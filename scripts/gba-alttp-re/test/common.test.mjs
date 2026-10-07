/* @layer scripts @kind test */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  gbaAddressToOffset,
  offsetToGbaAddress,
  offsetToSnesAddress,
  parseInteger,
  snesAddressToOffset,
} from '../lib/common.mjs';

test('maps GBA ROM addresses to file offsets', () => {
  assert.equal(gbaAddressToOffset(0x0817217a), 0x17217a);
  assert.equal(offsetToGbaAddress(0x17217a), 0x0817217a);
});

test('maps SNES LoROM addresses exactly like the production extractor', () => {
  for (const address of [0x808000, 0x818000, 0x89d62e, 0x9f8000]) {
    assert.equal(offsetToSnesAddress(snesAddressToOffset(address)), address);
  }
});

test('parses decimal and hexadecimal CLI integers', () => {
  assert.equal(parseInteger('18'), 18);
  assert.equal(parseInteger('0x12'), 18);
  assert.throws(() => parseInteger('12oops'));
});

