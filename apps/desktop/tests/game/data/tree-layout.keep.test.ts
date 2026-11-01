/* @layer tests @kind test */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import { expect, it } from 'vitest';
import { all, actorRecordFile, areaRecordFile, checkRecordFile, connectionRecordFile, dungeonRecordFile, itemRecordFile, locationRecordFile, regionRecordFile, screenRecordFile, SPLIT_BY_HALF } from '@rotp/game-data';
import { describeDataset } from '../../dataset-guard';
import { REPO_ROOT } from '../../repo-root';

const ROOT = join(REPO_ROOT, 'packages', 'game-data', 'src', 'data', 'records');

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

describeDataset('every record sits where its own fields put it', () => {
  it('files a screen by its world, its area or its dungeon and floor', { tags: ['standard'] }, () => {
    const entries = filings(all('screen'), screen => screenRecordFile(screen).relativePath);
    expect(mismatched(entries)).toEqual([]);
    const halves = Object.entries(SPLIT_BY_HALF).flatMap(halfFilesOf);
    const unresolved = entries.filter(entry => entry.wanted === null);
    expect(unresolved.length).toBeGreaterThan(0);
    for (const entry of unresolved) expect(halves, entry.id).toContain(entry.found);
  });

  it('files a connection with the screen it names', { tags: ['standard'] }, () => {
    const entries = filings(all('connection'), c => connectionRecordFile(c.screenId).relativePath);
    expect(mismatched(entries)).toEqual([]);
  });

  it('files a check, an item, an actor, a dungeon, an area and a location by its own rule', { tags: ['standard'] }, () => {
    expect(mismatched(filings(all('check'), c => (c.kind === 'event' ? null : checkRecordFile(c).relativePath)))).toEqual([]);
    expect(mismatched(filings(all('item'), i => itemRecordFile(i).relativePath))).toEqual([]);
    expect(mismatched(filings(all('actor'), a => actorRecordFile(a).relativePath))).toEqual([]);
    expect(mismatched(filings(all('dungeon'), d => dungeonRecordFile(d).relativePath))).toEqual([]);
    expect(mismatched(filings(all('area'), a => areaRecordFile(a).relativePath))).toEqual([]);
    expect(mismatched(filings(all('location'), l => locationRecordFile(l).relativePath))).toEqual([]);
    expect(mismatched(filings(all('region'), r => regionRecordFile(r).relativePath))).toEqual([]);
  });
});
