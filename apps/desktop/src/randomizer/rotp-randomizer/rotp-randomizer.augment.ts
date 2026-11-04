/* @layer renderer-app @kind types */
import type { GameSettings } from '@rotp/features';

declare module '@drizztdourden08/brock-randomizer/augment' {
  interface RandomizerModes {
    archipelia: true;
  }
  interface RandomizerTypeRegistry {
    frozenSettings: Partial<GameSettings>;
  }
}

export {};
