/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import { SaveRow } from '@app/compounds/SaveRow';
import type { SaveRowAction } from '@app/compounds/SaveRow';
import { NO_GAME_REASON } from '../home-tab.constants';
import { noticeOf } from '../undo/notice-of';
import { undoKey } from '../undo/undo-key';
import type { NormalSaveRowProps } from '../home-tab.type';

const NormalSaveRow = (props: NormalSaveRowProps) => {
  const { save, saves, isGameRunning, selection, renaming, onStartRename, onRenameEnd } = props;
  const { normalScreenshots, busyNormal, undo, handleLoadNormal, handleOverwriteNormal, handleDeleteNormal } = saves;
  const { id, name, timestamp } = save;

  const actions = useMemo((): SaveRowAction[] => [
    {
      id: 'save',
      icon: 'save',
      label: 'Save over',
      disabledReason: isGameRunning ? undefined : NO_GAME_REASON,
      onSelect: () => void handleOverwriteNormal(id),
    },
    { id: 'rename', icon: 'pencil', label: 'Rename', shortcut: 'F2', onSelect: () => onStartRename(id) },
    { id: 'delete', icon: 'trash-2', label: 'Delete', shortcut: 'Del', onSelect: () => handleDeleteNormal(id) },
  ], [id, isGameRunning, handleOverwriteNormal, handleDeleteNormal, onStartRename]);
  const handleActivate = useCallback(() => void handleLoadNormal(id), [id, handleLoadNormal]);
  const handleRenameEnd = useCallback((next: string | null) => onRenameEnd(id, next), [id, onRenameEnd]);

  return (
    <SaveRow
      rowKey={id}
      name={name}
      timestamp={timestamp}
      screenshotUrl={normalScreenshots[id] ?? null}
      busy={busyNormal === id}
      selected={selection.selectedId === id}
      tabIndex={selection.tabIndexOf(id)}
      notice={noticeOf(undo, undoKey('normal', id))}
      renaming={renaming}
      onActivate={handleActivate}
      onRenameEnd={handleRenameEnd}
      actions={actions}
    />
  );
};

export { NormalSaveRow };
