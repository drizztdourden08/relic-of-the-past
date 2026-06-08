/* @layer renderer-components @kind data */
/**
 * WebHidDeviceCard — Renders a single WebHID device's button/axis/raw state.
 */

import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import type { WebHidInputState } from '../../../../../lib/input/hid-reader';

interface WebHidDeviceCardProps {
  deviceKey: string;
  state: WebHidInputState;
}

const WebHidDeviceCard = ({ deviceKey, state }: WebHidDeviceCardProps) => {
  return (
    <Box className="input-tester__gamepad" style={{ marginTop: 8 }}>
      <Box className="input-tester__gamepad-header">
        <Text className="input-tester__gamepad-index">HID</Text>
        <Text className="input-tester__gamepad-id">{deviceKey}</Text>
        <Text className="input-tester__gamepad-mapping" style={{ color: '#818cf8' }}>WebHID</Text>
      </Box>

      <Box className="input-tester__section-label">Buttons ({state.buttons.length})</Box>
      <Box className="input-tester__buttons">
        {state.buttons.map((pressed, i) => (
          <Box
            key={i}
            className={`input-tester__button ${pressed ? 'input-tester__button--pressed' : 'input-tester__button--idle'}`}
          >
            {i}
          </Box>
        ))}
      </Box>

      <Box className="input-tester__section-label">Axes ({state.axes.length})</Box>
      <Box className="input-tester__axes">
        {state.axes.map((val, i) => (
          <Box key={i} className="input-tester__axis">
            <Text className="input-tester__axis-label">A{i}</Text>
            <Box className="input-tester__axis-bar">
              <Box
                className="input-tester__axis-fill"
                style={{
                  left: val < 0 ? `${50 + val * 50}%` : '50%',
                  width: `${Math.abs(val) * 50}%`,
                }}
              />
            </Box>
            <Text className="input-tester__axis-value">{val.toFixed(4)}</Text>
          </Box>
        ))}
      </Box>

      {/* Collapsible raw bytes debug */}
      <Box as="details" className="input-tester__raw-bytes-details">
        <Box as="summary" style={{ fontSize: 11, color: '#888', cursor: 'pointer', userSelect: 'none', marginTop: 8 }}>
          Raw Bytes {state.reportId != null ? `(report 0x${state.reportId.toString(16).padStart(2, '0')})` : ''} — {state.rawBytes ? state.rawBytes.length : 0} bytes
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
    </Box>
  );
};

export { WebHidDeviceCard };
