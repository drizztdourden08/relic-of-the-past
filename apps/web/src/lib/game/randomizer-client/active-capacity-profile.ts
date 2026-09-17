/* @layer bridge-wasm @kind logic */
/**
 * The capacity profile the running session was generated with, kept once the session arms it
 * and dropped when it disarms, with whether its upgrades climb the plan in order (progressive)
 * or each carry a fixed jump. Read by anything that must stay inside what the seed allows,
 * such as the cheat console's capacity ladders: logic reads a family as its start rung plus
 * the collected jumps, so a value no set of upgrades reaches is a value logic never assumed.
 */
import type { CapacityProfile } from '@shared/randomizer/ap-world/capacity';

type ActiveCapacity = {
  profile: CapacityProfile;
  progressive: boolean;
};

type ActiveCapacityListener = (active: ActiveCapacity | null) => void;

let active: ActiveCapacity | null = null;
const listeners = new Set<ActiveCapacityListener>();

const setActiveCapacity = (next: ActiveCapacity | null): void => {
  active = next;
  for (const listener of listeners) {
    try { listener(active); } catch { /* a bad listener never breaks the session */ }
  }
};

const getActiveCapacity = (): ActiveCapacity | null => active;

const subscribeActiveCapacity = (listener: ActiveCapacityListener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export { getActiveCapacity, setActiveCapacity, subscribeActiveCapacity };
export type { ActiveCapacity, ActiveCapacityListener };
