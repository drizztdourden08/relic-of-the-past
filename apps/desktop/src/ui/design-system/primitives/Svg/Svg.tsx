/* @layer renderer-components @kind component */
import type { SVGProps } from 'react';

/**
 * Raw inline-SVG escape hatch for dynamic/computed drawings (plots, gizmos)
 * that can't be expressed as a static Icon glyph. Raw <svg>/<line>/<circle>
 * live here, in the primitive.
 */
const Svg = (props: SVGProps<SVGSVGElement>) => <svg {...props} />;

const SvgLine = (props: SVGProps<SVGLineElement>) => <line {...props} />;

const SvgCircle = (props: SVGProps<SVGCircleElement>) => <circle {...props} />;

export { Svg, SvgLine, SvgCircle };
