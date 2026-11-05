/* @layer renderer-app @kind logic */
import type { RandomizerLogText } from '@drizztdourden08/brock-randomizer';
import { onlineSlotName } from './online-slot-name-slot';

const rotpLogText: Partial<RandomizerLogText> = {
  autoStart: (mode, seed) => `[Boot] Auto-starting ${mode} session for this profile (${mode === 'online' ? `slot ${onlineSlotName.current}` : `seed ${seed}`})`,
  armed: () => null,
  rerollFailed: (message) => `Randomizer generation failed: ${message}`,
};

export { rotpLogText };
