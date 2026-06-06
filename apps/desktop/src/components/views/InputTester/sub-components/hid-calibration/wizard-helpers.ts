/**
 * Helper utilities for the HID Calibration Wizard rendering and state.
 */
import type { AxisSubStep, ByteStatus, CaptureState, GyroState, InputItem } from './types';
import { AXIS_LABELS } from './constants';

// ── Byte Status Computation ─────────────────────────────────────────────────

const computeByteStatuses = (len: number, excluded: Set<number>, capturedStickBytes: Set<number>, capturedTriggerBytes: Set<number>, items: InputItem[]): ByteStatus[] => {
  const statuses: ByteStatus[] = new Array(len).fill('unknown');
  for (const i of excluded) {
    if (i < len) statuses[i] = 'gyro';
  }
  for (const i of capturedStickBytes) {
    if (i < len) statuses[i] = 'stick';
  }
  for (const i of capturedTriggerBytes) {
    if (i < len) statuses[i] = 'trigger';
  }
  for (const item of items) {
    if (item.mapping && item.status === 'captured') {
      const bi = item.mapping.byteIndex;
      if (bi < len) statuses[bi] = 'button';
    }
  }
  return statuses;
};

// ── Instruction Text ────────────────────────────────────────────────────────

const getInstructionText = (inputPhaseActive: boolean, items: InputItem[], activeIndex: number, captureState: CaptureState, axisSubStep: AxisSubStep): string => {
  if (!inputPhaseActive) return '';
  const item = items[activeIndex];
  if (!item) return '';
  if (item.status === 'captured') return `"${item.label}" captured — click another button or click a byte to reassign.`;
  if (captureState === 'confirming-press') return `Detecting "${item.label}"...`;
  if (captureState === 'waiting-release') return `Got it! Release "${item.label}"...`;
  if (item.kind === 'button') return `Press "${item.label}" on controller, or click a byte in the grid to assign manually.`;
  const info = AXIS_LABELS[item.id];
  if (axisSubStep === 'pos') return info?.pos ?? 'Push axis to positive extreme';
  return info?.neg ?? 'Push axis to negative extreme';
};

// ── Byte Color ──────────────────────────────────────────────────────────────

interface ByteColorResult {
  bg: string;
  border: string;
  text: string;
}

const getByteColor = (idx: number, byteStatuses: ByteStatus[], gyroState: GyroState, gyroChangedBytes: Set<number>): ByteColorResult => {
  if (gyroState === 'recording' && gyroChangedBytes.has(idx)) {
    return { bg: '#3b1a1a', border: '#f87171', text: '#f87171' };
  }
  const status = byteStatuses[idx] ?? 'unknown';
  switch (status) {
    case 'gyro': return { bg: '#1e1e2e', border: '#555', text: '#666' };
    case 'stick': return { bg: '#0f2a3d', border: '#38bdf8', text: '#38bdf8' };
    case 'trigger': return { bg: '#2d150f', border: '#fb923c', text: '#fb923c' };
    case 'button': return { bg: '#0f2e1a', border: '#4ade80', text: '#4ade80' };
    default: return { bg: '#1e1e2e', border: '#4a5568', text: '#c9d1d9' };
  }
};

export { computeByteStatuses, getInstructionText, getByteColor };
export type { ByteColorResult };
