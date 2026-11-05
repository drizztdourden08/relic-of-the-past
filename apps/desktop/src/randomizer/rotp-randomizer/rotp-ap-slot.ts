/* @layer renderer-app @kind logic */
import { AP_WORLD_VERSION, parseSlotData } from '@rotp/randomizer';
import type { Placement } from '@rotp/randomizer';
import type { ArchipelagoGame } from '@drizztdourden08/brock-randomizer';
import { rotpApPlacement } from './rotp-ap-placement';

const rotpApSlot: ArchipelagoGame<Placement, unknown>['slot'] = (raw) => {
  const parsed = parseSlotData(raw);
  if (parsed.kind !== 'ok') return parsed;
  const { slotData } = parsed;
  return {
    kind: 'ok',
    deathLink: slotData.deathLink,
    version: AP_WORLD_VERSION,
    placement: (input) => rotpApPlacement(slotData, input),
  };
};

export { rotpApSlot };
