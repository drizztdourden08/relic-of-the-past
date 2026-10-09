/* @layer shared-hud @kind types */
import type { HudNode } from '../../types/hud/hud-node';
import type { Rect } from '../layouts/geometry.type';

interface ChildBox { node: HudNode; box: Rect }

export type { ChildBox };
