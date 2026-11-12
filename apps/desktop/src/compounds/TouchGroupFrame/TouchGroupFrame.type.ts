/* @layer renderer-components @kind types */

interface TouchGroupFrameRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface TouchGroupFrameProps {
  rect: TouchGroupFrameRect;
  locked: boolean;
  selected?: boolean;
}

export type { TouchGroupFrameProps, TouchGroupFrameRect };
