/* @layer renderer-appshell @kind logic */
import { wasmGetGameUIState } from '@app/game';
import type { NavLocation } from './nav-dump.type';
import { NO_PALACE, UI_STATE_OFFSETS } from './nav-dump.constants';

const readNavLocation = (): NavLocation => {
  const uiState = wasmGetGameUIState();
  if (!uiState) {
    return { roomIndex: 0, palaceIndex: NO_PALACE, overworldScreenIndex: 0, isIndoors: false, whichEntrance: 0 };
  }
  const { heap, ptr } = uiState;
  const u16At = (offset: number): number => heap[ptr + offset] | (heap[ptr + offset + 1] << 8);
  return {
    roomIndex: u16At(UI_STATE_OFFSETS.roomIndex),
    palaceIndex: u16At(UI_STATE_OFFSETS.palaceIndex),
    overworldScreenIndex: u16At(UI_STATE_OFFSETS.overworldScreenIndex),
    isIndoors: heap[ptr + UI_STATE_OFFSETS.isIndoors] !== 0,
    whichEntrance: heap[ptr + UI_STATE_OFFSETS.whichEntrance],
  };
};

export { readNavLocation };
