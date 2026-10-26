/* @layer shared-input @kind types */
import type { ResolvedControl } from '@drizztdourden08/brock-input';
import type { CoreBindings, ModernSlot } from '@rotp/game-data';

interface SlotSource {
  core: CoreBindings;
  controls?: readonly ResolvedControl[];
  keyboard?: boolean;
  stored?: readonly ModernSlot[];
  layoutId?: string;
}

export type { SlotSource };
