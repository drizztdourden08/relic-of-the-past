/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import { SaveRow } from '@app/compounds/SaveRow';
import type { SaveRowAction } from '@app/compounds/SaveRow';
import { NO_GAME_REASON } from '../home-tab.constants';
import { noticeOf } from '../undo/notice-of';
import { undoKey } from '../undo/undo-key';
import type { QuickSlotRowProps } from '../home-tab.type';

const QuickSlotRow = (props: QuickSlotRowProps) => {
  const { info, saves, isGameRunning, selection } = props;
  const { busySlot, undo, handleQuickSave, handleQuickLoad } = saves;
  const { slot, timestamp, screenshot } = info;
  const id = String(slot);
  const empty = !timestamp;

  const actions = useMemo((): SaveRowAction[] => [{
    id: 'save',
    icon: 'save',
    label: empty ? 'Save here' : 'Save over',
    disabledReason: isGameRunning ? undefined : NO_GAME_REASON,
    onSelect: () => void handleQuickSave(slot),
  }], [slot, empty, isGameRunning, handleQuickSave]);
  const handleActivate = useCallback(() => void handleQuickLoad(slot), [slot, handleQuickLoad]);

  return (
    <SaveRow
      rowKey={id}
      name={`Slot ${slot + 1}`}
      timestamp={empty ? null : timestamp}
      screenshotUrl={screenshot}
      busy={busySlot === slot}
      selected={selection.selectedId === id}
      tabIndex={selection.tabIndexOf(id)}
      notice={noticeOf(undo, undoKey('quick', slot))}
      onActivate={empty ? undefined : handleActivate}
      actions={actions}
    />
  );
};

export { QuickSlotRow };
