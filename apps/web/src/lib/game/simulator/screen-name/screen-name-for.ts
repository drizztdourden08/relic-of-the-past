/* @layer bridge-wasm @kind logic */
import type { TraversalId } from '@shared/game/simulation';
import { recordFor } from './record-for';

const screenNameFor = (id: TraversalId, from?: TraversalId): string | null => {
  const palace = from !== undefined ? recordFor(from)?.gameId.palaceIndex : undefined;
  const record = recordFor(id, palace);
  return record ? record.name : null;
};

export { screenNameFor };
