/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { ItemList } from '@drizztdourden08/tessera/composites';
import type { AutoSaveInfo } from '@rotp/game-core';
import { AUTO_TRIGGER_LABELS, UNDO_WINDOW_MS } from '../home-tab.constants';
import type { HomeTabColumnsProps } from '../home-tab.type';
import { saveRowParts } from './save-row-parts';

const idOf = (save: AutoSaveInfo) => save.id;
const nameOf = (save: AutoSaveInfo) => AUTO_TRIGGER_LABELS[save.trigger];

const AutoSavesSection = (props: HomeTabColumnsProps) => {
  const { saves } = props;
  const { autoSaves, autoScreenshots, busyAuto, handleLoadAuto, handleDeleteAuto } = saves;

  const render = useCallback((save: AutoSaveInfo) => saveRowParts({
    screenshotUrl: autoScreenshots[save.id] ?? null,
    timestamp: save.timestamp,
    busy: busyAuto === save.id,
  }), [autoScreenshots, busyAuto]);

  const handleActivate = useCallback((id: string) => {
    if (busyAuto === null) void handleLoadAuto(id);
  }, [busyAuto, handleLoadAuto]);

  return (
    <ItemList
      title="Auto-saves"
      items={autoSaves}
      getId={idOf}
      getName={nameOf}
      render={render}
      onActivate={handleActivate}
      onDelete={handleDeleteAuto}
      undoDelete={UNDO_WINDOW_MS}
      deleteKey
      empty="No auto-saves yet"
    />
  );
};

export { AutoSavesSection };
