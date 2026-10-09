/* @layer tests @kind test */
import { it, expect, beforeAll } from 'vitest';
import { all } from '@shared/game/data';
import * as columnOps from '../../../apps/web/src/ui/design-system/data/table/column-ops';
import { capture, isViewSnapshot, restore } from '@drizztdourden08/tessera/data';
import {
  substituteDisplay,
} from '@drizztdourden08/tessera/composites';
import type * as DisplayModule from '../../../apps/web/src/ui/domains/app/views/DataInspector/behavior/id-ref-display';
import type { TableColumn } from '@drizztdourden08/tessera/data';
import { describeDataset } from '../../dataset-guard';
import { AREA_PATH, NAME_PATH } from './id-ref-display.constants';
import { fieldAt } from './field-at';
import { sample } from './sample';
import { stubViewStateWindow } from './stub-view-state-window';

const screens = all('screen') as unknown as readonly Record<string, unknown>[];

let resolveIdRefDisplayValue: typeof DisplayModule.resolveIdRefDisplayValue;
let resolveIdRefTargetFields: typeof DisplayModule.resolveIdRefTargetFields;

beforeAll(async () => {
  stubViewStateWindow();
  ({ resolveIdRefDisplayValue, resolveIdRefTargetFields } = await import(
    '../../../apps/web/src/ui/domains/app/views/DataInspector/behavior/id-ref-display'
  ));
});

describeDataset('the setDisplayField column op', () => {
  const columns: readonly TableColumn[] = [{ path: AREA_PATH }, { path: 'kind', label: 'Sort of' }];

  it('records which field of the referenced record the column shows', () => {
    const next = columnOps.setDisplayField(columns, AREA_PATH, NAME_PATH);
    expect(next[0]).toEqual({ path: AREA_PATH, displayField: NAME_PATH });
  });

  it('leaves every other column exactly as it was', () => {
    const next = columnOps.setDisplayField(columns, AREA_PATH, NAME_PATH);
    expect(next[1]).toBe(columns[1]);
  });

  it('drops the key instead of storing an empty one, so a snapshot compares equal', () => {
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

describeDataset('substituteDisplay falls back to the id for every missing piece', () => {
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
