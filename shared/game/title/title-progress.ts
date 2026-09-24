/* @layer shared-game @kind logic */
/**
 * What the title shows for a profile: the sword tier and the world of its most advanced battery-save
 * file. Pure over the 8 KiB save; the slot geometry and checksum come from the caller so this stays
 * free of the host's storage.
 */
import type { SwordTier, TitleProgress } from './title-frame.type';

/** Block offsets in a save file (variables.h): the sword byte and the progress indicator. */
const SWORD_OFFSET = 0x359;
const PROGRESS_OFFSET = 0x3c5;
/** The progress indicator's value once the tower's keeper falls and the second half begins. */
const SECOND_HALF_AT = 3;
const MAX_SWORD = 4;

/** Index = the sword byte. No sword yet, and no save at all, show the game's own title sword. */
const TIER_OF_SWORD: readonly SwordTier[] = ['fighter', 'fighter', 'master', 'tempered', 'golden'];

const DEFAULT_PROGRESS: TitleProgress = { tier: 'fighter', world: 'light', fromSlot: null };

interface SlotReader {
  /** The valid slots, 0-based. */
  validSlots: (sram: Uint8Array) => number[];
  /** The byte offset of a slot's valid block. */
  blockOffset: (sram: Uint8Array, slot: number) => number | null;
}

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

export { DEFAULT_PROGRESS, mostAdvancedSave };
export type { SlotReader };
