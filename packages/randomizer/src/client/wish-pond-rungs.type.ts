/* @layer bridge-wasm @kind types */
import type { LocationKey } from '../world/location-key';
import type { PondId } from '../world/pond/pond-instance.type';
import type { PondMode } from '../world/pond/pond-profile.type';
import type { WishPondRungArm } from '../wish-pond-plan/wish-pond-plan.type';
import type { WishPondMessageIds } from './receipt-text-refresh.type';

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
