/* @layer renderer-components @kind logic */
import type { FieldWeights } from '../SearchPalette.type';

const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const scoreField = (text: string | undefined, token: string, weights: FieldWeights): number => {
  if (!text) return 0;
  const value = text.toLowerCase();
  if (value === token) return weights.exact;
  if (value.startsWith(token)) return weights.prefix;
  if (new RegExp(`\\b${escapeRegex(token)}`).test(value)) return weights.wordStart;
  if (value.includes(token)) return weights.substring;
  return 0;
};

export { scoreField };
