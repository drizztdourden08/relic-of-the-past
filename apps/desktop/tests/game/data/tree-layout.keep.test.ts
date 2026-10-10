/* @layer tests @kind test */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import { describe, expect, it } from 'vitest';
import { all, actorRecordFile, areaRecordFile, checkRecordFile, connectionRecordFile, dungeonRecordFile, DUNGEON_FLOORS, itemRecordFile, locationRecordFile, recordArrayName, regionRecordFile, screenRecordFile, SPLIT_BY_HALF } from '@rotp/game-data';
import { describeDataset } from '../../dataset-guard';
import { REPO_ROOT } from '../../repo-root';
import { required } from '../../required';

const ROOT = join(REPO_ROOT, 'packages', 'game-data', 'src', 'data', 'records');

const COLLECTIONS = [
  'actors', 'areas', 'checks', 'connections', 'dungeons', 'enumeration',
  'item-groups', 'items', 'locations', 'names', 'native-tables', 'regions', 'screens', 'tags',
];

const EVENT_SUPPORT = ['event-bits.constants.ts', 'event-record.ts', 'event-screens.constants.ts'];

const walk = (dir: string): string[] => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [relative(ROOT, path).replace(/\\/g, '/')];
});

const FILES = walk(ROOT);
const SOURCES = new Map(FILES.filter(f => f.endsWith('.ts')).map(f => [f, readFileSync(join(ROOT, f), 'utf-8')]));

const fileHolding = (id: string): string | null => {
  for (const [file, source] of SOURCES) if (source.includes(`id: '${id}'`)) return file;
  return null;
};

const filings = <T extends { id: string }>(records: readonly T[], target: (record: T) => string | null) =>
  records.map(record => ({ id: record.id, wanted: target(record), found: fileHolding(record.id) }));

const mismatched = (entries: { id: string; wanted: string | null; found: string | null }[]): string[] => entries
  .filter(entry => entry.wanted !== null && entry.wanted !== entry.found)
  .map(entry => `${entry.id}: sits in ${entry.found}, the layout says ${entry.wanted}`);

const halfFilesOf = ([stem, names]: [string, readonly string[]]): string[] =>
  names.map(name => `screens/dark-world/${stem}/${name}.ts`);

const declaredFloors = (stem: string, floor: string): readonly number[] | undefined =>
  DUNGEON_FLOORS[stem]?.find(([name]) => name === `floor-${floor}`)?.[1];

const isEventSupportFile = (file: string): boolean => EVENT_SUPPORT.some(name => file === `checks/events/${name}`);

