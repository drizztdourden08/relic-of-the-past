/* @layer tests @kind test */
/**
 * The tag collection as the inspector sees it: its own collection, a schema
 * with the hierarchy on it, and a `tags` field on any OTHER collection reading
 * as a reference to it (what puts the real picker behind a former free-text edit).
 */
import { describe, it, expect } from 'vitest';
import { all } from '@shared/game/data';
import { COLLECTION_SOURCES } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/collection-sources';
import {
  ENTITY_KINDS, KIND_NAV_ITEMS,
} from '../../apps/web/src/ui/domains/app/views/DataInspector/DataInspector.constants';
import { resolveIdRefOptionsFor } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/id-ref-options';
import { resolveIdRef } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/id-ref-target';
import { buildSchema } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import type { FieldDescriptor } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';
import { describeDataset } from '../dataset-guard';

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
    expect(source.serialize?.(source.rows[0])).toContain("id: 'tag-001'");
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
    // The label a picker shows is the term, which is what a person searches for.
    expect(options.find(option => option.value === 'tag-001')?.label).toBe('env:outdoor');
  });

  it('resolves a clicked reference back to the tag collection', () => {
    expect(resolveIdRef('tag-001', 'tag')).toEqual({ kind: 'tag', id: 'tag-001', label: 'env:outdoor' });
    // And from the id alone, with no published target kind.
    expect(resolveIdRef('tag-001', undefined)?.kind).toBe('tag');
  });
});
