/* @layer renderer-app @kind component */
import { RING_RADIUS_RATIO } from './ProgressRing.constants';
import type { ProgressRingProps } from './ProgressRing.type';
import './ProgressRing.css';

const ProgressRing = (props: ProgressRingProps) => {
  const { size, progress, className, style } = props;
  const mid = size / 2;
  const radius = size * RING_RADIUS_RATIO;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * Math.min(1, Math.max(0, progress));

  return (
    <svg
      className={['rotp-hold-arc', className].filter(Boolean).join(' ')}
      style={{ ...style, width: size, height: size }}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden
    >
      <circle className="rotp-hold-arc__track" cx={mid} cy={mid} r={radius} />
      <circle
        className="rotp-hold-arc__fill"
        cx={mid}
        cy={mid}
        r={radius}
        strokeDasharray={`${filled} ${circumference}`}
        transform={`rotate(-90 ${mid} ${mid})`}
      />
    </svg>
  );
};

export { ProgressRing };
