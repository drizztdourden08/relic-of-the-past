/* @layer shared-hud @kind logic */
import { intrinsicSize } from './intrinsic-size';
import type { HudElementSpec } from '../../../types/hud/hud-node';
import type { MeasureContext } from '../engine.type';

const aspectOf = (spec: HudElementSpec, ctx: MeasureContext = {}): number => {
  const size = intrinsicSize(spec, ctx);
  return size.h > 0 ? size.w / size.h : 1;
};

export { aspectOf };
