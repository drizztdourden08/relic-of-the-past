/* @layer tests @kind test */
import { it, expect } from 'vitest';
import { all } from '@rotp/game-data';
import { resolveIdRefOptionsFor } from '@app/views/DataInspector/behavior/id-ref-options';
import { resolveIdRef } from '@app/views/DataInspector/behavior/id-ref-target';
import { buildSchema } from '@drizztdourden08/tessera/data';
import type { FieldDescriptor } from '@drizztdourden08/tessera/data';
import { describeDataset } from '../dataset-guard';

const fieldAt = (rows: readonly unknown[], path: string): FieldDescriptor => {
  const field = buildSchema(rows).find(entry => entry.path === path);
  if (!field) throw new Error(`no field at ${path}`);
  return field;
};

describeDataset('a tag field is now a reference', { tags: ['standard'] }, () => {
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
