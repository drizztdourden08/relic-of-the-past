/* @layer renderer-hooks @kind logic */
import { useState, useCallback, useMemo } from 'react';
import { OUTFIT_IDS } from '@rotp/game-data';
import type { OutfitId, GloveLevel, Wearing } from '@rotp/game-data';
import { GLOVE_LABELS, GLOVE_LEVELS, OUTFIT_LABELS } from './useWearing.constants';

const useWearing = () => {
  const [outfit, setOutfit] = useState<OutfitId>('green');
  const [gloves, setGloves] = useState<GloveLevel>(0);

  const wearing = useMemo<Wearing>(() => ({ outfit, gloves }), [outfit, gloves]);
  const reset = useCallback(() => { setOutfit('green'); setGloves(0); }, []);

  return { wearing, outfit, setOutfit, gloves, setGloves, reset, OUTFIT_IDS, OUTFIT_LABELS, GLOVE_LEVELS, GLOVE_LABELS };
};

export { useWearing };
