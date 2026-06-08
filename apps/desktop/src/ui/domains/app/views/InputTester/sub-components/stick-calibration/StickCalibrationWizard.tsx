/* @layer renderer-components @kind data */
/**
 * StickCalibrationWizard — 3-step analog stick calibration orchestrator.
 *
 * Steps:
 *   1. Center:  Leave sticks at rest → record center offsets
 *   2. Range:   Rotate sticks fully → record per-axis min/max
 *   3. Review:  Adjust deadzones, test live output, save
 */

import { RangeInput } from '../../../../../../design-system/primitives';
import { applyCalibration } from './stick-calibration.type';
import type { StickCalibrationWizardProps } from './stick-calibration.type';
import { useStickCalibration } from './useStickCalibration';
import { StickCircle } from './StickCircle';
import { StepIndicator } from './StepIndicator';

const StickCalibrationWizard = (props: StickCalibrationWizardProps) => {
  const { onComplete, onCancel, existingCalibration, target, deviceKey } = props;

  const cal = useStickCalibration({ existingCalibration, target, deviceKey });
  const { step, setStep, calibrateLeft, calibrateRight } = cal;
  const { rawLX, rawLY, rawRX, rawRY } = cal;
  const { centerDone, centerProgress, centerValues, startCenter } = cal;
  const { rangeMinMax, rangeDone } = cal;
  const { innerDz, setInnerDz, outerDz, setOuterDz } = cal;
  const { buildCalibration, goToRange, restart } = cal;

  // Live preview (review step)
  const previewCal = step === 'review' ? buildCalibration() : null;
  const previewL = previewCal ? applyCalibration(rawLX, rawLY, previewCal.left) : null;
  const previewR = previewCal ? applyCalibration(rawRX, rawRY, previewCal.right) : null;

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

      <StepIndicator currentStep={step} />

      {/* Step 1: Center */}
      {step === 'center' && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
            <strong>Leave {target ? `the ${target} stick` : 'both sticks'} at rest</strong> — don't touch {target ? 'it' : 'them'}. The software will record the idle center position.
          </p>
          {!centerDone ? (
            <div>
              <div style={{ height: 6, background: 'var(--color-bg-inset)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ height: '100%', width: `${centerProgress * 100}%`, background: 'var(--color-gold-base)', borderRadius: 3, transition: 'width 0.1s' }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Sampling... {Math.round(centerProgress * 100)}%</span>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: calibrateLeft && calibrateRight ? '1fr 1fr' : '1fr', gap: 8, fontSize: 12, fontFamily: 'monospace', marginBottom: 12, padding: 8, background: 'var(--color-bg-inset)', borderRadius: 6 }}>
                {calibrateLeft && <div>L Center: {centerValues.lx}, {centerValues.ly}</div>}
                {calibrateRight && <div>R Center: {centerValues.rx}, {centerValues.ry}</div>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="input-cal__btn input-cal__btn--primary" onClick={goToRange}>Next →</button>
                <button className="input-cal__btn" onClick={startCenter}>Redo</button>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 20, marginTop: 16, justifyContent: 'center' }}>
            {calibrateLeft && <StickCircle x={(rawLX - 2048) / 2048} y={-(rawLY - 2048) / 2048} label="L Stick (raw)" />}
            {calibrateRight && <StickCircle x={(rawRX - 2048) / 2048} y={-(rawRY - 2048) / 2048} label="R Stick (raw)" />}
          </div>
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 4, fontSize: 10, fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
            {calibrateLeft && <span>raw: {rawLX}, {rawLY}</span>}
            {calibrateRight && <span>raw: {rawRX}, {rawRY}</span>}
          </div>
        </div>
      )}

      {/* Step 2: Range */}
      {step === 'range' && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
            <strong>Slowly rotate {target ? `the ${target} stick` : 'both sticks'}</strong> in full circles, reaching the physical limits in all directions.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: calibrateLeft && calibrateRight ? '1fr 1fr' : '1fr', gap: 8, fontSize: 11, fontFamily: 'monospace', marginBottom: 12, padding: 8, background: 'var(--color-bg-inset)', borderRadius: 6 }}>
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
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
            {calibrateLeft && <StickCircle
              x={(rawLX - centerValues.lx) / Math.max(rangeMinMax.lxMax - centerValues.lx, centerValues.lx - rangeMinMax.lxMin, 1)}
              y={-(rawLY - centerValues.ly) / Math.max(rangeMinMax.lyMax - centerValues.ly, centerValues.ly - rangeMinMax.lyMin, 1)}
              label="L Stick" />}
            {calibrateRight && <StickCircle
              x={(rawRX - centerValues.rx) / Math.max(rangeMinMax.rxMax - centerValues.rx, centerValues.rx - rangeMinMax.rxMin, 1)}
              y={-(rawRY - centerValues.ry) / Math.max(rangeMinMax.ryMax - centerValues.ry, centerValues.ry - rangeMinMax.ryMin, 1)}
              label="R Stick" />}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="input-cal__btn input-cal__btn--primary" onClick={() => setStep('review')} disabled={!rangeDone}>Next →</button>
            <button className="input-cal__btn" onClick={() => setStep('center')}>← Back</button>
            {!rangeDone && (
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', alignSelf: 'center' }}>
                Rotate {target ? `the ${target} stick` : 'both sticks'} fully to continue...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 'review' && previewL && previewR && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
            <strong>Test the calibrated output</strong> — sticks should be centered at rest and reach the edge evenly. Adjust deadzones if needed.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16, padding: 8, background: 'var(--color-bg-inset)', borderRadius: 6 }}>
            <label style={{ fontSize: 12 }}>
              <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Inner Deadzone</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{(innerDz * 100).toFixed(0)}%</span>
              </span>
              <RangeInput min={0} max={30} value={innerDz * 100} style={{ width: '100%' }} onChange={(e) => setInnerDz(Number(e.target.value) / 100)} />
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Eliminates stick drift near center</span>
            </label>
            <label style={{ fontSize: 12 }}>
              <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Outer Deadzone</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{(outerDz * 100).toFixed(0)}%</span>
              </span>
              <RangeInput min={70} max={100} value={outerDz * 100} style={{ width: '100%' }} onChange={(e) => setOuterDz(Number(e.target.value) / 100)} />
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Reach full tilt before physical edge</span>
            </label>
          </div>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
            {calibrateLeft && <StickCircle x={previewL.x} y={previewL.y} label="L Stick (calibrated)" size={120} showDeadzones innerDeadzone={innerDz} outerDeadzone={outerDz} />}
            {calibrateRight && <StickCircle x={previewR.x} y={previewR.y} label="R Stick (calibrated)" size={120} showDeadzones innerDeadzone={innerDz} outerDeadzone={outerDz} />}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="input-cal__btn input-cal__btn--primary" onClick={() => onComplete(buildCalibration())}>Save Calibration</button>
            <button className="input-cal__btn" onClick={() => setStep('range')}>← Back</button>
            <button className="input-cal__btn" onClick={restart}>Start Over</button>
          </div>
        </div>
      )}
    </div>
  );
};

export { StickCalibrationWizard };
