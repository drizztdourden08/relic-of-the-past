/* @layer tests @kind test */
/**
 * The DEFAULT id-ref display — the fallback that applies with no column-level
 * `displayField` chosen at all, added alongside the explicit choice
 * `id-ref-display.test.ts` covers. Split into its own file because the two
 * together pushed that file over the line cap, and because this fallback is
 * a genuinely separate piece of behaviour: `defaultIdRefDisplay` resolving a
 * kind off an id's own prefix when the column (or the field) cannot supply
 * one, which is exactly the Recommendations table's `targetId` column.
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
  // file stubs for — see that file's note.
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

describe('substituteDisplay — the default fallback for a column with no displayField at all', () => {
  const field = fieldAt(screens, AREA_PATH);

  it('reaches for resolveDefault when no displayField is configured', () => {
    expect(substituteDisplay(sample.id, field, { resolveDefault: defaultIdRefDisplay })).toBe(sample.name);
  });

  it('an explicit displayField still wins over the default — unchanged from before this existed', () => {
    expect(substituteDisplay(sample.id, field, {
      displayField: NAME_PATH, resolve: () => sample.name, resolveDefault: () => 'WRONG',
    })).toBe(sample.name);
  });

  it('never runs for a field the schema did not infer as idRef', () => {
    const textField = { ...field, kind: 'string' as const, targetKind: undefined };
    expect(substituteDisplay(sample.id, textField, { resolveDefault: defaultIdRefDisplay })).toBeUndefined();
  });

  /**
   * A MIXED column — every row's id names a different collection, exactly
   * what the Recommendations table's `targetId` does — has no single
   * `field.targetKind` to hand `resolveDefault`. Each id still has to
   * resolve correctly on its own steam.
   */
  it('resolves per row from the id itself when the column carries no targetKind', () => {
    const [actor] = all('actor');
    const mixedField: FieldDescriptor = { ...field, targetKind: undefined };
    expect(substituteDisplay(sample.id, mixedField, { resolveDefault: defaultIdRefDisplay })).toBe(sample.name);
    expect(substituteDisplay(actor.id, mixedField, { resolveDefault: defaultIdRefDisplay })).toBe(actor.randomizerName);
  });
});

/**
 * A stand-in for the Recommendations table's `targetId` column: every row's
 * id names a different collection, so the schema `buildSchema` derives has
 * `targetKind: undefined` for it — there is no single kind the WHOLE column
 * points at, only what each row's own id says. This is the case
 * `resolveIdRefDefault` exists for, wired with no `displayField` at all,
 * exactly as the Recommendations table wires it.
 */
describe('the rendered table — a mixed-target-kind column, with only the default resolver wired', () => {
  // `sample.id` is an AREA id (see `sample` above) — paired with an actor,
  // that is already two different collections in one column.
  const [actor] = all('actor');
  const mixedRows = [
    { id: 'finding-1', targetId: sample.id },
    { id: 'finding-2', targetId: actor.id },
  ];
  const mixedSchema = createSchemaIndex(buildSchema(mixedRows));
  const targetField = mixedSchema.byPath('targetId');

  it('derives no single targetKind for the column — the mixed case this exists for', () => {
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

  it('keeps the real id on the element regardless of the resolved text — navigation is unaffected', () => {
    const markup = renderToStaticMarkup(createElement(DataRow<Record<string, unknown>>, {
      row: mixedRows[1], context: mixedContext,
    }));
    expect(markup).toContain(`data-id-ref="${actor.id}"`);
    expect(markup).not.toContain(`>${actor.id}<`);
  });

  /**
   * The column has no single `targetKind` to publish (same reason it has no
   * single display name), so navigation already falls back to the id's own
   * prefix — `resolveIdRef` in `id-ref-target.ts` does exactly that. This
   * pins that the display fix changes nothing about that: clicking a mixed
   * column's reference resolves the same way it did before this existed.
   */
  it('still resolves to the right collection on click, via the id\'s own prefix', () => {
    expect(entityKindFromId(actor.id)).toBe('actor');
    expect(entityKindFromId(sample.id)).toBe('area');
  });
});

/**
 * A collection's own `id` field is itself id-shaped, so it infers as `idRef`
 * targeting its OWN collection — with the default wired in generally, that
 * would otherwise look the id up and hand back its own name, making the `Id`
 * row show the same text as whatever name field the record already has. The
 * `Id` column's one job is showing the id, so this is exempt from the default,
 * unlike an ordinary reference to another record.
 */
describe('the identity field is exempt from the default — it always shows its own id', () => {
  const idField = fieldAt(screens, 'id');

  it('is itself inferred as idRef, targeting its own collection', () => {
    expect(idField.kind).toBe('idRef');
  });

  it('substituteDisplay never runs the default resolver for it', () => {
    expect(substituteDisplay(sample.row.id, idField, { resolveDefault: defaultIdRefDisplay })).toBeUndefined();
  });

  it('an explicit displayField still wins even on the identity field — this only closes the default', () => {
    expect(substituteDisplay(sample.row.id, idField, {
      displayField: NAME_PATH, resolve: () => 'chosen name', resolveDefault: defaultIdRefDisplay,
    })).toBe('chosen name');
  });
});
