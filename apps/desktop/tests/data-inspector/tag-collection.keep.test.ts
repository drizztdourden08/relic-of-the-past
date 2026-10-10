/* @layer tests @kind test */
import { it, expect } from 'vitest';
import { all } from '@rotp/game-data';
import { COLLECTION_SOURCES } from '@app/views/DataInspector/behavior/collection-sources';
import {
  ENTITY_KINDS, KIND_NAV_ITEMS,
} from '@app/views/DataInspector/DataInspector.constants';
import { resolveIdRefOptionsFor } from '@app/views/DataInspector/behavior/id-ref-options';
import { resolveIdRef } from '@app/views/DataInspector/behavior/id-ref-target';
import { buildSchema } from '@drizztdourden08/tessera/data';
import type { FieldDescriptor } from '@drizztdourden08/tessera/data';
import { describeDataset } from '../dataset-guard';
import { required } from '../required';

const fieldAt = (rows: readonly unknown[], path: string): FieldDescriptor => {
  const field = buildSchema(rows).find(entry => entry.path === path);
  if (!field) throw new Error(`no field at ${path}`);
  return field;
};

describeDataset('tags are a collection of their own', () => {
  it('is listed as a kind and given a place in the side menu', () => {
    expect(ENTITY_KINDS).toContain('tag');
    const item = KIND_NAV_ITEMS.find(entry => entry.id === 'tag');
    expect(item?.label).toBe('Tags');
    expect(item?.icon.length).toBeGreaterThan(0);
  });

  it('adapts to a source with real rows and a serializer', () => {
    const source = COLLECTION_SOURCES.tag;
    expect(source.rows.length).toBe(all('tag').length);
    expect(source.rows.length).toBeGreaterThan(0);
    expect(source.serialize?.(required(source.rows[0], 'the first tag row'))).toContain("id: 'tag-001'");
  });

  it('derives the hierarchy as fields, so the collection can be searched by it', () => {
    const paths = buildSchema(COLLECTION_SOURCES.tag.rows).map(field => field.path);
    for (const path of ['id', 'name', 'namespace', 'value', 'label']) {
      expect(paths, path).toContain(path);
    }
  });

  it('opens on the hierarchy instead of on key-insertion order', () => {
    expect(COLLECTION_SOURCES.tag.config?.defaultColumns).toEqual(
      ['id', 'namespace', 'value', 'label', 'appliesTo'],
    );
  });
});

describeDataset('a tag field is now a reference', () => {
  for (const kind of ['screen', 'connection'] as const) {
    it(`${kind}: derives as an array of references into the tag collection`, () => {
      const field = fieldAt(all(kind), 'tags');
      expect(field.kind).toBe('array');
      expect(field.of?.kind).toBe('idRef');
      expect(field.of?.targetKind).toBe('tag');
    });
  }

  it('offers every tag record as a choosable option', () => {
    const field = fieldAt(all('screen'), 'tags');
    const options = resolveIdRefOptionsFor('tag', field.of ?? field);
    expect(options).toHaveLength(all('tag').length);
    expect(options.find(option => option.value === 'tag-001')?.label).toBe('env:outdoor');
  });

  it('resolves a clicked reference back to the tag collection', () => {
    expect(resolveIdRef('tag-001', 'tag')).toEqual({ kind: 'tag', id: 'tag-001', label: 'env:outdoor' });
    expect(resolveIdRef('tag-001', undefined)?.kind).toBe('tag');
  });
});
