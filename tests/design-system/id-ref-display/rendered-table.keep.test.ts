/* @layer tests @kind test */
import { it, expect, beforeAll } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { all } from '@shared/game/data';
import { buildSchema, createSchemaIndex } from '../../../apps/web/src/ui/design-system/data/schema/build-schema';
import type * as DisplayModule from '../../../apps/web/src/ui/domains/app/views/DataInspector/behavior/id-ref-display';
import type * as DataRowModule from '../../../apps/web/src/ui/design-system/composites/DataTable/sub-components/DataRow';
import type * as RowTreeModule from '../../../apps/web/src/ui/design-system/composites/DataTable/sub-components/RowTree';
import type * as HeaderCellModule from '../../../apps/web/src/ui/design-system/composites/DataTable/sub-components/HeaderCell';
import type { TableColumn } from '../../../apps/web/src/ui/design-system/data/table/types';
import { describeDataset } from '../../dataset-guard';
import { AREA_PATH, NAME_PATH } from './id-ref-display.constants';
import { sample } from './sample';
import { stubActions } from './stub-actions';
import { stubViewStateWindow } from './stub-view-state-window';

type InspectorLikeRow = Record<string, unknown>;

const screens = all('screen') as unknown as readonly InspectorLikeRow[];

let resolveIdRefDisplayValue: typeof DisplayModule.resolveIdRefDisplayValue;
let resolveIdRefTargetFields: typeof DisplayModule.resolveIdRefTargetFields;
let DataRow: typeof DataRowModule.DataRow;
let RowTree: typeof RowTreeModule.RowTree;
let HeaderCell: typeof HeaderCellModule.HeaderCell;

beforeAll(async () => {
  stubViewStateWindow();
  ({ resolveIdRefDisplayValue, resolveIdRefTargetFields } = await import(
    '../../../apps/web/src/ui/domains/app/views/DataInspector/behavior/id-ref-display'
  ));
  ({ DataRow } = await import(
    '../../../apps/web/src/ui/design-system/composites/DataTable/sub-components/DataRow'
  ));
  ({ RowTree } = await import(
    '../../../apps/web/src/ui/design-system/composites/DataTable/sub-components/RowTree'
  ));
  ({ HeaderCell } = await import(
    '../../../apps/web/src/ui/design-system/composites/DataTable/sub-components/HeaderCell'
  ));
});

const rowContext = (columns: readonly TableColumn[]) => ({
  columns,
  schema: createSchemaIndex(buildSchema(screens)),
  getRowId: (row: Record<string, unknown>) => String(row.id),
  isExpanded: () => true,
  onToggleGroup: () => {},
  resolveIdRefDisplay: resolveIdRefDisplayValue,
});

describeDataset('the rendered table: the choice reaching a row and a group header', () => {
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

describeDataset('the header cell: the trigger that opens "Display as..."', () => {
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
    expect(markup).not.toContain('Display as');
  });
});
