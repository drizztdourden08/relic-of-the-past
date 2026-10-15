/* @layer renderer-components @kind component */
import { Box, ProgressBar, Text } from '@drizztdourden08/tessera/primitives';
import { DASH } from '../behavior/network-format.constants';
import type { ChecksCellProps } from './ChecksCell.type';

const ChecksCell = ({ checked, total }: ChecksCellProps) => {
  if (checked === null || total === null) {
    return <Text role="cell" className="network-tab__cell network-tab__cell--num network-tab__cell--dim">{DASH}</Text>;
  }
  return (
    <Box role="cell" className="network-tab__cell network-tab__checks">
      <Text className="network-tab__cell--num">{`${checked} / ${total}`}</Text>
      <ProgressBar value={checked} max={Math.max(1, total)} tone="secondary" className="network-tab__checks-bar" />
    </Box>
  );
};

export { ChecksCell };
