/* @layer renderer-components @kind types */
interface DebugCaptureButtonProps {
  profileId: string;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
}

export type { DebugCaptureButtonProps };
