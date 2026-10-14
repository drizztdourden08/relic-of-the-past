/* @layer renderer-widgets @kind logic */
import type { CapacityRung } from '@app/game';

const maxWriterOf = (
  ladder: readonly CapacityRung[],
  set: (rung: number) => void,
  enabled: boolean,
): ((cap: number) => void) | undefined => {
  if (!enabled) return undefined;
  return (cap) => {
    const hit = ladder.find((r) => r.cap === cap);
    if (hit) set(hit.rung);
  };
};

export { maxWriterOf };
