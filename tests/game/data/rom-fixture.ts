/* @layer tests @kind helper */
/**
 * Finds the US cartridge for a test that reads it, and skips the suite when it is absent.
 *
 * The ROM is never committed, so a clone without one has to stay green: `describeRom`
 * replaces the suite body the way `describeDataset` does. Candidate folders are the ones
 * a checkout actually keeps a ROM in, plus `ROTP_ROM` for a path of your own. A file only
 * counts when its SHA1 is `ZELDA3_SHA1_US`, so a translation or a hack cannot stand in.
 */
import { createHash } from 'crypto';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { describe, it } from 'vitest';
import { ZELDA3_SHA1_US } from '@shared/asset-extraction/rom/rom-loader';

const REPO = resolve(__dirname, '..', '..', '..');
const CANDIDATE_DIRS = [join('.user-data', 'Data', 'roms'), 'assets', 'test-roms'];
const SMC_HEADER_SIZE = 0x200;

/** The same strip `loadRomFromBuffer` does before it hashes. */
const bodyOf = (bytes: Buffer): Buffer =>
  (bytes.length & 0xfffff) === SMC_HEADER_SIZE ? bytes.subarray(SMC_HEADER_SIZE) : bytes;

const isUsRom = (bytes: Buffer): boolean =>
  createHash('sha1').update(bodyOf(bytes)).digest('hex').toUpperCase() === ZELDA3_SHA1_US;

const candidatePaths = (): string[] => {
  const named = process.env.ROTP_ROM ? [process.env.ROTP_ROM] : [];
  const scanned = CANDIDATE_DIRS.flatMap((dir) => {
    const full = join(REPO, dir);
    if (!existsSync(full)) return [];
    return readdirSync(full).filter((name) => name.toLowerCase().endsWith('.sfc')).map((name) => join(full, name));
  });
  return [...named, ...scanned];
};

const findUsRom = (): Buffer | null => {
  for (const path of candidatePaths()) {
    if (!existsSync(path)) continue;
    const bytes = readFileSync(path);
    if (isUsRom(bytes)) return bodyOf(bytes);
  }
  return null;
};

const US_ROM = findUsRom();

const placeholder = (name: string): void => {
  describe.skip(name, () => {
    it('needs the US cartridge, so put one in assets/ or point ROTP_ROM at it', () => undefined);
  });
};

const describeRom = (US_ROM ? describe : placeholder) as typeof describe;

/** Only call inside a `describeRom` body, where the ROM is known to be present. */
const usRom = (): Buffer => {
  if (!US_ROM) throw new Error('no US ROM: guard the suite with describeRom');
  return US_ROM;
};

export { describeRom, usRom };
