/* @layer renderer-appshell @kind logic */
import { wasmGetGameUIState } from '@app/lib/game';
import { UI_STATE_OFFSETS } from './nav-dump.constants';

const readRoomIndex = (): number | null => {
  const uiState = wasmGetGameUIState();
  if (!uiState) return null;
  const { heap, ptr } = uiState;
  return heap[ptr + UI_STATE_OFFSETS.roomIndex] | (heap[ptr + UI_STATE_OFFSETS.roomIndex + 1] << 8);
};

export { readRoomIndex };
