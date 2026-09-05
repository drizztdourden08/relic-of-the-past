/* @layer shared-game @kind logic */
/**
 * `screen-183 (Uncle Estate)` for the run's log. Display only, since traversal never
 * consults the dataset.
 *
 * The lookup has to be able to answer "nothing", because most ids reaching here
 * are TraversalIds (`room:80`) which are not dataset keys at all. The dataset
 * getters answer a miss with a structurally-valid stand-in record instead, and the
 * old test for a miss, `label === id`, only worked while that stand-in echoed
 * the id back as its name; the moment it stopped, every traversal id started
 * rendering the stand-in's placeholder as though it were real data.
 *
 * Memoized because this runs several times per engine step and the id space of a
 * run is small. The cache holds a LABEL, never an identity, so the one thing a
 * replaced dataset bundle could cause is a stale string in a log line.
 */
import { findOne } from '../../data';
import type { TraversalId } from '../traversal-id';

const labels = new Map<TraversalId, string>();

const resolve = (id: TraversalId): string => {
  const screen = findOne('screen', s => s.id === id);
  return screen ? `${id} (${screen.vanillaName ?? screen.randomizerName})` : id;
};

const screenLabel = (id: TraversalId): string => {
  const cached = labels.get(id);
  if (cached !== undefined) return cached;
  const label = resolve(id);
  labels.set(id, label);
  return label;
};

export { screenLabel };
