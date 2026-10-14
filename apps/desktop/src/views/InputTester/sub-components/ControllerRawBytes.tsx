/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import type { ControllerInputState } from '../../../input/controller-input-store';
import { byteCellBackground } from './byte-cell-background';

const ControllerRawBytes = ({ state }: { state: ControllerInputState }) => (
  <Box as="details" className="input-cal__raw-bytes">
    <Box as="summary" className="input-cal__raw-bytes-summary">
      Raw Bytes {state.reportId != null ? `(0x${state.reportId.toString(16).padStart(2, '0')})` : ''} · {state.rawBytes ? state.rawBytes.length : 0}B
    </Box>
    {state.rawBytes && (
      <Box className="input-cal__raw-bytes-grid">
        {Array.from(state.rawBytes).map((b, i) => (
          <Box
            key={i}
            className={b > 0 ? 'input-cal__raw-byte input-cal__raw-byte--set' : 'input-cal__raw-byte'}
            style={b > 0 ? { background: byteCellBackground(b) } : undefined}
          >
            {b.toString(16).padStart(2, '0')}
          </Box>
        ))}
      </Box>
    )}
  </Box>
);

export { ControllerRawBytes };
