/* @layer renderer-components @kind types */
import type { GizmoContext, GizmoHit } from './gizmo.type';

interface LocalPoint {
  lx: number;
  ly: number;
}

type GizmoCheck = (p: LocalPoint, ctx: GizmoContext) => GizmoHit | null;

export type { GizmoCheck };
