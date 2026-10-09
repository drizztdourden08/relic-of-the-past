/* @layer bridge-wasm @kind types */
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { PondId } from '@shared/randomizer/world/pond/pond-instance.type';
import type { PondMode } from '@shared/randomizer/world/pond/pond-profile.type';
import type { WishPondRungArm } from '../wish-pond-plan';
import type { WishPondMessageIds } from './receipt-text-refresh';

interface WishPondArmContext {
  messageIdOf: (location: LocationKey) => number;
  fireIdOf: (location: LocationKey) => number;
  lines: WishPondMessageIds;
}

interface WishPondRungRow extends WishPondRungArm {
  location: LocationKey;
  item: string;
}

interface WishPondWaterPlan {
  id: PondId;
  label: string;
  pond: number;
  mode: PondMode;
  rungs: readonly WishPondRungRow[];
  refusal?: string;
  lines: WishPondMessageIds;
}

interface WishPondSessionPlan {
  waters: readonly WishPondWaterPlan[];
  rungs: readonly WishPondRungArm[];
}

interface RungGrant {
  item: string;
  newItem: number;
  messageId: number;
  assigned: boolean;
}

type PendingRung = RungGrant & { pond: number; rung: number; location: LocationKey };

export type {
  PendingRung, RungGrant, WishPondArmContext, WishPondRungRow, WishPondSessionPlan, WishPondWaterPlan,
};
