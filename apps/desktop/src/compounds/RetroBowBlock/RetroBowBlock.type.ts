/* @layer renderer-components @kind types */
import type { CapacityProfile } from '@rotp/randomizer';
import type { ProgressiveSetting } from '@rotp/randomizer';
import type { RetroBowSetting } from '@rotp/randomizer';

interface RetroBowBlockProps {
  setting: RetroBowSetting;
  capacity: CapacityProfile;
  tiers: ProgressiveSetting;
  onChange?: (next: RetroBowSetting) => void;
}

export type { RetroBowBlockProps };
