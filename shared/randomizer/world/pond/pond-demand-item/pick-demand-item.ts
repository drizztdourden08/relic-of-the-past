/* @layer shared-game @kind logic */
import { WINDOW_SHARE } from './pond-demand-item.constants';
import type { Rng } from '../../../rng';
import type { ItemKey } from '../../item-ids.data';

const nearestUnused = (
  candidates: readonly ItemKey[], centre: number, used: ReadonlySet<ItemKey>,
): ItemKey | undefined =>
  candidates
    .map((item, index) => ({ item, distance: Math.abs(index - centre) }))
    .filter(({ item }) => !used.has(item))
    .sort((left, right) => left.distance - right.distance)[0]?.item;

const pickDemandItem = (
  candidates: readonly ItemKey[], position: number, rng: Rng, used: ReadonlySet<ItemKey> = new Set(),
): ItemKey => {
  const window = Math.max(1, Math.round(candidates.length * WINDOW_SHARE));
  const centre = Math.round(position * (candidates.length - 1));
  const low = Math.min(Math.max(0, centre - Math.floor(window / 2)), Math.max(0, candidates.length - window));
  const open = candidates.slice(low, low + window).filter((item) => !used.has(item));
  if (open.length === 0) {
    const nearest = nearestUnused(candidates, centre, used);
    if (nearest !== undefined) return nearest;
    return candidates[low + (window === 1 ? 0 : rng.int(window))];
  }
  return open[open.length === 1 ? 0 : rng.int(open.length)];
};

export { pickDemandItem };
