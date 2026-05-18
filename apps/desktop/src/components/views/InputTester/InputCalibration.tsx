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
import { webHidReader } from '../../../lib/input/hid-reader';
import type { WebHidInputState, DeviceStickCalibration } from '../../../lib/input/hid-reader';
import { getInputManager } from '../../../lib/input/input-manager';
import type { GamepadSnapshot } from '../../../lib/input/input-manager';
import { collectInputDiagnostics } from '../../../lib/input/diagnostics';
import { HidCalibrationWizard } from './HidCalibrationWizard';
import type { HidControllerMap } from './HidCalibrationWizard';
import { StickCalibrationWizard } from './StickCalibrationWizard';
import { TriggerCalibrationWizard } from './TriggerCalibrationWizard';
import type { TriggerCalibrationData } from './TriggerCalibrationWizard';
import { DEVICE_PROFILES } from '@shared/input';
import { findPresetByVidPid, parseGamepadId } from '@shared/input';
import { DEVICE_DATABASE } from '@shared/input/device-database';
import { getButtonIconUrl } from './button-icons';
import { vibrateGamepad, vibrateGamepadPattern } from '../../../lib/input/vibration';
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

// ── Idle Byte Analyzer ──

type IdleAnalysisState = 'idle' | 'recording' | 'done';

interface ByteAnalysis {
  index: number;
  min: number;
  max: number;
  uniqueValues: number[];
  range: number;
  classification: 'stable' | 'low-noise' | 'noisy' | 'full-range';
}

