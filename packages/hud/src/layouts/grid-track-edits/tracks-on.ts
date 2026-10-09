/* @layer shared-hud @kind logic */
import { reachOn } from './reach-on';
import type { Extent, HudGridContainer } from '../../types';
import type { TrackAxis } from './grid-track-edits.type';

const tracksOn = (container: HudGridContainer, axis: TrackAxis): Extent[] => {
  const declared = axis === 'columns' ? container.columns : (container.rows ?? []);
  const need = Math.max(declared.length, reachOn(container.children, axis), 1);
  return [...declared, ...Array.from({ length: need - declared.length }, () => 'auto' as Extent)];
};

export { tracksOn };
