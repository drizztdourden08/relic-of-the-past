/* @layer tests @kind test */
/**
 * Where a record is filed, pinned against the real dataset.
 *
 * The check resolver is held to the strongest claim available: EVERY check
 * record on file must resolve to the file it is actually committed in. That is
 * not a spot check — it is the whole collection asserting that the rule the
 * writer files a new record by is the rule the collection was already built on,
 * so a create can never land a record somewhere its siblings are not.
 *
 * Item, actor and dungeon are held to a weaker and deliberately different
 * claim. Their committed split follows no rule the record itself carries (see
 * record-file-targets.ts), so the resolver names ONE canonical destination per
 * category/kind for new records only, and existing records stay where they are.
 * What is pinned there is the canonical choice and the fact that the file it
 * names really exists.
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { all } from '@shared/game/data';
import {
  actorRecordFile, areaRecordFile, checkRecordFile, dungeonRecordFile, itemRecordFile, locationRecordFile,
} from '@shared/game/data/record-file-targets';
import type { ActorKind } from '@shared/game/data';
import type { ItemCategory } from '@shared/game/data/taxonomy/item-categories';

const DATA_ROOT = join(__dirname, '..', '..', '..', 'shared', 'game', 'data');

const dataFile = (relativePath: string): string => join(DATA_ROOT, relativePath);

/** The path a resolver named, or a failure message that says why it named none. */
const resolved = (target: { relativePath: string | null; unresolved?: string }): string => {
  expect(target.unresolved, target.unresolved).toBeUndefined();
  return target.relativePath as string;
};

describe('the file a check is filed in', () => {
  const checks = all('check');

  it('has real records to check against', () => {
    expect(checks.length).toBeGreaterThan(200);
  });

  /** The sibling files a size-split destination shares its group with. */
  const splitGroup = (relativePath: string): string[] => {
    const match = /^(.*)-(\d+)\.ts$/.exec(relativePath);
    if (!match) return [relativePath];
    const [, stem, last] = match;
    return Array.from({ length: Number(last) }, (_, i) => `${stem}-${i + 1}.ts`);
  };

  const holdsCheck = (relativePath: string, id: string): boolean =>
    readFileSync(dataFile(relativePath), 'utf-8').includes(`id: '${id}'`);

  it('names the file every committed record actually sits in', () => {
    const misfiled: string[] = [];
    for (const check of checks) {
      const target = checkRecordFile(check);
      // A handful of story-progress checks name neither a dungeon nor a screen;
      // those are unresolvable BY DESIGN and are asserted separately below.
      if (!target.relativePath) continue;
      // A group split by size is the one place the destination and the record's
      // real home may differ: a NEW record joins the last split, while the
      // earlier ones stay put. Anything outside the group is a genuine misfile.
      if (!splitGroup(target.relativePath).some(file => holdsCheck(file, check.id))) {
        misfiled.push(`${check.id} → ${target.relativePath}`);
      }
    }
    expect(misfiled).toEqual([]);
  });

  it('files a record in a collection with no split exactly where it already sits', () => {
    const unsplit = checks
      .map(check => ({ id: check.id, path: checkRecordFile(check).relativePath }))
      .filter((entry): entry is { id: string; path: string } => !!entry.path && !/-\d+\.ts$/.test(entry.path));
    expect(unsplit.length).toBeGreaterThan(200);
    expect(unsplit.filter(entry => !holdsCheck(entry.path, entry.id)).map(entry => entry.id)).toEqual([]);
  });

  it('files a dungeon check with its dungeon', () => {
    expect(resolved(checkRecordFile({ dungeonId: 'dungeon-012' }))).toBe('checks/dungeons/turtle-rock.ts');
  });

  it('sends a new record for the one split dungeon to the last split', () => {
    expect(resolved(checkRecordFile({ dungeonId: 'dungeon-013' }))).toBe('checks/dungeons/ganons-tower-2.ts');
  });

  it('refuses a check that names neither a dungeon nor a screen', () => {
    expect(checkRecordFile({}).relativePath).toBeNull();
  });

  it('refuses a dungeon or a screen that does not exist', () => {
    expect(checkRecordFile({ dungeonId: 'dungeon-999' }).relativePath).toBeNull();
    expect(checkRecordFile({ screenId: 'screen-9999' }).relativePath).toBeNull();
  });
});

describe('the file a new item is filed in', () => {
  const EXPECTED: Record<ItemCategory, string> = {
    weapon: 'items/weapons.ts',
    equipment: 'items/equipment-2.ts',
    bottle: 'items/equipment-2.ts',
    upgrade: 'items/equipment-2.ts',
    junk: 'items/junk-2.ts',
    key: 'items/dungeon-items-3.ts',
    crystal: 'items/progression.ts',
    event: 'items/progression.ts',
    medallion: 'items/progression.ts',
  };

  it.each(Object.entries(EXPECTED))('files a %s in %s', (category, path) => {
    const target = resolved(itemRecordFile({ category: category as ItemCategory }));
    expect(target).toBe(path);
    expect(existsSync(dataFile(target)), target).toBe(true);
  });

  it('covers every category the taxonomy declares', () => {
    const categories = new Set(all('item').map(item => item.category));
    for (const category of categories) expect(EXPECTED[category], category).toBeDefined();
  });
});

describe('the file a new actor is filed in', () => {
  const EXPECTED: Record<ActorKind, string> = {
    enemy: 'actors/enemies-4.ts',
    object: 'actors/objects-4.ts',
    trigger: 'actors/triggers-2.ts',
    boss: 'actors/bosses.ts',
    npc: 'actors/npcs.ts',
    obstacle: 'actors/obstacles.ts',
  };

  it.each(Object.entries(EXPECTED))('files a %s in %s', (kind, path) => {
    const target = resolved(actorRecordFile({ kind: kind as ActorKind }));
    expect(target).toBe(path);
    expect(existsSync(dataFile(target)), target).toBe(true);
  });

  it('names the LAST file of each size-split group, so a new record joins the newest', () => {
    for (const [kind, path] of Object.entries(EXPECTED)) {
      const next = path.replace(/-(\d+)\.ts$/, (_, n: string) => `-${Number(n) + 1}.ts`);
      expect(next === path || !existsSync(dataFile(next)), `${kind} has a file after ${path}`).toBe(true);
    }
  });

  it('covers every kind the collection uses', () => {
    const kinds = new Set(all('actor').map(actor => actor.kind));
    for (const kind of kinds) expect(EXPECTED[kind], kind).toBeDefined();
  });
});

describe('the flat single-file collections', () => {
  it.each([
    ['dungeon', dungeonRecordFile(), 'dungeons-2.ts'],
    ['area', areaRecordFile(), 'areas.ts'],
    ['location', locationRecordFile(), 'locations.ts'],
  ])('files a new %s in %s', (_kind, target, path) => {
    expect(resolved(target)).toBe(path);
    expect(existsSync(dataFile(path)), path).toBe(true);
  });
});
