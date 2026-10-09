/* @layer shared-game @kind logic */
import type { TitleProgress } from '../title-frame.type';
import type { SlotReader } from './title-progress.type';
import { DEFAULT_PROGRESS, MAX_SWORD, PROGRESS_OFFSET, SECOND_HALF_AT, SWORD_OFFSET, TIER_OF_SWORD } from './title-progress.constants';

const mostAdvancedSave = (sram: Uint8Array, reader: SlotReader): TitleProgress => {
  const { validSlots, blockOffset } = reader;
  let best = DEFAULT_PROGRESS;
  let bestScore = -1;
  for (const slot of validSlots(sram)) {
    const at = blockOffset(sram, slot);
    if (at === null) continue;
    const sword = Math.min(MAX_SWORD, sram[at + SWORD_OFFSET]);
    const dark = sram[at + PROGRESS_OFFSET] >= SECOND_HALF_AT;
    const score = (dark ? MAX_SWORD * 2 : 0) + sword;
    if (score > bestScore) {
      bestScore = score;
      best = { tier: TIER_OF_SWORD[sword], world: dark ? 'dark' : 'light', fromSlot: slot };
    }
  }
  return best;
};

export { mostAdvancedSave };
