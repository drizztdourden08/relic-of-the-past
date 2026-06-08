/* @layer renderer-components @kind data */
/**
 * StickCalibrationWizard — 3-step analog stick calibration orchestrator.
 *
 * Steps:
 *   1. Center:  Leave sticks at rest → record center offsets
 *   2. Range:   Rotate sticks fully → record per-axis min/max
 *   3. Review:  Adjust deadzones, test live output, save
 */

import { RangeInput, Box, Text } from '../../../../../../design-system/primitives';
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
    <Box className="hid-cal" style={{ maxWidth: 520 }}>
      <Box className="input-cal__header">
        <Text className="input-cal__title">
          {target ? `${target === 'left' ? 'Left' : 'Right'} Stick Calibration` : 'Stick Calibration'}
        </Text>
        <Box style={{ display: 'flex', gap: 8 }}>
          <Box as="button" className="input-cal__btn" onClick={onCancel}>Cancel</Box>
        </Box>
      </Box>

      <StepIndicator currentStep={step} />

      {/* Step 1: Center */}
      {step === 'center' && (
        <Box>
          <Text as="p" style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
            <Text as="strong">Leave {target ? `the ${target} stick` : 'both sticks'} at rest</Text> — don't touch {target ? 'it' : 'them'}. The software will record the idle center position.
          </Text>
          {!centerDone ? (
            <Box>
              <Box style={{ height: 6, background: 'var(--color-bg-inset)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
                <Box style={{ height: '100%', width: `${centerProgress * 100}%`, background: 'var(--color-gold-base)', borderRadius: 3, transition: 'width 0.1s' }} />
              </Box>
              <Text style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Sampling... {Math.round(centerProgress * 100)}%</Text>
            </Box>
          ) : (
            <Box>
              <Box style={{ display: 'grid', gridTemplateColumns: calibrateLeft && calibrateRight ? '1fr 1fr' : '1fr', gap: 8, fontSize: 12, fontFamily: 'monospace', marginBottom: 12, padding: 8, background: 'var(--color-bg-inset)', borderRadius: 6 }}>
                {calibrateLeft && <Box>L Center: {centerValues.lx}, {centerValues.ly}</Box>}
                {calibrateRight && <Box>R Center: {centerValues.rx}, {centerValues.ry}</Box>}
              </Box>
              <Box style={{ display: 'flex', gap: 8 }}>
                <Box as="button" className="input-cal__btn input-cal__btn--primary" onClick={goToRange}>Next →</Box>
                <Box as="button" className="input-cal__btn" onClick={startCenter}>Redo</Box>
              </Box>
            </Box>
          )}
          <Box style={{ display: 'flex', gap: 20, marginTop: 16, justifyContent: 'center' }}>
            {calibrateLeft && <StickCircle x={(rawLX - 2048) / 2048} y={-(rawLY - 2048) / 2048} label="L Stick (raw)" />}
            {calibrateRight && <StickCircle x={(rawRX - 2048) / 2048} y={-(rawRY - 2048) / 2048} label="R Stick (raw)" />}
          </Box>
          <Box style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 4, fontSize: 10, fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
            {calibrateLeft && <Text>raw: {rawLX}, {rawLY}</Text>}
            {calibrateRight && <Text>raw: {rawRX}, {rawRY}</Text>}
          </Box>
        </Box>
      )}

      {/* Step 2: Range */}
      {step === 'range' && (
        <Box>
          <Text as="p" style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
            <Text as="strong">Slowly rotate {target ? `the ${target} stick` : 'both sticks'}</Text> in full circles, reaching the physical limits in all directions.
          </Text>
          <Box style={{ display: 'grid', gridTemplateColumns: calibrateLeft && calibrateRight ? '1fr 1fr' : '1fr', gap: 8, fontSize: 11, fontFamily: 'monospace', marginBottom: 12, padding: 8, background: 'var(--color-bg-inset)', borderRadius: 6 }}>
            {calibrateLeft && (
              <Box>
                <Box style={{ fontWeight: 600, marginBottom: 4 }}>Left Stick</Box>
                <Box>X: {rangeMinMax.lxMin} — {rangeMinMax.lxMax} (Δ{rangeMinMax.lxMax - rangeMinMax.lxMin})</Box>
                <Box>Y: {rangeMinMax.lyMin} — {rangeMinMax.lyMax} (Δ{rangeMinMax.lyMax - rangeMinMax.lyMin})</Box>
              </Box>
            )}
            {calibrateRight && (
              <Box>
                <Box style={{ fontWeight: 600, marginBottom: 4 }}>Right Stick</Box>
                <Box>X: {rangeMinMax.rxMin} — {rangeMinMax.rxMax} (Δ{rangeMinMax.rxMax - rangeMinMax.rxMin})</Box>
                <Box>Y: {rangeMinMax.ryMin} — {rangeMinMax.ryMax} (Δ{rangeMinMax.ryMax - rangeMinMax.ryMin})</Box>
              </Box>
            )}
          </Box>
          <Box style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
            {calibrateLeft && <StickCircle
              x={(rawLX - centerValues.lx) / Math.max(rangeMinMax.lxMax - centerValues.lx, centerValues.lx - rangeMinMax.lxMin, 1)}
              y={-(rawLY - centerValues.ly) / Math.max(rangeMinMax.lyMax - centerValues.ly, centerValues.ly - rangeMinMax.lyMin, 1)}
              label="L Stick" />}
            {calibrateRight && <StickCircle
              x={(rawRX - centerValues.rx) / Math.max(rangeMinMax.rxMax - centerValues.rx, centerValues.rx - rangeMinMax.rxMin, 1)}
              y={-(rawRY - centerValues.ry) / Math.max(rangeMinMax.ryMax - centerValues.ry, centerValues.ry - rangeMinMax.ryMin, 1)}
              label="R Stick" />}
          </Box>
          <Box style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Box as="button" className="input-cal__btn input-cal__btn--primary" onClick={() => setStep('review')} disabled={!rangeDone}>Next →</Box>
            <Box as="button" className="input-cal__btn" onClick={() => setStep('center')}>← Back</Box>
            {!rangeDone && (
              <Text style={{ fontSize: 11, color: 'var(--color-text-muted)', alignSelf: 'center' }}>
                Rotate {target ? `the ${target} stick` : 'both sticks'} fully to continue...
              </Text>
            )}
          </Box>
        </Box>
      )}

      {/* Step 3: Review */}
      {step === 'review' && previewL && previewR && (
        <Box>
          <Text as="p" style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
            <Text as="strong">Test the calibrated output</Text> — sticks should be centered at rest and reach the edge evenly. Adjust deadzones if needed.
          </Text>
          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16, padding: 8, background: 'var(--color-bg-inset)', borderRadius: 6 }}>
            <Text as="label" style={{ fontSize: 12 }}>
              <Text style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Inner Deadzone</Text>
                <Text style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{(innerDz * 100).toFixed(0)}%</Text>
              </Text>
              <RangeInput min={0} max={30} value={innerDz * 100} style={{ width: '100%' }} onChange={(e) => setInnerDz(Number(e.target.value) / 100)} />
              <Text style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Eliminates stick drift near center</Text>
            </Text>
            <Text as="label" style={{ fontSize: 12 }}>
              <Text style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Outer Deadzone</Text>
                <Text style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{(outerDz * 100).toFixed(0)}%</Text>
              </Text>
              <RangeInput min={70} max={100} value={outerDz * 100} style={{ width: '100%' }} onChange={(e) => setOuterDz(Number(e.target.value) / 100)} />
              <Text style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Reach full tilt before physical edge</Text>
            </Text>
          </Box>
          <Box style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
            {calibrateLeft && <StickCircle x={previewL.x} y={previewL.y} label="L Stick (calibrated)" size={120} showDeadzones innerDeadzone={innerDz} outerDeadzone={outerDz} />}
            {calibrateRight && <StickCircle x={previewR.x} y={previewR.y} label="R Stick (calibrated)" size={120} showDeadzones innerDeadzone={innerDz} outerDeadzone={outerDz} />}
          </Box>
          <Box style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Box as="button" className="input-cal__btn input-cal__btn--primary" onClick={() => onComplete(buildCalibration())}>Save Calibration</Box>
            <Box as="button" className="input-cal__btn" onClick={() => setStep('range')}>← Back</Box>
            <Box as="button" className="input-cal__btn" onClick={restart}>Start Over</Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export { StickCalibrationWizard };
