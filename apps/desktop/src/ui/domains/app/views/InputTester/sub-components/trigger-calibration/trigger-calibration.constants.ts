/* @layer renderer-components @kind constants */
import type { CSSProperties } from 'react';
import type { CalibrationStepDef } from '../calibration-parts';
import type { Step } from './trigger-calibration.type';

const REST_SAMPLE_FRAMES = 60;
const DEFAULT_DEADZONE = 0.05;
const MIN_TRIGGER_RANGE = 0.1;
const FULL_PRESS_HIGHLIGHT = 0.9;
const LEFT_TRIGGER_AXIS = 4;
const RIGHT_TRIGGER_AXIS = 5;
const LEFT_TRIGGER_BYTE = 61;
const RIGHT_TRIGGER_BYTE = 62;

const TRIGGER_STEPS: readonly CalibrationStepDef<Step>[] = [
  { key: 'rest', label: 'Rest' },
  { key: 'max', label: 'Max' },
  { key: 'review', label: 'Review' },
];

const TRIGGER_WIZARD_STYLE: Record<string, CSSProperties> = {
  panel: { maxWidth: 360 },
  valueBox: { fontSize: 12, fontFamily: 'monospace', marginBottom: 12, padding: 8, background: 'var(--c-sunken)', borderRadius: 6 },
  barRow: { display: 'flex', justifyContent: 'center', marginTop: 16, gap: 16, alignItems: 'flex-end' },
  barRowCenter: { display: 'flex', justifyContent: 'center', marginTop: 8 },
  barRow24: { display: 'flex', gap: 24, justifyContent: 'center' },
  mono: { fontSize: 10, fontFamily: 'monospace', color: 'var(--c-text-muted)' },
  dzBox: { marginBottom: 16, padding: 8, background: 'var(--c-sunken)', borderRadius: 6 },
  barCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  barLabel: { fontSize: 11, color: 'var(--c-text-dim)', fontWeight: 600 },
  barValues: { fontSize: 10, fontFamily: 'monospace', color: 'var(--c-text-muted)' },
};

export {
  DEFAULT_DEADZONE, FULL_PRESS_HIGHLIGHT, LEFT_TRIGGER_AXIS, LEFT_TRIGGER_BYTE,
  MIN_TRIGGER_RANGE, REST_SAMPLE_FRAMES, RIGHT_TRIGGER_AXIS, RIGHT_TRIGGER_BYTE,
  TRIGGER_STEPS, TRIGGER_WIZARD_STYLE,
};
