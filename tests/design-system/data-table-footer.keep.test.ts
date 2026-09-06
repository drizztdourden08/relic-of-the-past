/* @layer tests @kind test */
import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type * as OptionsMenuModule from '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/TableOptionsMenu';
import type * as TableFooterModule from '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/TableFooter';
import type { TableActions } from '../../apps/web/src/ui/design-system/composites/DataTable/DataTable.type';

// SSR smoke tests for the footer: row count, options menu trigger, and the
// sort/group summary that used to be repeated in every column's ⋯ menu.

let TableOptionsMenu: typeof OptionsMenuModule.TableOptionsMenu;
let TableFooter: typeof TableFooterModule.TableFooter;

beforeEach(async () => {
  vi.resetModules();
  const load = vi.fn().mockResolvedValue({});
  const save = vi.fn().mockResolvedValue(undefined);
  // The view-state binding reaches lib/storage -> log-bus, which touches
  // window at module load, so the stub has to precede the import.
  vi.stubGlobal('window', {
    api: { uiViews: { load, save } },
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  ({ TableOptionsMenu } = await import(
    '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/TableOptionsMenu'
  ));
  ({ TableFooter } = await import(
    '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/TableFooter'
  ));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const stubTableActions = (): TableActions => ({
  onAddColumn: () => {}, onClearSort: () => {}, onClearGroupBy: () => {},
  onFitAllToContent: () => {}, onResetColumns: () => {},
});

describe('TableOptionsMenu behind the footer trigger', () => {
  // The entries are asserted in data-table-menus.test.ts. The menu is
  // portalled, so only rendering with the fuller action set is checked here.
  const render = (): string =>
    renderToStaticMarkup(createElement(TableOptionsMenu, {
      sortActive: false, groupActive: false, actions: stubTableActions(),
    }));

  it('renders its trigger and nothing else until it is opened', () => {
    const markup = render();
    expect(markup).toContain('aria-label="Table options"');
    expect(markup).not.toContain('dropdown-menu');
    expect(markup).not.toContain('Fit all to content');
  });
});

// The sort/group summary used to open every column's own ⋯ menu, repeated
// once per column. It now renders once, here, on the left of the same strip
// that already carries the row count and the options trigger.
describe('TableFooter shows the sort/group summary once, on the left', () => {
  const renderFooter = (summary: TableFooterModule.TableFooterProps['summary']): string =>
    renderToStaticMarkup(createElement(TableFooter, {
      count: 3, sortActive: false, groupActive: false, actions: stubTableActions(), summary,
    }));

  it('shows a placeholder when the table is in its natural order', () => {
    const markup = renderFooter({});
    expect(markup).toContain('data-table__summary');
    expect(markup).toContain('No sorting or grouping');
  });

  it('shows the sentence, on the left of the count and the options trigger', () => {
    const markup = renderFooter({ sorted: 'Sorted: Kind (ascending)' });
    expect(markup).toContain('data-table__summary');
    expect(markup).toContain('Sorted: Kind (ascending)');
    expect(markup.indexOf('data-table__summary')).toBeLessThan(markup.indexOf('data-table__count'));
  });

  it('carries both halves when both are set', () => {
    const markup = renderFooter({ sorted: 'Sorted: Kind (ascending)', grouped: 'Grouped by: World' });
    expect(markup).toContain('Sorted: Kind (ascending)');
    expect(markup).toContain('Grouped by: World');
  });

  it('keeps the count and the options trigger exactly where they were', () => {
    const markup = renderFooter({});
    expect(markup).toContain('3 entries');
    expect(markup).toContain('aria-label="Table options"');
  });
});
