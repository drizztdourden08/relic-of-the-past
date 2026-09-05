/* @layer test @kind test */
/**
 * Structural diff + line mapping, over the shapes real records have: an array
 * field (tags), a union (requirements), a nested object (placement.rect), and
 * a deeply nested one (nav.fromPoint.position).
 */
import { describe, it, expect } from 'vitest';
import { changedPaths, linesForPaths } from '@shared/game/recommendations';
import { serializeConnectionRecord } from '@shared/game/data/record-codegen';
import type { ConnectionRecord } from '@shared/game/data';

const base = (): ConnectionRecord => ({
  id: 'connection-001',
  kind: 'entrance',
  screenId: 'screen-100',
  toConnectionId: 'connection-002',
  canExit: true,
  tags: ['tag-074', 'tag-061'],
  placement: {
    form: 'border', side: 'north', rect: { x: 4, y: 0, w: 5, h: 1 },
    tiles: [{ x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }],
  },
});

describe('changedPaths', () => {
  it('reports nothing for structurally identical records', () => {
    expect(changedPaths(base(), base())).toEqual([]);
  });

  it('ignores key ORDER, so a reordered object is not a change', () => {
    const reordered = { toConnectionId: 'connection-002', screenId: 'screen-100' };
    const original = { screenId: 'screen-100', toConnectionId: 'connection-002' };
    expect(changedPaths(original, reordered)).toEqual([]);
  });

  it('reports a changed scalar at its own top-level path', () => {
    expect(changedPaths(base(), { ...base(), canExit: false })).toEqual(['canExit']);
  });

  it('reports an array element at its index, not the whole array', () => {
    const next = { ...base(), tags: ['tag-074', 'tag-099'] as ConnectionRecord['tags'] };
    expect(changedPaths(base(), next)).toEqual(['tags[1]']);
  });

  it('reports an appended array element and leaves the untouched ones alone', () => {
    const next = { ...base(), tags: ['tag-074', 'tag-061', 'tag-051'] as ConnectionRecord['tags'] };
    expect(changedPaths(base(), next)).toEqual(['tags[2]']);
  });

  it('reports a deeply nested change at its real path', () => {
    const next = base();
    const nextPlacement = { ...next.placement, rect: { ...next.placement.rect, w: 12 } };
    expect(changedPaths(base(), { ...next, placement: nextPlacement })).toEqual(['placement.rect.w']);
  });

  it('reports a union field that switched variant at the paths that differ', () => {
    const withItem = { itemId: 'item-032' as const };
    const withAllOf = { allOf: [{ itemId: 'item-032' as const }, { itemId: 'item-075' as const }] };
    const paths = changedPaths({ ...base(), requirements: withItem }, { ...base(), requirements: withAllOf });
    // The variant that appeared and the one that vanished both report LEAVES,
    // so a comparison view has a path for every line it needs to mark.
    expect(paths).toContain('requirements.allOf[0].itemId');
    expect(paths).toContain('requirements.itemId');
  });

  it('treats an absent key and an explicitly undefined one as the same', () => {
    const withUndefined = { ...base(), nav: undefined };
    expect(changedPaths(base(), withUndefined)).toEqual([]);
  });

  it('reports a shape change at its own path instead of recursing into it', () => {
    const paths = changedPaths({ nav: { weight: 1 } }, { nav: 3 });
    expect(paths).toEqual(['nav']);
  });

  it('reports every declared leaf when there is no current record (a create)', () => {
    const paths = changedPaths(null, { screenId: 'screen-100', tags: ['tag-073'] });
    expect(paths).toEqual(['screenId', 'tags[0]']);
  });

  it('reports the leaves of a subtree the proposal removes', () => {
    const withNav = { ...base(), nav: { transitType: 'walk', weight: 2 } };
    expect(changedPaths(withNav, base())).toEqual(['nav.transitType', 'nav.weight']);
  });
});

describe('linesForPaths', () => {
  const source = serializeConnectionRecord(base());

  it('maps a top-level field to the line it is written on', () => {
    const [line] = linesForPaths(source, ['canExit']);
    expect(source.split('\n')[line - 1]).toContain('canExit');
  });

  it('maps a nested path to the line holding that leaf', () => {
    const [line] = linesForPaths(source, ['placement.rect.w']);
    expect(source.split('\n')[line - 1]).toContain('w');
  });

  it('falls back to the nearest declared ancestor for a path the source lacks', () => {
    const [line] = linesForPaths(source, ['placement.rect.zzz']);
    expect(source.split('\n')[line - 1]).toContain('rect');
  });

  it('returns sorted, deduplicated lines when several paths share one', () => {
    const lines = linesForPaths(source, ['tags[0]', 'tags[1]', 'canExit']);
    expect(lines).toEqual([...lines].sort((a, b) => a - b));
    expect(new Set(lines).size).toBe(lines.length);
  });

  it('reads plain JSON and the record emitter output', () => {
    const json = JSON.stringify(base(), null, 2);
    const [line] = linesForPaths(json, ['placement.rect.w']);
    expect(json.split('\n')[line - 1]).toContain('"w"');
  });

  it('does not mistake a brace inside a string for a container', () => {
    const json = JSON.stringify({ name: 'a { b } c', canExit: true }, null, 2);
    const [line] = linesForPaths(json, ['canExit']);
    expect(json.split('\n')[line - 1]).toContain('"canExit"');
  });
});
