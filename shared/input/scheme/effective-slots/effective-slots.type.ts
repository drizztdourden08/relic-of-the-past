/* @layer shared-input @kind types */
import type { ResolvedControl } from '../../family/family.type';
import type { CoreBindings, ModernSlot } from '../../../types/controls';

interface SlotSource {
  core: CoreBindings;
  controls?: readonly ResolvedControl[];
  keyboard?: boolean;
  stored?: readonly ModernSlot[];
  layoutId?: string;
}

export type { SlotSource };
