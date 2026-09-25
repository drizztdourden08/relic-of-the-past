/* @layer renderer-components @kind types */
import type { SVGAttributes } from 'react';

/** Which part of the mouse is lit: the two buttons, the wheel, or the whole
 *  body moving (a drag). */
type MousePart = 'left' | 'right' | 'wheel' | 'drag';

interface MouseGlyphProps extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
  part: MousePart;
  /** Edge length in px. 16 sits on a legend's own text line. */
  size?: number;
  /** Spoken form. Defaults to the part's own name ("left click", "drag"). */
  title?: string;
  className?: string;
}

export type { MouseGlyphProps, MousePart };
