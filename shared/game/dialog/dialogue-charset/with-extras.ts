/* @layer shared-game @kind logic */
import type { ExtraGlyphSlot } from './dialogue-charset.type';

const withExtras = (alphabet: readonly string[], extras: readonly ExtraGlyphSlot[], fill: (extra: ExtraGlyphSlot) => string): string[] => {
  const codes = [...alphabet];
  for (const extra of extras) {
    while (codes.length < extra.slot) codes.push('');
    codes[extra.slot] = fill(extra);
  }
  return codes;
};

export { withExtras };
