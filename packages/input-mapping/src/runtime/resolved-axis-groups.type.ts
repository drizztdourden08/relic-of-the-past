/* @layer renderer-lib @kind types */
import type { ResolvedControl } from '../family';

interface StickPairGroup {
  readonly label: string;
  readonly basePrefix: string;
  readonly xControl: ResolvedControl;
  readonly yControl: ResolvedControl;
}

interface GroupedAxisControls {
  readonly stickPairs: readonly StickPairGroup[];
  readonly triggers: readonly ResolvedControl[];
}

export type { GroupedAxisControls, StickPairGroup };
