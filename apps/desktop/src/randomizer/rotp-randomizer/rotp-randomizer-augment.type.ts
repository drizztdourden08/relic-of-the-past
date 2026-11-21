/* @layer renderer-app @kind types */
import type { DeliverableLists, RandomizerOptionsSnapshot } from '@rotp/randomizer';
import type { GameSettings } from '@rotp/features';

declare module '@drizztdourden08/brock-randomizer/augment' {
  interface RandomizerModes {
    archipelia: true;
  }
  interface RandomizerTypeRegistry {
    frozenSettings: Partial<GameSettings>;
    options: RandomizerOptionsSnapshot;
  }
  interface RandomizerProfileConfig {
    deliverable?: DeliverableLists;
  }
}

export {};
