/* @layer renderer-components @kind types */
import type { GizmoPoint } from './gizmo.type';

type ToDisplay = (wx: number, wy: number) => GizmoPoint | null;

export type { ToDisplay };
