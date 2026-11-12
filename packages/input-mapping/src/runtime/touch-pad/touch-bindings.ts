/* @layer shared-input @kind logic */
import { resolveDeviceFromEntry } from '@drizztdourden08/brock-input';
import { defaultCoreBindings, effectiveModernBindings } from '../../scheme';
import type { ModernBindings } from '@rotp/game-data';
import { TOUCH_DEVICE_ENTRY } from './touch-pad.constants';

let cached: ModernBindings | null = null;

const touchModernBindings = (): ModernBindings => {
  if (cached) return cached;
  const controls = resolveDeviceFromEntry(TOUCH_DEVICE_ENTRY).controls;
  cached = effectiveModernBindings({ core: defaultCoreBindings(controls), controls });
  return cached;
};

export { touchModernBindings };
