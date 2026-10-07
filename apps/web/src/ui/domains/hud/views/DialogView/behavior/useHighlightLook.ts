/* @layer renderer-hud @kind hook */
/**
 * The two highlight colours of randomizer messages as the box paints them: snapped to the game's
 * 15-bit colours first, the same words the core draws the native box with, so both boxes match.
 * Original glyphs get an atlas per colour; the modern face gets the colour as ink. Index 0 is the
 * primary span, index 1 the secondary one.
 */
import { useMemo } from 'react';
import { snesToRgba } from '@shared/asset-extraction/graphics/palette';
import { hexToSnes15 } from '@shared/game/dialog/highlight-color';
import { getGlyphAtlas } from '../../../../../../lib/game/dialog/glyph-atlas';
import type { DialogFrame } from '@shared/game/dialog/dialog-frame.types';

interface HighlightLookParams {
  frame: DialogFrame;
  primary: string;
  secondary: string;
}

interface HighlightLook {
  atlases: readonly (HTMLCanvasElement | null)[];
  inks: readonly string[];
}

const NO_ATLASES: readonly (HTMLCanvasElement | null)[] = [null, null];

const useHighlightLook = (params: HighlightLookParams): HighlightLook => {
  const { frame, primary, secondary } = params;
  const { active, messageId, generation } = frame;
  const words = useMemo(() => [hexToSnes15(primary), hexToSnes15(secondary)], [primary, secondary]);
  const inks = useMemo(() => words.map((word) => {
    const [r, g, b] = snesToRgba(word);
    return `rgb(${r} ${g} ${b})`;
  }), [words]);
  // Asked per message, like the plain atlas, so a language switch or a new palette is caught.
  const atlases = useMemo(
    () => (active ? words.map((word) => getGlyphAtlas(word)?.canvas ?? null) : NO_ATLASES),
    [active, messageId, generation, words],
  );
  return { atlases, inks };
};

export { useHighlightLook };
export type { HighlightLook };
