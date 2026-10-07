/* @layer renderer-components @kind component */
/**
 * One number of a dashboard on a tile of its own: the label over the value,
 * and, for a count out of a whole, a thin bar under it. Tiles in a row stretch
 * to one height and their bars line up along the bottom edge.
 */
import { ProgressBar } from '../ProgressBar';
import type { StatTileProps } from './StatTile.type';
import './StatTile.css';

const StatTile = (props: StatTileProps) => {
  const { label, value, meter, tone, title, className = '' } = props;

  return (
    <div className={`stat-tile${className ? ` ${className}` : ''}`} data-tone={tone} title={title}>
      <span className="stat-tile__label">{label}</span>
      <span className="stat-tile__value">{value}</span>
      {meter !== undefined && (
        <ProgressBar className="stat-tile__meter" value={meter.value} max={Math.max(1, meter.max)} variant="green" />
      )}
    </div>
  );
};

export { StatTile };
