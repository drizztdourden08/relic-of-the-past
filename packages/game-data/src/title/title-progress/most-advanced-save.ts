/* @layer shared-game @kind logic */
import type { TitleProgress } from '../title-frame.type';
import type { SlotReader } from './title-progress.type';
import { DEFAULT_PROGRESS, MAX_SWORD, PROGRESS_OFFSET, SECOND_HALF_AT, SWORD_OFFSET, TIER_OF_SWORD } from './title-progress.constants';

const scoredSlot = (sram: Uint8Array, at: number, slot: number): { score: number; progress: TitleProgress } | null => {
  const swordByte = sram[at + SWORD_OFFSET];
  if (swordByte === undefined) return null;
  const sword = Math.min(MAX_SWORD, swordByte);
  const tier = TIER_OF_SWORD[sword];
  if (tier === undefined) throw new Error(`no title tier for sword ${sword}`);
  const dark = (sram[at + PROGRESS_OFFSET] ?? 0) >= SECOND_HALF_AT;
  return {
    score: (dark ? MAX_SWORD * 2 : 0) + sword,
    progress: { tier, world: dark ? 'dark' : 'light', fromSlot: slot },
  };
};

const mostAdvancedSave = (sram: Uint8Array, reader: SlotReader): TitleProgress => {
  const { validSlots, blockOffset } = reader;
  let best = DEFAULT_PROGRESS;
  let bestScore = -1;
  for (const slot of validSlots(sram)) {
    const at = blockOffset(sram, slot);
    const scored = at === null ? null : scoredSlot(sram, at, slot);
    if (scored !== null && scored.score > bestScore) {
      bestScore = scored.score;
      best = scored.progress;
    }
  }
  return best;
};

export { mostAdvancedSave };
