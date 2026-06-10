/* @layer renderer-widgets @kind component */
import type { CSSProperties } from 'react';
import { Svg, SvgLine, SvgRect, SvgText } from '../../../../design-system/primitives';
import { EDGE_COLORS } from '../navigation.constants';

const SVG_STYLE: CSSProperties = { flexShrink: 0 };

/** Two-square connector glyph showing an internal room-edge transition. */
const InternalEdgeSvg = ({ edge, fromName, toName }: { edge: string; fromName: string; toName: string }) => {
  const fromColor = EDGE_COLORS[edge] ?? 'var(--c-text-muted)';
  const opposites: Record<string, string> = { north: 'south', south: 'north', east: 'west', west: 'east' };
  const toColor = EDGE_COLORS[opposites[edge] ?? 'south'] ?? 'var(--c-text-muted)';
  const isVertical = edge === 'north' || edge === 'south';

  const SQ = 20; // square size
  const LINE_OVERFLOW = 3; // how much the separator line extends beyond squares

  if (isVertical) {
    const W = SQ + 2;
    const H = SQ * 2 + 2;
    return (
      <Svg width={W * 3} height={H} viewBox={`0 0 ${W * 3} ${H}`} style={SVG_STYLE}>
        <SvgRect x={W} y="0" width={SQ} height={SQ} rx="3" ry="3" fill={fromColor} opacity="0.9" />
        <SvgRect x={W} y={SQ - 3} width={SQ} height="3" fill={fromColor} opacity="0.9" />
        <SvgText x={W + SQ / 2} y={SQ / 2 + 3} textAnchor="middle" fontSize="8" fontWeight="700" fill="#000">{fromName}</SvgText>
        <SvgLine x1={W - LINE_OVERFLOW} y1={SQ} x2={W + SQ + LINE_OVERFLOW} y2={SQ} stroke="#999" strokeWidth="2" />
        <SvgRect x={W} y={SQ + 2} width={SQ} height={SQ} rx="3" ry="3" fill={toColor} opacity="0.9" />
        <SvgRect x={W} y={SQ + 2} width={SQ} height="3" fill={toColor} opacity="0.9" />
        <SvgText x={W + SQ / 2} y={SQ + 2 + SQ / 2 + 3} textAnchor="middle" fontSize="8" fontWeight="700" fill="#000">{toName}</SvgText>
      </Svg>
    );
  }
  const W = SQ * 2 + 2;
  const H = SQ + LINE_OVERFLOW * 2;
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={SVG_STYLE}>
      <SvgRect x="0" y={LINE_OVERFLOW} width={SQ} height={SQ} rx="3" ry="3" fill={fromColor} opacity="0.9" />
      <SvgRect x={SQ - 3} y={LINE_OVERFLOW} width="3" height={SQ} fill={fromColor} opacity="0.9" />
      <SvgText x={SQ / 2} y={LINE_OVERFLOW + SQ / 2 + 3} textAnchor="middle" fontSize="8" fontWeight="700" fill="#000">{fromName}</SvgText>
      <SvgLine x1={SQ} y1="0" x2={SQ} y2={H} stroke="#999" strokeWidth="2" />
      <SvgRect x={SQ + 2} y={LINE_OVERFLOW} width={SQ} height={SQ} rx="3" ry="3" fill={toColor} opacity="0.9" />
      <SvgRect x={SQ + 2} y={LINE_OVERFLOW} width="3" height={SQ} fill={toColor} opacity="0.9" />
      <SvgText x={SQ + 2 + SQ / 2} y={LINE_OVERFLOW + SQ / 2 + 3} textAnchor="middle" fontSize="8" fontWeight="700" fill="#000">{toName}</SvgText>
    </Svg>
  );
};

export { InternalEdgeSvg };
