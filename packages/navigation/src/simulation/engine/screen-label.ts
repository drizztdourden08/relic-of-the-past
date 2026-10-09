/* @layer shared-game @kind logic */
import { findOne } from '@rotp/game-data';
import type { TraversalId } from '../traversal-id.type';

const labels = new Map<TraversalId, string>();

const resolve = (id: TraversalId): string => {
  const screen = findOne('screen', s => s.id === id);
  return screen ? `${id} (${screen.name})` : id;
};

const screenLabel = (id: TraversalId): string => {
  const cached = labels.get(id);
  if (cached !== undefined) return cached;
  const label = resolve(id);
  labels.set(id, label);
  return label;
};

export { screenLabel };
