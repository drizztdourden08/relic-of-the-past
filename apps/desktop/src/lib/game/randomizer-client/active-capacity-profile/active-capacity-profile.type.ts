/* @layer bridge-wasm @kind types */
import type { CapacityProfile } from '@shared/randomizer/world/capacity';

type ActiveCapacity = {
  profile: CapacityProfile;
  progressive: boolean;
};

type ActiveCapacityListener = (active: ActiveCapacity | null) => void;

type ActiveCapacityState = {
  active: ActiveCapacity | null;
  listeners: Set<ActiveCapacityListener>;
};

export type { ActiveCapacity, ActiveCapacityListener, ActiveCapacityState };
