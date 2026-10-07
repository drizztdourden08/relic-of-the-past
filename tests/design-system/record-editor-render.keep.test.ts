/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { all } from '@shared/game/data';
import { buildSchema } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import { RecordEditor } from '../../apps/web/src/ui/design-system/composites/RecordEditor';
import type { SchemaConfig } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';
import { describeDataset } from '../dataset-guard';

// SSR smoke tests (no jsdom): the form builds for real records of several
// shapes, read-only and interactive. Typing, Save and the pending/error states
// need a browser.

const noop = async (): Promise<void> => undefined;

const render = (
  record: unknown,
  rows: readonly unknown[],
  interactive: boolean,
  config?: SchemaConfig,
): string =>
  renderToStaticMarkup(createElement(RecordEditor, {
    record,
    schema: buildSchema(rows, config),
    config,
    onSave: interactive ? noop : undefined,
  }));

const COLLECTIONS = [
  { kind: 'screen' as const, rows: all('screen') },
  { kind: 'connection' as const, rows: all('connection') },
  { kind: 'item' as const, rows: all('item') },
];

describeDataset('RecordEditor on a real record from several collections', () => {
  for (const { kind, rows } of COLLECTIONS) {
    const record = rows[0];

    it(`${kind}: renders read-only with no config and no save`, () => {
      const markup = render(record, rows, false);
      expect(markup).toContain('record-editor');
      expect(markup).not.toContain('>Save<');
      expect(markup).toContain('disabled=""');
    });

    it(`${kind}: renders interactive when a save is supplied`, () => {
      const markup = render(record, rows, true);
      expect(markup).toContain('>Save<');
      expect(markup).toContain('>Revert<');
    });

    it(`${kind}: renders every record in the collection without throwing`, () => {
      const schema = buildSchema(rows);
      for (const row of rows) {
        expect(() => renderToStaticMarkup(createElement(RecordEditor, {
          record: row, schema, onSave: noop,
        })), `${kind} ${String((row as { id?: string }).id)}`).not.toThrow();
      }
    });
  }
});

describeDataset('what RecordEditor auto-layout puts on the page', () => {
  const rows = all('connection');
  // Placement is a plain nested object now, not a discriminated union, so the
  // area-form record covers nested-object recursion, not union-branch detection.
  const withRect = rows.find((row) => row.placement.form === 'area') ?? rows[0];
  // `requirements` IS still a genuine discriminated union on a connection
  // record (itemId / checkId / allOf / anyOf / count / impossible), so it is
  // the union-branch fixture below instead of `placement`.
  const withAllOf = rows.find((row) => (row.requirements as { allOf?: unknown[] } | undefined)?.allOf?.length);

  it('labels the fields it derived, with no config to name them', () => {
    const markup = render(withRect, rows, true);
    expect(markup).toContain('Screen Id');
    expect(markup).toContain('To Connection Id');
  });

  it('recurses into a nested object inside a plain field', () => {
    const markup = render(withRect, rows, true);
    // The schema is derived from the whole collection, so `side` (border-only
    // elsewhere) appears as optional here. Only the nested `Rect` recursion is pinned.
    expect(markup).toContain('Placement');
    expect(markup).toContain('Rect');
    expect(markup).toContain('record-editor__nested');
  });

  it('recurses into a union branch (requirements)', () => {
    expect(withAllOf).toBeDefined();
    const markup = render(withAllOf, rows, true);
    expect(markup).toContain('Requirements');
    expect(markup).toContain('All Of');
  });

  it('falls back to a summary for a value in no known branch', () => {
    const odd = { ...withRect, requirements: { nothingKnown: true } } as unknown;
    const markup = render(odd, rows, true);
    expect(markup).toContain('record-editor__fallback');
    expect(markup).toContain('Unrecognised branch');
  });

  it('groups by the config when one is given, in the config order', () => {
    const config: SchemaConfig = {
      groups: [{ id: 'ends', label: 'Endpoints', paths: ['screenId', 'toConnectionId'] }],
    };
    const markup = render(withRect, rows, true, config);
    expect(markup).toContain('Endpoints');
    expect(markup).toContain('Other');
    expect(markup.indexOf('Endpoints')).toBeLessThan(markup.indexOf('Other'));
  });

  it('offers add, remove and reorder for a list of single values', () => {
    // A list of references, which is a sequence: order and membership both
    // matter, so it keeps the rows. (A list of TAGS deliberately does not; the
    // tag-array tests cover that.)
    const dungeons = all('dungeon');
    const withRooms = dungeons.find((row) => (row.roomScreenIds?.length ?? 0) > 1) ?? dungeons[0];
    const markup = render(withRooms, dungeons, true);
    expect(markup).toContain('aria-label="Remove"');
    expect(markup).toContain('aria-label="Move up"');
    expect(markup).toContain('+ Add');
  });

  it('gives a list of VARIANT elements a branch-aware editor, not the read-only summary', () => {
    // Full behaviour in `record-editor-variant-array.test.ts`. This pins that a
    // real requirement's `anyOf` reaches the branch editor, not the `array-kit` fallback.
    const checks = all('check');
    const withAnyOf = checks.find((row) => (row.requirements?.anyOf?.length ?? 0) > 1);
    expect(withAnyOf).toBeDefined();
    // Hide the list of references on the same record, so the only list left is
    // the one made of variants.
    const config: SchemaConfig = { hidden: ['vanillaItemIds'] };
    const markup = render(withAnyOf, checks, true, config);
    expect(markup).toContain('Any Of');
    expect(markup).toContain('record-editor__array-item');
    expect(markup).toContain('+ Add');
    expect(markup).toContain('aria-label="Move down"');
  });
});
