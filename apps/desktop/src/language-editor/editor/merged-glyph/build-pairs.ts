/* @layer renderer-components @kind logic */
import { PICTURE_GLYPH_SPRITES } from '@rotp/game-data';

const bareName = (token: string): string => token.replace(/^\[|\]$/g, '');

const buildPairs = (): Map<string, string> => {
  const firstOf = new Map<string, string>();
  const secondOf = new Map<string, string>();

  for (const [token, sprite] of Object.entries(PICTURE_GLYPH_SPRITES)) {
    if (sprite.span === 'first') firstOf.set(sprite.file, bareName(token));
    if (sprite.span === 'second') secondOf.set(sprite.file, bareName(token));
  }

  const pairs = new Map<string, string>();
  for (const [file, first] of firstOf) {
    const second = secondOf.get(file);
    if (second !== undefined) pairs.set(first, second);
  }
  return pairs;
};

export { buildPairs };
