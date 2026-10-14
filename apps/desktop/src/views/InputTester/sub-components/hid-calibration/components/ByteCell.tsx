/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { hex } from '../hid-analysis';
import { ByteChangeDot } from './ByteChangeDot';
import { deriveByteCellState } from './byte-cell-state';
import type { ByteCellProps } from './ByteGrid.type';

const ByteCell = (props: ByteCellProps) => {
  const { index, value, grid } = props;
  const { delta, signed, isPicked, dimmed, title } = deriveByteCellState(props);
  const colorKey = isPicked ? 'picked' : grid.getByteColorKey(index);
  const className = `hid-cal__byte-box hid-cal__byte-box--${colorKey}${dimmed ? ' hid-cal__byte-box--dim' : ''}`;
  const handleClick = () => grid.onByteClick(index);

  return (
    <Box className={className} title={title} onClick={handleClick}>
      <ByteChangeDot delta={delta} signed={signed} />
      <Text className="hid-cal__byte-idx">{index}</Text>
      <Text className="hid-cal__byte-val">{hex(value)}</Text>
    </Box>
  );
};

export { ByteCell };
