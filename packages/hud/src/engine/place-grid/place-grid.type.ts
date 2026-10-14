/* @layer shared-hud @kind types */
import type { Rect } from '../../layouts/geometry.type';
import type { HudGridJustifyItems } from '../../types/hud-node';

interface GridCellRect { column: number; row: number; implicit: boolean; rect: Rect }

interface CellAlignment { justify: HudGridJustifyItems; align: HudGridJustifyItems }

interface CellPlacement { w: number; h: number; x: number; y: number }

export type { CellAlignment, CellPlacement, GridCellRect };
