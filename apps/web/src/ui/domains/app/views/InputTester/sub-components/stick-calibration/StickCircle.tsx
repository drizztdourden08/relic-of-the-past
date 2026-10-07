/* @layer renderer-components @kind data */
/**
 * SVG analog stick position visualizer.
 */

import type { CSSProperties } from 'react';
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import { Svg, SvgLine, SvgCircle } from '../../../../../../design-system/primitives/Svg';

const S: Record<string, CSSProperties> = {
  col: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  label: { fontSize: 11, color: 'var(--c-text-dim)', fontWeight: 600 },
  svgAbs: { position: 'absolute', top: 0, left: 0 },
  values: { fontSize: 10, fontFamily: 'monospace', color: 'var(--c-text-muted)' },
};

interface StickCircleProps {
  x: number;
  y: number;
  label: string;
  size?: number;
  innerDeadzone?: number;
  outerDeadzone?: number;
  showDeadzones?: boolean;
}

const StickCircle = (props: StickCircleProps) => {
  const { x, y, label, size = 100, innerDeadzone = 0, outerDeadzone = 1, showDeadzones = false } = props;
  const r = (size - 12) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const dotX = cx + Math.max(-1, Math.min(1, x)) * r;
  const dotY = cy + Math.max(-1, Math.min(1, y)) * r;

  return (
    <Box style={S.col}>
      <Text style={S.label}>{label}</Text>
      <Box style={{
        width: size, height: size, borderRadius: '50%',
        background: 'var(--c-sunken)', border: '1px solid var(--c-border)',
        position: 'relative',
      }}>
        <Svg width={size} height={size} style={S.svgAbs}>
          <SvgLine x1={0} y1={cy} x2={size} y2={cy} stroke="var(--c-border)" strokeWidth="1" />
          <SvgLine x1={cx} y1={0} x2={cx} y2={size} stroke="var(--c-border)" strokeWidth="1" />
          {showDeadzones && (
            <SvgCircle cx={cx} cy={cy} r={r * innerDeadzone} fill="none"
              stroke="var(--c-danger)" strokeWidth="1" strokeDasharray="3 3" opacity={0.5} />
          )}
          {showDeadzones && (
            <SvgCircle cx={cx} cy={cy} r={r * outerDeadzone} fill="none"
              stroke="var(--c-gold)" strokeWidth="1" strokeDasharray="3 3" opacity={0.5} />
          )}
          <SvgLine x1={cx} y1={cy} x2={dotX} y2={dotY}
            stroke="var(--c-gold)" strokeWidth="2" strokeLinecap="round" />
          <SvgCircle cx={dotX} cy={dotY} r={5} fill="var(--c-gold-bright)" />
        </Svg>
      </Box>
      <Text style={S.values}>
        {x.toFixed(2)}, {y.toFixed(2)}
      </Text>
    </Box>
  );
};

export { StickCircle };
export type { StickCircleProps };
