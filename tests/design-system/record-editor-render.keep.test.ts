/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { all } from '@shared/game/data';
import { buildSchema } from '@drizztdourden08/tessera/data';
import { RecordEditor } from '@drizztdourden08/tessera/composites';
import type { SchemaConfig } from '@drizztdourden08/tessera/data';
import { describeDataset } from '../dataset-guard';

const noop = async (): Promise<void> => undefined;
const WHOLE_COLLECTION_TIMEOUT_MS = 30_000;

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
    }, WHOLE_COLLECTION_TIMEOUT_MS);
  }
});

describeDataset('what RecordEditor auto-layout puts on the page', () => {
  const rows = all('connection');
  const withRect = rows.find((row) => row.placement.form === 'area') ?? rows[0];
  const withAllOf = rows.find((row) => (row.requirements as { allOf?: unknown[] } | undefined)?.allOf?.length);

  it('labels the fields it derived, with no config to name them', () => {
    const markup = render(withRect, rows, true);
    expect(markup).toContain('Screen Id');
    expect(markup).toContain('To Connection Id');
  });

  it('recurses into a nested object inside a plain field', () => {
    const markup = render(withRect, rows, true);
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
    const dungeons = all('dungeon');
    const withRooms = dungeons.find((row) => (row.roomScreenIds?.length ?? 0) > 1) ?? dungeons[0];
    const markup = render(withRooms, dungeons, true);
    expect(markup).toContain('aria-label="Remove"');
    expect(markup).toContain('aria-label="Move up"');
    expect(markup).toContain('+ Add');
  });

  it('gives a list of VARIANT elements a branch-aware editor, not the read-only summary', () => {
    const checks = all('check');
    const withAnyOf = checks.find((row) => (row.requirements?.anyOf?.length ?? 0) > 1);
    expect(withAnyOf).toBeDefined();
    const config: SchemaConfig = { hidden: ['vanillaItemIds'] };
    const markup = render(withAnyOf, checks, true, config);
    expect(markup).toContain('Any Of');
    expect(markup).toContain('record-editor__array-item');
    expect(markup).toContain('+ Add');
    expect(markup).toContain('aria-label="Move down"');
  });
});
