/* @layer renderer-components @kind data */
/**
 * 3-step analog stick calibration: record centre offsets at rest, then per-axis
 * min/max from a full rotation, then adjust deadzones and save.
 */

import type { CSSProperties } from 'react';
import { RangeInput, Box, Text, Button } from '../../../../../../design-system/primitives';
import { applyCalibration } from './stick-calibration.type';
import type { StickCalibrationWizardProps } from './stick-calibration.type';
import { useStickCalibration } from './useStickCalibration';
import { StickCircle } from './StickCircle';
import { StepIndicator } from './StepIndicator';

const S: Record<string, CSSProperties> = {
  panel: { maxWidth: 520 },
  para: { fontSize: 13, color: 'var(--c-text-dim)', margin: '0 0 12px' },
  row8: { display: 'flex', gap: 8 },
  actions12: { display: 'flex', gap: 8, marginTop: 12 },
  actions16: { display: 'flex', gap: 8, marginTop: 16 },
  progressTrack: { height: 6, background: 'var(--c-sunken)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
  sampling: { fontSize: 11, color: 'var(--c-text-muted)' },
  circlesRowTop: { display: 'flex', gap: 20, marginTop: 16, justifyContent: 'center' },
  circlesRow: { display: 'flex', gap: 20, justifyContent: 'center' },
  rawRow: { display: 'flex', gap: 40, justifyContent: 'center', marginTop: 4, fontSize: 10, fontFamily: 'monospace', color: 'var(--c-text-muted)' },
  stickHead: { fontWeight: 600, marginBottom: 4 },
  hint: { fontSize: 11, color: 'var(--c-text-muted)', alignSelf: 'center' },
  dzGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16, padding: 8, background: 'var(--c-sunken)', borderRadius: 6 },
  dzLabel: { fontSize: 12 },
  dzRow: { display: 'flex', justifyContent: 'space-between' },
  dzPct: { fontFamily: 'monospace', color: 'var(--c-text-muted)' },
  full: { width: '100%' },
  dzNote: { fontSize: 10, color: 'var(--c-text-muted)' },
};

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
    <Box className="hid-cal" style={S.panel}>
      <Box className="input-cal__header">
        <Text className="input-cal__title">
          {target ? `${target === 'left' ? 'Left' : 'Right'} Stick Calibration` : 'Stick Calibration'}
        </Text>
        <Box style={S.row8}>
          <Button variant="tertiary" size="sm" onClick={onCancel}>Cancel</Button>
        </Box>
      </Box>

      <StepIndicator currentStep={step} />

      {/* Step 1: Center */}
      {step === 'center' && (
        <Box>
          <Text as="p" style={S.para}>
            <Text as="strong">Leave {target ? `the ${target} stick` : 'both sticks'} at rest</Text>. Don't touch {target ? 'it' : 'them'}. The software will record the idle center position.
          </Text>
          {!centerDone ? (
            <Box>
              <Box style={S.progressTrack}>
                <Box style={{ height: '100%', width: `${centerProgress * 100}%`, background: 'var(--c-gold)', borderRadius: 3, transition: 'width 0.1s' }} />
              </Box>
              <Text style={S.sampling}>Sampling... {Math.round(centerProgress * 100)}%</Text>
            </Box>
          ) : (
            <Box>
              <Box style={{ display: 'grid', gridTemplateColumns: calibrateLeft && calibrateRight ? '1fr 1fr' : '1fr', gap: 8, fontSize: 12, fontFamily: 'monospace', marginBottom: 12, padding: 8, background: 'var(--c-sunken)', borderRadius: 6 }}>
                {calibrateLeft && <Box>L Center: {centerValues.lx}, {centerValues.ly}</Box>}
                {calibrateRight && <Box>R Center: {centerValues.rx}, {centerValues.ry}</Box>}
              </Box>
              <Box style={S.row8}>
                <Button variant="primary" size="sm" onClick={goToRange}>Next →</Button>
                <Button variant="tertiary" size="sm" onClick={startCenter}>Redo</Button>
              </Box>
            </Box>
          )}
          <Box style={S.circlesRowTop}>
            {calibrateLeft && <StickCircle x={(rawLX - 2048) / 2048} y={-(rawLY - 2048) / 2048} label="L Stick (raw)" />}
            {calibrateRight && <StickCircle x={(rawRX - 2048) / 2048} y={-(rawRY - 2048) / 2048} label="R Stick (raw)" />}
          </Box>
          <Box style={S.rawRow}>
            {calibrateLeft && <Text>raw: {rawLX}, {rawLY}</Text>}
            {calibrateRight && <Text>raw: {rawRX}, {rawRY}</Text>}
          </Box>
        </Box>
      )}

      {/* Step 2: Range */}
      {step === 'range' && (
        <Box>
          <Text as="p" style={S.para}>
            <Text as="strong">Slowly rotate {target ? `the ${target} stick` : 'both sticks'}</Text> in full circles, reaching the physical limits in all directions.
          </Text>
          <Box style={{ display: 'grid', gridTemplateColumns: calibrateLeft && calibrateRight ? '1fr 1fr' : '1fr', gap: 8, fontSize: 11, fontFamily: 'monospace', marginBottom: 12, padding: 8, background: 'var(--c-sunken)', borderRadius: 6 }}>
            {calibrateLeft && (
              <Box>
                <Box style={S.stickHead}>Left Stick</Box>
                <Box>X: {rangeMinMax.lxMin} to {rangeMinMax.lxMax} (Δ{rangeMinMax.lxMax - rangeMinMax.lxMin})</Box>
                <Box>Y: {rangeMinMax.lyMin} to {rangeMinMax.lyMax} (Δ{rangeMinMax.lyMax - rangeMinMax.lyMin})</Box>
              </Box>
            )}
            {calibrateRight && (
              <Box>
                <Box style={S.stickHead}>Right Stick</Box>
                <Box>X: {rangeMinMax.rxMin} to {rangeMinMax.rxMax} (Δ{rangeMinMax.rxMax - rangeMinMax.rxMin})</Box>
                <Box>Y: {rangeMinMax.ryMin} to {rangeMinMax.ryMax} (Δ{rangeMinMax.ryMax - rangeMinMax.ryMin})</Box>
              </Box>
            )}
          </Box>
          <Box style={S.circlesRow}>
            {calibrateLeft && <StickCircle
              x={(rawLX - centerValues.lx) / Math.max(rangeMinMax.lxMax - centerValues.lx, centerValues.lx - rangeMinMax.lxMin, 1)}
              y={-(rawLY - centerValues.ly) / Math.max(rangeMinMax.lyMax - centerValues.ly, centerValues.ly - rangeMinMax.lyMin, 1)}
              label="L Stick" />}
            {calibrateRight && <StickCircle
              x={(rawRX - centerValues.rx) / Math.max(rangeMinMax.rxMax - centerValues.rx, centerValues.rx - rangeMinMax.rxMin, 1)}
              y={-(rawRY - centerValues.ry) / Math.max(rangeMinMax.ryMax - centerValues.ry, centerValues.ry - rangeMinMax.ryMin, 1)}
              label="R Stick" />}
          </Box>
          <Box style={S.actions12}>
            <Button variant="primary" size="sm" onClick={() => setStep('review')} disabled={!rangeDone}>Next →</Button>
            <Button variant="tertiary" size="sm" onClick={() => setStep('center')}>← Back</Button>
            {!rangeDone && (
              <Text style={S.hint}>
                Rotate {target ? `the ${target} stick` : 'both sticks'} fully to continue...
              </Text>
            )}
          </Box>
        </Box>
      )}

      {/* Step 3: Review */}
      {step === 'review' && previewL && previewR && (
        <Box>
          <Text as="p" style={S.para}>
            <Text as="strong">Test the calibrated output</Text>. Sticks should be centered at rest and reach the edge evenly. Adjust deadzones if needed.
          </Text>
          <Box style={S.dzGrid}>
            <Text as="label" style={S.dzLabel}>
              <Text style={S.dzRow}>
                <Text>Inner Deadzone</Text>
                <Text style={S.dzPct}>{(innerDz * 100).toFixed(0)}%</Text>
              </Text>
              <RangeInput min={0} max={30} value={innerDz * 100} style={S.full} onChange={(e) => setInnerDz(Number(e.target.value) / 100)} />
              <Text style={S.dzNote}>Eliminates stick drift near center</Text>
            </Text>
            <Text as="label" style={S.dzLabel}>
              <Text style={S.dzRow}>
                <Text>Outer Deadzone</Text>
                <Text style={S.dzPct}>{(outerDz * 100).toFixed(0)}%</Text>
              </Text>
              <RangeInput min={70} max={100} value={outerDz * 100} style={S.full} onChange={(e) => setOuterDz(Number(e.target.value) / 100)} />
              <Text style={S.dzNote}>Reach full tilt before physical edge</Text>
            </Text>
          </Box>
          <Box style={S.circlesRow}>
            {calibrateLeft && <StickCircle x={previewL.x} y={previewL.y} label="L Stick (calibrated)" size={120} showDeadzones innerDeadzone={innerDz} outerDeadzone={outerDz} />}
            {calibrateRight && <StickCircle x={previewR.x} y={previewR.y} label="R Stick (calibrated)" size={120} showDeadzones innerDeadzone={innerDz} outerDeadzone={outerDz} />}
          </Box>
          <Box style={S.actions16}>
            <Button variant="primary" size="sm" onClick={() => onComplete(buildCalibration())}>Save Calibration</Button>
            <Button variant="tertiary" size="sm" onClick={() => setStep('range')}>← Back</Button>
            <Button variant="tertiary" size="sm" onClick={restart}>Start Over</Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export { StickCalibrationWizard };
