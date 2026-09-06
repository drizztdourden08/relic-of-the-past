/* @layer tests @kind test */
/**
 * The default id-ref display: `defaultIdRefDisplay` resolves a kind off the
 * id's own prefix when neither column nor field supplies one (the
 * Recommendations table's `targetId` column). Split from
 * `id-ref-display.test.ts` for the line cap.
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { all } from '@shared/game/data';
import { buildSchema, createSchemaIndex } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import {
  substituteDisplay,
} from '../../apps/web/src/ui/design-system/composites/DataTable/behavior/display-substitution';
import { defaultIdRefDisplay, entityKindFromId } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/record-links';
import type * as DataRowModule from '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/DataRow';
import type { FieldDescriptor } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';
import { describeDataset } from '../dataset-guard';

/** What a generic row looks like once it is through a dot-path read. */
type InspectorLikeRow = Record<string, unknown>;

const screens = all('screen') as unknown as readonly InspectorLikeRow[];
const areas = all('area') as unknown as readonly InspectorLikeRow[];

const AREA_PATH = 'areaId';
const NAME_PATH = 'randomizerName';

let DataRow: typeof DataRowModule.DataRow;

beforeAll(async () => {
  // record-links.ts is a plain @shared/game/data import and needs no stub, but
  // DataRow's own module graph reaches the same view-state chain the sibling
  // file stubs for. See that file's note.
  vi.stubGlobal('window', {
    api: { uiViews: { load: vi.fn().mockResolvedValue({}), save: vi.fn().mockResolvedValue(undefined) } },
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  ({ DataRow } = await import(
    '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/DataRow'
  ));
});

const fieldAt = (rows: readonly unknown[], path: string): FieldDescriptor => {
  const field = buildSchema(rows).find((entry) => entry.path === path);
  if (!field) throw new Error(`no field at ${path}`);
  return field;
};

/** A screen that really does point at an area, and the area it points at. */
const sample = (() => {
  const row = screens.find((entry) => typeof entry[AREA_PATH] === 'string');
  if (!row) throw new Error('no screen carries an area reference');
  const id = String(row[AREA_PATH]);
  const area = areas.find((entry) => String(entry.id) === id);
  if (!area) throw new Error(`no area ${id}`);
  return { row, id, name: String(area[NAME_PATH]) };
})();

describeDataset('substituteDisplay falls back by default for a column with no displayField at all', () => {
  const field = fieldAt(screens, AREA_PATH);

  it('reaches for resolveDefault when no displayField is configured', () => {
    expect(substituteDisplay(sample.id, field, { resolveDefault: defaultIdRefDisplay })).toBe(sample.name);
  });

  it('still lets an explicit displayField win over the default, exactly as before this existed', () => {
    expect(substituteDisplay(sample.id, field, {
      displayField: NAME_PATH, resolve: () => sample.name, resolveDefault: () => 'WRONG',
    })).toBe(sample.name);
  });

  it('never runs for a field the schema did not infer as idRef', () => {
    const textField = { ...field, kind: 'string' as const, targetKind: undefined };
    expect(substituteDisplay(sample.id, textField, { resolveDefault: defaultIdRefDisplay })).toBeUndefined();
  });

  // A MIXED column (every row's id names a different collection, like the
  // Recommendations `targetId`) has no single `field.targetKind`. Each id
  // resolves on its own.
  it('resolves per row from the id itself when the column carries no targetKind', () => {
    const [actor] = all('actor');
    const mixedField: FieldDescriptor = { ...field, targetKind: undefined };
    expect(substituteDisplay(sample.id, mixedField, { resolveDefault: defaultIdRefDisplay })).toBe(sample.name);
    expect(substituteDisplay(actor.id, mixedField, { resolveDefault: defaultIdRefDisplay })).toBe(actor.randomizerName);
  });
});

/**
 * Stand-in for the Recommendations `targetId` column: `buildSchema` derives
 * `targetKind: undefined`, so only each row's own id says what it points at.
 * Wired with no `displayField`, as the real table is.
 */
describeDataset('the rendered table with a mixed-target-kind column and only the default resolver wired', () => {
  // `sample.id` is an AREA id (see `sample` above). Paired with an actor,
  // that is already two different collections in one column.
  const [actor] = all('actor');
  const mixedRows = [
    { id: 'finding-1', targetId: sample.id },
    { id: 'finding-2', targetId: actor.id },
  ];
  const mixedSchema = createSchemaIndex(buildSchema(mixedRows));
  const targetField = mixedSchema.byPath('targetId');

  it('derives no single targetKind for the column, which is the mixed case this exists for', () => {
    expect(targetField?.kind).toBe('idRef');
    expect(targetField?.targetKind).toBeUndefined();
  });

  const mixedContext = {
    columns: [{ path: 'targetId' }],
    schema: mixedSchema,
    getRowId: (row: Record<string, unknown>) => String(row.id),
    isExpanded: () => true,
    onToggleGroup: () => {},
    resolveIdRefDefault: defaultIdRefDisplay,
  };

  it('resolves each row by its OWN id\'s kind, not a column-wide one', () => {
    const first = renderToStaticMarkup(createElement(DataRow<Record<string, unknown>>, {
      row: mixedRows[0], context: mixedContext,
    }));
    const second = renderToStaticMarkup(createElement(DataRow<Record<string, unknown>>, {
      row: mixedRows[1], context: mixedContext,
    }));
    expect(first).toContain(sample.name);
    expect(second).toContain(actor.randomizerName);
  });

  it('keeps the real id on the element regardless of the resolved text, so navigation is unaffected', () => {
    const markup = renderToStaticMarkup(createElement(DataRow<Record<string, unknown>>, {
      row: mixedRows[1], context: mixedContext,
    }));
    expect(markup).toContain(`data-id-ref="${actor.id}"`);
    expect(markup).not.toContain(`>${actor.id}<`);
  });

  // Navigation already falls back to the id's prefix (`resolveIdRef` in
  // `id-ref-target.ts`). The display fix must not change that.
  it('still resolves to the right collection on click, via the id\'s own prefix', () => {
    expect(entityKindFromId(actor.id)).toBe('actor');
    expect(entityKindFromId(sample.id)).toBe('area');
  });
});

/**
 * A collection's own `id` infers as `idRef` to its own collection. With the
 * default resolver it would show the record's name instead of the id, so the
 * `Id` column is exempt.
 */
describeDataset('the identity field is exempt from the default and always shows its own id', () => {
  const idField = fieldAt(screens, 'id');

  it('is itself inferred as idRef, targeting its own collection', () => {
    expect(idField.kind).toBe('idRef');
  });

  it('substituteDisplay never runs the default resolver for it', () => {
    expect(substituteDisplay(sample.row.id, idField, { resolveDefault: defaultIdRefDisplay })).toBeUndefined();
  });

  it('an explicit displayField still wins even on the identity field, because this only closes the default', () => {
    expect(substituteDisplay(sample.row.id, idField, {
      displayField: NAME_PATH, resolve: () => 'chosen name', resolveDefault: defaultIdRefDisplay,
    })).toBe('chosen name');
  });
});
