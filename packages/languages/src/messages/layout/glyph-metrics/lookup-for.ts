/* @layer shared-game @kind logic */
import type { GlyphMetrics } from '../types';
import type { AlphabetLookup } from './glyph-metrics.type';

const lookups = new WeakMap<GlyphMetrics, AlphabetLookup>();

const buildLookup = (alphabet: readonly string[]): AlphabetLookup => {
  const byText = new Map<string, number>();
  let longest = 1;

  for (const [index, entry] of alphabet.entries()) {
    if (entry.length === 0) continue;
    byText.set(entry, index);
    if (entry.length > longest) longest = entry.length;
  }

  return { byText, longest };
};

const lookupFor = (metrics: GlyphMetrics): AlphabetLookup => {
  const cached = lookups.get(metrics);
  if (cached !== undefined) return cached;

  const built = buildLookup(metrics.alphabet);
  lookups.set(metrics, built);
  return built;
};

export { lookupFor };
