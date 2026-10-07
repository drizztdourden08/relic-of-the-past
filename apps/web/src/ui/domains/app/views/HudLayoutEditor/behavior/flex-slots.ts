/* @layer renderer-components @kind logic */
/**
 * WHERE A FLEX CONTAINER'S CHILDREN ACTUALLY LANDED. This is to the flex editor
 * what `grid-solve.ts` is to the lattice (§58).
 *
 * THE STRIP DRAWS THE STAGE'S OWN SOLVE, NOT A SECOND ONE. The lattice's whole
 * claim is that a panel cell is the shape of the cell on the stage instead of a
 * square standing in for it; a flex container's cells have to earn the same
 * claim, and they can earn it more cheaply, because a flex container HAS NO LATTICE to
 * solve, so where the children were PLACED is the arrangement (§57.5). This file
 * reads `usePlacedLayout`'s own answer and hands each child's placed box down.
 *
 * AS A CONTEXT INSTEAD OF A PROP, for `grid-solve.ts`'s reason exactly: it is a
 * fact about the session's preview and not about the selected node, and
 * threading it through `NodeInspector` → `LayoutSection` → `FlexEditor` would
 * put a prop nobody on that path reads into three signatures.
 *
 * AN UNPLACED CONTAINER IS NOT A BROKEN ONE. `[]` means "not on the stage right
 * now" (a repeat's template before expansion, a mount in a test), and the strip
 * falls back to equal shares, which is a truthful "no proportions known" and not
 * a guess.
 *
 * A REPEAT'S INSTANCES ALL PLACE. They share one authored id and `expand.ts`
 * suffixes the copies, so matching on the authored id takes the first instance.
 * `grid-solve-lookup.ts` makes the same choice for the same reason: drawing the
 * panel differently depending on which copy came back first is worse.
 */
import { createContext, useContext } from 'react';
import type { PlacedNode } from '@shared/hud/engine';
import type { HudContainer } from '@shared/types/hud';

/** One child's placed box, in GAME px. It is unit-free, so the strip may draw it at
 *  whatever size the rail gives it. */
interface FlexSlot {
  id: string;
  w: number;
  h: number;
}

type FlexSlotLookup = (container: HudContainer) => readonly FlexSlot[];

const NONE: FlexSlotLookup = () => [];

const FlexSlotContext = createContext<FlexSlotLookup>(NONE);

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

/** What the strip asks for: never null, so no caller has to branch. */
const useFlexSlots = (container: HudContainer): readonly FlexSlot[] =>
  useContext(FlexSlotContext)(container);

export { FlexSlotContext, slotLookup, useFlexSlots };
export type { FlexSlot, FlexSlotLookup };
