/* @layer website-site @kind logic */
import { VIEW_ANCHOR } from '../ScrollRail.constants';
import type { RailGeometry } from '../ScrollRail.type';

const railProgressOf = (geometry: RailGeometry, scrollY: number, viewport: number): number =>
  Math.min(Math.max((scrollY + viewport * VIEW_ANCHOR - geometry.top) / geometry.span, 0), 1);

export { railProgressOf };
