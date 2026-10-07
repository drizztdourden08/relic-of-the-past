/* @layer renderer-components @kind component */
/** A player's checks done out of the slot's total, with a small bar; a dash while unknown. */
import { Box, ProgressBar, Text } from '@ds/primitives';
import { DASH } from '../behavior/network-format';

interface ChecksCellProps {
  checked: number | null;
  total: number | null;
}

const ChecksCell = ({ checked, total }: ChecksCellProps) => {
  if (checked === null || total === null) {
    return <Text role="cell" className="network-tab__cell network-tab__cell--num network-tab__cell--dim">{DASH}</Text>;
  }
  return (
    <Box role="cell" className="network-tab__cell network-tab__checks">
      <Text className="network-tab__cell--num">{`${checked} / ${total}`}</Text>
      <ProgressBar value={checked} max={Math.max(1, total)} variant="green" className="network-tab__checks-bar" />
    </Box>
  );
};

export { ChecksCell };
export type { ChecksCellProps };
