/* @layer renderer-components @kind types */
interface ShadowEditorOverlayProps {
  width: number;
  height: number;
  gameRunning: boolean;
}

/** Snapshot of a shape/light at drag start, for relative transforms. */
interface GizmoStart {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export type { ShadowEditorOverlayProps, GizmoStart };
