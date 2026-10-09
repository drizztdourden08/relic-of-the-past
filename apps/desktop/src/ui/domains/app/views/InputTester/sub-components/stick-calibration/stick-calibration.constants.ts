/* @layer renderer-components @kind constants */
import type { CSSProperties } from 'react';
import type { CalibrationStepDef } from '../calibration-parts';
import type { Step } from './stick-calibration.type';

const CENTER_SAMPLE_FRAMES = 60;
const DEFAULT_INNER_DEADZONE = 0.10;
const DEFAULT_OUTER_DEADZONE = 0.95;
const STICK_RAW_CENTER = 2048;
const STICK_RAW_MAX = 4095;
const MIN_STICK_RANGE = 500;

const STICK_STEPS: readonly CalibrationStepDef<Step>[] = [
  { key: 'center', label: 'Center' },
  { key: 'range', label: 'Range' },
  { key: 'review', label: 'Review' },
];

const STICK_WIZARD_STYLE: Record<string, CSSProperties> = {
  panel: { maxWidth: 520 },
  circlesRowTop: { display: 'flex', gap: 20, marginTop: 16, justifyContent: 'center' },
  circlesRow: { display: 'flex', gap: 20, justifyContent: 'center' },
  rawRow: { display: 'flex', gap: 40, justifyContent: 'center', marginTop: 4, fontSize: 10, fontFamily: 'monospace', color: 'var(--c-text-muted)' },
  stickHead: { fontWeight: 600, marginBottom: 4 },
  dzGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16, padding: 8, background: 'var(--c-sunken)', borderRadius: 6 },
  circleCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  circleLabel: { fontSize: 11, color: 'var(--c-text-dim)', fontWeight: 600 },
  svgAbs: { position: 'absolute', top: 0, left: 0 },
  circleValues: { fontSize: 10, fontFamily: 'monospace', color: 'var(--c-text-muted)' },
};

const VALUE_GRID_BASE: CSSProperties = {
  display: 'grid', gap: 8, fontFamily: 'monospace', marginBottom: 12,
  padding: 8, background: 'var(--c-sunken)', borderRadius: 6,
};

const CENTER_GRID_PAIR: CSSProperties = { ...VALUE_GRID_BASE, gridTemplateColumns: '1fr 1fr', fontSize: 12 };
const CENTER_GRID_SINGLE: CSSProperties = { ...VALUE_GRID_BASE, gridTemplateColumns: '1fr', fontSize: 12 };
const RANGE_GRID_PAIR: CSSProperties = { ...VALUE_GRID_BASE, gridTemplateColumns: '1fr 1fr', fontSize: 11 };
const RANGE_GRID_SINGLE: CSSProperties = { ...VALUE_GRID_BASE, gridTemplateColumns: '1fr', fontSize: 11 };

export {
  CENTER_GRID_PAIR, CENTER_GRID_SINGLE, CENTER_SAMPLE_FRAMES,
  DEFAULT_INNER_DEADZONE, DEFAULT_OUTER_DEADZONE, MIN_STICK_RANGE,
  RANGE_GRID_PAIR, RANGE_GRID_SINGLE, STICK_RAW_CENTER, STICK_RAW_MAX,
  STICK_STEPS, STICK_WIZARD_STYLE,
};
