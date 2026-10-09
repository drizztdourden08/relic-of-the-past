/* @layer shared-game @kind types */
import type { InteriorKind, ScreenGameId, ScreenId, ScreenKind, ScreenWorld } from '../../../data';
import type { ScreenVariantInfo } from '../../../data/types/screen';

interface ScreenCandidate {
  id?: ScreenId;
  kind: ScreenKind;
  world: ScreenWorld;
  interiorKind?: InteriorKind;
  areaId?: string;
  locationId?: string;
  gameId: ScreenGameId;
  position?: { floor?: number };
  variant?: ScreenVariantInfo;
}

type TierRange = readonly [number, number];

export type { ScreenCandidate, TierRange };
