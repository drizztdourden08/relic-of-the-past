/* @layer shared-input @kind logic */
import { resolveDeviceFromEntry } from '@drizztdourden08/brock-input';
import { defaultCoreBindings, effectiveModernBindings } from '../../scheme';
import type { ModernBindings } from '@rotp/game-data';
import type { TouchBindings } from '@rotp/features';
import { TOUCH_DEVICE_ENTRY } from './touch-pad.constants';
import { overrideSlots } from './override-slots';

let cached: ModernBindings | null = null;
let cachedFor: TouchBindings | null = null;

const touchModernBindings = (overrides: TouchBindings): ModernBindings => {
  if (cached && cachedFor === overrides) return cached;
  const controls = resolveDeviceFromEntry(TOUCH_DEVICE_ENTRY).controls;
  const base = effectiveModernBindings({ core: defaultCoreBindings(controls), controls });
  cached = {
    ...base,
    core: { ...base.core, ...overrides.verbs },
    slots: overrideSlots(base.slots, overrides.slots),
  };
  cachedFor = overrides;
  return cached;
};

export { touchModernBindings };
