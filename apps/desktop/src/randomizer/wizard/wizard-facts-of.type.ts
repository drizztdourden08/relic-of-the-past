/* @layer renderer-app @kind types */
import type { ProfileRandomizerConfig } from '@app/profiles/types';

interface WizardFacts {
  enabled: boolean;
  rom: string;
  seed: string;
  mode: ProfileRandomizerConfig['mode'];
}

export type { WizardFacts };
