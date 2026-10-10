/* @layer renderer-components @kind types */
import type React from 'react';
import type { ByteColorResult, ByteStatus, GyroState } from '../hid-calibration.type';

interface ByteGridProps {
  latestBytes: Uint8Array;
  byteStatuses: ByteStatus[];
  gyroState: GyroState;
  stickPickMode: boolean;
  stickPickedBytes: number[];
  triggerPickMode: boolean;
  triggerPickedByte: number | null;
  inputPhaseActive: boolean;
  lastReportId: number;
  baselineRef: React.RefObject<Uint8Array>;
  excludedRef: React.RefObject<Set<number>>;
  itemsRef: React.RefObject<{ id: string; label: string; status: string }[]>;
  activeIdxRef: React.RefObject<number>;
  inputPhaseActiveRef: React.RefObject<boolean>;
  getByteColor: (idx: number) => ByteColorResult;
  onByteClick: (idx: number) => void;
}

export type { ByteGridProps };
