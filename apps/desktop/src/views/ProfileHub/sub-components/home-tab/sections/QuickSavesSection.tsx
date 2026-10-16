/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { ItemList } from '@drizztdourden08/tessera/composites';
import type { ItemListRowState } from '@drizztdourden08/tessera/composites';
import { NO_GAME_REASON } from '../home-tab.constants';
import type { HomeTabColumnsProps, SlotInfo } from '../home-tab.type';
import { SaveOverButton } from './SaveOverButton';
import { saveRowParts } from './save-row-parts';

const idOf = (info: SlotInfo) => String(info.slot);
const nameOf = (info: SlotInfo) => `Slot ${info.slot + 1}`;

const QuickSavesSection = (props: HomeTabColumnsProps) => {
  const { saves, isGameRunning } = props;
  const { slots, busySlot, handleQuickSave, handleQuickLoad } = saves;

  const render = useCallback((info: SlotInfo) => saveRowParts({
    screenshotUrl: info.screenshot,
    timestamp: info.timestamp,
    busy: busySlot === info.slot,
  }), [busySlot]);

  const rowActions = useCallback((info: SlotInfo, row: ItemListRowState) => (
    <SaveOverButton
      label={info.timestamp === null ? 'Save here' : 'Save over'}
      disabledReason={isGameRunning ? undefined : NO_GAME_REASON}
      tabIndex={row.tabIndex}
      onSave={() => void handleQuickSave(info.slot)}
    />
  ), [isGameRunning, handleQuickSave]);

  const handleActivate = useCallback((id: string) => {
    const info = slots.find((slot) => idOf(slot) === id);
    if (info !== undefined && info.timestamp !== null && busySlot === null) void handleQuickLoad(info.slot);
  }, [slots, busySlot, handleQuickLoad]);

  return (
    <ItemList
      title="Quick saves"
      items={slots}
      getId={idOf}
      getName={nameOf}
      render={render}
      rowActions={rowActions}
      onActivate={handleActivate}
      filter={false}
    />
  );
};

export { QuickSavesSection };
