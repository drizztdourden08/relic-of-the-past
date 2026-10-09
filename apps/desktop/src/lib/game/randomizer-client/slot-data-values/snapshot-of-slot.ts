/* @layer bridge-wasm @kind logic */
import { normalizeRandomizerOptions } from '@shared/randomizer/options-snapshot';
import type { RandomizerOptionsSnapshot } from '@shared/randomizer/world/options.type';
import type { RotpSlotData } from '@shared/randomizer/archipelago/slot-data.type';

const snapshotOfSlot = (slotData: RotpSlotData): RandomizerOptionsSnapshot =>
  normalizeRandomizerOptions({ schema: 'ap-options-v2', values: slotData.options });

export { snapshotOfSlot };
