/**
 * InputTester — Raw gamepad input visualization page.
 *
 * Shows every connected gamepad with real-time button/axis state,
 * event log, and HID enumeration results. Useful for diagnosing
 * whether the browser/Electron actually receives input.
 */

import { useInputTester } from './useInputTester';
import { GamepadCard } from './GamepadCard';
import { WebHidDeviceCard } from './WebHidDeviceCard';
import { HidCalibrationWizard } from './sub-components/HidCalibrationWizard';
import './InputTester.css';

const InputTester = () => {
  const {
    gamepads, events, hidDevices, eventLogRef,
    webHidConnected, webHidStates, webHidDiag,
    calibrating, setCalibrating, lastCalibration, handleCalibrationComplete,
  } = useInputTester();

  return (
    <div className="input-tester">
      <div className="input-tester__header">
        <span className="input-tester__title">Input Tester</span>
        <span className="input-tester__status input-tester__status--polling">
          Polling @ 60fps • {gamepads.length} gamepad(s)
        </span>
      </div>

      {/* Event log */}
      <div className="input-tester__event-log" ref={eventLogRef}>
        <h3>Event Log (gamepadconnected / gamepaddisconnected)</h3>
        {events.length === 0 && (
          <div className="input-tester__event-entry">
            Waiting for events... Press a button on any controller.
          </div>
        )}
        {events.map((ev, i) => (
          <div key={i} className={`input-tester__event-entry input-tester__event-entry--${ev.type}`}>
            [{new Date(ev.time).toLocaleTimeString()}] {ev.type.toUpperCase()} idx={ev.index} — {ev.id}
          </div>
        ))}
      </div>

      {/* Live gamepad state */}
      {gamepads.length === 0 && (
        <div className="input-tester__no-gamepads">
          <p>No gamepads detected by navigator.getGamepads()</p>
          <p>Press any button on your controller to wake it up.</p>
          <p style={{ fontSize: 11, color: '#555' }}>
            Chromium requires at least one button press before a gamepad appears in the API.
          </p>
        </div>
      )}

      {gamepads.map(gp => (
        <GamepadCard key={gp.index} gamepad={gp} />
      ))}

      {/* Calibration Wizard */}
      {calibrating && (
        <HidCalibrationWizard
          onComplete={handleCalibrationComplete}
          onCancel={() => setCalibrating(false)}
        />
      )}

      {/* Last calibration result */}
      {lastCalibration && !calibrating && (
        <div className="input-tester__hid-section" style={{ border: '2px solid #4ade80' }}>
          <h3 style={{ color: '#4ade80' }}>Calibration Result</h3>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
            {lastCalibration.name} — {Object.keys(lastCalibration.buttons).length} buttons, {Object.keys(lastCalibration.axes).length} axes
          </div>
          <pre style={{ fontSize: 10, background: '#1e1e2e', padding: 8, borderRadius: 4, maxHeight: 300, overflow: 'auto', color: '#e2e8f0' }}>
            {JSON.stringify(lastCalibration, null, 2)}
          </pre>
          <button
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(lastCalibration, null, 2));
            }}
            style={{ padding: '4px 12px', fontSize: 11, marginTop: 8, background: '#4ade80', color: '#000', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          >
            Copy JSON
          </button>
        </div>
      )}

      {/* HID Controller Input (Switch Pro, etc.) */}
      <div className="input-tester__hid-section">
        <h3>HID Controller Input</h3>
        <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>
            Controllers auto-connect via node-hid
          </span>
          <button
            onClick={() => setCalibrating(true)}
            disabled={!webHidConnected}
            style={{
              padding: '4px 12px', fontSize: 12,
              background: webHidConnected ? '#818cf8' : '#4a4a5a',
              color: '#fff', border: 'none', borderRadius: 4,
              cursor: webHidConnected ? 'pointer' : 'not-allowed',
            }}
          >
            Calibrate Controller
          </button>
          <span style={{ fontSize: 11, color: webHidConnected ? '#4ade80' : '#f87171' }}>
            {webHidConnected ? '● Connected' : '○ Not connected'}
          </span>
        </div>

        {webHidStates.size === 0 && webHidConnected && (
          <div style={{ color: '#666', fontSize: 11 }}>Device opened. Press buttons to see input.</div>
        )}
        {webHidStates.size === 0 && !webHidConnected && (
          <div style={{ color: '#666', fontSize: 11 }}>Click "Connect HID Controller" to pair your Switch Pro Controller via WebHID.</div>
        )}

        {[...webHidStates.entries()].map(([key, state]) => (
          <WebHidDeviceCard key={key} deviceKey={key} state={state} />
        ))}
      </div>

      {/* HID enumeration (from node-hid via main process) */}
      <div className="input-tester__hid-section">
        <h3>HID Enumeration (node-hid, reference)</h3>
        {hidDevices.length === 0 && (
          <div style={{ color: '#666', fontSize: 11 }}>No HID controller devices found.</div>
        )}
        {hidDevices.map((d, i) => (
          <div key={i} className="input-tester__hid-device">
            <strong>{d.product || '(no name)'}</strong> — {d.manufacturer || '?'} | VID: {d.vendorId} PID: {d.productId} | Serial: {d.serialNumber || 'n/a'}
          </div>
        ))}
      </div>

      {/* WebHID Diagnostic Log */}
      <div className="input-tester__hid-section">
        <h3>WebHID Diagnostics</h3>
        <div className="input-tester__event-log" style={{ maxHeight: 200 }}>
          {webHidDiag.length === 0 && (
            <div className="input-tester__event-entry">No WebHID activity yet.</div>
          )}
          {webHidDiag.map((entry, i) => (
            <div key={i} className="input-tester__event-entry input-tester__event-entry--connect">
              {entry}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { InputTester };
