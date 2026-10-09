/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { defaultOperatorFor } from '../../../apps/web/src/ui/design-system/data/filter/operators';
import { OperatorMenu } from '../../../apps/web/src/ui/design-system/composites/FilterBar/sub-components/OperatorMenu';
import type { FieldDescriptor } from '../../../apps/web/src/ui/design-system/data/schema/field-descriptor';
import { DESCRIPTORS, KINDS } from './filter-bar-render.constants';
import { field } from './field';

const renderOperatorMenu = (descriptor: FieldDescriptor, op: string, caseSensitive?: boolean): string =>
  renderToStaticMarkup(createElement(OperatorMenu, {
    field: descriptor, op, caseSensitive, onChange: () => undefined,
  }));

describe('OperatorMenu has an icon-only button, with the text in the dropdown', () => {
  for (const kind of KINDS) {
    it(`${kind}: renders without throwing`, () => {
      expect(() => renderOperatorMenu(DESCRIPTORS[kind], defaultOperatorFor(kind))).not.toThrow();
    });
  }

  it('shows only the glyph as visible content, so the label lives in aria-label, not as text', () => {
    const markup = renderOperatorMenu(field('number'), 'gte');
    expect(markup).toContain('aria-label="Filter operator: is at least"');
    const visible = markup.replace(/aria-label="[^"]*"/g, '');
    expect(visible).not.toContain('is at least');
    expect(visible).toContain('≥');
  });

  it('names the current operator in the accessible label', () => {
    expect(renderOperatorMenu(field('string'), 'startsWith'))
      .toContain('aria-label="Filter operator: starts with"');
  });

  it('marks the button with a class and in the label, but only when case matters', () => {
    const plain = renderOperatorMenu(field('string'), 'contains');
    expect(plain).not.toContain('filter-bar__operator-button--cased');
    expect(plain).toContain('aria-label="Filter operator: contains"');

    const cased = renderOperatorMenu(field('string'), 'contains', true);
    expect(cased).toContain('filter-bar__operator-button--cased');
    expect(cased).toContain('aria-label="Filter operator: contains, match case"');
  });

  it('ignores a stale flag on a kind that has no case to match', () => {
    const stale = renderOperatorMenu(field('number'), 'eq', true);
    expect(stale).not.toContain('filter-bar__operator-button--cased');
    expect(stale).toContain('aria-label="Filter operator: is"');
  });

  it('keeps the button icon-only even with the modifier on', () => {
    const visible = renderOperatorMenu(field('string'), 'contains', true)
      .replace(/aria-label="[^"]*"/g, '');
    expect(visible).not.toContain('match case');
    expect(visible).toContain('∋');
  });
});
