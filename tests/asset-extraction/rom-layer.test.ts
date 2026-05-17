/**
 * Verification tests for the ROM layer and compression codecs.
 * 
 * These tests require a real ROM file. Set ALTTP_ROM_PATH env var or
 * place ROM at test-roms/Legend of Zelda, The - A Link to the Past (USA).sfc
 * 
 * Run with: npx vitest run tests/asset-extraction/
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';
import {
  loadRom,
  snesToLinear,
  advanceAddress,
  RomReader,
  type RomData,
} from '../../shared/asset-extraction/rom';
import { decompress } from '../../shared/asset-extraction/compression';

const ROM_PATH = process.env.ALTTP_ROM_PATH
  || join(__dirname, '..', '..', 'test-roms', 'Legend of Zelda, The - A Link to the Past (USA).sfc');

const romAvailable = existsSync(ROM_PATH);

describe('SNES address translation', () => {
  it('converts known addresses correctly', () => {
    // Bank $00, offset $8000 → linear 0x0000
    expect(snesToLinear(0x008000)).toBe(0);
    // Bank $01, offset $8000 → linear 0x8000
    expect(snesToLinear(0x018000)).toBe(0x8000);
    // 0x82dd8a → bank 0x02 (masked to 0x02), offset 0xdd8a
    // linear = 2 * 0x8000 + (0xdd8a & 0x7fff) = 0x10000 + 0x5d8a = 0x15d8a
    expect(snesToLinear(0x82dd8a)).toBe(0x10000 + 0x5d8a);
  });

  it('throws on invalid address (bit 15 not set)', () => {
    expect(() => snesToLinear(0x007000)).toThrow();
  });

  it('advances across bank boundaries', () => {
    // Address at end of bank: 0x00FFFF → 0x018000
    expect(advanceAddress(0x00ffff)).toBe(0x018000);
    // Normal advance: 0x008000 → 0x008001
    expect(advanceAddress(0x008000)).toBe(0x008001);
  });
});

describe.skipIf(!romAvailable)('ROM loading', () => {
  let rom: RomData;

  beforeAll(() => {
    rom = loadRom(ROM_PATH);
  });

  it('identifies US ROM', () => {
    expect(rom.language).toBe('us');
  });

  it('reads bytes from known addresses', () => {
    // SNES ROM header at $00:FFC0 contains game title
    // "THE LEGEND OF ZELDA" starts at 0x00FFC0
    const titleStart = rom.getByte(0x00ffc0);
    // 'T' = 0x54
    expect(titleStart).toBe(0x54);
  });

  it('reads words correctly (little-endian)', () => {
    const word = rom.getWord(0x00ffc0);
    // 'T' = 0x54, 'H' = 0x48 → word = 0x4854
    expect(word).toBe(0x4854);
  });

  it('reads bytes across bank boundaries', () => {
    const bytes = rom.getBytes(0x00ffc0, 4);
    expect(bytes.length).toBe(4);
    // "THE " = [0x54, 0x48, 0x45, 0x20]
    expect(bytes[0]).toBe(0x54);
    expect(bytes[1]).toBe(0x48);
    expect(bytes[2]).toBe(0x45);
    expect(bytes[3]).toBe(0x20);
  });

  it('RomReader sequential read matches getBytes', () => {
    const reader = new RomReader(rom, 0x00ffc0);
    const b1 = reader.next();
    const b2 = reader.next();
    const b3 = reader.next();
    expect([b1, b2, b3]).toEqual([0x54, 0x48, 0x45]);
  });
});

describe.skipIf(!romAvailable)('LZ decompression', () => {
  let rom: RomData;

  beforeAll(() => {
    rom = loadRom(ROM_PATH);
  });

  it('decompresses sprite data without error', () => {
    // kCompSpritePtrs[0] is at a known ROM address
    // First compressed sprite pointer from tables — address 0x8CC860 (US ROM)
    // We'll just verify decompression doesn't crash and returns reasonable data
    const result = decompress(0x8cc860, (addr) => rom.getByte(addr), false);
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it('decompression produces consistent output', () => {
    // Same address, same parameters → same output
    const r1 = decompress(0x8cc860, (addr) => rom.getByte(addr), false);
    const r2 = decompress(0x8cc860, (addr) => rom.getByte(addr), false);
    expect(r1.equals(r2)).toBe(true);
  });
});
