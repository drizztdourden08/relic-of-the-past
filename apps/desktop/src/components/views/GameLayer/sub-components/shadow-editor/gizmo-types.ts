/* @layer renderer-components @kind types */
/** Transform-gizmo types for the shadow editor. */

type GizmoPart =
  | 'move-x'
  | 'move-y'
  | 'move-center'
  | 'resize-x'
  | 'resize-y'
  | 'resize-uniform'
  | 'rotate'
  | `vertex-${number}`
  | `radius-${number}`;

interface GizmoHit {
  part: GizmoPart;
  cursor: string;
}

interface GizmoContext {
  /** Center of the shape in display coordinates */
  cx: number;
  cy: number;
  /** Half-width/height in display coordinates */
  hw: number;
  hh: number;
  /** Shape rotation in radians */
  rotation: number;
  /** Scale from SNES to display px */
  scaleX: number;
  scaleY: number;
  /** Vertex points in display coordinates (relative to center) */
  vertices?: { x: number; y: number }[];
  /** Whether the shape is freehand (has editable vertices) */
  isFreehand: boolean;
}

export type { GizmoPart, GizmoHit, GizmoContext };
