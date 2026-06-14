/* @layer renderer-components @kind component */
import './ProgressRing.css';
import type { ProgressRingProps } from './ProgressRing.type';

/** Circular progress indicator (SVG). The radial counterpart to ProgressBar. */
const ProgressRing = (props: ProgressRingProps) => {
  const { progress, radius = 15, strokeWidth = 2.5, className = '' } = props;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg className={`progress-ring${className ? ` ${className}` : ''}`} viewBox="0 0 36 36">
      <circle className="progress-ring__track" cx="18" cy="18" r={radius} fill="none" strokeWidth={strokeWidth} />
      {progress != null && (
        <circle
          className="progress-ring__fill"
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
        />
      )}
    </svg>
  );
};

export { ProgressRing };
