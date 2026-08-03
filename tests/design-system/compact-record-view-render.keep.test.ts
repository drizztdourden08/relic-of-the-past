/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { all } from '@shared/game/data';
import { buildSchema } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import { CompactRecordView } from '../../apps/web/src/ui/design-system/composites/CompactRecordView';
import { defaultIdRefDisplay } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/record-links';
import type { FieldDescriptor, FieldKind, SchemaConfig } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';

// There is no jsdom or testing-library in this repo, so these are SSR smoke
// tests, matching RecordEditor's and the field kits' own render tests: they
// prove the view builds and shows the right text for every field kind, for
// real records of several shapes, and that the optional allow-list actually
// narrows what shows. Hover/tooltip content and clicking an id-ref (which
// needs a browser) are NOT covered here — see the Playwright check instead.

const field = (kind: FieldKind, extra: Partial<FieldDescriptor> = {}): FieldDescriptor => ({
  path: extra.path ?? 'sample', label: 'Sample', kind, optional: false, ...extra,
});

const render = (record: unknown, schema: readonly FieldDescriptor[], groups?: readonly string[]): string =>
  renderToStaticMarkup(createElement(CompactRecordView, { record, schema, groups }));

describe('CompactRecordView — one row per field kind', () => {
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
    const markup = render(record, schema);
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

  it('shows the string, number and array kits’ own compact text', () => {
    const markup = render(record, schema);
    expect(markup).toContain('a piece of free text');
    expect(markup).toContain('42');
    expect(markup).toContain('first, second, third');
  });

  it('shows the boolean and enum kits’ own badge text', () => {
    const markup = render(record, schema);
    expect(markup).toContain('Yes');
    expect(markup).toContain('north');
  });

  it('marks the id-ref cell with the id and its target kind, for cross-record navigation', () => {
    const markup = render(record, schema);
    expect(markup).toContain('data-id-ref="screen-183"');
    expect(markup).toContain('data-target-kind="screen"');
  });

  it('shows the raw id, same as always, with no resolver passed in', () => {
    const markup = render(record, schema);
    expect(markup).toContain('>screen-183<');
  });

  it('falls back to the flattened summary for an object/union field with no children described', () => {
    const markup = render(record, schema);
    // No `children` on either descriptor, so neither nests here — both are
    // leaves rendered by the structured kit's own one-line summary.
    expect(markup).toContain('x: 1, y: 2');
    expect(markup).not.toContain('compact-record-view__nest"');
  });
});

describe('CompactRecordView — resolveIdRefDisplay, this view\'s one lookup', () => {
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
    // Only the two idRef fields (top-level + nested) should ever reach it.
    expect(seen.sort()).toEqual(['area-011', 'screen-183']);
  });
});

describe('CompactRecordView — resolveIdRefDisplay, a real collection join', () => {
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
    expect(markup).toContain(area!.randomizerName);
    expect(markup).toContain(`data-id-ref="${withArea.areaId}"`);
  });
});

describe('CompactRecordView — the optional groups/field allow-list', () => {
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
    // Only one group survives the filter, so — same rule as with no filter at
    // all — its label stays off; a single set never needs a heading.
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

describe('CompactRecordView — an array of idRef elements', () => {
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

describe('CompactRecordView — real records from several collections', () => {
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

  it('recurses one level into a real union branch, then falls back for what is nested past it', () => {
    const rows = all('connection');
    const withRect = rows.find((row) => row.placement?.at === 'area') ?? rows[0];
    const schema = buildSchema(rows);
    const markup = render(withRect, schema);
    // The branch's own fields (depth 1) show as rows of their own.
    expect(markup).toContain('title="placement"');
    expect(markup).toContain('title="placement.at"');
    expect(markup).toContain('title="placement.rect"');
    // What is nested past that (depth 2) does not get its own row — it is
    // folded into `rect`'s own one-line summary instead.
    expect(markup).not.toContain('title="placement.rect.x"');
  });

  it('recurses one level into a real object field the same way', () => {
    const rows = all('item');
    const schema = buildSchema(rows);
    const withGameId = rows.find((row) => (row as { gameId?: unknown }).gameId !== undefined) ?? rows[0];
    const markup = render(withGameId, schema);
    expect(markup).toContain('title="gameId"');
    expect(markup).toContain('title="gameId.receiveItemId"');
  });
});
