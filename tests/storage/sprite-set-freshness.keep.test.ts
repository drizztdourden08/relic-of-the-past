/* @layer test @kind test */
/**
 * The two hops an item listing's art depends on, both of which have silently
 * broken before.
 *
 * 1. The STALENESS decision. Every extraction bump (a new format version, a new
 *    binary beside the PNGs, a changed drawing) has to keep answering the same
 *    three questions the same way, or a complete current set gets thrown away
 *    and rewritten on every boot — or, worse, an incomplete one is kept.
 * 2. The URL of a REWRITTEN set. An extraction clears the folder before writing
 *    it again at the same names, so every image on screen fails for the
 *    duration and the primitive remembers the failure per source. Unless the
 *    URLs change, the rows stay on placeholders for the rest of the session.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import * as sprites from '@shared/storage/sprites';
import { EXTRACTION_STAMP_FILE, extractionVersionOf } from '@shared/asset-extraction/item-sprites/extraction-stamp';
import { CURRENCY_SYMBOLS_FILE } from '@shared/asset-extraction/item-sprites/currency-symbols';
import { GEAR_ICONS_FILE } from '@shared/asset-extraction/item-sprites/gear-icons';
import { QUIVER_ICON_FILE } from '@shared/asset-extraction/item-sprites/quiver-icon';
import { SPRITE_DEFINITIONS } from '@shared/game/data/sprite-manifest/manifest';
import {
  getCapacityUpgradeSprite, setSpritesBase, setSpritesRevision,
} from '@shared/game/logic/queries/item-sprites';
import { createMemFileStore } from './mem-file-store';
import type { FileStore } from '@shared/platform';

const ROM = 'game.sfc';
const DIR = 'sprites/game';
const DEFS = SPRITE_DEFINITIONS as unknown as { file: string }[];
const EXPECTED = sprites.extractedFileNames(DEFS);
const VERSION = extractionVersionOf(DEFS as never);

/** A set exactly as the current extraction would leave it on disk. */
const writeCurrentSet = async (files: FileStore): Promise<void> => {
  for (const name of EXPECTED) await files.writeBytes(`${DIR}/${name}`, new Uint8Array([1]));
  await files.writeText(`${DIR}/${EXTRACTION_STAMP_FILE}`, JSON.stringify({ version: VERSION }));
};

describe('extracted sprite set freshness', () => {
  it('names the four binaries and one PNG per definition as the files an extraction writes', () => {
    expect(EXPECTED).toHaveLength(DEFS.length + 4);
    expect(EXPECTED).toContain(GEAR_ICONS_FILE);
    expect(EXPECTED).toContain(QUIVER_ICON_FILE);
    expect(EXPECTED).toContain(CURRENCY_SYMBOLS_FILE);
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
