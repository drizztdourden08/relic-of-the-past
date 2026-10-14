/* @layer shared-hud @kind types */
import type { HudNode } from '../../types/hud-node';
import type { Size } from '../../layouts/geometry.type';

interface Insets { top: number; right: number; bottom: number; left: number }

interface FlowItem { node: HudNode; size: Size; margin: Insets }

interface FlowLine { items: FlowItem[]; main: number; cross: number }

interface LineFlow { row: boolean; mainGap: number; wrap: boolean; available: number }

export type { FlowItem, FlowLine, Insets, LineFlow };
