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

import { RangeInput, Box, Text } from '../../../../../../design-system/primitives';
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
    <Box className="hid-cal" style={{ maxWidth: 360 }}>
      <Box className="input-cal__header">
        <Text className="input-cal__title">{label} Calibration</Text>
        <Box style={{ display: 'flex', gap: 8 }}>
          <Box as="button" className="input-cal__btn" onClick={onCancel}>Cancel</Box>
        </Box>
      </Box>

      {/* Progress indicator */}
      <Box style={{
        display: 'flex', gap: 8, margin: '8px 0 12px',
        fontSize: 12, fontWeight: 600,
      }}>
        {(['rest', 'max', 'review'] as Step[]).map((s, i) => (
          <Box key={s} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            color: cal.step === s ? 'var(--color-gold-bright)' : 'var(--color-text-muted)',
          }}>
            <Text style={{
              width: 20, height: 20, borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: cal.step === s ? 'var(--color-gold-base)' : 'var(--color-bg-inset)',
              color: cal.step === s ? 'var(--color-bg-base)' : 'var(--color-text-muted)',
              fontSize: 11,
            }}>{i + 1}</Text>
            {s === 'rest' ? 'Rest' : s === 'max' ? 'Max' : 'Review'}
          </Box>
        ))}
      </Box>

      {/* ── Step 1: Rest ── */}
      {cal.step === 'rest' && (
        <Box>
          <Text as="p" style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
            <Text as="strong">Leave the {label} fully released</Text> — don't touch it. Recording the idle rest position.
          </Text>

          {!cal.restDone ? (
            <Box>
              <Box style={{
                height: 6, background: 'var(--color-bg-inset)', borderRadius: 3,
                overflow: 'hidden', marginBottom: 12,
              }}>
                <Box style={{
                  height: '100%', width: `${cal.restProgress * 100}%`,
                  background: 'var(--color-gold-base)', borderRadius: 3,
                  transition: 'width 0.1s',
                }} />
              </Box>
              <Text style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                Sampling... {Math.round(cal.restProgress * 100)}%
              </Text>
            </Box>
          ) : (
            <Box>
              <Box style={{
                fontSize: 12, fontFamily: 'monospace', marginBottom: 12,
                padding: 8, background: 'var(--color-bg-inset)', borderRadius: 6,
              }}>
                Rest value: {cal.baseValue.toFixed(3)}
              </Box>
              <Box style={{ display: 'flex', gap: 8 }}>
                <Box as="button" className="input-cal__btn input-cal__btn--primary" onClick={cal.advanceToMax}>
                  Next →
                </Box>
                <Box as="button" className="input-cal__btn" onClick={cal.resetRest}>Redo</Box>
              </Box>
            </Box>
          )}

          <Box style={{ display: 'flex', justifyContent: 'center', marginTop: 16, gap: 16, alignItems: 'flex-end' }}>
            <TriggerBar value={cal.rawValue} label={`${label} (raw)`} step={cal.step} deadzone={cal.deadzone} />
            <Box style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
              <Box>axis[{axisIndex}]: {cal.rawValue.toFixed(4)}</Box>
              {cal.rawByte !== null && <Box>byte: {cal.rawByte} (0x{cal.rawByte.toString(16).padStart(2, '0')})</Box>}
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Step 2: Max ── */}
      {cal.step === 'max' && (
        <Box>
          <Text as="p" style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
            <Text as="strong">Fully press the {label}</Text> and hold it down. The software tracks the maximum value.
          </Text>

          <Box style={{
            fontSize: 12, fontFamily: 'monospace', marginBottom: 12,
            padding: 8, background: 'var(--color-bg-inset)', borderRadius: 6,
          }}>
            <Box>Rest: {cal.baseValue.toFixed(3)}</Box>
            <Box>Max recorded: {cal.maxValue.toFixed(3)}</Box>
            <Box>Range: {(cal.maxValue - cal.baseValue).toFixed(3)}</Box>
          </Box>

          <Box style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <TriggerBar value={cal.rawValue} label={`${label} (live)`} step={cal.step} deadzone={cal.deadzone} />
          </Box>

          <Box style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Box
              as="button"
              className="input-cal__btn input-cal__btn--primary"
              onClick={() => cal.setStep('review')}
              disabled={cal.maxValue - cal.baseValue < 0.1}
            >
              Next →
            </Box>
            <Box as="button" className="input-cal__btn" onClick={() => cal.setStep('rest')}>← Back</Box>
            {cal.maxValue - cal.baseValue < 0.1 && (
              <Text style={{ fontSize: 11, color: 'var(--color-text-muted)', alignSelf: 'center' }}>
                Press the trigger fully...
              </Text>
            )}
          </Box>
        </Box>
      )}

      {/* ── Step 3: Review ── */}
      {cal.step === 'review' && (
        <Box>
          <Text as="p" style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
            <Text as="strong">Test the calibrated output.</Text> The trigger should read 0 at rest and 1 when fully pressed.
          </Text>

          <Box style={{
            marginBottom: 16, padding: 8, background: 'var(--color-bg-inset)', borderRadius: 6,
          }}>
            <Text as="label" style={{ fontSize: 12 }}>
              <Text style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Deadzone</Text>
                <Text style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{(cal.deadzone * 100).toFixed(0)}%</Text>
              </Text>
              <RangeInput min={0} max={20} value={cal.deadzone * 100}
                style={{ width: '100%' }}
                onChange={(e) => cal.setDeadzone(Number(e.target.value) / 100)}
              />
              <Text style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                Eliminates noise near rest position
              </Text>
            </Text>
          </Box>

          <Box style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
            <TriggerBar value={cal.rawValue} label="Raw" step={cal.step} deadzone={cal.deadzone} />
            <TriggerBar value={cal.calibratedValue()} label="Calibrated" step={cal.step} deadzone={cal.deadzone} />
          </Box>

          <Box style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Box
              as="button"
              className="input-cal__btn input-cal__btn--primary"
              onClick={() => onComplete({ base: cal.baseValue, max: cal.maxValue, deadzone: cal.deadzone })}
            >
              Save Calibration
            </Box>
            <Box as="button" className="input-cal__btn" onClick={() => cal.setStep('max')}>← Back</Box>
            <Box as="button" className="input-cal__btn" onClick={() => { cal.resetRest(); cal.setStep('rest'); }}>
              Start Over
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export { TriggerCalibrationWizard };
export type { TriggerCalibrationData };
