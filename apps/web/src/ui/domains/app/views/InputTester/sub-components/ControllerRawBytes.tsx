/* @layer renderer-components @kind component */
/** Collapsible raw-report byte grid for a controller card. */
import type { CSSProperties } from 'react';
import { Box } from '../../../../../design-system/primitives/Box';
import type { ControllerInputState } from '../../../../../../lib/input/controller-input-store';

const S: Record<string, CSSProperties> = {
  details: { marginTop: 'var(--space-sm)' },
  summary: { fontSize: 11, color: 'var(--c-text-muted)', cursor: 'pointer', userSelect: 'none' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 6, fontFamily: 'monospace', fontSize: 10, lineHeight: 1 },
};

interface ControllerRawBytesProps {
  state: ControllerInputState;
}

const ControllerRawBytes = ({ state }: ControllerRawBytesProps) => (
  <Box as="details" style={S.details}>
    <Box as="summary" style={S.summary}>
      Raw Bytes {state.reportId != null ? `(0x${state.reportId.toString(16).padStart(2, '0')})` : ''} · {state.rawBytes ? state.rawBytes.length : 0}B
    </Box>
    {state.rawBytes && (
      <Box style={S.grid}>
        {Array.from(state.rawBytes).map((b, i) => (
          <Box key={i} style={{
            width: 22, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: b > 0 ? `rgba(129,140,248,${Math.min(1, b / 255 * 0.8 + 0.2)})` : 'var(--c-hover)',
            color: b > 0 ? 'var(--c-text)' : 'var(--c-text-muted)',
            borderRadius: 2, border: '1px solid var(--c-border)',
          }}>
            {b.toString(16).padStart(2, '0')}
          </Box>
        ))}
      </Box>
    )}
  </Box>
);

export { ControllerRawBytes };
