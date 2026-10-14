/* @layer shared-hud @kind types */
import type { HudNode } from '../types/hud-node';
import type { Rect, Size } from '../layouts/geometry.type';

interface ChildBox { node: HudNode; box: Rect }

interface ShareAxis { row: boolean; mainGap: number; available: number }

interface Pen { main: number; cross: number }

interface BoxFrame { area: Rect; unit: number; row: boolean }

interface FlowPlan { area: Rect; available: Size; unit: number; gap: { main: number; cross: number } }

export type { BoxFrame, ChildBox, FlowPlan, Pen, ShareAxis };