function IdleByteAnalyzer({ state }: { state: WebHidInputState }) {
  const [phase, setPhase] = useState<IdleAnalysisState>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ByteAnalysis[] | null>(null);
  const framesRef = useRef<Uint8Array[]>([]);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const rawRef = useRef(state.rawBytes);
  rawRef.current = state.rawBytes;

  const DURATION_MS = 3000;

  const startRecording = useCallback(() => {
    framesRef.current = [];
    startRef.current = performance.now();
    setPhase('recording');
    setResult(null);
    setProgress(0);

    const sample = () => {
      const elapsed = performance.now() - startRef.current;
      setProgress(Math.min(1, elapsed / DURATION_MS));

      if (rawRef.current) {
        framesRef.current.push(new Uint8Array(rawRef.current));
      }

      if (elapsed < DURATION_MS) {
        rafRef.current = requestAnimationFrame(sample);
      } else {
        // Analyze
        const frames = framesRef.current;
        if (frames.length === 0) { setPhase('idle'); return; }
        const len = frames[0].length;
        const analysis: ByteAnalysis[] = [];

        for (let i = 0; i < len; i++) {
          const seen = new Set<number>();
          let min = 255, max = 0;
          for (const f of frames) {
            const v = f[i];
            seen.add(v);
            if (v < min) min = v;
            if (v > max) max = v;
          }
          const range = max - min;
          const uniqueValues = [...seen].sort((a, b) => a - b);
          let classification: ByteAnalysis['classification'];
          if (range === 0) classification = 'stable';
          else if (range <= 3) classification = 'low-noise';
          else if (range <= 30) classification = 'noisy';
          else classification = 'full-range';

          analysis.push({ index: i, min, max, uniqueValues, range, classification });
        }

        setResult(analysis);
        setPhase('done');

        // Copy to clipboard
        const out = {
          reportId: frames[0]?.[0],
          frameCount: frames.length,
          durationMs: DURATION_MS,
          reportLength: len,
          bytes: analysis.map(b => ({
            i: b.index,
            hex: `0x${b.index.toString(16).padStart(2, '0')}`,
            min: b.min,
            max: b.max,
            range: b.range,
            uniqueCount: b.uniqueValues.length,
            classification: b.classification,
            values: b.uniqueValues.length <= 16 ? b.uniqueValues.map(v => v.toString(16).padStart(2, '0')) : `${b.uniqueValues.length} unique`,
          })),
        };
        navigator.clipboard.writeText(JSON.stringify(out, null, 2));
      }
    };
    rafRef.current = requestAnimationFrame(sample);
  }, []);

  const classColor = (c: ByteAnalysis['classification']) => {
    switch (c) {
      case 'stable': return '#4ade80';
      case 'low-noise': return '#facc15';
      case 'noisy': return '#f97316';
      case 'full-range': return '#ef4444';
    }
  };

  return (
    <details style={{ marginTop: 'var(--space-sm)' }}>
      <summary style={{ fontSize: 11, color: 'var(--color-text-muted)', cursor: 'pointer', userSelect: 'none' }}>
        Idle Byte Analyzer
      </summary>
      <div style={{ marginTop: 6 }}>
        <p style={{ fontSize: 10, color: 'var(--color-text-muted)', margin: '0 0 6px' }}>
          Leave sticks centered and press Record. Identifies noisy/timer bytes vs stable axis bytes.
        </p>
        <button
          className="input-cal__btn"
          style={{ fontSize: 10, padding: '2px 8px' }}
          onClick={startRecording}
          disabled={phase === 'recording'}
        >
          {phase === 'recording' ? `Recording... ${(progress * 100).toFixed(0)}%` : phase === 'done' ? '✓ Copied — Record Again' : 'Record Idle (3s)'}
        </button>

        {result && (
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 2, fontFamily: 'monospace', fontSize: 9 }}>
            {result.map(b => (
              <div key={b.index} style={{
                width: 28, padding: '2px 1px', textAlign: 'center',
                background: `${classColor(b.classification)}22`,
                border: `1px solid ${classColor(b.classification)}66`,
                borderRadius: 2,
              }} title={`Byte ${b.index} (0x${b.index.toString(16).padStart(2,'0')})\nRange: ${b.min}–${b.max} (${b.range})\nUnique: ${b.uniqueValues.length}\n${b.classification}`}>
                <div style={{ color: classColor(b.classification), fontWeight: 600 }}>{b.index}</div>
                <div style={{ fontSize: 7, color: 'var(--color-text-muted)' }}>{b.range}</div>
              </div>
            ))}
          </div>
        )}

        {result && (
          <div style={{ marginTop: 6, fontSize: 9, color: 'var(--color-text-muted)' }}>
            <span style={{ color: '#4ade80' }}>■</span> stable{' '}
            <span style={{ color: '#facc15' }}>■</span> low-noise (±3){' '}
            <span style={{ color: '#f97316' }}>■</span> noisy (±4-30){' '}
            <span style={{ color: '#ef4444' }}>■</span> full-range (±30+)
          </div>
        )}
      </div>
    </details>
  );
}

// ── Axis Record Button ──

