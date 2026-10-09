/* @layer bridge-wasm @kind logic */
import type { CheckId } from '@rotp/game-data';

const eventStatusEqual = (a: ReadonlyMap<CheckId, boolean>, b: ReadonlyMap<CheckId, boolean>): boolean => {
  if (a.size !== b.size) return false;
  for (const [id, value] of a) if (b.get(id) !== value) return false;
  return true;
};

export { eventStatusEqual };
