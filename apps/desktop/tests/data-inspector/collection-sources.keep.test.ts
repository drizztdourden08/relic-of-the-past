/* @layer tests @kind test */
import { it, expect } from 'vitest';
import { COLLECTION_SOURCES } from '@app/data-inspector/collection-sources';
import { ENTITY_KINDS } from '@app/views/DataInspector/DataInspector.constants';
import { resolveIdRef } from '@app/views/DataInspector/behavior/id-ref-target';
import { describeDataset } from '../dataset-guard';
import { required } from '@rotp/asset-extraction/testing';

describeDataset('collection sources', { tags: ['critical'] }, () => {
  it('emits source text for every collection that has a serializer, and the record is in it', () => {
    for (const kind of ENTITY_KINDS) {
      const source = COLLECTION_SOURCES[kind];
      const first = required(source.rows[0], `a ${kind} row`);
      const code = source.serialize?.(first);
      expect(code, kind).toBeDefined();
      expect(code).toContain(source.getId(first));
    }
  });
});

describeDataset('id reference resolution', { tags: ['critical'] }, () => {
  it('resolves the published target kind and a display name', () => {
    const screen = required(COLLECTION_SOURCES.screen.rows[0], 'a screen row');
    const id = COLLECTION_SOURCES.screen.getId(screen);
    const target = resolveIdRef(id, 'screen');
    expect(target?.kind).toBe('screen');
    expect(target?.id).toBe(id);
    expect(target?.label.length).toBeGreaterThan(0);
  });

  it('falls back to the id prefix when no target kind was published', () => {
    const id = COLLECTION_SOURCES.item.getId(required(COLLECTION_SOURCES.item.rows[0], 'an item row'));
    expect(resolveIdRef(id, undefined)?.kind).toBe('item');
  });

  it('ignores a target kind that names no collection', () => {
    const id = COLLECTION_SOURCES.check.getId(required(COLLECTION_SOURCES.check.rows[0], 'a check row'));
    expect(resolveIdRef(id, 'nonsense')?.kind).toBe('check');
  });

  it('resolves nothing from an absent, blank or unprefixed reference', () => {
    expect(resolveIdRef(undefined, 'screen')).toBeUndefined();
    expect(resolveIdRef('   ', 'screen')).toBeUndefined();
    expect(resolveIdRef('not-a-known-kind-42', undefined)).toBeUndefined();
  });

  it('trims a reference before resolving it', () => {
    const id = COLLECTION_SOURCES.area.getId(required(COLLECTION_SOURCES.area.rows[0], 'an area row'));
    expect(resolveIdRef(` ${id} `, undefined)?.id).toBe(id);
  });
});
