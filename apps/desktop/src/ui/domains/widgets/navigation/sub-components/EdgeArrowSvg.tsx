/* @layer renderer-widgets @kind component */
import type { CSSProperties } from 'react';
import { Svg, SvgPath } from '../../../../design-system/primitives';
import { EDGE_COLORS } from '../navigation.constants';

const SVG_STYLE: CSSProperties = { flexShrink: 0 };

/** A small directional arrow glyph colored by edge direction. */
const EdgeArrowSvg = ({ edge, size }: { edge: string; size: number }) => {
  const color = EDGE_COLORS[edge] ?? 'var(--c-text-muted)';
  const paths: Record<string, string> = {
    north: 'M8 14 L8 4 M4 7 L8 3 L12 7',
    south: 'M8 2 L8 12 M4 9 L8 13 L12 9',
    west: 'M14 8 L4 8 M7 4 L3 8 L7 12',
    east: 'M2 8 L12 8 M9 4 L13 8 L9 12',
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" style={SVG_STYLE}>
      <SvgPath d={paths[edge] ?? paths.east} stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
};

export { EdgeArrowSvg };
