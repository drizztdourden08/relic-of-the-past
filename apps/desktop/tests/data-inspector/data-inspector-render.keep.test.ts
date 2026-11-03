/* @layer tests @kind test */
import {
  it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import type * as KindDataModule from '@app/views/DataInspector/behavior/kind-data';
import type * as WindowedModule from '@app/views/DataInspector/behavior/windowed-rows';
import type * as ReachForModule from '@app/views/DataInspector/behavior/reach-for';
import { describeDataset } from '../dataset-guard';
import { required } from '@rotp/asset-extraction/testing';

let loadKindData: typeof KindDataModule.loadKindData;
let orderedRows: typeof WindowedModule.orderedRows;
let reachFor: typeof ReachForModule.reachFor;

beforeEach(async () => {
  vi.resetModules();
  vi.stubGlobal('window', {
    api: { uiViews: { load: vi.fn().mockResolvedValue({}), save: vi.fn().mockResolvedValue(undefined) } },
    addEventListener: () => {},
    removeEventListener: () => {},
    matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
  });
  ({ loadKindData } = await import('@app/views/DataInspector/behavior/kind-data'));
  ({ orderedRows } = await import('@app/views/DataInspector/behavior/windowed-rows'));
  ({ reachFor } = await import('@app/views/DataInspector/behavior/reach-for'));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describeDataset('DataInspector row window', { tags: ['standard'] }, () => {
  it('orders before it cuts, so a sorted page is the top of the whole collection', () => {
    const { source, schema } = loadKindData('screen');
    const order = (dir: 'asc' | 'desc') => orderedRows(source.rows, schema, { sort: [{ path: 'id', dir }], groupBy: [] });
    const ascending = order('asc');
    const descending = order('desc');
    expect(descending).toHaveLength(source.rows.length);
    expect(source.getId(required(descending[0], 'a sorted row')))
      .toBe(source.getId(required(ascending[ascending.length - 1], 'a sorted row')));
    expect(orderedRows(source.rows, schema, { sort: [], groupBy: [] })).toBe(source.rows);
  });

  it('reaches far enough to include the selected row', () => {
    const { source } = loadKindData('screen');
    const target = source.getId(required(source.rows[250], 'a screen row'));
    expect(reachFor(source.rows, target, source.getId)).toBe(251);
    expect(reachFor(source.rows, null, source.getId)).toBe(0);
  });
});
