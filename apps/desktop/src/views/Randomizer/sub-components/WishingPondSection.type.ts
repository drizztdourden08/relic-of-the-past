/* @layer renderer-components @kind types */
import type { CapacityProfile } from '@rotp/randomizer';
import type { PondDemandView } from '@rotp/randomizer';
import type { PondId } from '@rotp/randomizer';
import type { PondSetting } from '@rotp/randomizer';
import type { PondProfiles } from '@rotp/randomizer';

interface WishingPondSectionProps {
  profiles: PondProfiles;
  capacity?: CapacityProfile;
  share?: boolean;
  demands?: PondDemandView;
  notes?: readonly string[];
  readOnly?: boolean;
  frozen?: readonly PondId[];
  onChange?: (id: PondId, next: PondSetting) => void;
  onShareChange?: (next: boolean) => void;
}

export type { WishingPondSectionProps };
