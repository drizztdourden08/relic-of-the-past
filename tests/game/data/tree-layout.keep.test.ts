/* @layer tests @kind test */
/**
 * The record tree's shape, against the records themselves.
 *
 * One convention: `<collection>/<world>-world/<overworld|interiors|dungeon>/<area-or-floor>.ts`.
 * A record's world, its area or dungeon, and a dungeon room's floor decide the path, so a file
 * can be found by walking the tree the way the game is walked. Nothing is split by size, so no
 * file is named `-1` or `-2`.
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import { describe, expect, it } from 'vitest';
import { all } from '@shared/game/data';
import {
  actorRecordFile, areaRecordFile, checkRecordFile, connectionRecordFile, dungeonRecordFile,
  DUNGEON_FLOORS, itemRecordFile, locationRecordFile, recordArrayName, regionRecordFile,
  screenRecordFile, SPLIT_BY_HALF,
} from '@shared/game/data/record-file-targets';
import { describeDataset } from '../../dataset-guard';

const ROOT = join(__dirname, '..', '..', '..', 'shared', 'game', 'data', 'records');

/** The collections the tree holds, and nothing else. */
const COLLECTIONS = [
  'actors', 'areas', 'checks', 'connections', 'dungeons', 'enumeration',
  'item-groups', 'items', 'locations', 'names', 'native-tables', 'regions', 'screens',
  'sprite-manifest', 'tags',
];

/** The files under `checks/events/` that hold no record of their own. */
const EVENT_SUPPORT = ['event-bits.ts', 'event-record.ts', 'event-screens.data.ts'];

const walk = (dir: string): string[] => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [relative(ROOT, path).replace(/\\/g, '/')];
});

const FILES = walk(ROOT);
const SOURCES = new Map(FILES.filter(f => f.endsWith('.ts')).map(f => [f, readFileSync(join(ROOT, f), 'utf-8')]));

/** The file a record id is written in, or null when the tree holds it nowhere. */
const fileHolding = (id: string): string | null => {
  for (const [file, source] of SOURCES) if (source.includes(`id: '${id}'`)) return file;
  return null;
};

/** Every record of a kind, with the file its resolver names and the file it sits in. */
const filings = <T extends { id: string }>(records: readonly T[], target: (record: T) => string | null) =>
  records.map(record => ({ id: record.id, wanted: target(record), found: fileHolding(record.id) }));

const mismatched = (entries: { id: string; wanted: string | null; found: string | null }[]): string[] => entries
  .filter(entry => entry.wanted !== null && entry.wanted !== entry.found)
  .map(entry => `${entry.id}: sits in ${entry.found}, the layout says ${entry.wanted}`);

describe('the record tree', () => {
  it('holds only the collections the layout declares', () => {
    const folders = [...new Set(FILES.map(file => file.split('/')[0]))].sort();
    expect(folders).toEqual(COLLECTIONS);
  });

  it('names no file by a size split', () => {
    // A trailing number is a FLOOR, which only a dungeon folder's files carry.
    const numbered = FILES
      .filter(file => /-\d+\.ts$/.test(file))
      .filter(file => !/\/floor-[\db-]+\.ts$/.test(file));
    expect(numbered).toEqual([]);
  });

  it('keeps every collection to one shape of path', () => {
    const shapes = {
      screens: /^(light|dark)-world\/([a-z-]+\/[a-z\d-]+)\.ts$/,
      connections: /^(light|dark)-world\/([a-z-]+\/[a-z\d-]+)\.ts$/,
      checks: /^((light|dark)-world\/([a-z-]+\/)?[a-z-]+|events\/([a-z-]+\/)?[a-z-]+(\.data)?)\.ts$/,
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
      .map(file => file.split('/')[2])
      .filter(folder => folder !== 'overworld' && folder !== 'interiors');
    for (const folder of new Set(folders)) expect(stems.has(folder), folder).toBe(true);
  });
});

describeDataset('every record sits where its own fields put it', () => {
  it('files a screen by its world, its area or its dungeon and floor', () => {
    const entries = filings(all('screen'), screen => screenRecordFile(screen).relativePath);
    expect(mismatched(entries)).toEqual([]);
    // The one dungeon filed in halves: its rooms are refused a single destination, so the
    // claim is that they sit in one of the two files it declares.
    const halves = Object.entries(SPLIT_BY_HALF)
      .flatMap(([stem, names]) => names.map(name => `screens/dark-world/${stem}/${name}.ts`));
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
      const floors = DUNGEON_FLOORS[match[2]]?.find(([name]) => name === `floor-${match[3]}`);
      if (!floors?.[1].includes(screen.position?.floor as number)) wrong.push(`${screen.id} in ${file}`);
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
    const support = FILES.filter(file => EVENT_SUPPORT.some(name => file === `checks/events/${name}`));
    expect(support.length).toBe(EVENT_SUPPORT.length);
    for (const file of support) expect(SOURCES.get(file)?.includes("id: 'check-"), file).toBe(false);
  });
});
