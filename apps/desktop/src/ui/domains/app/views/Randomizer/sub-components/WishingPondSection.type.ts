/* @layer renderer-components @kind types */
import type { CapacityProfile } from '@shared/randomizer/world/capacity/capacity-profile.type';
import type { PondDemandView } from '@shared/randomizer/world/pond/pond-ask.type';
import type { PondId } from '@shared/randomizer/world/pond/pond-instance.type';
import type { PondSetting } from '@shared/randomizer/world/pond/pond-profile.type';
import type { PondProfiles } from '@shared/randomizer/world/pond/pond-profiles.type';

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
