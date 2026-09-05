/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReferencedBy } from '../../apps/web/src/ui/design-system/composites/RecordEditor';
import type { ReferencedByHit } from '../../apps/web/src/ui/design-system/composites/RecordEditor';

// SSR smoke tests: the empty-state copy with no hits, and grouping by kind
// with counts. Groups start COLLAPSED (a record can carry hundreds of hits), so
// the referencing rows only exist after a click; not covered here.

const EMPTY_TEXT = 'Not referenced anywhere.';

const render = (hits: readonly ReferencedByHit[]): string =>
  renderToStaticMarkup(createElement(ReferencedBy, { hits }));

describe('ReferencedBy in the empty state', () => {
  it('shows the empty-state copy instead of a blank panel', () => {
    const markup = render([]);
    expect(markup).toContain(EMPTY_TEXT);
  });

  it('renders no group controls at all when nothing references the record', () => {
    const markup = render([]);
    expect(markup).not.toContain('referenced-by__toggle');
  });
});

describe('ReferencedBy in the populated state', () => {
  const hits: readonly ReferencedByHit[] = [
    { kind: 'screen', id: 'screen-001', field: 'tags', label: 'A Real Screen' },
    { kind: 'screen', id: 'screen-002', field: 'tags', label: 'Another Screen' },
    { kind: 'check', id: 'check-072', field: 'requirements', label: 'A Real Check' },
  ];

  it('does not show the empty-state copy once there is at least one hit', () => {
    expect(render(hits)).not.toContain(EMPTY_TEXT);
  });

  it('groups hits by kind, one toggle per kind with its own count', () => {
    const markup = render(hits);
    expect(markup).toContain('screen (2)');
    expect(markup).toContain('check (1)');
  });

  it('starts collapsed, so no referencing row or its id-ref attributes render until asked for', () => {
    const markup = render(hits);
    expect(markup).not.toContain('data-id-ref');
    expect(markup).not.toContain('A Real Screen');
    expect(markup).not.toContain('via tags');
  });

  it('marks every toggle as collapsed (aria-expanded="false") by default', () => {
    const markup = render(hits);
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).not.toContain('aria-expanded="true"');
  });
});
