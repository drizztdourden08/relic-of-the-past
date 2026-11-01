/* @layer website-site @kind logic */
import { VIEW_ANCHOR } from '../ScrollRail.constants';
import type { RailGeometry } from '../ScrollRail.type';

const scrollOfProgress = (geometry: RailGeometry, progress: number, viewport: number): number =>
  geometry.top + progress * geometry.span - viewport * VIEW_ANCHOR;

export { scrollOfProgress };
