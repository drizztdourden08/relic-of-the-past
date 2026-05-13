/**
 * InputCalibration — Controller input visualization & calibration page.
 *
 * Shows detected controllers with real-time button/axis state using
 * proper SVG icons, joystick circle testers, and vibration testing.
 *
 * All input state comes from InputManager (the single source of truth).
 * Only the calibration wizard uses webHidReader.onRawReport() directly for raw bytes.
 */

import { useState, useEffect, useRef } from 'react';
import { webHidReader } from '../../../lib/game/webhid-input-reader';
import type { WebHidInputState, DeviceStickCalibration } from '../../../lib/game/webhid-input-reader';
import { getInputManager } from '../../../lib/game/input-manager';
import type { GamepadSnapshot } from '../../../lib/game/input-manager';
import { HidCalibrationWizard } from './HidCalibrationWizard';
import type { HidControllerMap } from './HidCalibrationWizard';
import { StickCalibrationWizard } from './StickCalibrationWizard';
import { CONTROLLER_PROFILES } from '@shared/data/controllers/profiles';
import { findPresetByVidPid, parseGamepadId } from '@shared/data/controllers';
import { getButtonIconUrl } from './button-icons';
import './InputCalibration.css';

interface HidDeviceInfo {
  vendorId: string;
  productId: string;
  product: string;
  manufacturer: string;
}

// ── Types ──

interface EventEntry {
  time: number;
  type: 'connect' | 'disconnect';
  id: string;
}

// ── Controller silhouette icons ──
const CONTROLLER_ICON_MAP: Record<string, string> = {
  nintendo: '/buttons/switch/controller_switch_pro.svg',
  xbox: '/buttons/xbox/controller_xboxseries.svg',
  playstation: '/buttons/playstation/controller_playstation5.svg',
};

// ── Joystick Circle Component ──

function StickCircle({ x, y, label }: { x: number; y: number; label: string }) {
  // x, y are -1..+1, clamped
  const clampX = Math.max(-1, Math.min(1, x));
  const clampY = Math.max(-1, Math.min(1, y));
  // Position in 80x80 box, inner radius 36px
  const dotX = 40 + clampX * 36;
  const dotY = 40 + clampY * 36;

  return (
    <div className="input-cal__stick-container">
      <span className="input-cal__stick-label">{label}</span>
      <div className="input-cal__stick-circle">
        <svg width="80" height="80" style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Crosshair */}
          <line x1="0" y1="40" x2="80" y2="40" stroke="var(--color-border-subtle)" strokeWidth="1" />
          <line x1="40" y1="0" x2="40" y2="80" stroke="var(--color-border-subtle)" strokeWidth="1" />
          {/* Line from center to dot */}
          <line x1="40" y1="40" x2={dotX} y2={dotY} stroke="var(--color-gold-base)" strokeWidth="2" strokeLinecap="round" />
          {/* Dot */}
          <circle cx={dotX} cy={dotY} r="5" fill="var(--color-gold-bright)" />
        </svg>
      </div>
      <span className="input-cal__stick-values">
        {clampX.toFixed(2)}, {clampY.toFixed(2)}
      </span>
    </div>
  );
}

// ── Main Component ──

