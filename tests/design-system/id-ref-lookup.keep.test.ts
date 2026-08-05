/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { all } from '@shared/game/data';
import { buildSchema } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import { resolveFieldKit } from '../../apps/web/src/ui/design-system/composites/field-kits';
import { RecordEditor } from '../../apps/web/src/ui/design-system/composites/RecordEditor';
import { resolveIdRefOptionsFor } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/id-ref-options';
import type { IdRefOption, IdRefOptionResolver } from '../../apps/web/src/ui/design-system/composites/field-kits';
import type { FieldDescriptor } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';

// SSR smoke tests: they prove which control an id reference is offered as, and
// that the injected lookup reaches it with real rows behind it. Opening the
// dropdown, typing in its search box and clicking a result need a browser and
// are NOT covered here.

const INPUT = '<input';
const DROPDOWN = 'class="select-trigger';

const refField = (extra: Partial<FieldDescriptor> = {}): FieldDescriptor => ({
  path: 'screenId', label: 'Screen Id', kind: 'idRef', optional: false, ...extra,
});

const renderRefEditor = (
  field: FieldDescriptor,
  value: unknown,
  resolveIdRefOptions?: IdRefOptionResolver,
): string => {
  const kit = resolveFieldKit('idRef');
  if (!kit) throw new Error('no id-ref kit registered');
  return renderToStaticMarkup(createElement(kit.EditorControl, {
    field, value, resolveIdRefOptions, onChange: () => undefined,
  }));
};

const fieldAt = (rows: readonly unknown[], path: string): FieldDescriptor => {
  const field = buildSchema(rows).find((entry) => entry.path === path);
  if (!field) throw new Error(`no field at ${path}`);
  return field;
};

describe('id reference editor — the fallback chain', () => {
  it('stays a plain input with no resolver wired at all', () => {
    const markup = renderRefEditor(refField({ targetKind: 'screen' }), 'screen-1');
    expect(markup).toContain(INPUT);
    expect(markup).not.toContain(DROPDOWN);
  });

  it('stays a plain input when the resolver knows nothing about the target', () => {
    const empty: IdRefOptionResolver = () => [];
    const markup = renderRefEditor(refField({ targetKind: 'screen' }), 'screen-1', empty);
    expect(markup).toContain(INPUT);
    expect(markup).not.toContain(DROPDOWN);
  });

  it('stays a plain input when the field never named a target', () => {
    const resolver: IdRefOptionResolver = () => [{ value: 'a-1', label: 'First' }];
    const markup = renderRefEditor(refField(), 'a-1', resolver);
    expect(markup).toContain(INPUT);
    expect(markup).not.toContain(DROPDOWN);
  });

  it('becomes a picker as soon as the resolver answers', () => {
    const options: readonly IdRefOption[] = [
      { value: 'a-1', label: 'First', description: 'a-1' },
      { value: 'a-2', label: 'Second', description: 'a-2' },
    ];
    const markup = renderRefEditor(refField({ targetKind: 'a' }), 'a-2', () => options);
    expect(markup).toContain(DROPDOWN);
    expect(markup).toContain('Second');
  });

  it('keeps showing a value the target collection does not hold', () => {
    const options: readonly IdRefOption[] = [{ value: 'a-1', label: 'First' }];
    const markup = renderRefEditor(refField({ targetKind: 'a' }), 'a-99', () => options);
    expect(markup).toContain('a-99');
  });
});

describe('the real lookup, over the real collections', () => {
  it('offers every row of the collection a field points at', () => {
    const field = fieldAt(all('connection'), 'screenId');
    expect(field.targetKind).toBe('screen');
    const options = resolveIdRefOptionsFor(field.targetKind ?? '', field);
    expect(options).toHaveLength(all('screen').length);
    expect(options.map((option) => option.description)).toContain(String(all('screen')[0].id));
  });

  it('answers for several different targets, each with its own collection', () => {
    const pairs = [
      { path: 'toConnectionId', rows: all('connection'), target: 'connection', size: all('connection').length },
      { path: 'dungeonId', rows: all('connection'), target: 'dungeon', size: all('dungeon').length },
      { path: 'screenId', rows: all('check'), target: 'screen', size: all('screen').length },
    ];
    for (const { path, rows, target, size } of pairs) {
      const field = fieldAt(rows, path);
      expect(field.targetKind, path).toBe(target);
      expect(resolveIdRefOptionsFor(target, field), path).toHaveLength(size);
    }
  });

  it('resolves a display name rather than echoing the id back', () => {
    const field = fieldAt(all('connection'), 'screenId');
    const options = resolveIdRefOptionsFor('screen', field);
    expect(options.some((option) => option.label !== option.value)).toBe(true);
  });

  it('offers nothing for a record\'s own key — that is identity, not a reference', () => {
    const field = fieldAt(all('screen'), 'id');
    expect(field.kind).toBe('idRef');
    expect(resolveIdRefOptionsFor('screen', field)).toHaveLength(0);
  });

  it('offers nothing for a target no collection answers to', () => {
    expect(resolveIdRefOptionsFor('nowhere', refField({ targetKind: 'nowhere' }))).toHaveLength(0);
  });

  it('hands back the same list every time, so a search box does not rebuild it', () => {
    const field = fieldAt(all('connection'), 'screenId');
    expect(resolveIdRefOptionsFor('screen', field)).toBe(resolveIdRefOptionsFor('screen', field));
  });
});

describe('the whole form, wired end to end', () => {
  const rows = all('connection');
  const record = rows[0];

  const render = (wired: boolean): string =>
    renderToStaticMarkup(createElement(RecordEditor, {
      record,
      schema: buildSchema(rows),
      onSave: async () => undefined,
      resolveIdRefOptions: wired ? resolveIdRefOptionsFor : undefined,
    }));

  it('reads the referenced record back by name once the lookup is injected', () => {
    const options = resolveIdRefOptionsFor('screen', fieldAt(rows, 'screenId'));
    const chosen = options.find((option) => option.value === record.screenId);
    expect(chosen).toBeDefined();
    expect(render(true)).toContain(chosen?.label ?? '');
  });

  it('leaves the record\'s own key on its plain input', () => {
    expect(render(true)).toContain(`value="${String(record.id)}"`);
  });

  it('renders the same form with nothing injected, references and all', () => {
    const markup = render(false);
    expect(markup).toContain('Screen Id');
    expect(markup).toContain(`value="${String(record.screenId)}"`);
  });

  it('gives each row of a list of references its own picker, and keeps the rows', () => {
    const listRows = all('dungeon');
    const held = listRows.find((row) => (row.roomScreenIds?.length ?? 0) > 1) ?? listRows[0];
    const markup = renderToStaticMarkup(createElement(RecordEditor, {
      record: held,
      schema: buildSchema(listRows),
      onSave: async () => undefined,
      resolveIdRefOptions: resolveIdRefOptionsFor,
    }));
    // Order and membership both matter for a list of references, so the rows stay.
    expect(markup).toContain('aria-label="Move up"');
    expect(markup).toContain('+ Add');
    const options = resolveIdRefOptionsFor('screen', fieldAt(rows, 'screenId'));
    const first = options.find((option) => option.value === held.roomScreenIds?.[0]);
    expect(first).toBeDefined();
    expect(markup).toContain(first?.label ?? '');
  });
});
