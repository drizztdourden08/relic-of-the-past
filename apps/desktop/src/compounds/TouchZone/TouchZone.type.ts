/* @layer renderer-app @kind types */
interface TouchZoneRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface TouchZoneProps {
  rect: TouchZoneRect;
  strength: number;
  selected?: boolean;
}

export type { TouchZoneProps };
