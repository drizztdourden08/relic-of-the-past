/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import { SaveRow } from '@app/compounds/SaveRow';
import type { SaveRowAction } from '@app/compounds/SaveRow';
import { AUTO_TRIGGER_LABELS } from '../home-tab.constants';
import { noticeOf } from '../undo/notice-of';
import { undoKey } from '../undo/undo-key';
import type { AutoSaveRowProps } from '../home-tab.type';

const AutoSaveRow = (props: AutoSaveRowProps) => {
  const { save, saves, selection } = props;
  const { autoScreenshots, busyAuto, undo, handleLoadAuto, handleDeleteAuto } = saves;
  const { id, trigger, timestamp } = save;

  const actions = useMemo((): SaveRowAction[] => [
    { id: 'delete', icon: 'trash-2', label: 'Delete', shortcut: 'Del', onSelect: () => handleDeleteAuto(id) },
  ], [id, handleDeleteAuto]);
  const handleActivate = useCallback(() => void handleLoadAuto(id), [id, handleLoadAuto]);

  return (
    <SaveRow
      rowKey={id}
      name={AUTO_TRIGGER_LABELS[trigger]}
      timestamp={timestamp}
      screenshotUrl={autoScreenshots[id] ?? null}
      busy={busyAuto === id}
      selected={selection.selectedId === id}
      tabIndex={selection.tabIndexOf(id)}
      notice={noticeOf(undo, undoKey('auto', id))}
      onActivate={handleActivate}
      actions={actions}
    />
  );
};

export { AutoSaveRow };
