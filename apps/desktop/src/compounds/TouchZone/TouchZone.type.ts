/* @layer renderer-app @kind types */
interface TouchZoneRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface TouchZoneProps {
  rect: TouchZoneRect;
  /** Opacity of the outline and label, 0.1..1. */
  strength: number;
  selected?: boolean;
}

export type { TouchZoneProps, TouchZoneRect };
