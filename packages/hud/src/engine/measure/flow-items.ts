/* @layer shared-hud @kind logic */
import { insetsOf } from '../flow';
import { resolveVisible } from '../resolve-box';
import { measureBox } from './measure-box';
import type { HudContainer } from '../../types/hud-node';
import type { FlowItem } from '../flow';
import type { MeasureContext } from '../engine.type';

const flowItems = (container: HudContainer, ctx: MeasureContext): FlowItem[] =>
  container.children
    .filter((child) => resolveVisible(child, ctx))
    .map((child) => ({ node: child, size: measureBox(child, ctx), margin: insetsOf(child.margin) }));

export { flowItems };
