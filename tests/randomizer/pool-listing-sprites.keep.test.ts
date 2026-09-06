/* @layer tests @kind test */
/**
 * The two hops that leave the randomizer options panel drawing placeholders
 * over a sprite set that is sitting on disk.
 *
 * 1. WHICH ROM the set is activated for. The panel lives inside the profile
 *    CREATION form, so it renders while there may be no active profile at all
 *    (a first run, or a launch whose pinned profile was not found) and before a
 *    ROM has been picked in the form. Nothing else activates a set in that
 *    state, so the shared base kept its built-in default and the availability
 *    flag stayed false — every row a placeholder. spriteRomOf is the answer:
 *    a ready ROM stands in until a real one is known.
 *
 * 2. WHICH FILE a row asks for. Every sprite an item record names has to be one
 *    the current extraction actually writes, or the row resolves to a URL that
 *    404s over app-sprite:// and falls back to the same placeholder — a failure
 *    that looks identical to hop 1 on screen. The capacity families' stamped
 *    upgrade art goes through a different function and is checked beside them.
 */
import { describe, expect, it } from 'vitest';
import { CAPACITY_FAMILY_IDS, all } from '@shared/game/data';
import {
  getCapacityUpgradeSprite, getItemSprite, setSpritesBase,
} from '@shared/game/logic/queries/item-sprites';
import { extractedFileNames } from '@shared/storage/sprites';
import { SPRITE_DEFINITIONS } from '@shared/game/data/sprite-manifest/manifest';
import { spriteRomOf } from '@app/lib/sprites/sprite-rom';
import { describeDataset } from '../dataset-guard';
import type { ItemRecord } from '@shared/game/data';

const BASE = 'app-sprite://sprites/A Rom Stem/';
const romOf = (romFile: string, hasAssets: boolean) => ({ romFile, hasAssets, assetSize: null });

describe('sprite set activation without an active profile', () => {
  it('stands a ready ROM in, so the creation form has art before a profile exists', () => {
    const roms = [romOf('unprepared.sfc', false), romOf('ready.sfc', true)];
    expect(spriteRomOf(null, roms)).toBe('ready.sfc');
    expect(spriteRomOf(undefined, roms)).toBe('ready.sfc');
    expect(spriteRomOf('', roms)).toBe('ready.sfc');
  });

  it('lets the active profile win, and falls back to any ROM at all', () => {
    expect(spriteRomOf('chosen.sfc', [romOf('ready.sfc', true)])).toBe('chosen.sfc');
    expect(spriteRomOf(null, [romOf('unprepared.sfc', false)])).toBe('unprepared.sfc');
  });

  it('answers null only when the library is empty', () => {
    expect(spriteRomOf(null, [])).toBeNull();
  });
});

describeDataset('sprite URLs a pool row can ask for', () => {
  const emitted = new Set(extractedFileNames(SPRITE_DEFINITIONS as unknown as { file: string }[]));
  const items = all('item') as ItemRecord[];

  it('names a file the current extraction writes, for every item that has art', () => {
    setSpritesBase(BASE);
    const orphans = items
      .filter((item) => item.spriteId !== undefined)
      .map((item) => ({ id: item.id, url: getItemSprite(item.id) as string }))
      .filter(({ url }) => !emitted.has(url.slice(BASE.length).replace(/\?.*$/, '')));
    expect(orphans).toEqual([]);
  });

  it('does the same for the stamped capacity-upgrade art', () => {
    setSpritesBase(BASE);
    for (const family of CAPACITY_FAMILY_IDS) {
      const url = getCapacityUpgradeSprite(family);
      expect(url.startsWith(BASE)).toBe(true);
      expect(emitted.has(url.slice(BASE.length).replace(/\?.*$/, ''))).toBe(true);
    }
  });
});
