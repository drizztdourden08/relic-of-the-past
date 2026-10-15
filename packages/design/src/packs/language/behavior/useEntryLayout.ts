/* @layer renderer-components @kind hook */
import { useCallback, useMemo, useRef } from 'react';
import { measureRows, splitBlocks, splitLines, splitScreens } from '@rotp/languages';
import type { DialogueEntry, GlossaryTerm, Token, GlyphMetrics } from '@rotp/languages';
import { EMPTY_LAYOUT } from './language-behavior.constants';
import type { EntryLayout, LayoutLookup } from './language-behavior.type';

const useEntryLayout = (metrics: GlyphMetrics | null, glossary: GlossaryTerm[]): LayoutLookup => {
  const layoutsByTokenArray = useRef(new WeakMap<Token[], EntryLayout>());

  const generation = useMemo(() => ({ metrics, glossary }), [metrics, glossary]);
  const lastGeneration = useRef(generation);
  if (lastGeneration.current !== generation) {
    layoutsByTokenArray.current = new WeakMap<Token[], EntryLayout>();
    lastGeneration.current = generation;
  }

  const layoutOf = useCallback((tokens: Token[]): EntryLayout => {
    if (!metrics) return EMPTY_LAYOUT;
    const hit = layoutsByTokenArray.current.get(tokens);
    if (hit) return hit;
    const lines = splitLines(tokens, metrics, glossary);
    const measured: EntryLayout = {
      rows: measureRows(tokens, metrics, glossary),
      screens: splitScreens(tokens, metrics, glossary),
      lines,
      blocks: splitBlocks(lines),
    };
    layoutsByTokenArray.current.set(tokens, measured);
    return measured;
  }, [metrics, glossary]);

  const layoutFor = useCallback(
    (entry: DialogueEntry): EntryLayout => layoutOf(entry.tokens),
    [layoutOf],
  );

  return useMemo(() => ({ layoutFor, layoutOf }), [layoutFor, layoutOf]);
};

export { useEntryLayout };
export type { LayoutLookup } from './language-behavior.type';
