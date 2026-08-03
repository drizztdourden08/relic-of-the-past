/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReferencedBy } from '../../apps/web/src/ui/design-system/composites/RecordEditor';
import type { ReferencedByHit } from '../../apps/web/src/ui/design-system/composites/RecordEditor';

// SSR smoke tests: they prove the empty-state copy shows with no hits, and
// that a populated list groups by kind with the right counts. Each group
// starts COLLAPSED (a compact summary first — a heavily-referenced record can
// carry hundreds of hits), so the actual referencing rows, and the id-ref
// navigation attributes they carry, only exist in the DOM after a click one
// needs a browser to make; that interaction is NOT covered here.

const EMPTY_TEXT = 'Not referenced anywhere.';

const render = (hits: readonly ReferencedByHit[]): string =>
  renderToStaticMarkup(createElement(ReferencedBy, { hits }));

describe('ReferencedBy — empty state', () => {
  it('shows the empty-state copy rather than a blank panel', () => {
    const markup = render([]);
    expect(markup).toContain(EMPTY_TEXT);
  });

  it('renders no group controls at all when nothing references the record', () => {
    const markup = render([]);
    expect(markup).not.toContain('referenced-by__toggle');
  });
});

describe('ReferencedBy — populated state', () => {
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

  it('starts collapsed — no referencing row or its id-ref attributes render until asked for', () => {
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
