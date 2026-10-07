/* @layer renderer-components @kind types */
import type { CapacityProfile } from '@shared/randomizer/ap-world/capacity';
import type { ProgressiveSetting } from '@shared/randomizer/ap-world/progressive/progressive.type';
import type { RetroBowSetting } from '@shared/randomizer/ap-world/retro/retro.type';

interface RetroBowBlockProps {
  setting: RetroBowSetting;
  /**
   * The capacity profile the seed is built from (the pair after the rule has
   * settled it). The two cost sliders stop where its wallet does, so no cost
   * the wallet could never hold is ever offered.
   */
  capacity: CapacityProfile;
  /**
   * The tier ticks standing above this block. With the plain bow rung unticked
   * the first bow found already fires silver, so the plain cost can never
   * apply and its slider is shown inert with the reason on it.
   */
  tiers: ProgressiveSetting;
  /** Absent renders the whole block frozen. */
  onChange?: (next: RetroBowSetting) => void;
}

export type { RetroBowBlockProps };
