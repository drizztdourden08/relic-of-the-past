/* @layer renderer-components @kind types */
import type { CapacityProfile } from '@shared/randomizer/world/capacity';
import type { ProgressiveSetting } from '@shared/randomizer/world/progressive/progressive.type';
import type { RetroBowSetting } from '@shared/randomizer/world/retro/retro.type';

interface RetroBowBlockProps {
  setting: RetroBowSetting;
  capacity: CapacityProfile;
  tiers: ProgressiveSetting;
  onChange?: (next: RetroBowSetting) => void;
}

export type { RetroBowBlockProps };
