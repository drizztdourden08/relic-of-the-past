/* @layer tests @kind test */
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { all } from '@shared/game/data';
import { buildSchema, createSchemaIndex } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import * as columnOps from '../../apps/web/src/ui/design-system/data/table/column-ops';
import { capture, isViewSnapshot, restore } from '../../apps/web/src/ui/design-system/data/view-state/snapshot';
import {
  cellContent, groupKeyContent,
} from '../../apps/web/src/ui/design-system/composites/DataTable/behavior/cell-content';
import {
  substituteDisplay,
} from '../../apps/web/src/ui/design-system/composites/DataTable/behavior/display-substitution';
import {
  buildColumnMenuItems,
} from '../../apps/web/src/ui/design-system/composites/DataTable/behavior/column-menu-items';
import type * as DisplayModule from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/id-ref-display';
import type * as DataRowModule from '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/DataRow';
import type * as RowTreeModule from '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/RowTree';
import type * as HeaderCellModule from '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/HeaderCell';
import type { MenuItem } from '../../apps/web/src/ui/design-system/composites/DropdownMenu';
import type { FieldDescriptor } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';
import type { TableColumn } from '../../apps/web/src/ui/design-system/data/table/types';
import type {
  ColumnActions,
} from '../../apps/web/src/ui/design-system/composites/DataTable/DataTable.type';
import { describeDataset } from '../dataset-guard';

// "Show me the name, not the id." Asserted over the REAL collections, because
// the whole point is that a design-system table shows a foreign record's field
// without ever importing one — a stub resolver would prove only the plumbing.
// What needs a browser and is NOT covered: opening the ⋯ menu (portalled),
// hovering into the submenu and clicking a field.

/** What a generic row looks like once it is through a dot-path read. */
type InspectorLikeRow = Record<string, unknown>;

const screens = all('screen') as unknown as readonly InspectorLikeRow[];
const areas = all('area') as unknown as readonly InspectorLikeRow[];

const AREA_PATH = 'areaId';
const NAME_PATH = 'randomizerName';

let resolveIdRefDisplayValue: typeof DisplayModule.resolveIdRefDisplayValue;
let resolveIdRefTargetFields: typeof DisplayModule.resolveIdRefTargetFields;
let DataRow: typeof DataRowModule.DataRow;
let RowTree: typeof RowTreeModule.RowTree;
let HeaderCell: typeof HeaderCellModule.HeaderCell;

