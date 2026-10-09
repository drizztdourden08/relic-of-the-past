/* @layer tests @kind test */
import { it, expect } from 'vitest';
import type { FieldDescriptor } from '@drizztdourden08/tessera/data';
import { describeDataset } from '../../dataset-guard';
import { field } from './field';
import { renderRecord } from './render-record';

describeDataset('CompactRecordView renders one row per field kind', () => {
  const record = {
    title: 'a piece of free text',
    count: 42,
    isOpen: true,
    direction: 'north',
    screenId: 'screen-183',
    tags: ['first', 'second', 'third'],
    blob: { x: 1, y: 2 },
    variant: { nothingKnown: true },
    odd: { nested: 'thing' },
  };
  const schema: readonly FieldDescriptor[] = [
    field('string', { path: 'title', label: 'Title' }),
    field('number', { path: 'count', label: 'Count' }),
    field('boolean', { path: 'isOpen', label: 'Is Open' }),
    field('enum', { path: 'direction', label: 'Direction', options: ['north', 'south'] }),
    field('idRef', { path: 'screenId', label: 'Screen Id', targetKind: 'screen' }),
    field('array', { path: 'tags', label: 'Tags', of: field('string', { path: 'tags[]' }) }),
    field('object', { path: 'blob', label: 'Blob' }),
    field('union', { path: 'variant', label: 'Variant' }),
    field('unknown', { path: 'odd', label: 'Odd' }),
  ];

  it('renders without throwing and shows one label per field', () => {
    const markup = renderRecord(record, schema);
    expect(markup).toContain('Title');
    expect(markup).toContain('Count');
    expect(markup).toContain('Is Open');
    expect(markup).toContain('Direction');
    expect(markup).toContain('Screen Id');
    expect(markup).toContain('Tags');
    expect(markup).toContain('Blob');
    expect(markup).toContain('Variant');
    expect(markup).toContain('Odd');
  });

  it('shows the string, number and array kits\' own compact text', () => {
    const markup = renderRecord(record, schema);
    expect(markup).toContain('a piece of free text');
    expect(markup).toContain('42');
    expect(markup).toContain('first, second, third');
  });

  it('shows the boolean and enum kits\' own badge text', () => {
    const markup = renderRecord(record, schema);
    expect(markup).toContain('Yes');
    expect(markup).toContain('north');
  });

  it('marks the id-ref cell with the id and its target kind, for cross-record navigation', () => {
    const markup = renderRecord(record, schema);
    expect(markup).toContain('data-id-ref="screen-183"');
    expect(markup).toContain('data-target-kind="screen"');
  });

  it('shows the raw id, same as always, with no resolver passed in', () => {
    const markup = renderRecord(record, schema);
    expect(markup).toContain('>screen-183<');
  });

  it('falls back to the flattened summary for an object/union field with no children described', () => {
    const markup = renderRecord(record, schema);
    expect(markup).toContain('x: 1, y: 2');
    expect(markup).not.toContain('compact-record-view__nest"');
  });
});
