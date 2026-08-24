/* @layer renderer-hooks @kind logic */
/**
 * The wearing selector: which outfit and glove level the preview renders with.
 *
 * Outfit and gloves are independent in the engine — the glove colour is written over one
 * row entry whatever outfit is loaded — so they stay two separate controls rather than a
 * flat list of combinations. The bunny outfit is offered alongside the three mails because
 * from the palette's point of view that is exactly what it is, even though its art differs.
 */
import { useState, useCallback, useMemo } from 'react';
import { OUTFIT_IDS } from '@shared/game/data/player-sheet/types';
import type { OutfitId, GloveLevel, Wearing } from '@shared/game/data/player-sheet/types';

const OUTFIT_LABELS: Record<OutfitId, string> = {
  green: 'Green',
  blue: 'Blue',
  red: 'Red',
  bunny: 'Bunny',
};

const GLOVE_LABELS: Record<GloveLevel, string> = { 0: 'None', 1: 'Power', 2: 'Titan' };
const GLOVE_LEVELS: readonly GloveLevel[] = [0, 1, 2];

const useWearing = () => {
  const [outfit, setOutfit] = useState<OutfitId>('green');
  const [gloves, setGloves] = useState<GloveLevel>(0);

  const wearing = useMemo<Wearing>(() => ({ outfit, gloves }), [outfit, gloves]);
  const reset = useCallback(() => { setOutfit('green'); setGloves(0); }, []);

  return { wearing, outfit, setOutfit, gloves, setGloves, reset, OUTFIT_IDS, OUTFIT_LABELS, GLOVE_LEVELS, GLOVE_LABELS };
};

export { useWearing, OUTFIT_LABELS, GLOVE_LABELS, GLOVE_LEVELS };
