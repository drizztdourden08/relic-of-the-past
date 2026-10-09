/* @layer renderer-components @kind logic */
import type { TextSlot } from '@shared/game/language';

const isTranslated = (slot: TextSlot, values: Record<string, string>): boolean => {
  const own = values[slot.key];
  return own !== undefined && own.trim().length > 0 && own !== slot.fallback;
};

export { isTranslated };
