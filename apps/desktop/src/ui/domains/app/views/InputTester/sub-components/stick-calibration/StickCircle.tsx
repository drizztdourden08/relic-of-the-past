/* @layer renderer-components @kind data */
/**
 * StickCircle — SVG analog stick position visualizer.
 */

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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 600 }}>{label}</span>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'var(--color-bg-inset)', border: '1px solid var(--color-border-subtle)',
        position: 'relative',
      }}>
        <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
          <line x1={0} y1={cy} x2={size} y2={cy} stroke="var(--color-border-subtle)" strokeWidth="1" />
          <line x1={cx} y1={0} x2={cx} y2={size} stroke="var(--color-border-subtle)" strokeWidth="1" />
          {showDeadzones && (
            <circle cx={cx} cy={cy} r={r * innerDeadzone} fill="none"
              stroke="var(--color-danger-base)" strokeWidth="1" strokeDasharray="3 3" opacity={0.5} />
          )}
          {showDeadzones && (
            <circle cx={cx} cy={cy} r={r * outerDeadzone} fill="none"
              stroke="var(--color-gold-base)" strokeWidth="1" strokeDasharray="3 3" opacity={0.5} />
          )}
          <line x1={cx} y1={cy} x2={dotX} y2={dotY}
            stroke="var(--color-gold-base)" strokeWidth="2" strokeLinecap="round" />
          <circle cx={dotX} cy={dotY} r={5} fill="var(--color-gold-bright)" />
        </svg>
      </div>
      <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
        {x.toFixed(2)}, {y.toFixed(2)}
      </span>
    </div>
  );
};

export { StickCircle };
export type { StickCircleProps };
