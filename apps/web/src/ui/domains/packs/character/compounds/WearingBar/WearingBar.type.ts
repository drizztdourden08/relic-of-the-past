/* @layer renderer-components @kind types */
import type { OutfitId, GloveLevel } from '@shared/game/data/player-sheet/types';

interface WearingBarProps {
  outfit: OutfitId;
  gloves: GloveLevel;
  onOutfit: (outfit: OutfitId) => void;
  onGloves: (gloves: GloveLevel) => void;
}

export type { WearingBarProps };
