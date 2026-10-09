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
  baselineRef: React.MutableRefObject<Uint8Array>;
  excludedRef: React.MutableRefObject<Set<number>>;
  itemsRef: React.MutableRefObject<{ id: string; label: string; status: string }[]>;
  activeIdxRef: React.MutableRefObject<number>;
  inputPhaseActiveRef: React.MutableRefObject<boolean>;
  getByteColor: (idx: number) => ByteColorResult;
  onByteClick: (idx: number) => void;
}

export type { ByteGridProps };
