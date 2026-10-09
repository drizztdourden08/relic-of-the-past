/* @layer renderer-components @kind types */
interface DebugReportFloatingButtonProps {
  dragging: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onOpenReport: () => void;
}

export type { DebugReportFloatingButtonProps };
