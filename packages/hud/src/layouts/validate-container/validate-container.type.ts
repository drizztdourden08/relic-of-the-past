/* @layer shared-hud @kind types */
import type { HudNode } from '../../types/hud-node';
import type { Issues } from '../validate-box';

type NodeValidator = (
  value: unknown, path: string, issues: Issues, seen: Set<string>, insideRepeat?: boolean,
) => HudNode | null;

export type { NodeValidator };
