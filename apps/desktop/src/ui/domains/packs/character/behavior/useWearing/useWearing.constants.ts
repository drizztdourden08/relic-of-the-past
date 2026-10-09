/* @layer renderer-hooks @kind constants */
import type { GloveLevel, OutfitId } from '@shared/game/data/player-sheet/types';

const OUTFIT_LABELS: Record<OutfitId, string> = {
  green: 'Green',
  blue: 'Blue',
  red: 'Red',
  bunny: 'Bunny',
};

const GLOVE_LABELS: Record<GloveLevel, string> = { 0: 'None', 1: 'Power', 2: 'Titan' };
const GLOVE_LEVELS: readonly GloveLevel[] = [0, 1, 2];

export { GLOVE_LABELS, GLOVE_LEVELS, OUTFIT_LABELS };
