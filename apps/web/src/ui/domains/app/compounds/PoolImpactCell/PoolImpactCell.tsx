/* @layer renderer-components @kind component */
import { Text } from '@ds/primitives';
import type { PoolImpactCellProps } from './PoolImpactCell.type';
import './PoolImpactCell.css';

const PoolImpactCell = ({ cell }: PoolImpactCellProps) => (
  <Text className={`pool-impact-cell${cell.muted ? ' pool-impact-cell--muted' : ''}`} title={cell.text}>
    {cell.text}
  </Text>
);

export { PoolImpactCell };
