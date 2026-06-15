/* @layer renderer-components @kind component */
import './ProgressBar.css';
import type { ProgressBarProps } from './ProgressBar.type';

const pct = (value: number, max: number): string => `${Math.max(0, Math.min(100, (value / max) * 100))}%`;

const ProgressBar = (props: ProgressBarProps) => {
  const { value, max = 100, variant = 'gold', secondaryValue, className = '' } = props;
  return (
    <div className={`progress-bar${className ? ` ${className}` : ''}`} data-variant={variant}>
      {secondaryValue != null && (
        <div className="progress-bar__fill progress-bar__fill--secondary" style={{ width: pct(secondaryValue, max) }} />
      )}
      <div className="progress-bar__fill" style={{ width: pct(value, max) }} />
    </div>
  );
};

export { ProgressBar };
