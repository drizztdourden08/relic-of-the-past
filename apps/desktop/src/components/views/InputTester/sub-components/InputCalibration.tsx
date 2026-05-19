/**
 * InputCalibration — Controller input visualization & calibration page.
 *
 * Shows detected controllers with real-time button/axis state using
 * proper SVG icons, joystick circle testers, and vibration testing.
 *
 * All input state comes from InputManager (the single source of truth).
 * Only the calibration wizard uses webHidReader.onRawReport() directly for raw bytes.
 */

import { useState, useEffect, useRef, useCallback, useReducer } from 'react';
import { webHidReader } from '../../../../lib/input/hid-reader';
import type { WebHidInputState, DeviceStickCalibration } from '../../../../lib/input/hid-reader';
import { getInputManager } from '../../../../lib/input/input-manager';
import type { GamepadSnapshot } from '../../../../lib/input/input-manager';
import { HidCalibrationWizard } from './HidCalibrationWizard';
import type { HidControllerMap } from './HidCalibrationWizard';
import type { TriggerCalibrationData } from './TriggerCalibrationWizard';
import { DEVICE_PROFILES, findPresetByVidPid } from '@shared/input';
import { WebHidCard } from './WebHidCard';
import { GamepadCard } from './GamepadCard';
import type { HidDeviceInfo } from './GamepadCard';
import { CONTROLLER_ICON_MAP, resolveDeviceName } from './input-cal-visuals';
import './InputCalibration.css';

// ── Types ──

interface EventEntry {
  time: number;
  type: 'connect' | 'disconnect';
  id: string;
}

// ── Main Component ──

