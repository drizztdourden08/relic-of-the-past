/* @layer test @kind test */
import { describe, it, expect, beforeEach } from 'vitest';
import { sprites } from '@rotp/packs';
import { EXTRACTION_STAMP_FILE, extractionVersionOf, CURRENCY_SYMBOLS_FILE, FOREIGN_ICONS_FILE, GEAR_ICONS_FILE, QUIVER_ICON_FILE } from '@rotp/asset-extraction';
import { SPRITE_DEFINITIONS, getCapacityUpgradeSprite, setSpritesBase, setSpritesRevision } from '@rotp/game-data';
import { createMemFileStore } from './mem-file-store';
import type { FileStore } from '@drizztdourden08/brock-core';

const ROM = 'game.sfc';
const DIR = 'sprites/game';
const DEFS: readonly { file: string }[] = SPRITE_DEFINITIONS;
const EXPECTED = sprites.extractedFileNames(DEFS);
const VERSION = extractionVersionOf(DEFS as never);

const writeCurrentSet = async (files: FileStore): Promise<void> => {
  for (const name of EXPECTED) await files.writeBytes(`${DIR}/${name}`, new Uint8Array([1]));
  await files.writeText(`${DIR}/${EXTRACTION_STAMP_FILE}`, JSON.stringify({ version: VERSION }));
};

describe('extracted sprite set freshness', () => {
  it('names the five binaries and one PNG per definition as the files an extraction writes', () => {
    expect(EXPECTED).toHaveLength(DEFS.length + 5);
    expect(EXPECTED).toContain(GEAR_ICONS_FILE);
    expect(EXPECTED).toContain(QUIVER_ICON_FILE);
    expect(EXPECTED).toContain(CURRENCY_SYMBOLS_FILE);
    expect(EXPECTED).toContain(FOREIGN_ICONS_FILE);
  });

  it('keeps a complete, currently stamped set', async () => {
    const files = createMemFileStore();
    await writeCurrentSet(files);
    expect(await sprites.isStale(files, ROM, EXPECTED, VERSION)).toBe(false);
    expect(await sprites.check(files, ROM)).toMatchObject({ extracted: true });
  });

  it('refreshes a set that is missing a file the current extraction writes', async () => {
    const files = createMemFileStore();
    await writeCurrentSet(files);
    await files.remove(`${DIR}/${GEAR_ICONS_FILE}`);
    expect(await sprites.isStale(files, ROM, EXPECTED, VERSION)).toBe(true);
  });

  it('refreshes a complete set whose stamp names another version', async () => {
    const files = createMemFileStore();
    await writeCurrentSet(files);
    await files.writeText(`${DIR}/${EXTRACTION_STAMP_FILE}`, JSON.stringify({ version: '1-deadbeef' }));
    expect(await sprites.isStale(files, ROM, EXPECTED, VERSION)).toBe(true);
  });

  it('refreshes a complete set that carries no stamp at all', async () => {
    const files = createMemFileStore();
    await writeCurrentSet(files);
    await files.remove(`${DIR}/${EXTRACTION_STAMP_FILE}`);
    expect(await sprites.isStale(files, ROM, EXPECTED, VERSION)).toBe(true);
  });

  it('leaves a set that was never extracted to the extract-if-missing path', async () => {
    const files = createMemFileStore();
    expect(await sprites.isStale(files, ROM, EXPECTED, VERSION)).toBe(false);
  });
});

describe('sprite URLs across a rewrite', () => {
  beforeEach(() => {
    setSpritesBase('app-sprite://sprites/game/');
    setSpritesRevision(0);
  });

  it('serves the plain URL for a set that was found as it is', () => {
    expect(getCapacityUpgradeSprite('meter')).toBe('app-sprite://sprites/game/upgrade-meter.png');
  });

  it('gives a rewritten set new URLs, so a failed image is fetched again', () => {
    const before = getCapacityUpgradeSprite('meter');
    setSpritesRevision(1);
    const after = getCapacityUpgradeSprite('meter');
    expect(after).not.toBe(before);
    expect(after.startsWith(`${before}?`)).toBe(true);
  });
});
