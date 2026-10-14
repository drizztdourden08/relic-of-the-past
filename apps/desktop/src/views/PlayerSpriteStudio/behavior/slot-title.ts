/* @layer renderer-components @kind logic */
import type { OutfitId } from '@rotp/game-data';
import { OUTFIT_LABELS } from '@rotp/design/packs';
import type { Slot } from '../PlayerSpriteStudio.type';

const slotTitle = (slot: Slot, outfit: OutfitId): string => {
  if (slot === null) return '';
  if (typeof slot === 'number') return `${OUTFIT_LABELS[outfit]} · index ${slot + 1}`;
  return `Gloves · ${slot === 'g0' ? 'power' : 'titan'}`;
};

export { slotTitle };