beforeAll(async () => {
  // The app-tier lookup reaches @ds/data, whose barrel pulls the view-state
  // binding -> lib/storage -> log-bus, and that touches window at module load.
  vi.stubGlobal('window', {
    api: { uiViews: { load: vi.fn().mockResolvedValue({}), save: vi.fn().mockResolvedValue(undefined) } },
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  ({ resolveIdRefDisplayValue, resolveIdRefTargetFields } = await import(
    '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/id-ref-display'
  ));
  ({ DataRow } = await import(
    '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/DataRow'
  ));
  ({ RowTree } = await import(
    '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/RowTree'
  ));
  ({ HeaderCell } = await import(
    '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/HeaderCell'
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

describeDataset('setDisplayField — the column op', () => {
  const columns: readonly TableColumn[] = [{ path: AREA_PATH }, { path: 'kind', label: 'Sort of' }];

  it('records which field of the referenced record the column shows', () => {
    const next = columnOps.setDisplayField(columns, AREA_PATH, NAME_PATH);
    expect(next[0]).toEqual({ path: AREA_PATH, displayField: NAME_PATH });
  });

  it('leaves every other column exactly as it was', () => {
    const next = columnOps.setDisplayField(columns, AREA_PATH, NAME_PATH);
    expect(next[1]).toBe(columns[1]);
  });

  it('drops the key rather than storing an empty one, so a snapshot compares equal', () => {
    const set = columnOps.setDisplayField(columns, AREA_PATH, NAME_PATH);
    expect(columnOps.setDisplayField(set, AREA_PATH, undefined)[0]).toEqual({ path: AREA_PATH });
    expect(columnOps.setDisplayField(set, AREA_PATH, '')[0]).toEqual({ path: AREA_PATH });
  });

  it('keeps the width and the rename it finds beside it', () => {
    const sized: readonly TableColumn[] = [{ path: AREA_PATH, width: 200, label: 'Where' }];
    expect(columnOps.setDisplayField(sized, AREA_PATH, NAME_PATH)[0])
      .toEqual({ path: AREA_PATH, width: 200, label: 'Where', displayField: NAME_PATH });
  });

  it('is a plain serialisable field, so the view snapshot carries it untouched', () => {
    const state = {
      columns: columnOps.setDisplayField(columns, AREA_PATH, NAME_PATH), sort: [], groupBy: [],
    };
    const snapshot = capture(state, []);
    expect(isViewSnapshot(JSON.parse(JSON.stringify(snapshot)))).toBe(true);
    expect(restore(snapshot).table.columns[0].displayField).toBe(NAME_PATH);
  });
});

describeDataset('the injected lookup, over the real collections', () => {
  it('offers the target collection\'s own fields, not the referring one\'s', () => {
    const paths = resolveIdRefTargetFields('area').map((entry) => entry.path);
    expect(paths).toContain(NAME_PATH);
    expect(paths).toContain('world');
    expect(paths).not.toContain(AREA_PATH);
  });

  it('reaches a nested field too, since a dotted path reads the same at any depth', () => {
    const paths = resolveIdRefTargetFields('screen').map((entry) => entry.path);
    expect(paths.some((path) => path.includes('.'))).toBe(true);
  });

  it('answers nothing for a target no collection holds', () => {
    expect(resolveIdRefTargetFields('nowhere')).toHaveLength(0);
  });

  it('hands back the same list every time, so a menu does not rebuild it', () => {
    expect(resolveIdRefTargetFields('area')).toBe(resolveIdRefTargetFields('area'));
  });

  it('reads one referenced record\'s field, by id', () => {
    expect(resolveIdRefDisplayValue('area', sample.id, NAME_PATH)).toBe(sample.name);
  });

  it('says nothing for an id the collection does not hold, or a field it has not got', () => {
    expect(resolveIdRefDisplayValue('area', 'area-999999', NAME_PATH)).toBeUndefined();
    expect(resolveIdRefDisplayValue('area', sample.id, 'nope')).toBeUndefined();
    expect(resolveIdRefDisplayValue('nowhere', sample.id, NAME_PATH)).toBeUndefined();
  });
});

describeDataset('substituteDisplay — every missing piece falls back to the id', () => {
  const field = fieldAt(screens, AREA_PATH);

  it('resolves when it has all four', () => {
    expect(substituteDisplay(sample.id, field, {
      displayField: NAME_PATH, resolve: resolveIdRefDisplayValue,
    })).toBe(sample.name);
  });

  it('answers undefined with no choice, no resolver, no target or no value', () => {
    const whole = { displayField: NAME_PATH, resolve: resolveIdRefDisplayValue };
    expect(substituteDisplay(sample.id, field, undefined)).toBeUndefined();
    expect(substituteDisplay(sample.id, field, { resolve: resolveIdRefDisplayValue })).toBeUndefined();
    expect(substituteDisplay(sample.id, field, { displayField: NAME_PATH })).toBeUndefined();
    expect(substituteDisplay('', field, whole)).toBeUndefined();
    expect(substituteDisplay(sample.id, { ...field, targetKind: undefined }, whole)).toBeUndefined();
  });
});

/** Built per call: the lookup is only bound once the stubbed window is up. */
const wired = () => ({ displayField: NAME_PATH, resolve: resolveIdRefDisplayValue });

const renderCell = (substitution?: Parameters<typeof cellContent>[3]): string =>
  renderToStaticMarkup(createElement(
    'div', null, cellContent(sample.row, AREA_PATH, fieldAt(screens, AREA_PATH), substitution),
  ));

describeDataset('the cell — what it shows versus what it points at', () => {
  it('shows the raw id until a display field is chosen', () => {
    expect(renderCell()).toContain(`>${sample.id}<`);
  });

  it('shows the referenced record\'s field once one is', () => {
    const markup = renderCell(wired());
    expect(markup).toContain(sample.name);
    expect(markup).not.toContain(`>${sample.id}<`);
  });

  /*
   * The one thing that must NOT move. Following a reference reads the
   * attribute, not the text, so a cell reading as a name still opens the same
   * record — and the tooltip keeps saying which one that is.
   */
  it('keeps the real id on the element no matter what is on screen', () => {
    for (const markup of [renderCell(), renderCell(wired())]) {
      expect(markup).toContain(`data-id-ref="${sample.id}"`);
      expect(markup).toContain('data-target-kind="area"');
      expect(markup).toContain(`title="area: ${sample.id}"`);
    }
  });

  it('falls back to the id when the chosen field resolves to nothing', () => {
    expect(renderCell({ displayField: 'nope', resolve: resolveIdRefDisplayValue }))
      .toContain(`>${sample.id}<`);
  });
});

describeDataset('the group header — the same substitution, off the same resolver', () => {
  const field = fieldAt(screens, AREA_PATH);
  const renderKey = (substitution?: Parameters<typeof groupKeyContent>[2]): string =>
    renderToStaticMarkup(createElement('div', null, groupKeyContent(sample.id, field, substitution)));

  it('reads as the id while the column is unconfigured', () => {
    expect(renderKey()).toContain(`>${sample.id}<`);
  });

  it('reads as the name once the column is, matching the rows underneath it', () => {
    expect(renderKey(wired())).toContain(sample.name);
    expect(renderKey(wired())).toContain(`data-id-ref="${sample.id}"`);
  });

  it('still shows a dash for an absent group value', () => {
    expect(groupKeyContent('', field, wired())).toBe('—');
  });
});

const stubActions = (): ColumnActions => ({
  onToggleSort: vi.fn(), onSortDir: vi.fn(), onRemoveSort: vi.fn(), onAddColumnAt: vi.fn(),
  onRemove: vi.fn(), onMove: vi.fn(), onRename: vi.fn(), onGroupBy: vi.fn(), onUngroup: vi.fn(),
  onResize: vi.fn(), onPreviewResize: vi.fn(), onFitToContent: vi.fn(), onExpandToFill: vi.fn(),
  onSetDisplayField: vi.fn(),
});

const displayMenu = (overrides: Partial<Parameters<typeof buildColumnMenuItems>[0]> = {}) => {
  const actions = stubActions();
  const onClose = vi.fn();
  const items = buildColumnMenuItems({
    path: AREA_PATH, index: 0, columnCount: 2, grouped: false,
    field: fieldAt(screens, AREA_PATH), resolveTargetFields: resolveIdRefTargetFields,
    actions, onStartRename: vi.fn(), onClose, ...overrides,
  });
  const entries = items.filter((entry): entry is MenuItem => entry !== 'separator');
  return { actions, onClose, entry: entries.find((item) => item.key === 'display-as') };
};

describeDataset('the ⋯ menu — "Display as…"', () => {
  it('opens the target collection\'s fields as a submenu, not a panel', () => {
    const { entry } = displayMenu();
    expect(entry?.label).toBe('Display as…');
    expect(entry?.onClick).toBeUndefined();
    expect(entry?.children?.map((child) => child.key)).toContain(`display-${NAME_PATH}`);
  });

  it('leads with the id and ticks it, since that is what the column shows by default', () => {
    const [first] = displayMenu().entry?.children ?? [];
    expect(first.label).toBe('Reference id');
    expect(first.checked).toBe(true);
  });

  it('moves the tick onto the chosen field', () => {
    const children = displayMenu({ displayField: NAME_PATH }).entry?.children ?? [];
    expect(children[0].checked).toBe(false);
    expect(children.find((child) => child.key === `display-${NAME_PATH}`)?.checked).toBe(true);
  });

  it('sets the field, and puts the id back, closing first like every other action', () => {
    const chosen = displayMenu();
    chosen.entry?.children?.find((child) => child.key === `display-${NAME_PATH}`)?.onClick?.();
    expect(chosen.onClose).toHaveBeenCalled();
    expect(chosen.actions.onSetDisplayField).toHaveBeenCalledWith(AREA_PATH, NAME_PATH);

    const cleared = displayMenu({ displayField: NAME_PATH });
    cleared.entry?.children?.[0].onClick?.();
    expect(cleared.actions.onSetDisplayField).toHaveBeenCalledWith(AREA_PATH, undefined);
  });

  it('is absent for a column that references nothing, and with no resolver wired', () => {
    expect(displayMenu({ field: fieldAt(screens, 'kind') }).entry).toBeUndefined();
    expect(displayMenu({ field: undefined }).entry).toBeUndefined();
    expect(displayMenu({ resolveTargetFields: undefined }).entry).toBeUndefined();
    expect(displayMenu({ resolveTargetFields: () => [] }).entry).toBeUndefined();
  });
});

const rowContext = (columns: readonly TableColumn[]) => ({
  columns,
  schema: createSchemaIndex(buildSchema(screens)),
  getRowId: (row: Record<string, unknown>) => String(row.id),
  isExpanded: () => true,
  onToggleGroup: () => {},
  resolveIdRefDisplay: resolveIdRefDisplayValue,
});

/*
 * SSR only, so what these prove is that the choice REACHES the row and the
 * group header through the real components. Opening the ⋯ menu, hovering into
 * "Display as…" and picking a field all need a document (the menu is
 * portalled) and are unverified here.
 */
describeDataset('the rendered table — the choice reaching a row and a group header', () => {
  const configured: readonly TableColumn[] = [{ path: AREA_PATH, displayField: NAME_PATH }];

  it('renders the row\'s reference cell as the name, still pointing at the id', () => {
    const markup = renderToStaticMarkup(createElement(DataRow<InspectorLikeRow>, {
      row: sample.row, context: rowContext(configured),
    }));
    expect(markup).toContain(sample.name);
    expect(markup).toContain(`data-id-ref="${sample.id}"`);
  });

  it('leaves the same row on its id with no choice made', () => {
    const markup = renderToStaticMarkup(createElement(DataRow<InspectorLikeRow>, {
      row: sample.row, context: rowContext([{ path: AREA_PATH }]),
    }));
    expect(markup).toContain(`>${sample.id}<`);
  });

  it('reads the group header off the SAME column setting, so the two agree', () => {
    const node = {
      kind: 'group' as const, level: 0, key: sample.id, path: AREA_PATH, count: 1,
      children: [{ kind: 'row' as const, row: sample.row }],
    };
    const markup = renderToStaticMarkup(createElement(RowTree<InspectorLikeRow>, {
      nodes: [node], parentUid: '', context: rowContext(configured),
    }));
    expect(markup).toContain('data-table__group');
    expect(markup.match(new RegExp(sample.name, 'g'))?.length).toBe(2);
    expect(markup).toContain(`data-id-ref="${sample.id}"`);
  });
});

describeDataset('the header cell — the trigger that opens "Display as…"', () => {
  it('renders a reference column with the lookup wired, menu closed', () => {
    const schema = createSchemaIndex(buildSchema(screens));
    const markup = renderToStaticMarkup(createElement(HeaderCell, {
      column: { path: AREA_PATH, displayField: NAME_PATH },
      field: schema.byPath(AREA_PATH),
      index: 0,
      columnCount: 1,
      grouped: false,
      resolveTargetFields: resolveIdRefTargetFields,
      actions: stubActions(),
      drag: {
        draggingPath: null, draggingIndex: null, overIndex: null,
        onDragStart: () => {}, onDragOver: () => {}, onDrop: () => {}, onDragEnd: () => {},
        onSurfaceHover: () => {}, onSurfaceDrop: () => {},
      },
      ghostRows: [],
      rowTotal: 0,
    }));
    expect(markup).toContain('data-table__menu-trigger');
    // Portalled: nothing of the menu is in the markup until it is opened.
    expect(markup).not.toContain('Display as');
  });
});
