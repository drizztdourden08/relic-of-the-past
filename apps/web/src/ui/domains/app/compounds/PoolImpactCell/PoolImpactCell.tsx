/* @layer renderer-components @kind component */
/**
 * The In Pool cell of an options row: one mono line in a fixed-width track,
 * right-aligned, so the number never moves the control beside it. Muted for
 * a qualifier ("fixed", "not used") instead of a count. Bare: the text
 * arrives worded.
 */
import { Text } from '@ds/primitives';
import type { PoolImpactCellProps } from './PoolImpactCell.type';
import './PoolImpactCell.css';

const PoolImpactCell = ({ cell }: PoolImpactCellProps) => (
  <Text className={`pool-impact-cell${cell.muted ? ' pool-impact-cell--muted' : ''}`} title={cell.text}>
    {cell.text}
  </Text>
);

export { PoolImpactCell };
