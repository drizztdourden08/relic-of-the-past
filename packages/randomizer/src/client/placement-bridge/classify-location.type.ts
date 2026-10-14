/* @layer bridge-wasm @kind types */
import type { CheckId, getCheck } from '@rotp/game-data';
import type { ItemKey } from '../../world/item-ids';
import type { LocationKey } from '../../world/location-key';
import type { CheckDetection } from '../check-detection';
import type { ScopeFlags } from '../scope-lock';

type DetectionField = { detection?: CheckDetection };

interface ScopedContext {
  location: LocationKey;
  item: ItemKey;
  flags: ScopeFlags;
  targetLocalId: number;
  checkId: CheckId | undefined;
  detectionField: DetectionField;
}

interface CheckPlanContext {
  location: LocationKey;
  item: ItemKey;
  checkId: CheckId;
  check: ReturnType<typeof getCheck>;
  detection: CheckDetection | null;
  detectionField: DetectionField;
  targetLocalId: number;
}

export type { CheckPlanContext, DetectionField, ScopedContext };
