/* @layer renderer-components @kind types */
import type { SVGAttributes } from 'react';

interface IconProps extends SVGAttributes<SVGSVGElement> {
  /** One or more SVG path `d` strings. */
  paths: string[];
  /** Square pixel size (width = height). */
  size?: number;
  /** SVG viewBox (defaults to a 16-unit grid). */
  viewBox?: string;
}

export type { IconProps };
