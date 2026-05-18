/**
 * StickCalibrationWizard — 3-step analog stick calibration.
 *
 * Steps:
 *   1. Center:  Leave sticks at rest → record center offsets
 *   2. Range:   Rotate sticks fully → record per-axis min/max
 *   3. Review:  Adjust deadzones, test live output, save
 *
 * Persists per-device (VID:PID) in Data/stick-calibration.json.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { webHidReader } from '../../../lib/game/webhid-input-reader';

// ── Types ──

export interface StickCalibrationData {
  centerX: number;
  centerY: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  innerDeadzone: number;
  outerDeadzone: number;
}

export interface DeviceStickCalibration {
  left: StickCalibrationData;
  right: StickCalibrationData;
  updatedAt: string;
}

type Step = 'center' | 'range' | 'review';

interface Props {
  onComplete: (cal: DeviceStickCalibration) => void;
  onCancel: () => void;
  /** Current raw 12-bit stick values from parser (before normalization) */
  existingCalibration?: DeviceStickCalibration | null;
  /** Which stick to calibrate — undefined means both */
  target?: 'left' | 'right';
}

// ── Constants ──

const CENTER_SAMPLE_FRAMES = 60;
const DEFAULT_INNER_DEADZONE = 0.10;
const DEFAULT_OUTER_DEADZONE = 0.95;

// ── Helpers ──

function applyCalibration(
  rawX: number, rawY: number,
  cal: StickCalibrationData,
): { x: number; y: number } {
  // Asymmetric per-axis normalize to -1..+1
  const rangeNegX = cal.centerX - cal.minX || 1;
  const rangePosX = cal.maxX - cal.centerX || 1;
  const rangeNegY = cal.centerY - cal.minY || 1;
  const rangePosY = cal.maxY - cal.centerY || 1;

  const nx = rawX < cal.centerX
    ? -(cal.centerX - rawX) / rangeNegX
    : (rawX - cal.centerX) / rangePosX;
  const ny = rawY < cal.centerY
    ? (cal.centerY - rawY) / rangeNegY
    : -(rawY - cal.centerY) / rangePosY;

  // Circular clamp
  let mag = Math.sqrt(nx * nx + ny * ny);
  let cx = nx, cy = ny;
  if (mag > 1) { cx /= mag; cy /= mag; mag = 1; }

  // Deadzone with rescaling
  if (mag < cal.innerDeadzone) return { x: 0, y: 0 };

  const rescaled = Math.min(
    (mag - cal.innerDeadzone) / (cal.outerDeadzone - cal.innerDeadzone),
    1,
  );
  const scale = mag > 0 ? rescaled / mag : 0;
  return { x: cx * scale, y: cy * scale };
}

// ── Component ──

