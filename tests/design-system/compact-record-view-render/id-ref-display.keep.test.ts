/* @layer tests @kind test */
import { it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { all } from '@shared/game/data';
import { buildSchema } from '@drizztdourden08/tessera/data';
import { CompactRecordView } from '@drizztdourden08/tessera/composites';
import { defaultIdRefDisplay } from '../../../apps/web/src/ui/domains/app/views/DataInspector/behavior/record-links';
import type { FieldDescriptor } from '@drizztdourden08/tessera/data';
import { describeDataset } from '../../dataset-guard';
import { field } from './field';

describeDataset('CompactRecordView calls resolveIdRefDisplay, this view\'s one lookup', () => {
  const record = {
    title: 'Jail Cell',
    screenId: 'screen-183',
    nested: { areaId: 'area-011' },
  };
  const schema: readonly FieldDescriptor[] = [
    field('string', { path: 'title', label: 'Title' }),
    field('idRef', { path: 'screenId', label: 'Screen Id', targetKind: 'screen' }),
    field('object', { path: 'nested', label: 'Nested', children: [
      field('idRef', { path: 'nested.areaId', label: 'Area Id', targetKind: 'area' }),
    ] }),
  ];

  const withResolver = (resolveIdRefDisplay?: (id: string, targetKind?: string) => string | undefined) =>
    renderToStaticMarkup(createElement(CompactRecordView, { record, schema, resolveIdRefDisplay }));

  it('shows the resolved name in place of the id when a resolver is passed', () => {
    const markup = withResolver(() => 'Jail Cell (screen)');
    expect(markup).toContain('Jail Cell (screen)');
    expect(markup).not.toContain('>screen-183<');
  });

  it('keeps the real id on the element no matter what text is shown', () => {
    const markup = withResolver(() => 'Jail Cell (screen)');
    expect(markup).toContain('data-id-ref="screen-183"');
    expect(markup).toContain('data-target-kind="screen"');
  });

  it('passes the field\'s own targetKind through as the hint', () => {
    const seen: Array<[string, string | undefined]> = [];
    withResolver((id, targetKind) => { seen.push([id, targetKind]); return undefined; });
    expect(seen).toContainEqual(['screen-183', 'screen']);
  });

  it('falls back to the id when the resolver answers nothing', () => {
    const markup = withResolver(() => undefined);
    expect(markup).toContain('>screen-183<');
  });

  it('threads through one level of recursion, so a nested reference resolves too', () => {
    const markup = withResolver((id) => (id === 'area-011' ? 'The Sanctuary Grounds' : undefined));
    expect(markup).toContain('The Sanctuary Grounds');
  });

  it('never calls the resolver for a non-reference field', () => {
    const seen: string[] = [];
    withResolver((id) => { seen.push(id); return undefined; });
    expect(seen.sort()).toEqual(['area-011', 'screen-183']);
  });
});

describeDataset('CompactRecordView calls resolveIdRefDisplay across a real collection join', () => {
  it('resolves a real screen\'s areaId to the area\'s own name, via defaultIdRefDisplay', () => {
    const rows = all('screen');
    const withArea = rows.find((row) => typeof row.areaId === 'string');
    if (!withArea) throw new Error('no screen carries an area reference');
    const schema = buildSchema(rows);
    const markup = renderToStaticMarkup(createElement(CompactRecordView, {
      record: withArea, schema, resolveIdRefDisplay: defaultIdRefDisplay,
    }));
    const area = all('area').find((entry) => entry.id === withArea.areaId);
    expect(area).toBeDefined();
    expect(markup).toContain(area!.name);
    expect(markup).toContain(`data-id-ref="${withArea.areaId}"`);
  });
});

describeDataset('CompactRecordView given an array of idRef elements', () => {
  const record = { title: 'A Shop', tags: ['tag-001', 'tag-002'] };
  const schema: readonly FieldDescriptor[] = [
    field('string', { path: 'title', label: 'Title' }),
    field('array', {
      path: 'tags', label: 'Tags', of: field('idRef', { path: 'tags[]', targetKind: 'tag' }),
    }),
  ];
  const names: Record<string, string> = { 'tag-001': 'Key', 'tag-002': 'Boss' };

  it('resolves each entry through the SAME top-level resolver a scalar reference uses', () => {
    const markup = renderToStaticMarkup(createElement(CompactRecordView, {
      record, schema, resolveIdRefDisplay: (id) => names[id],
    }));
    expect(markup).toContain('Key (tag-001)');
    expect(markup).toContain('Boss (tag-002)');
  });

  it('marks every entry for cross-record navigation', () => {
    const markup = renderToStaticMarkup(createElement(CompactRecordView, {
      record, schema, resolveIdRefDisplay: (id) => names[id],
    }));
    expect(markup).toContain('data-id-ref="tag-001"');
    expect(markup).toContain('data-id-ref="tag-002"');
    expect(markup).toContain('data-target-kind="tag"');
  });

  it('falls back to each entry\'s bare id with no resolver passed in', () => {
    const markup = renderToStaticMarkup(createElement(CompactRecordView, { record, schema }));
    expect(markup).toContain('>tag-001<');
    expect(markup).toContain('>tag-002<');
  });
});
