/* @layer shared-hud @kind types */
import type { HudNode } from '../../types/hud-node';
import type { Issues } from '../validate-box';

interface NodeContext {
  issues: Issues;
  seen: Set<string>;
  insideRepeat: boolean;
}

type NodeValidator = (value: unknown, path: string, ctx: NodeContext) => HudNode | null;

export type { NodeContext, NodeValidator };
