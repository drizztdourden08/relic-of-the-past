/* @layer renderer-components @kind logic */
import { withFormulaMarker } from '@app/hud-layout-editing/value-text';
import type { SpliceInput, Spliced } from './splice-snippet.type';

const spliceSnippet = (input: SpliceInput): Spliced => {
  const { text, caret, prefix, snippet, select } = input;
  const head = text.slice(0, caret - prefix.length);
  const tail = text.slice(caret);
  const next = withFormulaMarker(`${head}${snippet}${tail}`);
  const at = next.indexOf(select ?? snippet, Math.max(0, next.length - snippet.length - tail.length - 4));
  const from = at < 0 ? next.length : at;
  return { next, from, to: from + (select ?? snippet).length };
};

export { spliceSnippet };
