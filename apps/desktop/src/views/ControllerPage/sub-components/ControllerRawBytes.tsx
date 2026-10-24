/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { ControllerInputState } from '@rotp/input-mapping';
import { byteLevel } from '../behavior/byte-level';
import './ControllerRawBytes.css';

const reportText = ({ reportId, rawBytes }: ControllerInputState): string => {
  const id = reportId == null ? '' : `0x${reportId.toString(16).padStart(2, '0')} `;
  return `${id}${rawBytes ? rawBytes.length : 0} B`;
};

const ControllerRawBytes = ({ state }: { state: ControllerInputState }) => (
  <Box className="controller-raw-bytes">
    <Text className="controller-raw-bytes__summary">{reportText(state)}</Text>
    {state.rawBytes ? (
      <Box className="controller-raw-bytes__grid">
        {Array.from(state.rawBytes).map((byte, index) => (
          <Box key={index} className="controller-raw-bytes__byte" data-level={byte > 0 ? byteLevel(byte) : undefined}>
            {byte.toString(16).padStart(2, '0')}
          </Box>
        ))}
      </Box>
    ) : (
      <Text className="controller-raw-bytes__summary">No raw report.</Text>
    )}
  </Box>
);

export { ControllerRawBytes };
