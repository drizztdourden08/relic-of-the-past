/* @layer tests @kind test */
/**
 * The shell around the comparison view: the permanent rail entry (a review
 * pass is navigable directly, like the eleven real collections) and the
 * foldable detail column (the Controls page's Profiles column mechanism,
 * reused). Pinned: which glyph is shown, and the modifier class the CSS hangs off.
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  KIND_NAV_ITEMS, NAV_ITEMS, RECOMMENDATIONS_KIND, isEntityKind, queryViewKey, tableViewKey,
} from '@app/ui/domains/app/views/DataInspector/DataInspector.constants';
import { CollapsibleDetail } from '@app/ui/domains/app/views/DataInspector/sub-components/CollapsibleDetail';

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
    CollapsibleDetail,
    { title, collapsed, onToggle: () => {}, children: 'the panes' },
  ));

  it('shows the content and the fold-away glyph when open', () => {
    const html = render('Comparison', false);
    expect(html).toContain('the panes');
    expect(html).toContain('▶');
    expect(html).not.toContain('collapsible-detail--collapsed');
  });

  it('names what is behind the strip when folded', () => {
    const html = render('Comparison', true);
    expect(html).toContain('collapsible-detail--collapsed');
    expect(html).toContain('Comparison');
    expect(html).toContain('◀');
  });

  // The CSS hides the content instead of unmounting it, so a fold never
  // discards a half-made amendment in the pane behind it.
  it('keeps the panes mounted while folded', () => {
    expect(render('Comparison', true)).toContain('the panes');
  });

  // The component knows nothing about recommendations: it takes any title and
  // children, so a plain collection's detail pane uses it too (DataInspector.tsx).
  it('works the same for a plain collection\'s title as for the comparison\'s', () => {
    const html = render('Screens', true);
    expect(html).toContain('collapsible-detail--collapsed');
    expect(html).toContain('Screens');
    expect(html).not.toContain('Comparison');
  });
});