function AxisRecordButton({ getValues, label }: { getValues: () => number[]; label: string }) {
  const [recording, setRecording] = useState(false);
  const [done, setDone] = useState(false);
  const bufRef = useRef<{ t: number; v: number[] }[]>([]);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const getValRef = useRef(getValues);
  getValRef.current = getValues;

  const startRecording = useCallback(() => {
    bufRef.current = [];
    startRef.current = performance.now();
    setRecording(true);
    setDone(false);
    const sample = () => {
      bufRef.current.push({ t: Math.round(performance.now() - startRef.current), v: getValRef.current() });
      rafRef.current = requestAnimationFrame(sample);
    };
    rafRef.current = requestAnimationFrame(sample);
  }, []);

  const stopRecording = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setRecording(false);
    const data = { label, samples: bufRef.current.length, durationMs: bufRef.current.length > 0 ? bufRef.current[bufRef.current.length - 1].t : 0, values: bufRef.current };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  }, [label]);

  const color = done ? '#4ade80' : recording ? '#ef4444' : 'var(--color-text-muted)';

  return (
    <button
      onClick={recording ? stopRecording : startRecording}
      title={recording ? 'Stop recording & copy to clipboard' : `Record ${label} axis data`}
      style={{
        width: 18, height: 18, padding: 0, border: 'none', borderRadius: 4,
        background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: recording ? 'axis-rec-flash 0.6s ease-in-out infinite' : undefined,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14">
        <circle cx="7" cy="7" r="6" fill="none" stroke={color} strokeWidth="1.5" />
        <circle cx="7" cy="7" r="3" fill={color} />
      </svg>
    </button>
  );
}

// ── Trigger Bar Component ──

function TriggerBar({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(1, value));
  const fillH = clamped * 60; // 60px tall bar
  return (
    <div className="input-cal__stick-container">
      <span className="input-cal__stick-label">{label}</span>
      <div style={{
        width: 24, height: 60, borderRadius: 4,
        border: '1px solid var(--color-border-subtle)',
        background: 'var(--color-bg-secondary, #1a1a2e)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: fillH,
          background: 'var(--color-gold-bright)',
          borderRadius: '0 0 3px 3px',
          transition: 'height 0.05s linear',
        }} />
      </div>
      <span className="input-cal__stick-values">{clamped.toFixed(2)}</span>
    </div>
  );
}

// ── Joystick Circle Component ──

function getStickDirectionIcon(x: number, y: number, prefix: string): string | null {
  const threshold = 0.4;
  const ax = Math.abs(x);
  const ay = Math.abs(y);
  if (ax < threshold && ay < threshold) return getButtonIconUrl(prefix);
  if (ax > ay) {
    if (ax > threshold && ay > threshold) return getButtonIconUrl(`${prefix}-horizontal`);
    return getButtonIconUrl(x > 0 ? `${prefix}-right` : `${prefix}-left`);
  } else {
    if (ax > threshold && ay > threshold) return getButtonIconUrl(`${prefix}-vertical`);
    return getButtonIconUrl(y > 0 ? `${prefix}-down` : `${prefix}-up`);
  }
}

function StickCircle({ x, y, label, iconPrefix }: { x: number; y: number; label: string; iconPrefix?: string }) {
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
      {iconPrefix && (() => {
        const iconUrl = getStickDirectionIcon(clampX, clampY, iconPrefix);
        return iconUrl ? (
          <img src={iconUrl} alt="" draggable={false} style={{ width: 32, height: 32, marginTop: 2, opacity: 0.85 }} />
        ) : null;
      })()}
    </div>
  );
}

