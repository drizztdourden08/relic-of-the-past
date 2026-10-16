/* @layer renderer-components @kind types */
import type { OutfitId, GloveLevel } from '@rotp/game-data';

interface WearingBarProps {
  outfit: OutfitId;
  gloves: GloveLevel;
  onOutfit: (outfit: OutfitId) => void;
  onGloves: (gloves: GloveLevel) => void;
  flat?: boolean;
}

export type { WearingBarProps };
