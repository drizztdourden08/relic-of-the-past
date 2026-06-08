/* @layer renderer-components @kind data */
/**
 * InputTester — Raw gamepad input visualization page.
 *
 * Shows every connected gamepad with real-time button/axis state,
 * event log, and HID enumeration results. Useful for diagnosing
 * whether the browser/Electron actually receives input.
 */

import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
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
    <Box className="input-tester">
      <Box className="input-tester__header">
        <Text className="input-tester__title">Input Tester</Text>
        <Text className="input-tester__status input-tester__status--polling">
          Polling @ 60fps • {gamepads.length} gamepad(s)
        </Text>
      </Box>

      {/* Event log */}
      <Box className="input-tester__event-log" ref={eventLogRef}>
        <Text as="h3">Event Log (gamepadconnected / gamepaddisconnected)</Text>
        {events.length === 0 && (
          <Box className="input-tester__event-entry">
            Waiting for events... Press a button on any controller.
          </Box>
        )}
        {events.map((ev, i) => (
          <Box key={i} className={`input-tester__event-entry input-tester__event-entry--${ev.type}`}>
            [{new Date(ev.time).toLocaleTimeString()}] {ev.type.toUpperCase()} idx={ev.index} — {ev.id}
          </Box>
        ))}
      </Box>

      {/* Live gamepad state */}
      {gamepads.length === 0 && (
        <Box className="input-tester__no-gamepads">
          <Text as="p">No gamepads detected by navigator.getGamepads()</Text>
          <Text as="p">Press any button on your controller to wake it up.</Text>
          <Text as="p" style={{ fontSize: 11, color: '#555' }}>
            Chromium requires at least one button press before a gamepad appears in the API.
          </Text>
        </Box>
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
        <Box className="input-tester__hid-section" style={{ border: '2px solid #4ade80' }}>
          <Text as="h3" style={{ color: '#4ade80' }}>Calibration Result</Text>
          <Box style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
            {lastCalibration.name} — {Object.keys(lastCalibration.buttons).length} buttons, {Object.keys(lastCalibration.axes).length} axes
          </Box>
          <Box as="pre" style={{ fontSize: 10, background: '#1e1e2e', padding: 8, borderRadius: 4, maxHeight: 300, overflow: 'auto', color: '#e2e8f0' }}>
            {JSON.stringify(lastCalibration, null, 2)}
          </Box>
          <Box
            as="button"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(lastCalibration, null, 2));
            }}
            style={{ padding: '4px 12px', fontSize: 11, marginTop: 8, background: '#4ade80', color: '#000', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          >
            Copy JSON
          </Box>
        </Box>
      )}

      {/* HID Controller Input (Switch Pro, etc.) */}
      <Box className="input-tester__hid-section">
        <Text as="h3">HID Controller Input</Text>
        <Box style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, opacity: 0.7 }}>
            Controllers auto-connect via node-hid
          </Text>
          <Box
            as="button"
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
          </Box>
          <Text style={{ fontSize: 11, color: webHidConnected ? '#4ade80' : '#f87171' }}>
            {webHidConnected ? '● Connected' : '○ Not connected'}
          </Text>
        </Box>

        {webHidStates.size === 0 && webHidConnected && (
          <Box style={{ color: '#666', fontSize: 11 }}>Device opened. Press buttons to see input.</Box>
        )}
        {webHidStates.size === 0 && !webHidConnected && (
          <Box style={{ color: '#666', fontSize: 11 }}>Click "Connect HID Controller" to pair your Switch Pro Controller via WebHID.</Box>
        )}

        {[...webHidStates.entries()].map(([key, state]) => (
          <WebHidDeviceCard key={key} deviceKey={key} state={state} />
        ))}
      </Box>

      {/* HID enumeration (from node-hid via main process) */}
      <Box className="input-tester__hid-section">
        <Text as="h3">HID Enumeration (node-hid, reference)</Text>
        {hidDevices.length === 0 && (
          <Box style={{ color: '#666', fontSize: 11 }}>No HID controller devices found.</Box>
        )}
        {hidDevices.map((d, i) => (
          <Box key={i} className="input-tester__hid-device">
            <Text as="strong">{d.product || '(no name)'}</Text> — {d.manufacturer || '?'} | VID: {d.vendorId} PID: {d.productId} | Serial: {d.serialNumber || 'n/a'}
          </Box>
        ))}
      </Box>

      {/* WebHID Diagnostic Log */}
      <Box className="input-tester__hid-section">
        <Text as="h3">WebHID Diagnostics</Text>
        <Box className="input-tester__event-log" style={{ maxHeight: 200 }}>
          {webHidDiag.length === 0 && (
            <Box className="input-tester__event-entry">No WebHID activity yet.</Box>
          )}
          {webHidDiag.map((entry, i) => (
            <Box key={i} className="input-tester__event-entry input-tester__event-entry--connect">
              {entry}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export { InputTester };
