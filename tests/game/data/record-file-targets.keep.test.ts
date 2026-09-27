/* @layer tests @kind test */
/**
 * Where a record is filed, against the real dataset.
 *
 * Checks are held to the strongest claim: EVERY check record must resolve to
 * the file it is committed in, so a create can never land somewhere its
 * siblings are not. Nothing is split by size any more, so there is no group of
 * sibling files to fall back on: the resolved path is the file, exactly.
 *
 * Item, actor, dungeon, area and location follow the same convention from the
 * other side (see record-file-targets.ts): one file per category, per kind, per
 * dungeon or per world. Pinned: that choice, and that the file exists.
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { all, getDungeon } from '@shared/game/data';
import {
  actorRecordFile, areaRecordFile, checkRecordFile, dungeonRecordFile, itemRecordFile, locationRecordFile,
} from '@shared/game/data/record-file-targets';
import type { ActorKind } from '@shared/game/data';
import type { ItemCategory } from '@shared/game/data/taxonomy/item-categories';
import { describeDataset } from '../../dataset-guard';

const DATA_ROOT = join(__dirname, '..', '..', '..', 'shared', 'game', 'data', 'records');

const dataFile = (relativePath: string): string => join(DATA_ROOT, relativePath);

/** The path a resolver named, or a failure message that says why it named none. */
const resolved = (target: { relativePath: string | null; unresolved?: string }): string => {
  expect(target.unresolved, target.unresolved).toBeUndefined();
  return target.relativePath as string;
};

describeDataset('the file a check is filed in', () => {
  const checks = all('check');

  it('has real records to check against', () => {
    expect(checks.length).toBeGreaterThan(200);
  });

  const holdsCheck = (relativePath: string, id: string): boolean =>
    existsSync(dataFile(relativePath)) && readFileSync(dataFile(relativePath), 'utf-8').includes(`id: '${id}'`);

  /** An event record is written as a numbered spec, so its file names the number, not the id. */
  const holdsEvent = (relativePath: string, id: string): boolean => {
    if (!existsSync(dataFile(relativePath))) return false;
    const n = Number(id.slice('check-'.length)) - 300;
    return new RegExp(`\\bn: ${n},`).test(readFileSync(dataFile(relativePath), 'utf-8'));
  };

  it('names the file every committed record actually sits in', () => {
    const misfiled: string[] = [];
    for (const check of checks) {
      const target = checkRecordFile(check);
      // A handful of story rows name neither a dungeon nor a screen, and the event groups
      // that span two files are refused by design; both are asserted separately below.
      if (!target.relativePath) continue;
      const found = check.kind === 'event'
        ? holdsEvent(target.relativePath, check.id) || holdsCheck(target.relativePath, check.id)
        : holdsCheck(target.relativePath, check.id);
      if (!found) misfiled.push(`${check.id} -> ${target.relativePath}`);
    }
    expect(misfiled).toEqual([]);
  });

  it('resolves every check that names a dungeon or a screen', () => {
    const unresolved = checks
      .filter(check => check.kind !== 'event' && (check.dungeonId || check.screenId))
      .filter(check => !checkRecordFile(check).relativePath)
      .map(check => check.id);
    expect(unresolved).toEqual([]);
  });

  it('files a dungeon check with its dungeon, under that dungeon world', () => {
    expect(resolved(checkRecordFile({ dungeonId: 'dungeon-012' }))).toBe('checks/dark-world/turtle-rock.ts');
    expect(resolved(checkRecordFile({ dungeonId: 'dungeon-003' }))).toBe('checks/light-world/eastern-palace.ts');
  });

  it('files a dungeon stage event with its dungeon, in the events tree', () => {
    expect(resolved(checkRecordFile({ kind: 'event', eventGroup: 'dungeon', dungeonId: 'dungeon-013' })))
      .toBe('checks/events/dungeons/ganons-tower.ts');
  });

  it('files a story event and a status with the story', () => {
    expect(resolved(checkRecordFile({ kind: 'event', eventGroup: 'story' }))).toBe('checks/events/story.ts');
    expect(resolved(checkRecordFile({ kind: 'event', eventGroup: 'status' }))).toBe('checks/events/story.ts');
  });

  it('refuses an event whose group spans two files', () => {
    expect(checkRecordFile({ kind: 'event', eventGroup: 'area' }).relativePath).toBeNull();
  });

  it('refuses a check that names neither a dungeon nor a screen', () => {
    expect(checkRecordFile({}).relativePath).toBeNull();
  });

  it('refuses a dungeon or a screen that does not exist', () => {
    expect(checkRecordFile({ dungeonId: 'dungeon-999' }).relativePath).toBeNull();
    expect(checkRecordFile({ screenId: 'screen-9999' }).relativePath).toBeNull();
  });
});

