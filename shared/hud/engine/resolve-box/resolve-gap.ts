/* @layer shared-hud @kind logic */
import { resolveValue } from '../../data/resolve-value';
import { scopeOf } from './scope-of';
import type { HudContainer } from '../../../types/hud/hud-node';
import type { MeasureContext } from '../engine.type';

const resolveGap = (container: HudContainer, ctx: MeasureContext): { x: number; y: number } => {
  const scope = scopeOf(ctx);
  return {
    x: resolveValue(container.gap?.x ?? 0, scope),
    y: resolveValue(container.gap?.y ?? 0, scope),
  };
};

export { resolveGap };
