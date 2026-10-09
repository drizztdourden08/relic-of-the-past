/* @layer renderer-hud @kind hook */
import { useMemo } from 'react';
import { snesToRgba } from '@rotp/asset-extraction';
import { hexToSnes15 } from '@rotp/game-data';
import { getGlyphAtlas } from '../../../../../../lib/game/dialog/glyph-atlas';
import { NO_ATLASES } from '../DialogView.constants';
import type { HighlightLook, HighlightLookParams } from '../DialogView.type';

const useHighlightLook = (params: HighlightLookParams): HighlightLook => {
  const { frame, primary, secondary } = params;
  const { active, messageId, generation } = frame;
  const words = useMemo(() => [hexToSnes15(primary), hexToSnes15(secondary)], [primary, secondary]);
  const inks = useMemo(() => words.map((word) => {
    const [r, g, b] = snesToRgba(word);
    return `rgb(${r} ${g} ${b})`;
  }), [words]);
  const atlases = useMemo(
    () => (active ? words.map((word) => getGlyphAtlas(word)?.canvas ?? null) : NO_ATLASES),
    [active, messageId, generation, words],
  );
  return { atlases, inks };
};

export { useHighlightLook };
