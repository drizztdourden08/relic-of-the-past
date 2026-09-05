/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { all } from '@shared/game/data';
import { buildSchema } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import {
  RecordEditor, blankValue, elementFields, rebaseField,
} from '../../apps/web/src/ui/design-system/composites/RecordEditor';
import { resolveIdRefOptionsFor } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/id-ref-options';
import { numberBoundsResolverFor } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/number-bounds';
import type { FieldDescriptor } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';
import { describeDataset } from '../dataset-guard';

// SSR smoke tests plus unit tests over the two helpers: an element's fields
// get the same real controls a top-level field gets. Add, drag and dropdown
// need a browser.

const PICKER = 'class="select-trigger';

const screens = all('screen');

const fieldAt = (rows: readonly unknown[], path: string): FieldDescriptor => {
  const field = buildSchema(rows).find((entry) => entry.path === path);
  if (!field) throw new Error(`no field at ${path}`);
  return field;
};

const withSpawns = screens.find((row) => (row.spawns?.length ?? 0) > 1);

const render = (record: unknown, wired: boolean): string =>
  renderToStaticMarkup(createElement(RecordEditor, {
    record,
    schema: buildSchema(screens),
    onSave: async () => undefined,
    resolveIdRefOptions: wired ? resolveIdRefOptionsFor : undefined,
    resolveNumberBounds: numberBoundsResolverFor('screen'),
  }));

describeDataset('re-addressing an element descriptor onto a real element', () => {
  const spawns = fieldAt(screens, 'spawns');

  it('found the real list of records to work over', () => {
    expect(spawns.kind).toBe('array');
    expect(spawns.of?.kind).toBe('object');
    expect(withSpawns).toBeDefined();
  });

  it('swaps the descriptive prefix for an indexed one, all the way down', () => {
    const fields = elementFields(spawns, 3);
    expect(fields.map((field) => field.path)).toContain('spawns.3.actorId');
    const tile = fields.find((field) => field.path === 'spawns.3.tile');
    expect(tile?.children?.map((child) => child.path)).toEqual(['spawns.3.tile.x', 'spawns.3.tile.y']);
  });

  it('leaves everything about the descriptor except the address', () => {
    const actorId = elementFields(spawns, 0).find((field) => field.path === 'spawns.0.actorId');
    expect(actorId?.kind).toBe('idRef');
    expect(actorId?.targetKind).toBe('actor');
    expect(actorId?.label).toBe(spawns.of?.children?.[0].label);
  });

  it('rebases a nested element descriptor too, not just children', () => {
    const nested: FieldDescriptor = {
      path: 'a[]', label: 'A item', kind: 'object', optional: false,
      children: [{
        path: 'a[].ids', label: 'Ids', kind: 'array', optional: false,
        of: { path: 'a[].ids[]', label: 'Ids item', kind: 'string', optional: false },
      }],
    };
    const rebased = rebaseField(nested, 'a[]', 'a.2');
    expect(rebased.children?.[0].path).toBe('a.2.ids');
    expect(rebased.children?.[0].of?.path).toBe('a.2.ids[]');
  });

  it('answers with nothing for a list whose element has no children', () => {
    expect(elementFields(fieldAt(screens, 'tags'), 0)).toHaveLength(0);
  });
});

describeDataset('what a freshly added element starts as', () => {
  it('builds the element\'s whole required shape, recursively', () => {
    const spawns = fieldAt(screens, 'spawns');
    expect(blankValue(spawns.of as FieldDescriptor)).toEqual({ actorId: '', tile: { x: 0, y: 0 } });
  });

  it('leaves an optional child absent instead of inventing a value for it', () => {
    const shape: FieldDescriptor = {
      path: 'p', label: 'P', kind: 'object', optional: false,
      children: [
        { path: 'p.need', label: 'Need', kind: 'number', optional: false },
        { path: 'p.maybe', label: 'Maybe', kind: 'number', optional: true },
      ],
    };
    expect(blankValue(shape)).toEqual({ need: 0 });
  });

  it('answers per kind for everything that is not an object', () => {
    const of = (kind: FieldDescriptor['kind'], extra: Partial<FieldDescriptor> = {}): FieldDescriptor =>
      ({ path: 'v', label: 'V', kind, optional: false, ...extra });
    expect(blankValue(of('number'))).toBe(0);
    expect(blankValue(of('boolean'))).toBe(false);
    expect(blankValue(of('string'))).toBe('');
    expect(blankValue(of('idRef'))).toBe('');
    expect(blankValue(of('array'))).toEqual([]);
    expect(blankValue(of('enum', { options: ['first', 'second'] }))).toBe('first');
  });

  it('stops at a sensible depth instead of following a pathological shape', () => {
    const deep = (level: number): FieldDescriptor => ({
      path: `l${level}`, label: `L${level}`, kind: 'object', optional: false,
      children: level > 8 ? [] : [deep(level + 1)],
    });
    expect(() => blankValue(deep(0))).not.toThrow();
  });
});

describeDataset('the whole form, with a real list of records on it', () => {
  it('opens each element as its own form instead of a read-only count', () => {
    const markup = render(withSpawns, true);
    expect(markup).toContain('record-editor__array-item');
    expect(markup).toContain('>#1<');
    expect(markup).toContain('>#2<');
    expect(markup).toContain('Actor Id');
  });

  it('gives the element\'s reference the real picker, with real names in it', () => {
    const markup = render(withSpawns, true);
    const options = resolveIdRefOptionsFor('actor', {
      path: 'spawns.0.actorId', label: 'Actor Id', kind: 'idRef', optional: false, targetKind: 'actor',
    });
    expect(options.length).toBe(all('actor').length);
    const chosen = options.find((option) => option.value === withSpawns?.spawns?.[0].actorId);
    expect(chosen).toBeDefined();
    expect(markup).toContain(PICKER);
    expect(markup).toContain(chosen?.label ?? '');
  });

  it('leaves the element\'s reference on a plain input with nothing injected', () => {
    const markup = render(withSpawns, false);
    expect(markup).toContain('record-editor__array-item');
    expect(markup).not.toContain(PICKER);
    expect(markup).toContain(`value="${String(withSpawns?.spawns?.[0].actorId)}"`);
  });

  it('gives the element\'s numbers the real controls, bounds and all', () => {
    const markup = render(withSpawns, true);
    expect(markup).toContain(`value="${String(withSpawns?.spawns?.[0].tile.x)}"`);
    expect(markup).toContain('max="63"');
  });

  it('keeps add, remove and reorder, exactly as a list of values has them', () => {
    const markup = render(withSpawns, true);
    expect(markup).toContain('aria-label="Move up"');
    expect(markup).toContain('aria-label="Move down"');
    expect(markup).toContain('aria-label="Remove"');
    expect(markup).toContain('+ Add');
  });

  it('renders every screen that has a list of records without throwing', () => {
    for (const row of screens) {
      if (!row.spawns?.length) continue;
      expect(() => render(row, true), String(row.id)).not.toThrow();
    }
  });
});
