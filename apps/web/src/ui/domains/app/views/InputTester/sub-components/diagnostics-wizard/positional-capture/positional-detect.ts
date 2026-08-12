/* @layer renderer-components @kind logic */
/**
 * Pure helpers for usePositionalOneByOne: finding which joystick-level index
 * newly fired relative to a baseline sample, trimming the preset-built ask
 * list down to what the connected device actually reports, and turning one
 * detection into the record the summary/export step reads.
 */
import type { ControllerJoystickSample } from '@shared/ipc';
import { sdlAxisNameForIndex, sdlButtonNameForIndex } from '../../hid-calibration/diagnostics/sdl-names';
import { AXIS_LABELS } from '../../hid-calibration/hid-calibration.constants';
import type { PositionalCaptureRecord, PositionalTarget } from './positional-capture.type';

/** Minimum axis delta from baseline to count as "moved", not resting jitter. */
const AXIS_FIRED_THRESHOLD = 0.5;

/** How far an axis must travel end to end before its identity is trusted. A
 *  full stick sweep or a trigger pressed to the stop clears this easily; a
 *  knock or a resting drift does not. */
const AXIS_TRAVEL_THRESHOLD = 0.8;

/** Within this of the baseline counts as back at rest. */
const REST_EPSILON = 0.25;

/** Per-axis travel seen so far while one target is being captured. */
type AxisRanges = { min: number; max: number }[];

const startAxisRanges = (sample: ControllerJoystickSample): AxisRanges =>
  sample.axes.map((v) => ({ min: v, max: v }));

const growAxisRanges = (ranges: AxisRanges, sample: ControllerJoystickSample): AxisRanges =>
  sample.axes.map((v, i) => {
    const prev = ranges[i] ?? { min: v, max: v };
    return { min: Math.min(prev.min, v), max: Math.max(prev.max, v) };
  });

/** The axis that travelled furthest, once any has travelled far enough. */
const widestAxis = (ranges: AxisRanges): number | null => {
  let best = -1;
  let bestTravel = 0;
  for (let i = 0; i < ranges.length; i++) {
    const travel = ranges[i].max - ranges[i].min;
    if (travel > bestTravel) { bestTravel = travel; best = i; }
  }
  return bestTravel >= AXIS_TRAVEL_THRESHOLD ? best : null;
};

/** Everything back where it started: no button held that was not held at the
 *  baseline, and every axis returned near its baseline value. Capturing only
 *  once a controller is at rest is what stops one still-deflected stick from
 *  answering every remaining question in the list. */
const isAtRest = (baseline: ControllerJoystickSample, current: ControllerJoystickSample): boolean => {
  for (let i = 0; i < current.buttons.length; i++) {
    if (current.buttons[i] && !baseline.buttons[i]) return false;
  }
  for (let i = 0; i < current.axes.length; i++) {
    if (Math.abs(current.axes[i] - (baseline.axes[i] ?? 0)) > REST_EPSILON) return false;
  }
  return true;
};

/** The first index that transitioned (a button pressed, or an axis moved past
 *  the threshold) relative to `baseline`, or null while nothing new has fired. */
const detectFiredIndex = (
  target: PositionalTarget,
  baseline: ControllerJoystickSample,
  current: ControllerJoystickSample,
): number | null => {
  if (target.kind === 'button') {
    for (let i = 0; i < current.buttons.length; i++) {
      if (current.buttons[i] && !baseline.buttons[i]) return i;
    }
    return null;
  }
  for (let i = 0; i < current.axes.length; i++) {
    const base = baseline.axes[i] ?? 0;
    if (Math.abs(current.axes[i] - base) >= AXIS_FIRED_THRESHOLD) return i;
  }
  return null;
};

/** Drops targets the connected device structurally cannot answer: a button
 *  role whose expected positional index is past what this device reports.
 *  Axis targets have no expected index to check against, so every one stays
 *  askable; a device missing that control is answered with Skip instead. */
const trimTargetsToDevice = (targets: PositionalTarget[], sample: ControllerJoystickSample): PositionalTarget[] =>
  targets.filter((t) => t.kind === 'axis' || t.expectedIndex === null || t.expectedIndex < sample.buttons.length);

const positionalNameFor = (target: PositionalTarget, index: number): string | null =>
  target.kind === 'button' ? sdlButtonNameForIndex(index) : sdlAxisNameForIndex(index);

const buildRecord = (
  target: PositionalTarget,
  status: PositionalCaptureRecord['status'],
  firedIndex: number | null,
): PositionalCaptureRecord => ({
  id: target.id,
  kind: target.kind,
  askedLabel: target.label,
  status,
  firedIndex,
  firedPositionalName: firedIndex === null ? null : positionalNameFor(target, firedIndex),
  expectedIndex: target.expectedIndex,
  mismatch: status === 'captured' && target.expectedIndex !== null && firedIndex !== null && firedIndex !== target.expectedIndex,
});

const describeRecord = (record: PositionalCaptureRecord): string => {
  if (record.status === 'skipped') return 'skipped';
  const name = record.firedPositionalName ?? `index ${record.firedIndex}`;
  return record.mismatch ? `${name} (mismatch)` : name;
};

/** What the step asks the user to do for one target, phrased as a concrete
 *  action, using the same positive-direction wording byte-capture's stick
 *  step already uses for a recognized stick axis id. */
const instructionFor = (target: PositionalTarget): string => {
  if (target.kind === 'button') return `Press "${target.label}", then let go.`;
  if (isTriggerTarget(target)) return `Press "${target.label}" all the way down, then release it.`;
  return `Rotate "${target.label}" once all the way around, then let it centre.`;
};

/** Triggers travel one way and spring back; sticks sweep a circle. The prompt
 *  and the completion rule differ, so they are told apart by id. */
const isTriggerTarget = (target: PositionalTarget): boolean => /trigger|zl|zr|lt|rt|l2|r2/i.test(target.id);

export {
  buildRecord, describeRecord, detectFiredIndex, growAxisRanges, instructionFor,
  isAtRest, isTriggerTarget, startAxisRanges, trimTargetsToDevice, widestAxis,
};
export type { AxisRanges };
