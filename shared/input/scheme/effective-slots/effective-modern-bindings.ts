/* @layer shared-input @kind logic */
import { effectiveSlots } from './effective-slots';
import type { ModernBindings } from '@rotp/game-data';
import type { SlotSource } from './effective-slots.type';

const effectiveModernBindings = (source: SlotSource): ModernBindings => ({
  core: source.core,
  slots: effectiveSlots(source),
  ...(source.layoutId ? { layoutId: source.layoutId } : {}),
});

export { effectiveModernBindings };
