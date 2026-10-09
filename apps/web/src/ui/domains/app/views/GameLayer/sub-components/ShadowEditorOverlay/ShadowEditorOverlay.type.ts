/* @layer renderer-components @kind types */
interface ShadowEditorOverlayProps {
  width: number;
  height: number;
  gameRunning: boolean;
}

interface GizmoStart {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export type { ShadowEditorOverlayProps, GizmoStart };
