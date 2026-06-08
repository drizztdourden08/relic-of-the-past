/* @layer renderer-components @kind data */
/**
 * TriggerCalibrationWizard — 2-step analog trigger calibration UI.
 *
 * Steps:
 *   1. Rest:  Leave trigger released → record idle base value
 *   2. Max:   Fully press trigger → record max value, test live output
 *
 * Saves per-axis trigger calibration (base, max, deadzone).
 */

import { RangeInput } from '../../../../primitives';
import { useTriggerCalibration } from './useTriggerCalibration';
import { TriggerBar } from './TriggerBar';
import type { TriggerCalibrationData, Step } from './useTriggerCalibration';

interface Props {
  axisIndex: number;
  label: string;
  onComplete: (cal: TriggerCalibrationData) => void;
  onCancel: () => void;
  existingCalibration?: TriggerCalibrationData | null;
  deviceKey?: string;
}

const TriggerCalibrationWizard = (props: Props) => {
  const { axisIndex, label, onComplete, onCancel, existingCalibration, deviceKey } = props;

  const cal = useTriggerCalibration({ axisIndex, deviceKey, existingCalibration });

  return (
    <div className="hid-cal" style={{ maxWidth: 360 }}>
      <div className="input-cal__header">
        <span className="input-cal__title">{label} Calibration</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="input-cal__btn" onClick={onCancel}>Cancel</button>
        </div>
      </div>

      {/* Progress indicator */}
      <div style={{
        display: 'flex', gap: 8, margin: '8px 0 12px',
        fontSize: 12, fontWeight: 600,
      }}>
        {(['rest', 'max', 'review'] as Step[]).map((s, i) => (
          <div key={s} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            color: cal.step === s ? 'var(--color-gold-bright)' : 'var(--color-text-muted)',
          }}>
            <span style={{
              width: 20, height: 20, borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: cal.step === s ? 'var(--color-gold-base)' : 'var(--color-bg-inset)',
              color: cal.step === s ? 'var(--color-bg-base)' : 'var(--color-text-muted)',
              fontSize: 11,
            }}>{i + 1}</span>
            {s === 'rest' ? 'Rest' : s === 'max' ? 'Max' : 'Review'}
          </div>
        ))}
      </div>

      {/* ── Step 1: Rest ── */}
      {cal.step === 'rest' && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
            <strong>Leave the {label} fully released</strong> — don't touch it. Recording the idle rest position.
          </p>

          {!cal.restDone ? (
            <div>
              <div style={{
                height: 6, background: 'var(--color-bg-inset)', borderRadius: 3,
                overflow: 'hidden', marginBottom: 12,
              }}>
                <div style={{
                  height: '100%', width: `${cal.restProgress * 100}%`,
                  background: 'var(--color-gold-base)', borderRadius: 3,
                  transition: 'width 0.1s',
                }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                Sampling... {Math.round(cal.restProgress * 100)}%
              </span>
            </div>
          ) : (
            <div>
              <div style={{
                fontSize: 12, fontFamily: 'monospace', marginBottom: 12,
                padding: 8, background: 'var(--color-bg-inset)', borderRadius: 6,
              }}>
                Rest value: {cal.baseValue.toFixed(3)}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="input-cal__btn input-cal__btn--primary" onClick={cal.advanceToMax}>
                  Next →
                </button>
                <button className="input-cal__btn" onClick={cal.resetRest}>Redo</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, gap: 16, alignItems: 'flex-end' }}>
            <TriggerBar value={cal.rawValue} label={`${label} (raw)`} step={cal.step} deadzone={cal.deadzone} />
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
              <div>axis[{axisIndex}]: {cal.rawValue.toFixed(4)}</div>
              {cal.rawByte !== null && <div>byte: {cal.rawByte} (0x{cal.rawByte.toString(16).padStart(2, '0')})</div>}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Max ── */}
      {cal.step === 'max' && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
            <strong>Fully press the {label}</strong> and hold it down. The software tracks the maximum value.
          </p>

          <div style={{
            fontSize: 12, fontFamily: 'monospace', marginBottom: 12,
            padding: 8, background: 'var(--color-bg-inset)', borderRadius: 6,
          }}>
            <div>Rest: {cal.baseValue.toFixed(3)}</div>
            <div>Max recorded: {cal.maxValue.toFixed(3)}</div>
            <div>Range: {(cal.maxValue - cal.baseValue).toFixed(3)}</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <TriggerBar value={cal.rawValue} label={`${label} (live)`} step={cal.step} deadzone={cal.deadzone} />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              className="input-cal__btn input-cal__btn--primary"
              onClick={() => cal.setStep('review')}
              disabled={cal.maxValue - cal.baseValue < 0.1}
            >
              Next →
            </button>
            <button className="input-cal__btn" onClick={() => cal.setStep('rest')}>← Back</button>
            {cal.maxValue - cal.baseValue < 0.1 && (
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', alignSelf: 'center' }}>
                Press the trigger fully...
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Step 3: Review ── */}
      {cal.step === 'review' && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
            <strong>Test the calibrated output.</strong> The trigger should read 0 at rest and 1 when fully pressed.
          </p>

          <div style={{
            marginBottom: 16, padding: 8, background: 'var(--color-bg-inset)', borderRadius: 6,
          }}>
            <label style={{ fontSize: 12 }}>
              <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Deadzone</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{(cal.deadzone * 100).toFixed(0)}%</span>
              </span>
              <RangeInput min={0} max={20} value={cal.deadzone * 100}
                style={{ width: '100%' }}
                onChange={(e) => cal.setDeadzone(Number(e.target.value) / 100)}
              />
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                Eliminates noise near rest position
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
            <TriggerBar value={cal.rawValue} label="Raw" step={cal.step} deadzone={cal.deadzone} />
            <TriggerBar value={cal.calibratedValue()} label="Calibrated" step={cal.step} deadzone={cal.deadzone} />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button
              className="input-cal__btn input-cal__btn--primary"
              onClick={() => onComplete({ base: cal.baseValue, max: cal.maxValue, deadzone: cal.deadzone })}
            >
              Save Calibration
            </button>
            <button className="input-cal__btn" onClick={() => cal.setStep('max')}>← Back</button>
            <button className="input-cal__btn" onClick={() => { cal.resetRest(); cal.setStep('rest'); }}>
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { TriggerCalibrationWizard };
export type { TriggerCalibrationData };
