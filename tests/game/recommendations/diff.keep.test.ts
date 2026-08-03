/* @layer test @kind test */
/**
 * Structural diff + line mapping. Genuinely new logic with no precedent in the
 * codebase, so the shapes exercised here are the ones real records actually
 * have: an array field (tags), a union field (placement), and a deeply nested
 * object (nav.fromPoint.position).
 */
import { describe, it, expect } from 'vitest';
import { changedPaths, linesForPaths } from '@shared/game/recommendations';
import { serializeConnectionRecord } from '@shared/game/data/record-codegen';
import type { ConnectionRecord } from '@shared/game/data';

const base = (): ConnectionRecord => ({
  id: 'connection-001',
  kind: 'entrance',
  fromScreenId: 'screen-100',
  toScreenId: 'screen-200',
  direction: 'two-way',
  tags: ['tag-073', 'tag-074'],
  placement: { at: 'side', side: 'north', tileRange: { axis: 'x', start: 4, end: 8 } },
});

describe('changedPaths', () => {
  it('reports nothing for structurally identical records', () => {
    expect(changedPaths(base(), base())).toEqual([]);
  });

  it('ignores key ORDER — a reordered object is not a change', () => {
    const reordered = { toScreenId: 'screen-200', fromScreenId: 'screen-100' };
    const original = { fromScreenId: 'screen-100', toScreenId: 'screen-200' };
    expect(changedPaths(original, reordered)).toEqual([]);
  });

  it('reports a changed scalar at its own top-level path', () => {
    expect(changedPaths(base(), { ...base(), direction: 'one-way' })).toEqual(['direction']);
  });

  it('reports an array element at its index, not the whole array', () => {
    const next = { ...base(), tags: ['tag-073', 'tag-099'] as ConnectionRecord['tags'] };
    expect(changedPaths(base(), next)).toEqual(['tags[1]']);
  });

  it('reports an appended array element and leaves the untouched ones alone', () => {
    const next = { ...base(), tags: ['tag-073', 'tag-074', 'tag-051'] as ConnectionRecord['tags'] };
    expect(changedPaths(base(), next)).toEqual(['tags[2]']);
  });

  it('reports a deeply nested change at its real path', () => {
    const next = base();
    const nextPlacement = { at: 'side' as const, side: 'north' as const, tileRange: { axis: 'x' as const, start: 4, end: 12 } };
    expect(changedPaths(base(), { ...next, placement: nextPlacement })).toEqual(['placement.tileRange.end']);
  });

  it('reports a union field that switched variant at the paths that differ', () => {
    const areaPlacement = { at: 'area' as const, rect: { x: 1, y: 2, w: 4, h: 4 } };
    const paths = changedPaths(base(), { ...base(), placement: areaPlacement });
    expect(paths).toContain('placement.at');
    // The variant that appeared and the one that vanished both report LEAVES,
    // so a comparison view has a path for every line it needs to mark.
    expect(paths).toContain('placement.rect.w');
    expect(paths).toContain('placement.tileRange.start');
  });

  it('treats an absent key and an explicitly undefined one as the same', () => {
    const withUndefined = { ...base(), nav: undefined };
    expect(changedPaths(base(), withUndefined)).toEqual([]);
  });

  it('reports a shape change at its own path rather than recursing into it', () => {
    const paths = changedPaths({ nav: { weight: 1 } }, { nav: 3 });
    expect(paths).toEqual(['nav']);
  });

  it('reports every declared leaf when there is no current record (a create)', () => {
    const paths = changedPaths(null, { fromScreenId: 'screen-100', tags: ['tag-073'] });
    expect(paths).toEqual(['fromScreenId', 'tags[0]']);
  });

  it('reports the leaves of a subtree the proposal removes', () => {
    const withNav = { ...base(), nav: { transitType: 'walk', weight: 2 } };
    expect(changedPaths(withNav, base())).toEqual(['nav.transitType', 'nav.weight']);
  });
});

describe('linesForPaths', () => {
  const source = serializeConnectionRecord(base());

  it('maps a top-level field to the line it is written on', () => {
    const [line] = linesForPaths(source, ['direction']);
    expect(source.split('\n')[line - 1]).toContain('direction');
  });

  it('maps a nested path to the line holding that leaf', () => {
    const [line] = linesForPaths(source, ['placement.tileRange.end']);
    expect(source.split('\n')[line - 1]).toContain('end');
  });

  it('falls back to the nearest declared ancestor for a path the source lacks', () => {
    const [line] = linesForPaths(source, ['placement.rect.w']);
    expect(source.split('\n')[line - 1]).toContain('placement');
  });

  it('returns sorted, deduplicated lines when several paths share one', () => {
    const lines = linesForPaths(source, ['tags[0]', 'tags[1]', 'direction']);
    expect(lines).toEqual([...lines].sort((a, b) => a - b));
    expect(new Set(lines).size).toBe(lines.length);
  });

  it('reads plain JSON as well as the record emitter output', () => {
    const json = JSON.stringify(base(), null, 2);
    const [line] = linesForPaths(json, ['placement.tileRange.start']);
    expect(json.split('\n')[line - 1]).toContain('"start"');
  });

  it('does not mistake a brace inside a string for a container', () => {
    const json = JSON.stringify({ name: 'a { b } c', direction: 'two-way' }, null, 2);
    const [line] = linesForPaths(json, ['direction']);
    expect(json.split('\n')[line - 1]).toContain('"direction"');
  });
});
