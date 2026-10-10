/* @layer renderer-appshell @kind logic */
import { wasmGetGameUIState } from '@app/game';
import { UI_STATE_OFFSETS } from './nav-dump.constants';
import { heapU16 } from './heap-u16';

const readRoomIndex = (): number | null => {
  const uiState = wasmGetGameUIState();
  if (!uiState) return null;
  const { heap, ptr } = uiState;
  return heapU16(heap, ptr + UI_STATE_OFFSETS.roomIndex);
};

export { readRoomIndex };
