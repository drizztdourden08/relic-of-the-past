/* @layer shared-hud @kind logic */
import { resolveValue } from '../../data/resolve-value';
import { scopeOf } from './scope-of';
import type { HudBox } from '../../types/hud-node';
import type { MeasureContext } from '../engine.type';

const resolveScale = (node: HudBox, ctx: MeasureContext): number => resolveValue(node.scale ?? 1, scopeOf(ctx));

export { resolveScale };
