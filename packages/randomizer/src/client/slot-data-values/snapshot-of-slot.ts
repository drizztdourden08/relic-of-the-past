/* @layer bridge-wasm @kind logic */
import { normalizeRandomizerOptions } from '../../options-snapshot';
import type { RandomizerOptionsSnapshot } from '../../world/options.type';
import type { RotpSlotData } from '../../archipelago/slot-data.type';

const snapshotOfSlot = (slotData: RotpSlotData): RandomizerOptionsSnapshot =>
  normalizeRandomizerOptions({ schema: 'ap-options-v2', values: slotData.options });

export { snapshotOfSlot };