const InputCalibration = () => {
  const [gamepads, setGamepads] = useState<GamepadSnapshot[]>([]);
  const [events, setEvents] = useState<EventEntry[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  // WebHID
  const [webHidConnected, setWebHidConnected] = useState(webHidReader.isConnected());
  const [webHidStates, setWebHidStates] = useState<Map<string, WebHidInputState>>(new Map());
  const [webHidDiag, setWebHidDiag] = useState<string[]>(webHidReader.getDiagLog());

  // Calibration
  const [calibrating, setCalibrating] = useState(false);
  const [lastCalibration, setLastCalibration] = useState<HidControllerMap | null>(null);

  // Stick calibration
  const [stickCalibrationStore, setStickCalibrationStore] = useState<Record<string, DeviceStickCalibration>>({});

  // Force re-render on device connect/disconnect
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  // Node-HID enumeration for accurate model detection
  const [hidDeviceInfo, setHidDeviceInfo] = useState<HidDeviceInfo[]>([]);
  const refreshHidDevices = useCallback(() => {
    window.api.enumerateHidDevices()
      .then(devices => setHidDeviceInfo(devices))
      .catch(() => {});
  }, []);
  useEffect(() => { refreshHidDevices(); }, [webHidConnected, refreshHidDevices]);

  // Load stick calibration store for display (InputManager already loaded them into webHidReader)
  useEffect(() => {
    window.api.readStickCalibration()
      .then((store) => {
        setStickCalibrationStore(store as Record<string, DeviceStickCalibration>);
      })
      .catch(() => {});
  }, []);

  // ── Subscribe to InputManager for all input state ──
  useEffect(() => {
    const inputMgr = getInputManager();
    const unsub = inputMgr.onInputState((hidStates, gamepadSnaps, _pressedKeys) => {
      setWebHidStates(hidStates);
      setWebHidConnected(hidStates.size > 0 || webHidReader.isConnected() || webHidReader.getConnectedDeviceKeys().length > 0);
      setGamepads(gamepadSnaps);
    });
    return unsub;
  }, []);

  // ── Direct HID connect/disconnect subscriptions for immediate UI updates ──
  useEffect(() => {
    const unsubConnect = window.api.onHidDeviceOpened(() => {
      forceUpdate();
      refreshHidDevices();
    });
    const unsubDisconnect = webHidReader.onDisconnect(() => {
      forceUpdate();
      refreshHidDevices();
    });
    return () => {
      unsubConnect();
      unsubDisconnect();
    };
  }, [refreshHidDevices]);

  // ── Gamepad connect/disconnect events (for log only) ──
  useEffect(() => {
    const onConnect = (e: GamepadEvent) => {
      setEvents(prev => [...prev.slice(-49), { time: Date.now(), type: 'connect', id: e.gamepad.id }]);
    };
    const onDisconnect = (e: GamepadEvent) => {
      setEvents(prev => [...prev.slice(-49), { time: Date.now(), type: 'disconnect', id: e.gamepad.id }]);
    };
    window.addEventListener('gamepadconnected', onConnect);
    window.addEventListener('gamepaddisconnected', onDisconnect);
    return () => {
      window.removeEventListener('gamepadconnected', onConnect);
      window.removeEventListener('gamepaddisconnected', onDisconnect);
    };
  }, []);

  // ── HID diagnostics (lightweight listener — no input polling) ──
  useEffect(() => {
    const unsubDiag = webHidReader.onDiag(() => {
      setWebHidDiag([...webHidReader.getDiagLog()]);
    });
    return unsubDiag;
  }, []);

  const handleCalibrationComplete = (map: HidControllerMap) => {
    setLastCalibration(map);
    setCalibrating(false);
  };

  const handleStickCalibrationComplete = async (cal: DeviceStickCalibration) => {
    const keys = webHidReader.getConnectedDeviceKeys();
    if (keys.length === 0) return;
    const key = keys[0];
    webHidReader.setStickCalibration(key, cal);
    const updated = { ...stickCalibrationStore, [key]: cal };
    setStickCalibrationStore(updated);
    await window.api.writeStickCalibration(updated);
  };

  const handleTriggerCalibrationComplete = async (deviceKey: string, axisIndex: number, cal: TriggerCalibrationData) => {
    webHidReader.setTriggerCalibration(deviceKey, axisIndex, cal);
    await window.api.writeTriggerCalibration(deviceKey, axisIndex, cal);
  };

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [events, webHidDiag]);

  // Find the profile for the connected HID device
  const connectedProfile = (() => {
    const keys = webHidReader.getConnectedDeviceKeys();
    if (keys.length === 0) return null;
    const [vidHex, pidHex] = keys[0].split(':');
    return DEVICE_PROFILES.find(p => p.vendorId === vidHex && p.productId === pidHex) ?? null;
  })();

  // HID connected = any device keys registered (even unparsed devices)
  const anyHidConnected = webHidConnected || webHidReader.getConnectedDeviceKeys().length > 0;

  // ── Render ──
  return (
    <div className="input-cal">
      {/* Header */}
      <div className="input-cal__header">
        <span className="input-cal__title">Input Calibration</span>
        <span className={`input-cal__status ${anyHidConnected ? 'input-cal__status--connected' : 'input-cal__status--disconnected'}`}>
          {anyHidConnected
            ? `Connected ${'\u2022'} ${gamepads.length + webHidReader.getConnectedDeviceKeys().length} controller(s)`
            : `${gamepads.length} controller(s) detected`}
        </span>
      </div>

      {/* Actions */}
      <div className="input-cal__actions">
        <span style={{ fontSize: 'var(--text-sm)', opacity: 0.6 }}>
          Controllers auto-connect via node-hid
        </span>
        <button
          className="input-cal__btn"
          onClick={() => setCalibrating(true)}
          disabled={!anyHidConnected}
        >
          Calibrate
        </button>
      </div>

      {/* Calibration Wizard */}
      {calibrating && (
        <div className="input-cal__section">
          <HidCalibrationWizard
            onComplete={handleCalibrationComplete}
            onCancel={() => setCalibrating(false)}
            deviceKey={webHidReader.getConnectedDeviceKeys()[0]}
          />
        </div>
      )}

      {/* Calibration Result */}
      {lastCalibration && !calibrating && (
        <div className="input-cal__section">
          <div className="input-cal__result">
            <div className="input-cal__result-header">
              <span className="input-cal__result-title">Calibration Complete</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                {lastCalibration.name} {'\u2014'} {Object.keys(lastCalibration.buttons).length} buttons, {Object.keys(lastCalibration.axes).length} axes
              </span>
            </div>
            <pre>{JSON.stringify(lastCalibration, null, 2)}</pre>
            <button
              className="input-cal__btn"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(lastCalibration, null, 2))}
              style={{ marginTop: 'var(--space-sm)' }}
            >
              Copy JSON
            </button>
          </div>
        </div>
      )}

      {/* Controller Cards */}
      <div className="input-cal__section">
        <div className="input-cal__section-title">Controllers</div>

        {gamepads.length === 0 && !anyHidConnected && hidDeviceInfo.filter(d => d.vendorId !== '046d').length === 0 && (
          <div className="input-cal__empty">
            <p>No controllers detected.</p>
            <p style={{ fontSize: 'var(--text-sm)' }}>Press a button on your gamepad to activate it.</p>
          </div>
        )}

        <div className="input-cal__cards">
          {/* HID Controller Card */}
          {anyHidConnected && (() => {
            const keys = new Set(webHidReader.getConnectedDeviceKeys());
            return [...keys].map(key => {
              const [vidHex, pidHex] = key.split(':');
              const deviceProfile = DEVICE_PROFILES.find(
                p => p.vendorId === vidHex?.padStart(4, '0') && p.productId === pidHex?.padStart(4, '0')
              ) ?? null;

              const profileButtons = deviceProfile?.buttons.length ?? 0;
              const profileAxes = deviceProfile?.axes.length ?? 0;
              const state = webHidStates.get(key) ?? {
                deviceKey: key,
                buttons: new Array(profileButtons).fill(false),
                axes: new Array(profileAxes).fill(0),
                timestamp: 0,
              };
              return (
                <WebHidCard
                  key={key}
                  deviceKey={key}
                  state={state}
                  profile={deviceProfile}
                  hasStickCal={!!stickCalibrationStore[key]}
                  existingStickCal={stickCalibrationStore[key] ?? null}
                  onStickCalibrationComplete={(cal) => {
                    handleStickCalibrationComplete(cal);
                  }}
                  onTriggerCalibrationComplete={(axisIndex, cal) => {
                    handleTriggerCalibrationComplete(key, axisIndex, cal);
                  }}
                />
              );
            });
          })()}

          {/* Standard Gamepad API Cards */}
          {gamepads.map(gp => (
            <GamepadCard key={gp.index} gamepad={gp} hidDevices={hidDeviceInfo} />
          ))}

          {/* Inactive controllers */}
          {hidDeviceInfo
            .filter(d => {
              const key = `${d.vendorId}:${d.productId}`;
              if (webHidReader.getConnectedDeviceKeys().includes(key)) return false;
              if (gamepads.some(gp => {
                const gpLower = gp.id.toLowerCase();
                if (gpLower.includes(`vendor: ${d.vendorId}`) && gpLower.includes(`product: ${d.productId}`)) return true;
                if (d.vendorId === '045e' && /xbox|xinput/i.test(gp.id)) return true;
                return false;
              })) return false;
              if (d.vendorId === '046d') return false;
              return true;
            })
            .map(d => {
              const key = `${d.vendorId}:${d.productId}`;
              const preset = findPresetByVidPid(d.vendorId, d.productId);
              const family = preset?.family;
              const icon = family ? CONTROLLER_ICON_MAP[family] : null;
              const name = resolveDeviceName(d.vendorId, d.productId, d.product);
              const isGeneric = !preset || preset.id === 'generic';
              return (
                <div key={`inactive-${key}`} className="input-cal__card" style={{ opacity: 0.5 }}>
                  <div className="input-cal__card-header">
                    {icon && (
                      <img src={icon} alt="" draggable={false} style={{ width: 28, height: 28, opacity: 0.5, flexShrink: 0 }} />
                    )}
                    <span className="input-cal__card-badge" style={{ background: 'var(--color-bg-tertiary, #333)' }}>
                      INACTIVE
                    </span>
                    <span className="input-cal__card-badge" style={{ background: '#1e40af', marginLeft: 4 }}>
                      HID
                    </span>
                    <span className="input-cal__card-name">{name}</span>
                    <span className="input-cal__card-meta">{key}</span>
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 'var(--space-sm) 0 0' }}>
                    {isGeneric
                      ? 'Press a button to activate, then use Calibrate to map this controller.'
                      : 'Press a button to activate this controller.'}
                  </p>
                </div>
              );
            })
          }
        </div>
      </div>

      {/* Logs */}
      <div className="input-cal__section">
        <div className="input-cal__section-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          Diagnostics
          <button
            className="input-cal__btn"
            style={{ fontSize: 'var(--text-xs)', padding: '2px 8px' }}
            onClick={() => {
              const lines = [
                ...events.map(ev => `[${new Date(ev.time).toLocaleTimeString()}] ${ev.type.toUpperCase()} ${'\u2014'} ${ev.id}`),
                ...webHidDiag,
              ];
              navigator.clipboard.writeText(lines.join('\n'));
            }}
          >
            Copy
          </button>
        </div>
        <div className="input-cal__log" ref={logRef}>
          {events.map((ev, i) => (
            <div key={`ev-${i}`} className={`input-cal__log-entry input-cal__log-entry--${ev.type}`}>
              [{new Date(ev.time).toLocaleTimeString()}] {ev.type.toUpperCase()} {'\u2014'} {ev.id}
            </div>
          ))}
          {webHidDiag.map((entry, i) => (
            <div key={`hid-${i}`} className="input-cal__log-entry">
              {entry}
            </div>
          ))}
          {events.length === 0 && webHidDiag.length === 0 && (
            <div className="input-cal__log-entry">Waiting for controller activity...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export { InputCalibration };