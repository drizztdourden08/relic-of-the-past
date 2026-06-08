/* @layer renderer-components @kind component */
/** Collapsible raw-report byte grid for a WebHID controller card. */
import { Box } from '../../../../../design-system/primitives/Box';
import type { WebHidInputState } from '../../../../../../lib/input/hid-reader';

interface WebHidRawBytesProps {
  state: WebHidInputState;
}

const WebHidRawBytes = ({ state }: WebHidRawBytesProps) => (
  <Box as="details" style={{ marginTop: 'var(--space-sm)' }}>
    <Box as="summary" style={{ fontSize: 11, color: 'var(--color-text-muted)', cursor: 'pointer', userSelect: 'none' }}>
      Raw Bytes {state.reportId != null ? `(0x${state.reportId.toString(16).padStart(2, '0')})` : ''} — {state.rawBytes ? state.rawBytes.length : 0}B
    </Box>
    {state.rawBytes && (
      <Box style={{
        display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 6,
        fontFamily: 'monospace', fontSize: 10, lineHeight: 1,
      }}>
        {Array.from(state.rawBytes).map((b, i) => (
          <Box key={i} style={{
            width: 22, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: b > 0 ? `rgba(129,140,248,${Math.min(1, b / 255 * 0.8 + 0.2)})` : '#2a2a3a',
            color: b > 0 ? '#fff' : '#555',
            borderRadius: 2, border: '1px solid #3a3a4a',
          }}>
            {b.toString(16).padStart(2, '0')}
          </Box>
        ))}
      </Box>
    )}
  </Box>
);

export { WebHidRawBytes };
