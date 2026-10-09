/* @layer tests @kind test */
import { it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { all } from '@shared/game/data';
import { buildSchema } from '../../../apps/web/src/ui/design-system/data/schema/build-schema';
import { CompactRecordView } from '../../../apps/web/src/ui/design-system/composites/CompactRecordView';
import type { FieldDescriptor, SchemaConfig } from '../../../apps/web/src/ui/design-system/data/schema/field-descriptor';
import { describeDataset } from '../../dataset-guard';
import { field } from './field';
import { renderRecord } from './render-record';

describeDataset('CompactRecordView with the optional groups/field allow-list', () => {
  const record = { fromScreenId: 'screen-001', toScreenId: 'screen-002', direction: 'north', tags: ['a'] };
  const schema: readonly FieldDescriptor[] = [
    field('idRef', { path: 'fromScreenId', label: 'From Screen Id', targetKind: 'screen' }),
    field('idRef', { path: 'toScreenId', label: 'To Screen Id', targetKind: 'screen' }),
    field('enum', { path: 'direction', label: 'Direction', options: ['north', 'south'] }),
    field('array', { path: 'tags', label: 'Tags', of: field('string', { path: 'tags[]' }) }),
  ];
  const config: SchemaConfig = {
    groups: [
      { id: 'ends', label: 'Endpoints', paths: ['fromScreenId', 'toScreenId'] },
      { id: 'meta', label: 'Meta', paths: ['direction', 'tags'] },
    ],
  };

  it('shows every group and field with no allow-list at all', () => {
    const markup = renderToStaticMarkup(createElement(CompactRecordView, { record, schema, config }));
    expect(markup).toContain('Endpoints');
    expect(markup).toContain('Meta');
    expect(markup).toContain('Direction');
    expect(markup).toContain('Tags');
  });

  it('keeps a whole group when its id is on the allow-list, and drops the rest', () => {
    const markup = renderToStaticMarkup(createElement(CompactRecordView, {
      record, schema, config, groups: ['ends'],
    }));
    expect(markup).toContain('From Screen Id');
    expect(markup).toContain('To Screen Id');
    expect(markup).not.toContain('Meta');
    expect(markup).not.toContain('Direction');
    expect(markup).not.toContain('Tags');
  });

  it('pulls one field out of an otherwise-excluded group when only its path is listed', () => {
    const markup = renderToStaticMarkup(createElement(CompactRecordView, {
      record, schema, config, groups: ['ends', 'direction'],
    }));
    expect(markup).toContain('Endpoints');
    expect(markup).toContain('Meta');
    expect(markup).toContain('Direction');
    expect(markup).not.toContain('Tags');
  });

  it('shows nothing but the empty-state copy when the allow-list matches no group or field', () => {
    const markup = renderToStaticMarkup(createElement(CompactRecordView, {
      record, schema, config, groups: ['nonexistent'],
    }));
    expect(markup).toContain('This record has no fields to show.');
  });
});

describeDataset('CompactRecordView on real records from several collections', () => {
  const COLLECTIONS = [
    { kind: 'screen' as const, rows: all('screen') },
    { kind: 'connection' as const, rows: all('connection') },
    { kind: 'item' as const, rows: all('item') },
  ];

  for (const { kind, rows } of COLLECTIONS) {
    it(`${kind}: renders every real record without throwing`, () => {
      const schema = buildSchema(rows);
      for (const row of rows) {
        expect(
          () => renderToStaticMarkup(createElement(CompactRecordView, { record: row, schema })),
          `${kind} ${String((row as { id?: string }).id)}`,
        ).not.toThrow();
      }
    });
  }

  it('recurses one level into a nested object field, then falls back for what is nested past it', () => {
    const rows = all('connection');
    const withRect = rows.find((row) => row.placement.form === 'area') ?? rows[0];
    const schema = buildSchema(rows);
    const markup = renderRecord(withRect, schema);
    expect(markup).toContain('title="placement"');
    expect(markup).toContain('title="placement.form"');
    expect(markup).toContain('title="placement.rect"');
    expect(markup).not.toContain('title="placement.rect.x"');
  });

  it('recurses one level into a real object field the same way', () => {
    const rows = all('item');
    const schema = buildSchema(rows);
    const withGameId = rows.find((row) => (row as { gameId?: unknown }).gameId !== undefined) ?? rows[0];
    const markup = renderRecord(withGameId, schema);
    expect(markup).toContain('title="gameId"');
    expect(markup).toContain('title="gameId.receiveItemId"');
  });
});
