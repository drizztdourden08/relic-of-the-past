/* @layer renderer-components @kind types */
import type React from 'react';
import type { ByteColorKey, ByteStatus, GyroState } from '../hid-calibration.type';

type ByteGridItem = { id: string; label: string; status: string };

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
  itemsRef: React.RefObject<ByteGridItem[]>;
  activeIdxRef: React.RefObject<number>;
  inputPhaseActiveRef: React.RefObject<boolean>;
  getByteColorKey: (idx: number) => ByteColorKey;
  onByteClick: (idx: number) => void;
}

type BytePickMode = 'stick' | 'trigger' | 'none';

interface ByteCellTitleParams {
  index: number;
  value: number;
  status: ByteStatus;
  pickMode: BytePickMode;
  isPicked: boolean;
  activeItem: ByteGridItem | undefined;
}

interface ByteCellState {
  delta: number;
  signed: boolean;
  isPicked: boolean;
  dimmed: boolean;
  title: string;
}

interface ByteCellProps {
  index: number;
  value: number;
  grid: ByteGridProps;
}

type ByteGridLegendProps = Pick<ByteGridProps, 'gyroState' | 'stickPickMode' | 'triggerPickMode'>;

export type { ByteCellProps, ByteCellState, ByteCellTitleParams, ByteGridItem, ByteGridLegendProps, ByteGridProps, BytePickMode };
