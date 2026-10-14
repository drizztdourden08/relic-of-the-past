/* @layer renderer-components @kind types */
import type { RefObject } from 'react';
import type { ControllerJoystickSample } from '@drizztdourden08/brock-input';
import type { ResolvedDevice } from '@rotp/input-mapping';
import type { InputItem } from '../../hid-calibration/hid-calibration.type';
import type { usePositionalSession } from './usePositionalSession';

interface PositionalTarget {
  id: string;
  kind: 'button' | 'axis';
  label: string;
  category: string;
  expectedIndex: number | null;
}

interface PositionalCaptureRecord {
  id: string;
  kind: 'button' | 'axis';
  askedLabel: string;
  status: 'captured' | 'skipped';
  firedIndex: number | null;
  firedPositionalName: string | null;
  expectedIndex: number | null;
  mismatch: boolean;
}

type AxisRanges = { min: number; max: number }[];

interface UsePositionalOneByOneProps {
  deviceKey: string | null;
  active: boolean;
  resolvedDevice: ResolvedDevice | null;
}

interface PositionalRefs {
  targetsRef: RefObject<PositionalTarget[]>;
  trimmedRef: RefObject<boolean>;
  activeIndexRef: RefObject<number>;
  inputPhaseActiveRef: RefObject<boolean>;
  autoAdvanceRef: RefObject<boolean>;
  baselineRef: RefObject<ControllerJoystickSample | null>;
  latestSampleRef: RefObject<ControllerJoystickSample | null>;
  rangesRef: RefObject<AxisRanges>;
  awaitingRestRef: RefObject<boolean>;
}

type PositionalAnswer = (status: PositionalCaptureRecord['status'], firedIndex: number | null) => void;

type PositionalSession = ReturnType<typeof usePositionalSession>;

interface SampleParams {
  refs: PositionalRefs;
  sample: ControllerJoystickSample;
  onAnswer: PositionalAnswer;
  onItemsChange: (items: InputItem[]) => void;
}

export type {
  AxisRanges, PositionalAnswer, PositionalCaptureRecord, PositionalRefs, PositionalSession, PositionalTarget,
  SampleParams, UsePositionalOneByOneProps,
};
