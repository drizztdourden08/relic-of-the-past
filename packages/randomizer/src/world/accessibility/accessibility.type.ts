/* @layer shared-game @kind types */
import type { CheckId } from '@rotp/game-data';
import type { ItemKey } from '../item-ids';
import type { LocationKey } from '../location-key';
import type { CapacityProfile } from '../capacity/capacity-profile.type';

type AccessibilityMode = 'full' | 'items' | 'minimal';

interface AccessibilityInput {
  mode: AccessibilityMode;
  capacity: CapacityProfile;
  uncollected: readonly LocationKey[];
  missedEvents: readonly CheckId[];
  placedItems: ReadonlyMap<LocationKey, ItemKey>;
}

export type { AccessibilityMode, AccessibilityInput };