export function InputCalibration(): JSX.Element {
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

  // Node-HID enumeration for accurate model detection
  const [hidDeviceInfo, setHidDeviceInfo] = useState<HidDeviceInfo[]>([]);
  useEffect(() => {
    window.api.enumerateHidDevices()
      .then(devices => setHidDeviceInfo(devices))
      .catch(() => {});
  }, [webHidConnected]);

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
      // Update WebHID states
      setWebHidStates(hidStates);
      setWebHidConnected(hidStates.size > 0 || webHidReader.isConnected());
      // Update gamepad states
      setGamepads(gamepadSnaps);
    });
    return unsub;
  }, []);

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

  // ── WebHID diagnostics (lightweight listener — no input polling) ──
  useEffect(() => {
    const unsubDiag = webHidReader.onDiag(() => {
      setWebHidDiag([...webHidReader.getDiagLog()]);
    });
    return unsubDiag;
  }, []);

  const handleWebHidConnect = async () => {
    const ok = await webHidReader.requestDevice();
    setWebHidConnected(ok);
    setWebHidDiag([...webHidReader.getDiagLog()]);
  };

  const handleCalibrationComplete = (map: HidControllerMap) => {
    setLastCalibration(map);
    setCalibrating(false);
  };

  const handleStickCalibrationComplete = async (cal: DeviceStickCalibration) => {
    // Find device key for the connected controller
    const devices = webHidReader.getDevices();
    if (devices.length === 0) return;
    const dev = devices[0];
    const key = `${dev.vendorId.toString(16)}:${dev.productId.toString(16)}`;

    // Apply immediately
    webHidReader.setStickCalibration(key, cal);

    // Persist
    const updated = { ...stickCalibrationStore, [key]: cal };
    setStickCalibrationStore(updated);
    await window.api.writeStickCalibration(updated);
  };

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [events, webHidDiag]);

  // Find the profile for the connected WebHID device
  const connectedProfile = (() => {
    const devices = webHidReader.getDevices();
    if (devices.length === 0) return null;
    const dev = devices[0];
    const vid = dev.vendorId.toString(16).padStart(4, '0');
    const pid = dev.productId.toString(16).padStart(4, '0');
    return CONTROLLER_PROFILES.find(p => p.vendorId === vid && p.productId === pid) ?? null;
  })();

  // ── Render ──
  return (
    <div className="input-cal">
      {/* Header */}
      <div className="input-cal__header">
        <span className="input-cal__title">Input Calibration</span>
        <span className={`input-cal__status ${webHidConnected ? 'input-cal__status--connected' : 'input-cal__status--disconnected'}`}>
          {webHidConnected
            ? `Connected • ${gamepads.length + (webHidConnected ? 1 : 0)} controller(s)`
            : `${gamepads.length} controller(s) detected`}
        </span>
      </div>

      {/* Actions */}
      <div className="input-cal__actions">
        <button className="input-cal__btn input-cal__btn--primary" onClick={handleWebHidConnect}>
          Connect HID Controller
        </button>
        <button
          className="input-cal__btn"
          onClick={() => setCalibrating(true)}
          disabled={!webHidConnected}
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
                {lastCalibration.name} — {Object.keys(lastCalibration.buttons).length} buttons, {Object.keys(lastCalibration.axes).length} axes
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

        {gamepads.length === 0 && !webHidConnected && (
          <div className="input-cal__empty">
            <p>No controllers detected.</p>
            <p style={{ fontSize: 'var(--text-sm)' }}>Press a button on your gamepad to activate it, or connect via HID above.</p>
          </div>
        )}

        <div className="input-cal__cards">
          {/* WebHID Controller Card — show as soon as connected, even without input */}
          {webHidConnected && (() => {
            const devices = webHidReader.getDevices();
            // Build cards from either existing state or from connected devices
            const keys = new Set([
              ...webHidStates.keys(),
              ...devices.map(d => `${d.vendorId.toString(16)}:${d.productId.toString(16)}`),
            ]);
            return [...keys].map(key => {
              // Find profile for this specific device key
              const [vidHex, pidHex] = key.split(':');
              const deviceProfile = CONTROLLER_PROFILES.find(
                p => p.vendorId === vidHex?.padStart(4, '0') && p.productId === pidHex?.padStart(4, '0')
              ) ?? connectedProfile;

              // Pre-fill placeholder state from profile so buttons/sticks render immediately
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
                />
              );
            });
          })()}

          {/* Standard Gamepad API Cards */}
          {gamepads.map(gp => (
            <GamepadCard key={gp.index} gamepad={gp} hidDevices={hidDeviceInfo} />
          ))}
        </div>
      </div>

      {/* Logs (at the end) */}
      <div className="input-cal__section">
        <div className="input-cal__section-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          Diagnostics
          <button
            className="input-cal__btn"
            style={{ fontSize: 'var(--text-xs)', padding: '2px 8px' }}
            onClick={() => {
              const lines = [
                ...events.map(ev => `[${new Date(ev.time).toLocaleTimeString()}] ${ev.type.toUpperCase()} — ${ev.id}`),
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
              [{new Date(ev.time).toLocaleTimeString()}] {ev.type.toUpperCase()} — {ev.id}
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
}

// ── WebHID Controller Card ──

interface WebHidCardProps {
  deviceKey: string;
  state: WebHidInputState;
  profile: (typeof CONTROLLER_PROFILES)[number] | null;
  hasStickCal?: boolean;
  existingStickCal?: DeviceStickCalibration | null;
  onStickCalibrationComplete?: (cal: DeviceStickCalibration) => void;
}

function WebHidCard({ deviceKey, state, profile, hasStickCal, existingStickCal, onStickCalibrationComplete }: WebHidCardProps) {
  const name = profile?.name ?? `HID ${deviceKey}`;
  const buttons = profile?.buttons ?? [];
  const [stickCalibrating, setStickCalibrating] = useState(false);

  const handleVibrate = async () => {
    const devices = webHidReader.getDevices();
    if (devices.length === 0) return;
    const device = devices[0];
    const rumbleOn = new Uint8Array([0x00, 0x28, 0x88, 0x60, 0x64, 0x28, 0x88, 0x60, 0x64]);
    const rumbleOff = new Uint8Array([0x00, 0x00, 0x01, 0x40, 0x40, 0x00, 0x01, 0x40, 0x40]);
    try {
      await device.sendReport(0x10, rumbleOn);
      setTimeout(async () => {
        try { await device.sendReport(0x10, rumbleOff); } catch { /* ignore */ }
      }, 2000);
    } catch { /* ignore */ }
  };

  const controllerIcon = profile ? CONTROLLER_ICON_MAP[profile.family] : null;

  return (
    <div className="input-cal__card">
      <div className="input-cal__card-header">
        {controllerIcon && (
          <img src={controllerIcon} alt="" draggable={false} style={{ width: 28, height: 28, opacity: 0.7, flexShrink: 0 }} />
        )}
        <span className="input-cal__card-badge">HID</span>
        <span className="input-cal__card-name">{name}</span>
        <span className="input-cal__card-meta">{deviceKey}</span>
        {hasStickCal && (
          <span style={{
            fontSize: 10, padding: '1px 6px', borderRadius: 4,
            background: 'var(--color-success-bg, #1a3a2a)', color: 'var(--color-success-text, #4ade80)',
            fontWeight: 600,
          }}>
            Sticks Calibrated
          </span>
        )}
      </div>

      {/* Buttons with icons */}
      <div className="input-cal__btn-grid">
        {buttons.map((btn, i) => {
          const pressed = state.buttons[i] ?? false;
          const iconUrl = getButtonIconUrl(btn.icon);
          return (
            <div
              key={btn.id}
              className={`input-cal__btn-cell ${pressed ? 'input-cal__btn-cell--pressed' : ''}`}
              title={`${btn.label} (${btn.id})`}
            >
              {iconUrl ? (
                <img src={iconUrl} alt={btn.label} draggable={false} />
              ) : (
                <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>{btn.label}</span>
              )}
              <span className="input-cal__btn-cell-label">{btn.label}</span>
            </div>
          );
        })}
      </div>

      {/* Joystick circles */}
      {state.axes.length >= 2 && (
        <div className="input-cal__sticks">
          <StickCircle
            x={state.axes[0] ?? 0}
            y={state.axes[1] ?? 0}
            label="L Stick"
          />
          {state.axes.length >= 4 && (
            <StickCircle
              x={state.axes[2] ?? 0}
              y={state.axes[3] ?? 0}
              label="R Stick"
            />
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ marginTop: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
        <button className="input-cal__btn" onClick={handleVibrate}>
          Test Vibration
        </button>
        <button
          className="input-cal__btn"
          onClick={() => setStickCalibrating(true)}
        >
          {hasStickCal ? 'Recalibrate Sticks' : 'Calibrate Sticks'}
        </button>
        <span className="input-cal__debug-state" style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
          t={state.timestamp > 0 ? state.timestamp.toFixed(0) : '—'}
          {' '}btn={state.buttons.filter(Boolean).length}/{state.buttons.length}
          {' '}axes={state.axes.map(a => a.toFixed(1)).join(',')}
        </span>
      </div>

      {/* Stick Calibration Wizard (inline) */}
      {stickCalibrating && (
        <div style={{ marginTop: 'var(--space-md)' }}>
          <StickCalibrationWizard
            onComplete={(cal) => {
              onStickCalibrationComplete?.(cal);
              setStickCalibrating(false);
            }}
            onCancel={() => setStickCalibrating(false)}
            existingCalibration={existingStickCal}
          />
        </div>
      )}
    </div>
  );
}

// ── Standard Gamepad Card ──

/** VID patterns for name-based matching when Gamepad API doesn't embed VID:PID */
const VENDOR_PATTERNS: [RegExp, string][] = [
  [/xbox|xinput/i, '045e'],
  [/playstation|dualshock|dualsense/i, '054c'],
  [/switch|nintendo|pro controller/i, '057e'],
];

/** Try to find the best Xbox device from HID list (skip keyboard/mouse interfaces) */
function findBestXboxDevice(hidDevices: HidDeviceInfo[]): HidDeviceInfo | undefined {
  const msDevices = hidDevices.filter(d => d.vendorId === '045e');
  // Prefer one with a preset match
  for (const d of msDevices) {
    if (findPresetByVidPid(d.vendorId, d.productId)) return d;
  }
  // Prefer one with 'xbox' or 'controller' in the product name
  const controller = msDevices.find(d => /xbox|controller/i.test(d.product));
  if (controller) return controller;
  return msDevices[0];
}

function GamepadCard({ gamepad, hidDevices }: { gamepad: GamepadSnapshot; hidDevices: HidDeviceInfo[] }) {
  // Resolve display name: prefer HID-reported real VID/PID over XInput-abstracted one
  const { displayName, detectedVidPid } = (() => {
    const parsed = parseGamepadId(gamepad.id);

    // If we got a VID/PID from the ID string, use it
    if (parsed) {
      const realDevice = hidDevices.find(d => d.vendorId === parsed.vid);
      if (realDevice) {
        const vidPid = `${realDevice.vendorId}:${realDevice.productId}`;
        const preset = findPresetByVidPid(realDevice.vendorId, realDevice.productId);
        // All Xbox variants → just "Xbox Controller"
        if (preset?.family === 'xbox') return { displayName: 'Xbox Controller', detectedVidPid: vidPid };
        if (preset) return { displayName: preset.name, detectedVidPid: vidPid };
        if (realDevice.product) return { displayName: realDevice.product, detectedVidPid: vidPid };
      }
      const preset = findPresetByVidPid(parsed.vid, parsed.pid);
      if (preset?.family === 'xbox') return { displayName: 'Xbox Controller', detectedVidPid: `${parsed.vid}:${parsed.pid}` };
      if (preset) return { displayName: preset.name, detectedVidPid: `${parsed.vid}:${parsed.pid}` };
    }

    // XInput doesn't embed VID:PID — match by name pattern against HID devices
    for (const [pattern, vid] of VENDOR_PATTERNS) {
      if (pattern.test(gamepad.id)) {
        const realDevice = vid === '045e'
          ? findBestXboxDevice(hidDevices)
          : hidDevices.find(d => d.vendorId === vid);
        if (realDevice) {
          const vidPid = `${realDevice.vendorId}:${realDevice.productId}`;
          const preset = findPresetByVidPid(realDevice.vendorId, realDevice.productId);
          if (preset?.family === 'xbox') return { displayName: 'Xbox Controller', detectedVidPid: vidPid };
          if (preset) return { displayName: preset.name, detectedVidPid: vidPid };
          if (realDevice.product) return { displayName: realDevice.product, detectedVidPid: vidPid };
        }
        // No HID device but name matches Xbox
        if (vid === '045e') return { displayName: 'Xbox Controller', detectedVidPid: null };
      }
    }

    return { displayName: gamepad.id, detectedVidPid: null };
  })();

  // For standard-mapped gamepads, use the Xbox profile for icons
  const isXbox = /xbox|xinput/i.test(gamepad.id) || detectedVidPid?.startsWith('045e') || false;
  const xboxProfile = isXbox ? CONTROLLER_PROFILES.find(p => p.id === 'xbox-one') : null;

  const controllerIcon = isXbox ? CONTROLLER_ICON_MAP['xbox'] : null;

  return (
    <div className="input-cal__card">
      <div className="input-cal__card-header">
        {controllerIcon && (
          <img src={controllerIcon} alt="" draggable={false} style={{ width: 28, height: 28, opacity: 0.7, flexShrink: 0 }} />
        )}
        <span className="input-cal__card-badge">#{gamepad.index}</span>
        <span className="input-cal__card-name">{displayName}</span>
        <span className="input-cal__card-meta">{detectedVidPid ?? (gamepad.mapping || 'unmapped')}</span>
      </div>

      {/* Buttons — with Xbox icons if recognized, otherwise numbered */}
      <div className="input-cal__btn-grid">
        {gamepad.buttons.map((btn, i) => {
          const profileBtn = xboxProfile?.buttons[i];
          const iconUrl = profileBtn ? getButtonIconUrl(profileBtn.icon) : null;
          const pressed = btn.pressed;
          return (
            <div
              key={i}
              className={`input-cal__btn-cell ${pressed ? 'input-cal__btn-cell--pressed' : ''}`}
              title={profileBtn ? `${profileBtn.label} (${profileBtn.id})` : `B${i} value=${btn.value.toFixed(2)}`}
            >
              {iconUrl ? (
                <img src={iconUrl} alt={profileBtn!.label} draggable={false} />
              ) : (
                <span style={{ fontSize: 11, fontWeight: 600, color: pressed ? 'var(--color-green-bright)' : 'var(--color-text-muted)' }}>
                  {profileBtn?.label ?? i}
                </span>
              )}
              {profileBtn && (
                <span className="input-cal__btn-cell-label">{profileBtn.label}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Joystick circles */}
      {gamepad.axes.length >= 2 && (
        <div className="input-cal__sticks">
          <StickCircle
            x={gamepad.axes[0] ?? 0}
            y={gamepad.axes[1] ?? 0}
            label="L Stick"
          />
          {gamepad.axes.length >= 4 && (
            <StickCircle
              x={gamepad.axes[2] ?? 0}
              y={gamepad.axes[3] ?? 0}
              label="R Stick"
            />
          )}
        </div>
      )}
    </div>
  );
}