describeDataset('the file a new item is filed in', () => {
  const EXPECTED: Record<ItemCategory, string> = {
    weapon: 'items/weapons.ts',
    equipment: 'items/equipment.ts',
    bottle: 'items/bottles.ts',
    upgrade: 'items/capacity.ts',
    junk: 'items/junk.ts',
    key: 'items/keys.ts',
    crystal: 'items/prizes.ts',
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

  it('files a dungeon item with its dungeon', () => {
    expect(resolved(itemRecordFile({ category: 'key', dungeonId: 'dungeon-002' })))
      .toBe('items/dungeon-items/light-world/castle-tower.ts');
  });

  it('files a seed-only item with the other seed items', () => {
    expect(resolved(itemRecordFile({ category: 'junk', origin: 'randomizer' }))).toBe('items/randomizer.ts');
  });

  it('names the file every committed record actually sits in', () => {
    const misfiled = all('item')
      .map(item => ({ id: item.id, path: itemRecordFile(item).relativePath }))
      .filter(entry => !entry.path || !readFileSync(dataFile(entry.path), 'utf-8').includes(`id: '${entry.id}'`))
      .map(entry => `${entry.id} -> ${entry.path}`);
    expect(misfiled).toEqual([]);
  });
});

describeDataset('the file a new actor is filed in', () => {
  const EXPECTED: Record<ActorKind, string> = {
    enemy: 'actors/enemies.ts',
    object: 'actors/objects.ts',
    trigger: 'actors/triggers.ts',
    boss: 'actors/bosses.ts',
    npc: 'actors/npcs.ts',
    obstacle: 'actors/obstacles.ts',
  };

  it.each(Object.entries(EXPECTED))('files a %s in %s', (kind, path) => {
    const target = resolved(actorRecordFile({ kind: kind as ActorKind }));
    expect(target).toBe(path);
    expect(existsSync(dataFile(target)), target).toBe(true);
  });

  it('covers every kind the collection uses', () => {
    const kinds = new Set(all('actor').map(actor => actor.kind));
    for (const kind of kinds) expect(EXPECTED[kind], kind).toBeDefined();
  });

  it('names the file every committed record actually sits in', () => {
    const misfiled = all('actor')
      .map(actor => ({ id: actor.id, path: actorRecordFile(actor).relativePath as string }))
      .filter(entry => !readFileSync(dataFile(entry.path), 'utf-8').includes(`id: '${entry.id}'`))
      .map(entry => `${entry.id} -> ${entry.path}`);
    expect(misfiled).toEqual([]);
  });
});

describeDataset('the collections filed by world', () => {
  it('files a dungeon in its own file, under its world', () => {
    expect(resolved(dungeonRecordFile(getDungeon('dungeon-012')))).toBe('dungeons/dark-world/turtle-rock.ts');
    expect(resolved(dungeonRecordFile(getDungeon('dungeon-001')))).toBe('dungeons/light-world/hyrule-castle.ts');
  });

  it('files an area and a location by world', () => {
    expect(resolved(areaRecordFile({ world: 'light' }))).toBe('areas/light-world.ts');
    expect(resolved(areaRecordFile({ world: 'dark' }))).toBe('areas/dark-world.ts');
    expect(resolved(locationRecordFile({ areaId: 'area-001' }))).toBe('locations/light-world.ts');
    expect(resolved(locationRecordFile({ areaId: 'area-002' }))).toBe('locations/dark-world.ts');
  });

  it('names the file every committed record of those three sits in', () => {
    const paths = [
      ...all('dungeon').map(d => ({ id: d.id, path: dungeonRecordFile(d).relativePath as string })),
      ...all('area').map(a => ({ id: a.id, path: areaRecordFile(a).relativePath as string })),
      ...all('location').map(l => ({ id: l.id, path: locationRecordFile(l).relativePath as string })),
    ];
    const misfiled = paths
      .filter(entry => !readFileSync(dataFile(entry.path), 'utf-8').includes(`id: '${entry.id}'`))
      .map(entry => `${entry.id} -> ${entry.path}`);
    expect(misfiled).toEqual([]);
  });
});