describe('the record tree', () => {
  it('holds only the collections the layout declares', () => {
    const folders = [...new Set(FILES.map(file => file.split('/')[0]))].sort();
    expect(folders).toEqual(COLLECTIONS);
  });

  it('names no file by a size split', () => {
    const numbered = FILES
      .filter(file => /-\d+\.ts$/.test(file))
      .filter(file => !/\/floor-[\db-]+\.ts$/.test(file));
    expect(numbered).toEqual([]);
  });

  it('keeps every collection to one shape of path', () => {
    const shapes = {
      screens: /^(light|dark)-world\/([a-z-]+\/[a-z\d-]+)\.ts$/,
      connections: /^(light|dark)-world\/([a-z-]+\/[a-z\d-]+)\.ts$/,
      checks: /^((light|dark)-world\/([a-z-]+\/)?[a-z-]+|events\/([a-z-]+\/)?[a-z-]+(\.constants|\.generated)?)\.ts$/,
      items: /^([a-z-]+|dungeon-items\/(light|dark)-world\/[a-z-]+)\.ts$/,
      dungeons: /^(light|dark)-world\/[a-z-]+\.ts$/,
      regions: /^(light|dark)-world\/[a-z-]+\.ts$/,
      areas: /^(light|dark)-world\.ts$/,
      locations: /^(light|dark)-world\.ts$/,
    };
    const wrong: string[] = [];
    for (const [collection, shape] of Object.entries(shapes)) {
      for (const file of FILES.filter(f => f.startsWith(`${collection}/`))) {
        if (!shape.test(file.slice(collection.length + 1))) wrong.push(file);
      }
    }
    expect(wrong).toEqual([]);
  });

  it('names the array in every record file after its own path', () => {
    const wrong: string[] = [];
    for (const [file, source] of SOURCES) {
      const name = recordArrayName(file);
      if (!name) continue;
      if (!source.includes(`const ${name}:`)) wrong.push(`${file} does not export ${name}`);
    }
    expect(wrong).toEqual([]);
  });

  it('names every dungeon folder after a dungeon record', () => {
    const stems = new Set(all('dungeon').map(dungeon => dungeon.fileStem));
    const folders = FILES
      .filter(file => /^(screens|connections)\/(light|dark)-world\//.test(file))
      .map(file => required(file.split('/')[2], `the dungeon folder of ${file}`))
      .filter(folder => folder !== 'overworld' && folder !== 'interiors');
    for (const folder of new Set(folders)) expect(stems.has(folder), folder).toBe(true);
  });
});

describeDataset('every record sits where its own fields put it', () => {
  it('files a screen by its world, its area or its dungeon and floor', () => {
    const entries = filings(all('screen'), screen => screenRecordFile(screen).relativePath);
    expect(mismatched(entries)).toEqual([]);
    const halves = Object.entries(SPLIT_BY_HALF).flatMap(halfFilesOf);
    const unresolved = entries.filter(entry => entry.wanted === null);
    expect(unresolved.length).toBeGreaterThan(0);
    for (const entry of unresolved) expect(halves, entry.id).toContain(entry.found);
  });

  it('files a connection with the screen it names', () => {
    const entries = filings(all('connection'), c => connectionRecordFile(c.screenId).relativePath);
    expect(mismatched(entries)).toEqual([]);
  });

  it('files a check, an item, an actor, a dungeon, an area and a location by its own rule', () => {
    expect(mismatched(filings(all('check'), c => (c.kind === 'event' ? null : checkRecordFile(c).relativePath)))).toEqual([]);
    expect(mismatched(filings(all('item'), i => itemRecordFile(i).relativePath))).toEqual([]);
    expect(mismatched(filings(all('actor'), a => actorRecordFile(a).relativePath))).toEqual([]);
    expect(mismatched(filings(all('dungeon'), d => dungeonRecordFile(d).relativePath))).toEqual([]);
    expect(mismatched(filings(all('area'), a => areaRecordFile(a).relativePath))).toEqual([]);
    expect(mismatched(filings(all('location'), l => locationRecordFile(l).relativePath))).toEqual([]);
    expect(mismatched(filings(all('region'), r => regionRecordFile(r).relativePath))).toEqual([]);
  });

  it('keeps a dungeon floor file to the floors it declares', () => {
    const wrong: string[] = [];
    for (const screen of all('screen')) {
      const file = fileHolding(screen.id);
      const match = file && /^screens\/(light|dark)-world\/([a-z-]+)\/floor-([\db-]+)\.ts$/.exec(file);
      if (!match) continue;
      const floors = declaredFloors(required(match[2], 'the dungeon stem'), required(match[3], 'the floor name'));
      const floor = screen.position?.floor;
      if (floor === undefined || !floors?.includes(floor)) wrong.push(`${screen.id} in ${file}`);
    }
    expect(wrong).toEqual([]);
  });

  it('keeps an overworld or interiors file to one area', () => {
    const areasPerFile = new Map<string, Set<string>>();
    for (const screen of all('screen')) {
      const file = fileHolding(screen.id);
      if (!file || !/\/(overworld|interiors)\//.test(file)) continue;
      if (!areasPerFile.has(file)) areasPerFile.set(file, new Set());
      areasPerFile.get(file)?.add(screen.areaId);
    }
    const shared = [...areasPerFile.entries()]
      .filter(([file, areas]) => areas.size > 1 && !file.endsWith('/special.ts'))
      .map(([file, areas]) => `${file}: ${[...areas].join(', ')}`);
    expect(shared).toEqual([]);
  });

  it('holds no support file under events that carries a record', () => {
    const support = FILES.filter(isEventSupportFile);
    expect(support.length).toBe(EVENT_SUPPORT.length);
    for (const file of support) expect(SOURCES.get(file)?.includes("id: 'check-"), file).toBe(false);
  });
});
