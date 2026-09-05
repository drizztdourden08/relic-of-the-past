/* @layer tests @kind test */
/** SSR smoke test (no jsdom): the `highlightedLines` diff is purely additive, compared as markup strings. */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CodeBlock } from '../../apps/web/src/ui/design-system/composites/CodeBlock';

const CODE = 'const a = 1;\nconst b = 2;\nconst c = 3;';

const render = (highlightedLines?: readonly number[]): string =>
  renderToStaticMarkup(createElement(CodeBlock, { code: CODE, language: 'typescript', highlightedLines }));

/** Splits rendered markup into one chunk per source line, in order. Every
 * line div is a sibling with no nested divs (tokens render as spans), so this
 * split is exact. */
const lineChunksOf = (markup: string): string[] => markup.split('<div class="code-block__line').slice(1);

describe('CodeBlock highlightedLines', () => {
  it('adds no modifier class when the prop is omitted', () => {
    const markup = render();
    expect(markup).not.toContain('code-block__line--changed');
  });

  it('marks only the requested 1-indexed lines', () => {
    const chunks = lineChunksOf(render([2]));
    expect(chunks).toHaveLength(3);
    expect(chunks.map((chunk) => chunk.slice(0, 60).includes('--changed'))).toEqual([false, true, false]);
  });

  it('marks every requested line when more than one is given', () => {
    const chunks = lineChunksOf(render([1, 3]));
    expect(chunks.map((chunk) => chunk.slice(0, 60).includes('--changed'))).toEqual([true, false, true]);
  });

  it('ignores a line number outside the code\'s range instead of throwing', () => {
    expect(() => render([1, 99])).not.toThrow();
    expect(lineChunksOf(render([99])).every((chunk) => !chunk.slice(0, 60).includes('--changed'))).toBe(true);
  });

  it('changes nothing else in the markup, so stripping the modifier class recovers the unhighlighted render', () => {
    const withHighlight = render([2]);
    const without = render();
    expect(withHighlight.replaceAll(' code-block__line--changed', '')).toBe(without);
  });
});
