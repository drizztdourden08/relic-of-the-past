/* @layer renderer-components @kind types */
import type { CapacityProfile, ProgressiveSetting, RetroBowSetting } from '@rotp/randomizer';

interface RetroBowBlockProps {
  setting: RetroBowSetting;
  capacity: CapacityProfile;
  tiers: ProgressiveSetting;
  onChange?: (next: RetroBowSetting) => void;
}

export type { RetroBowBlockProps };
