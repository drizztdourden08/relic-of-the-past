/* @layer renderer-hud @kind types */
import type { PlacedNode } from '@rotp/hud';
import type { Ghost } from './hud-node-motion.type';

interface EnterExitCssInput {
  id: string;
  nodes: readonly PlacedNode[];
  ghosts: readonly Ghost[];
  enteringIds: ReadonlySet<string>;
  exitingIds: ReadonlySet<string>;
}

export type { EnterExitCssInput };
