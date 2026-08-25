/* @layer renderer-components @kind hook */
/**
 * Lays out entries for preview, on demand and cached.
 *
 * Measuring a line means resolving glossary references and walking every glyph
 * through the language's width table, so it is done once per token array and
 * kept until that array changes. Only the entries a caller asks for are
 * measured, which keeps a set of a few hundred lines cheap to scroll.
 */
import { useCallback, useMemo, useRef } from 'react';
import { measureRows, splitBlocks, splitLines, splitScreens } from '@shared/game/language';
import type {
  BlockDoc, DialogueEntry, DialogueLineView, GlossaryTerm, Token,
} from '@shared/game/language';
import type { GlyphMetrics, RowFit, ScreenFit } from '@shared/game/language/layout/types';

/**
 * One entry, measured every way the interface reads it: as rows for the fit
 * verdict, as screens for a box preview, and as the lines and BLOCKS the
 * collapsed row counts and the editor groups by.
 */
type EntryLayout = {
  rows: RowFit[];
  screens: ScreenFit[];
  lines: DialogueLineView[];
  blocks: BlockDoc;
};

const NO_BLOCKS: BlockDoc = { blocks: [] };

const EMPTY_LAYOUT: EntryLayout = { rows: [], screens: [], lines: [], blocks: NO_BLOCKS };

type LayoutLookup = {
  /** Layout for one entry, measured on first ask and reused after. */
  layoutFor: (entry: DialogueEntry) => EntryLayout;
  /** Layout for a token array that is not in the set yet (an open draft). */
  layoutOf: (tokens: Token[]) => EntryLayout;
};

const useEntryLayout = (metrics: GlyphMetrics | null, glossary: GlossaryTerm[]): LayoutLookup => {
  // Keyed on the token array's identity: every edit produces a new array, so a
  // stale entry can never be served, and unchanged entries never re-measure.
  const cache = useRef(new WeakMap<Token[], EntryLayout>());

  // A new glossary or font means every cached measurement is out of date.
  const generation = useMemo(() => ({ metrics, glossary }), [metrics, glossary]);
  const lastGeneration = useRef(generation);
  if (lastGeneration.current !== generation) {
    cache.current = new WeakMap<Token[], EntryLayout>();
    lastGeneration.current = generation;
  }

  const layoutOf = useCallback((tokens: Token[]): EntryLayout => {
    if (!metrics) return EMPTY_LAYOUT;
    const hit = cache.current.get(tokens);
    if (hit) return hit;
    const lines = splitLines(tokens, metrics, glossary);
    const measured: EntryLayout = {
      rows: measureRows(tokens, metrics, glossary),
      screens: splitScreens(tokens, metrics, glossary),
      lines,
      blocks: splitBlocks(lines),
    };
    cache.current.set(tokens, measured);
    return measured;
  }, [metrics, glossary]);

  const layoutFor = useCallback(
    (entry: DialogueEntry): EntryLayout => layoutOf(entry.tokens),
    [layoutOf],
  );

  return useMemo(() => ({ layoutFor, layoutOf }), [layoutFor, layoutOf]);
};

export { useEntryLayout };
export type { EntryLayout, LayoutLookup };