/** Resolve a friendly controller name from SDL database, preset, or HID product string */
function resolveDeviceName(vid: string, pid: string, hidProduct?: string): string {
  const vidPid = `${vid.padStart(4, '0')}:${pid.padStart(4, '0')}`;
  // Try SDL database first (893+ controllers)
  const sdlEntry = DEVICE_DATABASE.find(e => e.vidPid === vidPid);
  if (sdlEntry) return sdlEntry.name;
  // Try controller preset
  const preset = findPresetByVidPid(vid, pid);
  if (preset && preset.id !== 'generic') return preset.name;
  // Fall back to HID product string or generic
  return hidProduct || `HID ${vidPid}`;
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
      // Update gamepad states
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
    // Find device key for the connected controller
    const keys = webHidReader.getConnectedDeviceKeys();
    if (keys.length === 0) return;
    const key = keys[0];

    // Apply immediately
    webHidReader.setStickCalibration(key, cal);

    // Persist
    const updated = { ...stickCalibrationStore, [key]: cal };
    setStickCalibrationStore(updated);
    await window.api.writeStickCalibration(updated);
  };

  const handleTriggerCalibrationComplete = async (deviceKey: string, axisIndex: number, cal: TriggerCalibrationData) => {
    // Store trigger calibration per device + axis index
    webHidReader.setTriggerCalibration(deviceKey, axisIndex, cal);
    // Persist alongside stick calibration
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

  // ── Diagnostic dump ──
  const [diagState, setDiagState] = useState<'idle' | 'running' | 'done'>('idle');
  const runDiagnostics = useCallback(async () => {
    setDiagState('running');
    try {
      const result = await collectInputDiagnostics();
      const json = JSON.stringify(result, null, 2);
      await navigator.clipboard.writeText(json);
      console.log('[DIAG] Full diagnostics:', result);
      setDiagState('done');
      setTimeout(() => setDiagState('idle'), 5000);
    } catch (e) {
      console.error('[DIAG] Failed:', e);
      setDiagState('idle');
    }
  }, []);

  // ── Render ──
  return (
    <div className="input-cal">
      {/* Header */}
      <div className="input-cal__header">
        <span className="input-cal__title">Input Calibration</span>
        <span className={`input-cal__status ${anyHidConnected ? 'input-cal__status--connected' : 'input-cal__status--disconnected'}`}>
          {anyHidConnected
            ? `Connected • ${gamepads.length + webHidReader.getConnectedDeviceKeys().length} controller(s)`
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
        <button
          onClick={runDiagnostics}
          disabled={diagState === 'running'}
          style={{
            padding: '6px 16px',
            fontWeight: 700,
            fontSize: 13,
            border: 'none',
            borderRadius: 6,
            cursor: diagState === 'running' ? 'wait' : 'pointer',
            color: '#000',
            background: diagState === 'done' ? '#4ade80' : diagState === 'running' ? '#facc15' : '#f87171',
            transition: 'background 0.2s',
          }}
        >
          {diagState === 'done' ? '✓ Copied to Clipboard' : diagState === 'running' ? 'Collecting...' : 'Dump Diagnostics'}
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

        {gamepads.length === 0 && !anyHidConnected && hidDeviceInfo.filter(d => d.vendorId !== '046d').length === 0 && (
          <div className="input-cal__empty">
            <p>No controllers detected.</p>
            <p style={{ fontSize: 'var(--text-sm)' }}>Press a button on your gamepad to activate it.</p>
          </div>
        )}

        <div className="input-cal__cards">
          {/* HID Controller Card — show as soon as connected, even without input */}
          {anyHidConnected && (() => {
            // Build cards from authoritative connected device keys (updated immediately on disconnect)
            const keys = new Set(webHidReader.getConnectedDeviceKeys());
            return [...keys].map(key => {
              // Find profile for this specific device key
              const [vidHex, pidHex] = key.split(':');
              const deviceProfile = DEVICE_PROFILES.find(
                p => p.vendorId === vidHex?.padStart(4, '0') && p.productId === pidHex?.padStart(4, '0')
              ) ?? null;

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

          {/* Inactive controllers — detected by node-hid but not yet sending input */}
          {hidDeviceInfo
            .filter(d => {
              const key = `${d.vendorId}:${d.productId}`;
              // Skip if already shown as active HID card
              if (webHidReader.getConnectedDeviceKeys().includes(key)) return false;
              // Skip if matched by an active Gamepad API card (by embedded VID:PID or name)
              if (gamepads.some(gp => {
                const gpLower = gp.id.toLowerCase();
                // Check embedded VID:PID (some drivers include it)
                if (gpLower.includes(`vendor: ${d.vendorId}`) && gpLower.includes(`product: ${d.productId}`)) return true;
                // XInput controllers don't embed VID:PID — match Xbox VID against Xbox-named gamepads
                if (d.vendorId === '045e' && /xbox|xinput/i.test(gp.id)) return true;
                return false;
              })) return false;
              // Skip known non-controller devices (mice with no usage page filtering)
              if (d.vendorId === '046d') return false; // Logitech mice
              // Show ALL other HID devices — even unknown ones can be calibrated
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
  profile: (typeof DEVICE_PROFILES)[number] | null;
  hasStickCal?: boolean;
  existingStickCal?: DeviceStickCalibration | null;
  onStickCalibrationComplete?: (cal: DeviceStickCalibration) => void;
  onTriggerCalibrationComplete?: (axisIndex: number, cal: TriggerCalibrationData) => void;
}

/** What's being calibrated — null means nothing open */
type CalibrationTarget =
  | { type: 'stick'; side: 'left' | 'right' | 'both' }
  | { type: 'trigger'; axisIndex: number; label: string }
  | null;

function WebHidCard({ deviceKey, state, profile, hasStickCal, existingStickCal, onStickCalibrationComplete, onTriggerCalibrationComplete }: WebHidCardProps) {
  const [vidHex, pidHex] = deviceKey.split(':');
  const name = profile?.name ?? resolveDeviceName(vidHex, pidHex);
  const buttons = profile?.buttons ?? [];
  const [calibrationTarget, setCalibrationTarget] = useState<CalibrationTarget>(null);

  const controllerIcon = profile ? CONTROLLER_ICON_MAP[profile.family] : null;
  const isStale = webHidReader.isDeviceStale(deviceKey);

  return (
    <div className={`input-cal__card ${isStale ? 'input-cal__card--stale' : ''}`}>
      {isStale && (
        <div className="input-cal__stale-overlay">
          <span className="input-cal__stale-label">STALE</span>
          <span className="input-cal__stale-sub">No HID data</span>
        </div>
      )}
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

      {/* Sticks and triggers — dynamically derived from profile axes */}
      {(() => {
        const axesDef = profile?.axes ?? [];
        // Pair up stick axes (consecutive X/Y pairs)
        const stickPairs: { label: string; xIdx: number; yIdx: number }[] = [];
        const triggerAxes: { label: string; idx: number }[] = [];
        let i = 0;
        while (i < axesDef.length) {
          if (axesDef[i].category === 'stick' && i + 1 < axesDef.length && axesDef[i + 1].category === 'stick') {
            stickPairs.push({
              label: axesDef[i].label.replace(/ X$/, ''),
              xIdx: i,
              yIdx: i + 1,
            });
            i += 2;
          } else if (axesDef[i].category === 'trigger') {
            triggerAxes.push({ label: axesDef[i].label, idx: i });
            i++;
          } else {
            i++;
          }
        }
        if (stickPairs.length === 0 && triggerAxes.length === 0) return null;
        const stickIconPrefixes = profile?.id === 'gamecube-wireless'
          ? ['gc-stick-l', 'gc-stick-c']
          : profile?.id === 'switch-pro-2'
            ? ['switch-stick-l', 'switch-stick-r']
            : [];
        return (
          <div className="input-cal__sticks">
            {stickPairs.map((s, pairIdx) => (
              <div key={s.xIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <StickCircle
                  x={state.axes[s.xIdx] ?? 0}
                  y={state.axes[s.yIdx] ?? 0}
                  label={s.label}
                  iconPrefix={stickIconPrefixes[pairIdx]}
                />
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <AxisRecordButton
                    getValues={() => [state.axes[s.xIdx] ?? 0, state.axes[s.yIdx] ?? 0]}
                    label={s.label}
                  />
                  <button
                    className="input-cal__btn"
                    style={{ fontSize: 9, padding: '1px 5px', lineHeight: 1.2 }}
                    onClick={() => setCalibrationTarget({ type: 'stick', side: pairIdx === 0 ? 'left' : 'right' })}
                    title={`Calibrate ${s.label}`}
                  >Cal</button>
                </div>
              </div>
            ))}
            {triggerAxes.map(t => (
              <div key={t.idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <TriggerBar
                  value={state.axes[t.idx] ?? 0}
                  label={t.label}
                />
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <AxisRecordButton
                    getValues={() => [state.axes[t.idx] ?? 0]}
                    label={t.label}
                  />
                  <button
                    className="input-cal__btn"
                    style={{ fontSize: 9, padding: '1px 5px', lineHeight: 1.2 }}
                    onClick={() => setCalibrationTarget({ type: 'trigger', axisIndex: t.idx, label: t.label })}
                    title={`Calibrate ${t.label}`}
                  >Cal</button>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Actions */}
      <div style={{ marginTop: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
        {profile?.supportsVibration && <>
        <button className="input-cal__btn" onClick={() => window.api.vibratePattern(deviceKey, [{ durationMs: 100, intensity: 1.0 }], 0).then(r => { if (!r.ok) webHidReader.addDiag(`⚠ Vibrate failed (${deviceKey}): ${r.error}`); }).catch(e => webHidReader.addDiag(`⚠ Vibrate IPC error: ${e}`))}>
          100ms
        </button>
        <button className="input-cal__btn" onClick={() => window.api.vibratePattern(deviceKey, [{ durationMs: 250, intensity: 1.0 }], 0).then(r => { if (!r.ok) webHidReader.addDiag(`⚠ Vibrate failed (${deviceKey}): ${r.error}`); }).catch(e => webHidReader.addDiag(`⚠ Vibrate IPC error: ${e}`))}>
          250ms
        </button>
        <button className="input-cal__btn" onClick={() => window.api.vibratePattern(deviceKey, [{ durationMs: 1000, intensity: 1.0 }], 0).then(r => { if (!r.ok) webHidReader.addDiag(`⚠ Vibrate failed (${deviceKey}): ${r.error}`); }).catch(e => webHidReader.addDiag(`⚠ Vibrate IPC error: ${e}`))}>
          1000ms
        </button>
        <button className="input-cal__btn" onClick={() => window.api.vibratePattern(deviceKey, [{ durationMs: 100, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }], 50).then(r => { if (!r.ok) webHidReader.addDiag(`⚠ Vibrate failed (${deviceKey}): ${r.error}`); }).catch(e => webHidReader.addDiag(`⚠ Vibrate IPC error: ${e}`))}>
          3×100ms
        </button>
        <button className="input-cal__btn" onClick={() => window.api.vibratePattern(deviceKey, [{ durationMs: 100, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }, { durationMs: 1000, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }], 50).then(r => { if (!r.ok) webHidReader.addDiag(`⚠ Vibrate failed (${deviceKey}): ${r.error}`); }).catch(e => webHidReader.addDiag(`⚠ Vibrate IPC error: ${e}`))}>
          2-long-2
        </button>
        </>}
        <span className="input-cal__debug-state" style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
          t={state.timestamp > 0 ? state.timestamp.toFixed(0) : '—'}
          {' '}btn={state.buttons.filter(Boolean).length}/{state.buttons.length}
          {' '}axes={state.axes.map(a => a.toFixed(1)).join(',')}
        </span>
      </div>

      {/* Calibration Wizard (inline) */}
      {calibrationTarget?.type === 'stick' && (
        <div style={{ marginTop: 'var(--space-md)' }}>
          <StickCalibrationWizard
            target={calibrationTarget.side === 'both' ? undefined : calibrationTarget.side}
            onComplete={(cal) => {
              onStickCalibrationComplete?.(cal);
              setCalibrationTarget(null);
            }}
            onCancel={() => setCalibrationTarget(null)}
            existingCalibration={existingStickCal}
          />
        </div>
      )}
      {calibrationTarget?.type === 'trigger' && (
        <div style={{ marginTop: 'var(--space-md)' }}>
          <TriggerCalibrationWizard
            axisIndex={calibrationTarget.axisIndex}
            label={calibrationTarget.label}
            onComplete={(cal) => {
              onTriggerCalibrationComplete?.(calibrationTarget.axisIndex, cal);
              setCalibrationTarget(null);
            }}
            onCancel={() => setCalibrationTarget(null)}
          />
        </div>
      )}

      {/* Collapsible raw bytes debug */}
      <details style={{ marginTop: 'var(--space-sm)' }}>
        <summary style={{ fontSize: 11, color: 'var(--color-text-muted)', cursor: 'pointer', userSelect: 'none' }}>
          Raw Bytes {state.reportId != null ? `(0x${state.reportId.toString(16).padStart(2, '0')})` : ''} — {state.rawBytes ? state.rawBytes.length : 0}B
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

      {/* Idle Byte Analyzer */}
      <IdleByteAnalyzer state={state} />
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
  const xboxProfile = isXbox ? DEVICE_PROFILES.find(p => p.id === 'xbox') : null;

  const controllerIcon = isXbox ? CONTROLLER_ICON_MAP['xbox'] : null;

  return (
    <div className="input-cal__card">
      <div className="input-cal__card-header">
        {controllerIcon && (
          <img src={controllerIcon} alt="" draggable={false} style={{ width: 28, height: 28, opacity: 0.7, flexShrink: 0 }} />
        )}
        <span className="input-cal__card-badge">#{gamepad.index}</span>
        <span className="input-cal__card-badge" style={{ background: isXbox ? '#166534' : '#7c3aed', marginLeft: 4 }}>
          {isXbox ? 'XInput' : 'WebAPI'}
        </span>
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

      {/* Sticks and triggers — dynamically derived from profile or generic */}
      {(() => {
        const axesDef = xboxProfile?.axes;
        if (axesDef && axesDef.length > 0) {
          const stickPairs: { label: string; xIdx: number; yIdx: number }[] = [];
          const triggerAxes: { label: string; idx: number }[] = [];
          let i = 0;
          while (i < axesDef.length) {
            if (axesDef[i].category === 'stick' && i + 1 < axesDef.length && axesDef[i + 1].category === 'stick') {
              stickPairs.push({ label: axesDef[i].label.replace(/ X$/, ''), xIdx: i, yIdx: i + 1 });
              i += 2;
            } else if (axesDef[i].category === 'trigger') {
              triggerAxes.push({ label: axesDef[i].label, idx: i });
              i++;
            } else {
              i++;
            }
          }
          return (
            <div className="input-cal__sticks">
              {stickPairs.map(s => (
                <StickCircle key={s.xIdx} x={gamepad.axes[s.xIdx] ?? 0} y={gamepad.axes[s.yIdx] ?? 0} label={s.label} />
              ))}
              {triggerAxes.map((t, ti) => {
                // Gamepad API standard mapping: triggers are buttons 6+7, not axes 4+5
                const triggerBtnIdx = 6 + ti;
                const value = gamepad.buttons[triggerBtnIdx]?.value ?? gamepad.axes[t.idx] ?? 0;
                return <TriggerBar key={t.idx} value={value} label={t.label} />;
              })}
            </div>
          );
        }
        // Fallback: render stick circles for every consecutive pair of axes
        const pairs: { xIdx: number; yIdx: number }[] = [];
        for (let j = 0; j + 1 < gamepad.axes.length; j += 2) {
          pairs.push({ xIdx: j, yIdx: j + 1 });
        }
        if (pairs.length === 0) return null;
        return (
          <div className="input-cal__sticks">
            {pairs.map((p, k) => (
              <StickCircle key={p.xIdx} x={gamepad.axes[p.xIdx] ?? 0} y={gamepad.axes[p.yIdx] ?? 0} label={`Stick ${k + 1}`} />
            ))}
          </div>
        );
      })()}

      {/* Vibration tests */}
      {xboxProfile?.supportsVibration && (
      <div style={{ marginTop: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
        <button className="input-cal__btn" onClick={() => vibrateGamepad(gamepad.index, 100, { intensity: 1.0 })}>
          100ms
        </button>
        <button className="input-cal__btn" onClick={() => vibrateGamepad(gamepad.index, 250, { intensity: 1.0 })}>
          250ms
        </button>
        <button className="input-cal__btn" onClick={() => vibrateGamepad(gamepad.index, 1000, { intensity: 1.0 })}>
          1000ms
        </button>
        <button className="input-cal__btn" onClick={() => vibrateGamepadPattern(gamepad.index, [{ durationMs: 100, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }], 50)}>
          3×100ms
        </button>
        <button className="input-cal__btn" onClick={() => vibrateGamepadPattern(gamepad.index, [{ durationMs: 100, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }, { durationMs: 1000, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }], 50)}>
          2-long-2
        </button>
      </div>
      )}
    </div>
  );
}
