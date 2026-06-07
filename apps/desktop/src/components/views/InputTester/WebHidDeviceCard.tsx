/* @layer renderer-components @kind data */
/**
 * WebHidDeviceCard — Renders a single WebHID device's button/axis/raw state.
 */

import type { WebHidInputState } from '../../../lib/input/hid-reader';

interface WebHidDeviceCardProps {
  deviceKey: string;
  state: WebHidInputState;
}

const WebHidDeviceCard = ({ deviceKey, state }: WebHidDeviceCardProps) => {
  return (
    <div className="input-tester__gamepad" style={{ marginTop: 8 }}>
      <div className="input-tester__gamepad-header">
        <span className="input-tester__gamepad-index">HID</span>
        <span className="input-tester__gamepad-id">{deviceKey}</span>
        <span className="input-tester__gamepad-mapping" style={{ color: '#818cf8' }}>WebHID</span>
      </div>

      <div className="input-tester__section-label">Buttons ({state.buttons.length})</div>
      <div className="input-tester__buttons">
        {state.buttons.map((pressed, i) => (
          <div
            key={i}
            className={`input-tester__button ${pressed ? 'input-tester__button--pressed' : 'input-tester__button--idle'}`}
          >
            {i}
          </div>
        ))}
      </div>

      <div className="input-tester__section-label">Axes ({state.axes.length})</div>
      <div className="input-tester__axes">
        {state.axes.map((val, i) => (
          <div key={i} className="input-tester__axis">
            <span className="input-tester__axis-label">A{i}</span>
            <div className="input-tester__axis-bar">
              <div
                className="input-tester__axis-fill"
                style={{
                  left: val < 0 ? `${50 + val * 50}%` : '50%',
                  width: `${Math.abs(val) * 50}%`,
                }}
              />
            </div>
            <span className="input-tester__axis-value">{val.toFixed(4)}</span>
          </div>
        ))}
      </div>

      {/* Collapsible raw bytes debug */}
      <details className="input-tester__raw-bytes-details">
        <summary style={{ fontSize: 11, color: '#888', cursor: 'pointer', userSelect: 'none', marginTop: 8 }}>
          Raw Bytes {state.reportId != null ? `(report 0x${state.reportId.toString(16).padStart(2, '0')})` : ''} — {state.rawBytes ? state.rawBytes.length : 0} bytes
        </summary>
        {state.rawBytes && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 6,
            fontFamily: 'monospace', fontSize: 10, lineHeight: 1,
          }}>
            {Array.from(state.rawBytes).map((b, i) => (
              <div key={i} style={{
                width: 22, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: b > 0 ? `rgba(129,140,248,${Math.min(1, b / 255 * 0.8 + 0.2)})` : '#2a2a3a',
                color: b > 0 ? '#fff' : '#555',
                borderRadius: 2, border: '1px solid #3a3a4a',
              }}>
                {b.toString(16).padStart(2, '0')}
              </div>
            ))}
          </div>
        )}
      </details>
    </div>
  );
};

export { WebHidDeviceCard };
