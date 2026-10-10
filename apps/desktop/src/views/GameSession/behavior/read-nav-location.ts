/* @layer renderer-appshell @kind logic */
import { wasmGetGameUIState } from '@app/game';
import type { NavLocation } from './nav-dump.type';
import { NO_PALACE, UI_STATE_OFFSETS } from './nav-dump.constants';
import { heapU16 } from './heap-u16';

const readNavLocation = (): NavLocation => {
  const uiState = wasmGetGameUIState();
  if (!uiState) {
    return { roomIndex: 0, palaceIndex: NO_PALACE, overworldScreenIndex: 0, isIndoors: false, whichEntrance: 0 };
  }
  const { heap, ptr } = uiState;
  const whichEntrance = heap[ptr + UI_STATE_OFFSETS.whichEntrance];
  if (whichEntrance === undefined) throw new Error('UI state block ends before its entrance byte');
  return {
    roomIndex: heapU16(heap, ptr + UI_STATE_OFFSETS.roomIndex),
    palaceIndex: heapU16(heap, ptr + UI_STATE_OFFSETS.palaceIndex),
    overworldScreenIndex: heapU16(heap, ptr + UI_STATE_OFFSETS.overworldScreenIndex),
    isIndoors: heap[ptr + UI_STATE_OFFSETS.isIndoors] !== 0,
    whichEntrance,
  };
};

export { readNavLocation };
