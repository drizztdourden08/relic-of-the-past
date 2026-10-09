/* @layer renderer-components @kind logic */
import type { PlacedNode } from '@rotp/hud';
import type { HudContainer } from '@rotp/hud';
import type { FlexSlot, FlexSlotLookup } from './flex-slots.type';

const slotLookup = (placed: readonly PlacedNode[]): FlexSlotLookup => {
  const cache = new Map<string, readonly FlexSlot[]>();
  return (container: HudContainer): readonly FlexSlot[] => {
    const held = cache.get(container.id);
    if (held !== undefined) return held;
    const slots = container.children.map((child) => {
      const host = placed.find((node) => node.id === child.id);
      return { id: child.id, w: host?.rect.w ?? 0, h: host?.rect.h ?? 0 };
    });
    cache.set(container.id, slots);
    return slots;
  };
};

export { slotLookup };
