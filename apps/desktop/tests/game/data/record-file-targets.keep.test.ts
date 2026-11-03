/* @layer tests @kind test */
import { existsSync } from 'fs';
import { join } from 'path';
import { expect, it } from 'vitest';
import { all, getDungeon, actorRecordFile, areaRecordFile, checkRecordFile, dungeonRecordFile, itemRecordFile, locationRecordFile } from '@rotp/game-data';
import type { ActorKind, ItemCategory } from '@rotp/game-data';
import { describeDataset } from '../../dataset-guard';
import { REPO_ROOT } from '../../repo-root';

const DATA_ROOT = join(REPO_ROOT, 'packages', 'game-data', 'src', 'data', 'records');

const dataFile = (relativePath: string): string => join(DATA_ROOT, relativePath);

const resolved = (target: { relativePath: string | null; unresolved?: string }): string => {
  expect(target.unresolved, target.unresolved).toBeUndefined();
  return target.relativePath as string;
};

describeDataset('the file a check is filed in', () => {
  const checks = all('check');

  it('resolves every check that names a dungeon or a screen', { tags: ['critical'] }, () => {
    const unresolved = checks
      .filter(check => check.kind !== 'event' && (check.dungeonId ?? check.screenId))
      .filter(check => !checkRecordFile(check).relativePath)
      .map(check => check.id);
    expect(unresolved).toEqual([]);
  });

  it('files a dungeon check with its dungeon, under that dungeon world', { tags: ['critical'] }, () => {
    expect(resolved(checkRecordFile({ dungeonId: 'dungeon-012' }))).toBe('checks/dark-world/turtle-rock.ts');
    expect(resolved(checkRecordFile({ dungeonId: 'dungeon-003' }))).toBe('checks/light-world/eastern-palace.ts');
  });

  it('files a dungeon stage event with its dungeon, in the events tree', { tags: ['critical'] }, () => {
    expect(resolved(checkRecordFile({ kind: 'event', eventGroup: 'dungeon', dungeonId: 'dungeon-013' })))
      .toBe('checks/events/dungeons/ganons-tower.ts');
  });

  it('files a story event and a status with the story', { tags: ['critical'] }, () => {
    expect(resolved(checkRecordFile({ kind: 'event', eventGroup: 'story' }))).toBe('checks/events/story.ts');
    expect(resolved(checkRecordFile({ kind: 'event', eventGroup: 'status' }))).toBe('checks/events/story.ts');
  });

  it('refuses an event whose group spans two files', { tags: ['critical'] }, () => {
    expect(checkRecordFile({ kind: 'event', eventGroup: 'area' }).relativePath).toBeNull();
  });

  it('refuses a check that names neither a dungeon nor a screen', { tags: ['critical'] }, () => {
    expect(checkRecordFile({}).relativePath).toBeNull();
  });

  it('refuses a dungeon or a screen that does not exist', { tags: ['critical'] }, () => {
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

  it.each(Object.entries(EXPECTED))('files a %s in %s', { tags: ['standard'] }, (category, path) => {
    const target = resolved(itemRecordFile({ category: category as ItemCategory }));
    expect(target).toBe(path);
    expect(existsSync(dataFile(target)), target).toBe(true);
  });

  it('files a dungeon item with its dungeon', { tags: ['critical'] }, () => {
    expect(resolved(itemRecordFile({ category: 'key', dungeonId: 'dungeon-002' })))
      .toBe('items/dungeon-items/light-world/castle-tower.ts');
  });

  it('files a seed-only item with the other seed items', { tags: ['critical'] }, () => {
    expect(resolved(itemRecordFile({ category: 'junk', origin: 'randomizer' }))).toBe('items/randomizer.ts');
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

  it.each(Object.entries(EXPECTED))('files a %s in %s', { tags: ['standard'] }, (kind, path) => {
    const target = resolved(actorRecordFile({ kind: kind as ActorKind }));
    expect(target).toBe(path);
    expect(existsSync(dataFile(target)), target).toBe(true);
  });
});

describeDataset('the collections filed by world', () => {
  it('files a dungeon in its own file, under its world', { tags: ['critical'] }, () => {
    expect(resolved(dungeonRecordFile(getDungeon('dungeon-012')))).toBe('dungeons/dark-world/turtle-rock.ts');
    expect(resolved(dungeonRecordFile(getDungeon('dungeon-001')))).toBe('dungeons/light-world/hyrule-castle.ts');
  });

  it('files an area and a location by world', { tags: ['critical'] }, () => {
    expect(resolved(areaRecordFile({ world: 'light' }))).toBe('areas/light-world.ts');
    expect(resolved(areaRecordFile({ world: 'dark' }))).toBe('areas/dark-world.ts');
    expect(resolved(locationRecordFile({ areaId: 'area-001' }))).toBe('locations/light-world.ts');
    expect(resolved(locationRecordFile({ areaId: 'area-002' }))).toBe('locations/dark-world.ts');
  });
});
