/* @layer renderer-components @kind data */
/**
 * 2-step analog trigger calibration UI: record the idle base value, then the
 * fully pressed max. Saves per-axis calibration (base, max, deadzone).
 */

import type { CSSProperties } from 'react';
import { RangeInput, Box, Text, Button } from '../../../../../../design-system/primitives';
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

const S: Record<string, CSSProperties> = {
  panel: { maxWidth: 360 },
  row8: { display: 'flex', gap: 8 },
  progressBar: { display: 'flex', gap: 8, margin: '8px 0 12px', fontSize: 12, fontWeight: 600 },
  para: { fontSize: 13, color: 'var(--c-text-dim)', margin: '0 0 12px' },
  progressTrack: { height: 6, background: 'var(--c-sunken)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
  sampling: { fontSize: 11, color: 'var(--c-text-muted)' },
  valueBox: { fontSize: 12, fontFamily: 'monospace', marginBottom: 12, padding: 8, background: 'var(--c-sunken)', borderRadius: 6 },
  barRow: { display: 'flex', justifyContent: 'center', marginTop: 16, gap: 16, alignItems: 'flex-end' },
  barRowCenter: { display: 'flex', justifyContent: 'center', marginTop: 8 },
  barRow24: { display: 'flex', gap: 24, justifyContent: 'center' },
  mono: { fontSize: 10, fontFamily: 'monospace', color: 'var(--c-text-muted)' },
  actions12: { display: 'flex', gap: 8, marginTop: 12 },
  actions16: { display: 'flex', gap: 8, marginTop: 16 },
  hint: { fontSize: 11, color: 'var(--c-text-muted)', alignSelf: 'center' },
  dzBox: { marginBottom: 16, padding: 8, background: 'var(--c-sunken)', borderRadius: 6 },
  dzLabel: { fontSize: 12 },
  dzRow: { display: 'flex', justifyContent: 'space-between' },
  dzPct: { fontFamily: 'monospace', color: 'var(--c-text-muted)' },
  full: { width: '100%' },
  dzNote: { fontSize: 10, color: 'var(--c-text-muted)' },
};

const TriggerCalibrationWizard = (props: Props) => {
  const { axisIndex, label, onComplete, onCancel, existingCalibration, deviceKey } = props;

  const cal = useTriggerCalibration({ axisIndex, deviceKey, existingCalibration });

  return (
    <Box className="hid-cal" style={S.panel}>
      <Box className="input-cal__header">
        <Text className="input-cal__title">{label} Calibration</Text>
        <Box style={S.row8}>
          <Button variant="tertiary" size="sm" onClick={onCancel}>Cancel</Button>
        </Box>
      </Box>

      {/* Progress indicator */}
      <Box style={S.progressBar}>
        {(['rest', 'max', 'review'] as Step[]).map((s, i) => (
          <Box key={s} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            color: cal.step === s ? 'var(--c-gold-bright)' : 'var(--c-text-muted)',
          }}>
            <Text style={{
              width: 20, height: 20, borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: cal.step === s ? 'var(--c-gold)' : 'var(--c-sunken)',
              color: cal.step === s ? 'var(--c-bg)' : 'var(--c-text-muted)',
              fontSize: 11,
            }}>{i + 1}</Text>
            {s === 'rest' ? 'Rest' : s === 'max' ? 'Max' : 'Review'}
          </Box>
        ))}
      </Box>

      {/* ── Step 1: Rest ── */}
      {cal.step === 'rest' && (
        <Box>
          <Text as="p" style={S.para}>
            <Text as="strong">Leave the {label} fully released</Text>. Don't touch it. Recording the idle rest position.
          </Text>

          {!cal.restDone ? (
            <Box>
              <Box style={S.progressTrack}>
                <Box style={{
                  height: '100%', width: `${cal.restProgress * 100}%`,
                  background: 'var(--c-gold)', borderRadius: 3,
                  transition: 'width 0.1s',
                }} />
              </Box>
              <Text style={S.sampling}>
                Sampling... {Math.round(cal.restProgress * 100)}%
              </Text>
            </Box>
          ) : (
            <Box>
              <Box style={S.valueBox}>
                Rest value: {cal.baseValue.toFixed(3)}
              </Box>
              <Box style={S.row8}>
                <Button variant="primary" size="sm" onClick={cal.advanceToMax}>
                  Next →
                </Button>
                <Button variant="tertiary" size="sm" onClick={cal.resetRest}>Redo</Button>
              </Box>
            </Box>
          )}

          <Box style={S.barRow}>
            <TriggerBar value={cal.rawValue} label={`${label} (raw)`} step={cal.step} deadzone={cal.deadzone} />
            <Box style={S.mono}>
              <Box>axis[{axisIndex}]: {cal.rawValue.toFixed(4)}</Box>
              {cal.rawByte !== null && <Box>byte: {cal.rawByte} (0x{cal.rawByte.toString(16).padStart(2, '0')})</Box>}
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Step 2: Max ── */}
      {cal.step === 'max' && (
        <Box>
          <Text as="p" style={S.para}>
            <Text as="strong">Fully press the {label}</Text> and hold it down. The software tracks the maximum value.
          </Text>

          <Box style={S.valueBox}>
            <Box>Rest: {cal.baseValue.toFixed(3)}</Box>
            <Box>Max recorded: {cal.maxValue.toFixed(3)}</Box>
            <Box>Range: {(cal.maxValue - cal.baseValue).toFixed(3)}</Box>
          </Box>

          <Box style={S.barRowCenter}>
            <TriggerBar value={cal.rawValue} label={`${label} (live)`} step={cal.step} deadzone={cal.deadzone} />
          </Box>

          <Box style={S.actions12}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => cal.setStep('review')}
              disabled={cal.maxValue - cal.baseValue < 0.1}
            >
              Next →
            </Button>
            <Button variant="tertiary" size="sm" onClick={() => cal.setStep('rest')}>← Back</Button>
            {cal.maxValue - cal.baseValue < 0.1 && (
              <Text style={S.hint}>
                Press the trigger fully...
              </Text>
            )}
          </Box>
        </Box>
      )}

      {/* ── Step 3: Review ── */}
      {cal.step === 'review' && (
        <Box>
          <Text as="p" style={S.para}>
            <Text as="strong">Test the calibrated output.</Text> The trigger should read 0 at rest and 1 when fully pressed.
          </Text>

          <Box style={S.dzBox}>
            <Text as="label" style={S.dzLabel}>
              <Text style={S.dzRow}>
                <Text>Deadzone</Text>
                <Text style={S.dzPct}>{(cal.deadzone * 100).toFixed(0)}%</Text>
              </Text>
              <RangeInput min={0} max={20} value={cal.deadzone * 100}
                style={S.full}
                onChange={(e) => cal.setDeadzone(Number(e.target.value) / 100)}
              />
              <Text style={S.dzNote}>
                Eliminates noise near rest position
              </Text>
            </Text>
          </Box>

          <Box style={S.barRow24}>
            <TriggerBar value={cal.rawValue} label="Raw" step={cal.step} deadzone={cal.deadzone} />
            <TriggerBar value={cal.calibratedValue()} label="Calibrated" step={cal.step} deadzone={cal.deadzone} />
          </Box>

          <Box style={S.actions16}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onComplete({ base: cal.baseValue, max: cal.maxValue, deadzone: cal.deadzone })}
            >
              Save Calibration
            </Button>
            <Button variant="tertiary" size="sm" onClick={() => cal.setStep('max')}>← Back</Button>
            <Button variant="tertiary" size="sm" onClick={() => { cal.resetRest(); cal.setStep('rest'); }}>
              Start Over
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export { TriggerCalibrationWizard };
export type { TriggerCalibrationData };
