/* @layer tests @kind test */
import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type * as OptionsMenuModule from '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/TableOptionsMenu';
import type * as TableFooterModule from '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/TableFooter';
import type { TableActions } from '../../apps/web/src/ui/design-system/composites/DataTable/DataTable.type';

// SSR smoke tests for the table's footer — the row count, the table-wide
// options menu trigger, and (once, on the left) the sort/group summary that
// used to open every column's own ⋯ menu, repeated once per column. See
// data-table-render.test.ts for why these are SSR-only.

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

describe('TableOptionsMenu — the footer trigger', () => {
  // The entries themselves are asserted in data-table-menus.test.ts, where they
  // are a pure list. All that can be checked here is that the component takes
  // the fuller action set and renders — the menu is portalled, so opening it
  // needs a document this suite does not have.
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
describe('TableFooter — the sort/group summary, once, on the left', () => {
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
