/**
 * InputTester — Raw gamepad input visualization page.
 *
 * Shows every connected gamepad with real-time button/axis state,
 * event log, and HID enumeration results. Useful for diagnosing
 * whether the browser/Electron actually receives input.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { webHidReader } from '../../../lib/game/webhid-input-reader';
import type { WebHidInputState } from '../../../lib/game/webhid-input-reader';
import { HidCalibrationWizard } from './HidCalibrationWizard';
import type { HidControllerMap } from './HidCalibrationWizard';
import './InputTester.css';

interface GamepadSnapshot {
  index: number;
  id: string;
  connected: boolean;
  mapping: string;
  timestamp: number;
  buttons: { pressed: boolean; touched: boolean; value: number }[];
  axes: number[];
}

interface EventEntry {
  time: number;
  type: 'connect' | 'disconnect';
  index: number;
  id: string;
}

interface HidDevice {
  vendorId: string;
  productId: string;
  product: string;
  manufacturer: string;
  path: string;
  serialNumber: string | null;
}

export function InputTester(): JSX.Element {
  const [gamepads, setGamepads] = useState<GamepadSnapshot[]>([]);
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [hidDevices, setHidDevices] = useState<HidDevice[]>([]);
  const [polling, setPolling] = useState(true);
  const rafRef = useRef<number>(0);
  const eventLogRef = useRef<HTMLDivElement>(null);

  // Poll gamepad state at 60fps
  const poll = useCallback(() => {
    const raw = navigator.getGamepads();
    const snaps: GamepadSnapshot[] = [];
    for (const gp of raw) {
      if (!gp) continue;
      snaps.push({
        index: gp.index,
        id: gp.id,
        connected: gp.connected,
        mapping: gp.mapping,
        timestamp: gp.timestamp,
        buttons: gp.buttons.map(b => ({ pressed: b.pressed, touched: b.touched, value: b.value })),
        axes: [...gp.axes],
      });
    }
    setGamepads(snaps);
    if (polling) {
      rafRef.current = requestAnimationFrame(poll);
    }
  }, [polling]);

  useEffect(() => {
    if (polling) {
      rafRef.current = requestAnimationFrame(poll);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [polling, poll]);

  // Listen for gamepad events
  useEffect(() => {
    const onConnect = (e: GamepadEvent) => {
      setEvents(prev => [...prev.slice(-49), {
        time: Date.now(),
        type: 'connect',
        index: e.gamepad.index,
        id: e.gamepad.id,
      }]);
    };
    const onDisconnect = (e: GamepadEvent) => {
      setEvents(prev => [...prev.slice(-49), {
        time: Date.now(),
        type: 'disconnect',
        index: e.gamepad.index,
        id: e.gamepad.id,
      }]);
    };
    window.addEventListener('gamepadconnected', onConnect);
    window.addEventListener('gamepaddisconnected', onDisconnect);
    return () => {
      window.removeEventListener('gamepadconnected', onConnect);
      window.removeEventListener('gamepaddisconnected', onDisconnect);
    };
  }, []);

  // Auto-scroll event log
  useEffect(() => {
    if (eventLogRef.current) {
      eventLogRef.current.scrollTop = eventLogRef.current.scrollHeight;
    }
  }, [events]);

  // Enumerate HID devices on mount (node-hid, for reference)
  useEffect(() => {
    window.api.enumerateHidDevices().then(setHidDevices).catch(() => {});
  }, []);

  // WebHID state
  const [webHidConnected, setWebHidConnected] = useState(webHidReader.isConnected());
  const [webHidStates, setWebHidStates] = useState<Map<string, WebHidInputState>>(new Map());
  const [webHidDiag, setWebHidDiag] = useState<string[]>(webHidReader.getDiagLog());

  useEffect(() => {
    // Subscribe to input
    const unsubInput = webHidReader.onInput((state) => {
      setWebHidStates(prev => {
        const next = new Map(prev);
        next.set(state.deviceKey, state);
        return next;
      });
      setWebHidConnected(true);
    });
    // Subscribe to diagnostics
    const unsubDiag = webHidReader.onDiag(() => {
      setWebHidDiag([...webHidReader.getDiagLog()]);
    });
    // Auto-connect on mount
    webHidReader.autoConnect().then((ok) => {
      setWebHidConnected(ok);
      setWebHidDiag([...webHidReader.getDiagLog()]);
    });
    return () => { unsubInput(); unsubDiag(); };
  }, []);

  const handleWebHidConnect = async () => {
    const ok = await webHidReader.requestDevice();
    setWebHidConnected(ok);
    setWebHidDiag([...webHidReader.getDiagLog()]);
  };

  // Calibration wizard state
  const [calibrating, setCalibrating] = useState(false);
  const [lastCalibration, setLastCalibration] = useState<HidControllerMap | null>(null);

  const handleCalibrationComplete = (map: HidControllerMap) => {
    setLastCalibration(map);
    setCalibrating(false);
  };

  const anyInput = gamepads.some(gp =>
    gp.buttons.some(b => b.pressed || b.value > 0.1) ||
    gp.axes.some(a => Math.abs(a) > 0.1)
  );

  return (
    <div className="input-tester">
      <div className="input-tester__header">
        <span className="input-tester__title">Input Tester</span>
        <span className={`input-tester__status ${polling ? 'input-tester__status--polling' : 'input-tester__status--idle'}`}>
          {polling ? `Polling @ 60fps • ${gamepads.length} gamepad(s)` : 'Paused'}
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
        <div key={gp.index} className="input-tester__gamepad">
          <div className="input-tester__gamepad-header">
            <span className="input-tester__gamepad-index">#{gp.index}</span>
            <span className="input-tester__gamepad-id">{gp.id}</span>
            <span className="input-tester__gamepad-mapping">mapping: {gp.mapping || 'none'}</span>
          </div>

          {/* Buttons */}
          <div className="input-tester__section-label">
            Buttons ({gp.buttons.length})
          </div>
          <div className="input-tester__buttons">
            {gp.buttons.map((btn, i) => (
              <div
                key={i}
                className={`input-tester__button ${
                  btn.pressed ? 'input-tester__button--pressed'
                    : btn.touched ? 'input-tester__button--touched'
                    : 'input-tester__button--idle'
                }`}
                title={`B${i}: pressed=${btn.pressed} touched=${btn.touched} value=${btn.value.toFixed(2)}`}
              >
                {i}
              </div>
            ))}
          </div>

          {/* Axes */}
          <div className="input-tester__section-label">
            Axes ({gp.axes.length})
          </div>
          <div className="input-tester__axes">
            {gp.axes.map((val, i) => (
              <div key={i} className="input-tester__axis">
                <span className="input-tester__axis-label">A{i}</span>
                <div className="input-tester__axis-bar">
                  <div
                    className="input-tester__axis-fill"
                    style={{
                      left: `${50 + val * 50}%`,
                      width: `${Math.abs(val) * 50}%`,
                      ...(val < 0 ? { left: `${50 + val * 50}%` } : { left: '50%' }),
                    }}
                  />
                </div>
                <span className="input-tester__axis-value">{val.toFixed(4)}</span>
              </div>
            ))}
          </div>

          {/* Raw timestamp */}
          <div className="input-tester__raw">
            timestamp: {gp.timestamp.toFixed(0)} | connected: {String(gp.connected)}
          </div>
        </div>
      ))}

      {/* Calibration Wizard (shown when active) */}
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

      {/* WebHID Controller Input (Switch Pro, etc.) */}
      <div className="input-tester__hid-section">
        <h3>WebHID Controller Input</h3>
        <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={handleWebHidConnect} style={{ padding: '4px 12px', fontSize: 12 }}>
            Connect HID Controller
          </button>
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
          <div key={key} className="input-tester__gamepad" style={{ marginTop: 8 }}>
            <div className="input-tester__gamepad-header">
              <span className="input-tester__gamepad-index">HID</span>
              <span className="input-tester__gamepad-id">{key}</span>
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
          </div>
        ))}
      </div>

      {/* HID enumeration (from node-hid via main process — reference only) */}
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
}
