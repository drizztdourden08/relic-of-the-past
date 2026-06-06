/**
 * WebHidCard — Shows a connected WebHID controller with buttons, sticks, triggers,
 * vibration controls, calibration wizard, and raw byte debug.
 */

import { useState } from 'react';
import { webHidReader } from '../../../../lib/input/hid-reader';
import type { WebHidInputState, DeviceStickCalibration } from '../../../../lib/input/hid-reader';
import type { DEVICE_PROFILES } from '@shared/input';
import { getButtonIconUrl } from '../data/button-icons';
import { StickCalibrationWizard } from './StickCalibrationWizard';
import { TriggerCalibrationWizard } from './TriggerCalibrationWizard';
import type { TriggerCalibrationData } from './TriggerCalibrationWizard';
import { AxisRecordButton, CONTROLLER_ICON_MAP, StickCircle, TriggerBar, resolveDeviceName } from './input-cal-visuals';

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

const WebHidCard = ({ deviceKey, state, profile, hasStickCal, existingStickCal, onStickCalibrationComplete, onTriggerCalibrationComplete }: WebHidCardProps) => {
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
            deviceKey={deviceKey}
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
            deviceKey={deviceKey}
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
    </div>
  );
};

export { WebHidCard };
export type { WebHidCardProps };
