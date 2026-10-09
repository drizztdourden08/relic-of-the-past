/* @layer shared-input @kind logic */
import { defaultSlotList } from '../derive-slots';
import { defaultCoreBindings } from './default-core-bindings';
import type { ResolvedControl } from '../../family/family.type';
import type { ModernBindings } from '@rotp/game-data';

const defaultModernBindings = (controls: readonly ResolvedControl[]): ModernBindings => {
  const core = defaultCoreBindings(controls);
  return { core, slots: defaultSlotList(controls, core) };
};

export { defaultModernBindings };
