/* @layer renderer-components @kind types */
import type { OutfitId, GloveLevel } from '@rotp/game-data';
import type { PoseLabelsProp } from '../../behavior/pose-labels';

interface WearingBarProps extends PoseLabelsProp {
  outfit: OutfitId;
  gloves: GloveLevel;
  onOutfit: (outfit: OutfitId) => void;
  onGloves: (gloves: GloveLevel) => void;
  flat?: boolean;
}

export type { WearingBarProps };