export function StickCalibrationWizard({ onComplete, onCancel, existingCalibration, target }: Props) {
  const [step, setStep] = useState<Step>('center');
  const calibrateLeft = target !== 'right';
  const calibrateRight = target !== 'left';

  // Raw 12-bit values (live)
  const [rawLX, setRawLX] = useState(2048);
  const [rawLY, setRawLY] = useState(2048);
  const [rawRX, setRawRX] = useState(2048);
  const [rawRY, setRawRY] = useState(2048);

  // Center calibration
  const centerSamplesRef = useRef<{ lx: number[]; ly: number[]; rx: number[]; ry: number[] }>({
    lx: [], ly: [], rx: [], ry: [],
  });
  const [centerDone, setCenterDone] = useState(false);
  const [centerProgress, setCenterProgress] = useState(0);
  const [centerValues, setCenterValues] = useState({ lx: 2048, ly: 2048, rx: 2048, ry: 2048 });

  // Range calibration
  const [rangeMinMax, setRangeMinMax] = useState({
    lxMin: 4095, lxMax: 0, lyMin: 4095, lyMax: 0,
    rxMin: 4095, rxMax: 0, ryMin: 4095, ryMax: 0,
  });
  const rangeMinMaxRef = useRef(rangeMinMax);
  const [rangeDone, setRangeDone] = useState(false);

  // Review deadzones
  const [innerDz, setInnerDz] = useState(
    existingCalibration?.left.innerDeadzone ?? DEFAULT_INNER_DEADZONE,
  );
  const [outerDz, setOuterDz] = useState(
    existingCalibration?.left.outerDeadzone ?? DEFAULT_OUTER_DEADZONE,
  );

  // ── Subscribe to input state for rawSticks (controller-agnostic) ──
  useEffect(() => {
    const unsub = webHidReader.onInput((state) => {
      if (!state.rawSticks) return;
      const [lx, ly, rx, ry] = state.rawSticks;
      setRawLX(lx);
      setRawLY(ly);
      setRawRX(rx);
      setRawRY(ry);
    });
    return unsub;
  }, []);

  // ── Center sampling ──
  const startCenter = useCallback(() => {
    centerSamplesRef.current = { lx: [], ly: [], rx: [], ry: [] };
    setCenterDone(false);
    setCenterProgress(0);
  }, []);

  useEffect(() => {
    if (step !== 'center' || centerDone) return;

    const s = centerSamplesRef.current;
    s.lx.push(rawLX);
    s.ly.push(rawLY);
    s.rx.push(rawRX);
    s.ry.push(rawRY);

    const count = s.lx.length;
    setCenterProgress(Math.min(count / CENTER_SAMPLE_FRAMES, 1));

    if (count >= CENTER_SAMPLE_FRAMES) {
      const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
      const cv = { lx: avg(s.lx), ly: avg(s.ly), rx: avg(s.rx), ry: avg(s.ry) };
      setCenterValues(cv);
      setCenterDone(true);
    }
  }, [step, centerDone, rawLX, rawLY, rawRX, rawRY]);

  // ── Range tracking ──
  useEffect(() => {
    if (step !== 'range') return;

    const prev = rangeMinMaxRef.current;
    const next = {
      lxMin: Math.min(prev.lxMin, rawLX),
      lxMax: Math.max(prev.lxMax, rawLX),
      lyMin: Math.min(prev.lyMin, rawLY),
      lyMax: Math.max(prev.lyMax, rawLY),
      rxMin: Math.min(prev.rxMin, rawRX),
      rxMax: Math.max(prev.rxMax, rawRX),
      ryMin: Math.min(prev.ryMin, rawRY),
      ryMax: Math.max(prev.ryMax, rawRY),
    };
    rangeMinMaxRef.current = next;
    setRangeMinMax(next);

    // Auto-enable "Done" once we have decent range (>500 in each targeted axis)
    const minRange = 500;
    const lxRange = next.lxMax - next.lxMin;
    const lyRange = next.lyMax - next.lyMin;
    const rxRange = next.rxMax - next.rxMin;
    const ryRange = next.ryMax - next.ryMin;
    const leftOk = !calibrateLeft || (lxRange > minRange && lyRange > minRange);
    const rightOk = !calibrateRight || (rxRange > minRange && ryRange > minRange);
    if (leftOk && rightOk) {
      setRangeDone(true);
    }
  }, [step, rawLX, rawLY, rawRX, rawRY]);

  // ── Build calibration data ──
  const buildCalibration = useCallback((): DeviceStickCalibration => {
    const left: StickCalibrationData = calibrateLeft ? {
      centerX: centerValues.lx,
      centerY: centerValues.ly,
      minX: rangeMinMax.lxMin,
      maxX: rangeMinMax.lxMax,
      minY: rangeMinMax.lyMin,
      maxY: rangeMinMax.lyMax,
      innerDeadzone: innerDz,
      outerDeadzone: outerDz,
    } : (existingCalibration?.left ?? {
      centerX: 2048, centerY: 2048, minX: 0, maxX: 4095, minY: 0, maxY: 4095,
      innerDeadzone: DEFAULT_INNER_DEADZONE, outerDeadzone: DEFAULT_OUTER_DEADZONE,
    });
    const right: StickCalibrationData = calibrateRight ? {
      centerX: centerValues.rx,
      centerY: centerValues.ry,
      minX: rangeMinMax.rxMin,
      maxX: rangeMinMax.rxMax,
      minY: rangeMinMax.ryMin,
      maxY: rangeMinMax.ryMax,
      innerDeadzone: innerDz,
      outerDeadzone: outerDz,
    } : (existingCalibration?.right ?? {
      centerX: 2048, centerY: 2048, minX: 0, maxX: 4095, minY: 0, maxY: 4095,
      innerDeadzone: DEFAULT_INNER_DEADZONE, outerDeadzone: DEFAULT_OUTER_DEADZONE,
    });
    return { left, right, updatedAt: new Date().toISOString() };
  }, [centerValues, rangeMinMax, innerDz, outerDz, calibrateLeft, calibrateRight, existingCalibration]);

  // ── Live preview (review step) ──
  const previewCal = step === 'review' ? buildCalibration() : null;
  const previewL = previewCal ? applyCalibration(rawLX, rawLY, previewCal.left) : null;
  const previewR = previewCal ? applyCalibration(rawRX, rawRY, previewCal.right) : null;

  // ── Render helpers ──
  const renderStickPreview = (
    x: number, y: number, label: string, size = 100,
  ) => {
    const r = (size - 12) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const dotX = cx + Math.max(-1, Math.min(1, x)) * r;
    const dotY = cy + Math.max(-1, Math.min(1, y)) * r;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 600 }}>{label}</span>
        <div style={{
          width: size, height: size, borderRadius: '50%',
          background: 'var(--color-bg-inset)', border: '1px solid var(--color-border-subtle)',
          position: 'relative',
        }}>
          <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
            <line x1={0} y1={cy} x2={size} y2={cy} stroke="var(--color-border-subtle)" strokeWidth="1" />
            <line x1={cx} y1={0} x2={cx} y2={size} stroke="var(--color-border-subtle)" strokeWidth="1" />
            {/* Deadzone ring */}
            {step === 'review' && (
              <circle cx={cx} cy={cy} r={r * innerDz} fill="none" stroke="var(--color-danger-base)" strokeWidth="1" strokeDasharray="3 3" opacity={0.5} />
            )}
            {step === 'review' && (
              <circle cx={cx} cy={cy} r={r * outerDz} fill="none" stroke="var(--color-gold-base)" strokeWidth="1" strokeDasharray="3 3" opacity={0.5} />
            )}
            <line x1={cx} y1={cy} x2={dotX} y2={dotY} stroke="var(--color-gold-base)" strokeWidth="2" strokeLinecap="round" />
            <circle cx={dotX} cy={dotY} r={5} fill="var(--color-gold-bright)" />
          </svg>
        </div>
        <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
          {x.toFixed(2)}, {y.toFixed(2)}
        </span>
      </div>
    );
  };

  // ── Step content ──
  return (
    <div className="hid-cal" style={{ maxWidth: 520 }}>
      <div className="input-cal__header">
        <span className="input-cal__title">
          {target ? `${target === 'left' ? 'Left' : 'Right'} Stick Calibration` : 'Stick Calibration'}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="input-cal__btn" onClick={onCancel}>Cancel</button>
        </div>
      </div>

      {/* Progress indicator */}
      <div style={{
        display: 'flex', gap: 8, margin: '8px 0 12px',
        fontSize: 12, fontWeight: 600,
      }}>
        {(['center', 'range', 'review'] as Step[]).map((s, i) => (
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
            {s === 'center' ? 'Center' : s === 'range' ? 'Range' : 'Review'}
          </div>
        ))}
      </div>

      {/* ── Step 1: Center ── */}
      {step === 'center' && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
            <strong>Leave {target ? `the ${target} stick` : 'both sticks'} at rest</strong> — don't touch {target ? 'it' : 'them'}. The software will record the idle center position.
          </p>

          {!centerDone ? (
            <div>
              <div style={{
                height: 6, background: 'var(--color-bg-inset)', borderRadius: 3,
                overflow: 'hidden', marginBottom: 12,
              }}>
                <div style={{
                  height: '100%', width: `${centerProgress * 100}%`,
                  background: 'var(--color-gold-base)', borderRadius: 3,
                  transition: 'width 0.1s',
                }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                Sampling... {Math.round(centerProgress * 100)}%
              </span>
            </div>
          ) : (
            <div>
              <div style={{
                display: 'grid', gridTemplateColumns: calibrateLeft && calibrateRight ? '1fr 1fr' : '1fr', gap: 8,
                fontSize: 12, fontFamily: 'monospace', marginBottom: 12,
                padding: 8, background: 'var(--color-bg-inset)', borderRadius: 6,
              }}>
                {calibrateLeft && <div>L Center: {centerValues.lx}, {centerValues.ly}</div>}
                {calibrateRight && <div>R Center: {centerValues.rx}, {centerValues.ry}</div>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="input-cal__btn input-cal__btn--primary"
                  onClick={() => {
                    // Initialize range tracking with center as baseline
                    const mm = {
                      lxMin: centerValues.lx, lxMax: centerValues.lx,
                      lyMin: centerValues.ly, lyMax: centerValues.ly,
                      rxMin: centerValues.rx, rxMax: centerValues.rx,
                      ryMin: centerValues.ry, ryMax: centerValues.ry,
                    };
                    rangeMinMaxRef.current = mm;
                    setRangeMinMax(mm);
                    setRangeDone(false);
                    setStep('range');
                  }}
                >
                  Next →
                </button>
                <button className="input-cal__btn" onClick={startCenter}>
                  Redo
                </button>
              </div>
            </div>
          )}

          {/* Live raw preview */}
          <div style={{ display: 'flex', gap: 20, marginTop: 16, justifyContent: 'center' }}>
            {calibrateLeft && renderStickPreview((rawLX - 2048) / 2048, -(rawLY - 2048) / 2048, 'L Stick (raw)')}
            {calibrateRight && renderStickPreview((rawRX - 2048) / 2048, -(rawRY - 2048) / 2048, 'R Stick (raw)')}
          </div>
          <div style={{
            display: 'flex', gap: 40, justifyContent: 'center', marginTop: 4,
            fontSize: 10, fontFamily: 'monospace', color: 'var(--color-text-muted)',
          }}>
            {calibrateLeft && <span>raw: {rawLX}, {rawLY}</span>}
            {calibrateRight && <span>raw: {rawRX}, {rawRY}</span>}
          </div>
        </div>
      )}

      {/* ── Step 2: Range ── */}
      {step === 'range' && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
            <strong>Slowly rotate {target ? `the ${target} stick` : 'both sticks'}</strong> in full circles, reaching the physical limits in all directions.
          </p>

          {/* Range info grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: calibrateLeft && calibrateRight ? '1fr 1fr' : '1fr', gap: 8,
            fontSize: 11, fontFamily: 'monospace', marginBottom: 12,
            padding: 8, background: 'var(--color-bg-inset)', borderRadius: 6,
          }}>
            {calibrateLeft && (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Left Stick</div>
              <div>X: {rangeMinMax.lxMin} — {rangeMinMax.lxMax} (Δ{rangeMinMax.lxMax - rangeMinMax.lxMin})</div>
              <div>Y: {rangeMinMax.lyMin} — {rangeMinMax.lyMax} (Δ{rangeMinMax.lyMax - rangeMinMax.lyMin})</div>
            </div>
            )}
            {calibrateRight && (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Right Stick</div>
              <div>X: {rangeMinMax.rxMin} — {rangeMinMax.rxMax} (Δ{rangeMinMax.rxMax - rangeMinMax.rxMin})</div>
              <div>Y: {rangeMinMax.ryMin} — {rangeMinMax.ryMax} (Δ{rangeMinMax.ryMax - rangeMinMax.ryMin})</div>
            </div>
            )}
          </div>

          {/* Live sticks — show with center-adjusted preview */}
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
            {calibrateLeft && renderStickPreview(
              (rawLX - centerValues.lx) / Math.max(rangeMinMax.lxMax - centerValues.lx, centerValues.lx - rangeMinMax.lxMin, 1),
              -(rawLY - centerValues.ly) / Math.max(rangeMinMax.lyMax - centerValues.ly, centerValues.ly - rangeMinMax.lyMin, 1),
              'L Stick',
            )}
            {calibrateRight && renderStickPreview(
              (rawRX - centerValues.rx) / Math.max(rangeMinMax.rxMax - centerValues.rx, centerValues.rx - rangeMinMax.rxMin, 1),
              -(rawRY - centerValues.ry) / Math.max(rangeMinMax.ryMax - centerValues.ry, centerValues.ry - rangeMinMax.ryMin, 1),
              'R Stick',
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              className="input-cal__btn input-cal__btn--primary"
              onClick={() => setStep('review')}
              disabled={!rangeDone}
            >
              Next →
            </button>
            <button
              className="input-cal__btn"
              onClick={() => setStep('center')}
            >
              ← Back
            </button>
            {!rangeDone && (
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', alignSelf: 'center' }}>
                Rotate {target ? `the ${target} stick` : 'both sticks'} fully to continue...
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Step 3: Review ── */}
      {step === 'review' && previewL && previewR && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
            <strong>Test the calibrated output</strong> — sticks should be centered at rest and reach the edge evenly. Adjust deadzones if needed.
          </p>

          {/* Deadzone sliders */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
            marginBottom: 16, padding: 8, background: 'var(--color-bg-inset)', borderRadius: 6,
          }}>
            <label style={{ fontSize: 12 }}>
              <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Inner Deadzone</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{(innerDz * 100).toFixed(0)}%</span>
              </span>
              <input type="range" min={0} max={30} value={innerDz * 100}
                style={{ width: '100%' }}
                onChange={(e) => setInnerDz(Number(e.target.value) / 100)}
              />
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                Eliminates stick drift near center
              </span>
            </label>
            <label style={{ fontSize: 12 }}>
              <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Outer Deadzone</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{(outerDz * 100).toFixed(0)}%</span>
              </span>
              <input type="range" min={70} max={100} value={outerDz * 100}
                style={{ width: '100%' }}
                onChange={(e) => setOuterDz(Number(e.target.value) / 100)}
              />
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                Reach full tilt before physical edge
              </span>
            </label>
          </div>

          {/* Live calibrated preview */}
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
            {calibrateLeft && renderStickPreview(previewL.x, previewL.y, 'L Stick (calibrated)', 120)}
            {calibrateRight && renderStickPreview(previewR.x, previewR.y, 'R Stick (calibrated)', 120)}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button
              className="input-cal__btn input-cal__btn--primary"
              onClick={() => onComplete(buildCalibration())}
            >
              Save Calibration
            </button>
            <button className="input-cal__btn" onClick={() => setStep('range')}>
              ← Back
            </button>
            <button className="input-cal__btn" onClick={() => {
              startCenter();
              setStep('center');
            }}>
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { applyCalibration };
export type { StickCalibrationData as StickCal };
