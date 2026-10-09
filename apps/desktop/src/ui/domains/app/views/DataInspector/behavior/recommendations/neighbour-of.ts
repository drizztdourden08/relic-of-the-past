/* @layer renderer-app @kind logic */
import type { Recommendation } from '@rotp/navigation';

const neighbourOf = (order: readonly Recommendation[], id: string): string | null => {
  const at = order.findIndex(entry => entry.id === id);
  if (at === -1) return null;
  return order[at + 1]?.id ?? order[at - 1]?.id ?? null;
};

export { neighbourOf };
