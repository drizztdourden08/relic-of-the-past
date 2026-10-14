/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ListDetailLayout } from '@drizztdourden08/tessera/composites';
import {
  KIND_NAV_ITEMS, NAV_ITEMS, RECOMMENDATIONS_KIND, RECORD_LIST_RATIO, isEntityKind, queryViewKey, tableViewKey,
} from '@app/views/DataInspector/DataInspector.constants';

describe('the rail entry', () => {
  it('is always present, last, regardless of the active kind', () => {
    expect(NAV_ITEMS).toHaveLength(KIND_NAV_ITEMS.length + 1);
    expect(NAV_ITEMS[NAV_ITEMS.length - 1]).toEqual({ id: 'recommendations', icon: '⚠️', label: 'Recommendations' });
  });

  it('never leaves the eleven real collections behind', () => {
    const ids = NAV_ITEMS.map(item => item.id);
    for (const item of KIND_NAV_ITEMS) expect(ids).toContain(item.id);
  });
});

describe('the pseudo-kind stays out of the real collections', () => {
  it('narrows away from every entity kind', () => {
    expect(isEntityKind(RECOMMENDATIONS_KIND)).toBe(false);
    expect(isEntityKind('connection')).toBe(true);
  });

  it('keeps its own view keys, so it never shares a saved layout', () => {
    expect(tableViewKey(RECOMMENDATIONS_KIND)).toBe('data-inspector:recommendations');
    expect(queryViewKey(RECOMMENDATIONS_KIND)).toBe('data-inspector-query:recommendations');
  });
});

describe('the foldable detail column', () => {
  const render = (title: string, collapsed: boolean): string => renderToStaticMarkup(createElement(
    ListDetailLayout,
    {
      list: 'the list',
      detail: 'the panes',
      listRatio: RECORD_LIST_RATIO,
      resizable: false,
      collapsible: false,
      detailCollapsible: true,
      detailCollapsed: collapsed,
      onDetailCollapsedChange: () => {},
      detailLabel: title,
      listScroll: false,
      detailScroll: false,
    },
  ));

  it('shows the content and the fold-away glyph when open', () => {
    const html = render('Comparison', false);
    expect(html).toContain('the panes');
    expect(html).toContain('aria-label="Hide Comparison"');
    expect(html).not.toContain('list-detail-layout--detail-collapsed');
  });

  it('names what is behind the strip when folded', () => {
    const html = render('Comparison', true);
    expect(html).toContain('list-detail-layout--detail-collapsed');
    expect(html).toContain('Comparison');
    expect(html).toContain('aria-label="Show Comparison"');
  });

  it('keeps the panes mounted while folded', () => {
    expect(render('Comparison', true)).toContain('the panes');
  });

  it('works the same for a plain collection\'s title as for the comparison\'s', () => {
    const html = render('Screens', true);
    expect(html).toContain('list-detail-layout--detail-collapsed');
    expect(html).toContain('Screens');
    expect(html).not.toContain('Comparison');
  });
});
