/* @layer renderer-components @kind types */

interface TouchGroupFrameRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface TouchGroupFrameProps {
  /** Frame area in px inside the overlay. */
  rect: TouchGroupFrameRect;
  /** A locked group moves as one piece; the badge shows the lock closed. */
  locked: boolean;
  selected?: boolean;
}

export type { TouchGroupFrameProps, TouchGroupFrameRect };
