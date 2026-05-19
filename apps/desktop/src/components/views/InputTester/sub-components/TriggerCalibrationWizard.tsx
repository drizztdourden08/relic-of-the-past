/**
 * TriggerCalibrationWizard — 2-step analog trigger calibration.
 *
 * Steps:
 *   1. Rest:  Leave trigger released → record idle base value
 *   2. Max:   Fully press trigger → record max value, test live output
 *
 * Saves per-axis trigger calibration (base, max, deadzone).
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { webHidReader } from '../../../../lib/input/hid-reader';

// ── Types ──

interface TriggerCalibrationData {
  base: number;
  max: number;
  deadzone: number;
}

type Step = 'rest' | 'max' | 'review';

interface Props {
  /** Axis index in the parsed axes array (e.g., 4 for L trigger, 5 for R trigger) */
  axisIndex: number;
  label: string;
  onComplete: (cal: TriggerCalibrationData) => void;
  onCancel: () => void;
  existingCalibration?: TriggerCalibrationData | null;
  /** Filter input state to only this device */
  deviceKey?: string;
}

// ── Constants ──

const REST_SAMPLE_FRAMES = 60;
const DEFAULT_DEADZONE = 0.05;

// ── Component ──

const TriggerCalibrationWizard = (props: Props) => {
  const { axisIndex, label, onComplete, onCancel, existingCalibration, deviceKey } = props;
  const [step, setStep] = useState<Step>('rest');

  // Live raw trigger value (0..1 from parser)
  const [rawValue, setRawValue] = useState(0);
  // Debug: raw byte value from buffer (to verify correct byte offset)
  const [rawByte, setRawByte] = useState<number | null>(null);

  // Rest sampling
  const restSamplesRef = useRef<number[]>([]);
  const [restDone, setRestDone] = useState(false);
  const [restProgress, setRestProgress] = useState(0);
  const [baseValue, setBaseValue] = useState(existingCalibration?.base ?? 0);

  // Max tracking
  const [maxValue, setMaxValue] = useState(existingCalibration?.max ?? 0);
  const maxRef = useRef(0);

  // Review
  const [deadzone, setDeadzone] = useState(existingCalibration?.deadzone ?? DEFAULT_DEADZONE);

  // Refs for step/restDone so the subscription callback always sees current values
  const stepRef = useRef<Step>(step);
  stepRef.current = step;
  const restDoneRef = useRef(restDone);
  restDoneRef.current = restDone;

  // ── Subscribe to input state ──
  // Use a single subscription that drives sampling, max tracking, AND UI updates.
  // This avoids the React dedup problem where constant values don't trigger re-renders.
  useEffect(() => {
    const unsub = webHidReader.onInput((state) => {
      if (deviceKey && state.deviceKey !== deviceKey) return;

      const val = state.axes[axisIndex] ?? 0;
      setRawValue(val);

      // Read raw byte from buffer for debug (rawBytes includes report ID at [0])
      // axisIndex 4 → trigger L → DataView[60] → rawBytes[61]
      // axisIndex 5 → trigger R → DataView[61] → rawBytes[62]
      if (state.rawBytes) {
        const byteOffset = axisIndex === 4 ? 61 : axisIndex === 5 ? 62 : null;
        if (byteOffset !== null && state.rawBytes.length > byteOffset) {
          setRawByte(state.rawBytes[byteOffset]);
        }
      }

      // Rest sampling (push every report regardless of value change)
      if (stepRef.current === 'rest' && !restDoneRef.current) {
        restSamplesRef.current.push(val);
        const count = restSamplesRef.current.length;
        setRestProgress(Math.min(count / REST_SAMPLE_FRAMES, 1));

        if (count >= REST_SAMPLE_FRAMES) {
          const avg = restSamplesRef.current.reduce((a, b) => a + b, 0) / count;
          setBaseValue(avg);
          setRestDone(true);
        }
      }

      // Max tracking
      if (stepRef.current === 'max' && val > maxRef.current) {
        maxRef.current = val;
        setMaxValue(val);
      }
    });
    return unsub;
  }, [axisIndex]);

  // ── Live preview with calibration applied ──
  const calibratedValue = useCallback(() => {
    const range = maxValue - baseValue;
    if (range <= 0) return 0;
    const normalized = Math.max(0, Math.min(1, (rawValue - baseValue) / range));
    if (normalized < deadzone) return 0;
    return (normalized - deadzone) / (1 - deadzone);
  }, [rawValue, baseValue, maxValue, deadzone]);

  // ── Render ──
  const renderTriggerBar = (value: number, barLabel: string, height = 120) => {
    const fill = Math.max(0, Math.min(1, value));
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 600 }}>{barLabel}</span>
        <div style={{
          width: 32, height, borderRadius: 4,
          background: 'var(--color-bg-inset)', border: '1px solid var(--color-border-subtle)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: `${fill * 100}%`,
            background: fill > 0.9 ? 'var(--color-gold-bright)' : 'var(--color-gold-base)',
            transition: 'height 0.05s',
            borderRadius: '0 0 3px 3px',
          }} />
          {/* Deadzone line */}
          {step === 'review' && deadzone > 0 && (
            <div style={{
              position: 'absolute', bottom: `${deadzone * 100}%`, left: 0, right: 0,
              height: 1, background: 'var(--color-danger-base)', opacity: 0.6,
            }} />
          )}
        </div>
        <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
          {value.toFixed(2)}
        </span>
      </div>
    );
  };

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
            color: step === s ? 'var(--color-gold-bright)' : 'var(--color-text-muted)',
          }}>
            <span style={{
              width: 20, height: 20, borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: step === s ? 'var(--color-gold-base)' : 'var(--color-bg-inset)',
              color: step === s ? 'var(--color-bg-base)' : 'var(--color-text-muted)',
              fontSize: 11,
            }}>{i + 1}</span>
            {s === 'rest' ? 'Rest' : s === 'max' ? 'Max' : 'Review'}
          </div>
        ))}
      </div>

      {/* ── Step 1: Rest ── */}
      {step === 'rest' && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
            <strong>Leave the {label} fully released</strong> — don't touch it. Recording the idle rest position.
          </p>

          {!restDone ? (
            <div>
              <div style={{
                height: 6, background: 'var(--color-bg-inset)', borderRadius: 3,
                overflow: 'hidden', marginBottom: 12,
              }}>
                <div style={{
                  height: '100%', width: `${restProgress * 100}%`,
                  background: 'var(--color-gold-base)', borderRadius: 3,
                  transition: 'width 0.1s',
                }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                Sampling... {Math.round(restProgress * 100)}%
              </span>
            </div>
          ) : (
            <div>
              <div style={{
                fontSize: 12, fontFamily: 'monospace', marginBottom: 12,
                padding: 8, background: 'var(--color-bg-inset)', borderRadius: 6,
              }}>
                Rest value: {baseValue.toFixed(3)}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="input-cal__btn input-cal__btn--primary"
                  onClick={() => {
                    maxRef.current = baseValue;
                    setMaxValue(baseValue);
                    setStep('max');
                  }}
                >
                  Next →
                </button>
                <button className="input-cal__btn" onClick={() => {
                  restSamplesRef.current = [];
                  setRestDone(false);
                  setRestProgress(0);
                }}>
                  Redo
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, gap: 16, alignItems: 'flex-end' }}>
            {renderTriggerBar(rawValue, `${label} (raw)`)}
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
              <div>axis[{axisIndex}]: {rawValue.toFixed(4)}</div>
              {rawByte !== null && <div>byte: {rawByte} (0x{rawByte.toString(16).padStart(2, '0')})</div>}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Max ── */}
      {step === 'max' && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
            <strong>Fully press the {label}</strong> and hold it down. The software tracks the maximum value.
          </p>

          <div style={{
            fontSize: 12, fontFamily: 'monospace', marginBottom: 12,
            padding: 8, background: 'var(--color-bg-inset)', borderRadius: 6,
          }}>
            <div>Rest: {baseValue.toFixed(3)}</div>
            <div>Max recorded: {maxValue.toFixed(3)}</div>
            <div>Range: {(maxValue - baseValue).toFixed(3)}</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            {renderTriggerBar(rawValue, `${label} (live)`)}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              className="input-cal__btn input-cal__btn--primary"
              onClick={() => setStep('review')}
              disabled={maxValue - baseValue < 0.1}
            >
              Next →
            </button>
            <button className="input-cal__btn" onClick={() => setStep('rest')}>
              ← Back
            </button>
            {maxValue - baseValue < 0.1 && (
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', alignSelf: 'center' }}>
                Press the trigger fully...
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Step 3: Review ── */}
      {step === 'review' && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
            <strong>Test the calibrated output.</strong> The trigger should read 0 at rest and 1 when fully pressed.
          </p>

          {/* Deadzone slider */}
          <div style={{
            marginBottom: 16, padding: 8, background: 'var(--color-bg-inset)', borderRadius: 6,
          }}>
            <label style={{ fontSize: 12 }}>
              <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Deadzone</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{(deadzone * 100).toFixed(0)}%</span>
              </span>
              <input type="range" min={0} max={20} value={deadzone * 100}
                style={{ width: '100%' }}
                onChange={(e) => setDeadzone(Number(e.target.value) / 100)}
              />
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                Eliminates noise near rest position
              </span>
            </label>
          </div>

          {/* Live calibrated preview */}
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
            {renderTriggerBar(rawValue, 'Raw')}
            {renderTriggerBar(calibratedValue(), 'Calibrated')}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button
              className="input-cal__btn input-cal__btn--primary"
              onClick={() => onComplete({ base: baseValue, max: maxValue, deadzone })}
            >
              Save Calibration
            </button>
            <button className="input-cal__btn" onClick={() => setStep('max')}>
              ← Back
            </button>
            <button className="input-cal__btn" onClick={() => {
              restSamplesRef.current = [];
              setRestDone(false);
              setRestProgress(0);
              setStep('rest');
            }}>
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { TriggerCalibrationWizard };
export type { TriggerCalibrationData };
