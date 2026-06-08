/* @layer renderer-components @kind component */
import './StatRow.css';
import type { StatRowProps } from './types';

const StatRow = (props: StatRowProps) => {
  const { label, value, mono, className = '' } = props;
  return (
    <div className={`stat-row${className ? ` ${className}` : ''}`}>
      <span className="stat-row__label">{label}</span>
      <span className="stat-row__value" data-mono={mono ? '' : undefined}>{value}</span>
    </div>
  );
};

export { StatRow };
