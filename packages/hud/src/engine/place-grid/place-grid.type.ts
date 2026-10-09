/* @layer shared-hud @kind types */
import type { Rect } from '../../layouts/geometry.type';

interface GridCellRect { column: number; row: number; implicit: boolean; rect: Rect }

export type { GridCellRect };
