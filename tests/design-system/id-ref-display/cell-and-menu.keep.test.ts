/* @layer tests @kind test */
import { it, expect, vi, beforeAll } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { all } from '@shared/game/data';
import {
  cellContent, groupKeyContent,
} from '../../../apps/web/src/ui/design-system/composites/DataTable/behavior/cell-content';
import {
  buildColumnMenuItems,
} from '../../../apps/web/src/ui/design-system/composites/DataTable/behavior/column-menu-items';
import type * as DisplayModule from '../../../apps/web/src/ui/domains/app/views/DataInspector/behavior/id-ref-display';
import type { MenuItem } from '../../../apps/web/src/ui/design-system/composites/DropdownMenu';
import { describeDataset } from '../../dataset-guard';
import { AREA_PATH, NAME_PATH } from './id-ref-display.constants';
import { fieldAt } from './field-at';
import { sample } from './sample';
import { stubActions } from './stub-actions';
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

const wired = () => ({ displayField: NAME_PATH, resolve: resolveIdRefDisplayValue });

const renderCell = (substitution?: Parameters<typeof cellContent>[3]): string =>
  renderToStaticMarkup(createElement(
    'div', null, cellContent(sample.row, AREA_PATH, fieldAt(screens, AREA_PATH), substitution),
  ));

describeDataset('the cell shows one thing and points at another', () => {
  it('shows the raw id until a display field is chosen', () => {
    expect(renderCell()).toContain(`>${sample.id}<`);
  });

  it('shows the referenced record\'s field once one is', () => {
    const markup = renderCell(wired());
    expect(markup).toContain(sample.name);
    expect(markup).not.toContain(`>${sample.id}<`);
  });

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

describeDataset('the group header runs the same substitution off the same resolver', () => {
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
    expect(groupKeyContent('', field, wired())).toBe('-');
  });
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

describeDataset('the ⋯ menu: "Display as..."', () => {
  it('opens the target collection\'s fields as a submenu, not a panel', () => {
    const { entry } = displayMenu();
    expect(entry?.label).toBe('Display as...');
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
