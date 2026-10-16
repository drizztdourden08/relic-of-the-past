/* @layer renderer-components @kind component */
import { useCallback, useState } from 'react';
import { ItemList } from '@drizztdourden08/tessera/composites';
import type { ItemListCreate, ItemListRowState } from '@drizztdourden08/tessera/composites';
import type { NormalSaveInfo } from '@rotp/game-core';
import { NO_GAME_REASON, UNDO_WINDOW_MS } from '../home-tab.constants';
import type { HomeTabColumnsProps } from '../home-tab.type';
import { CreateSaveForm } from './CreateSaveForm';
import { SaveOverButton } from './SaveOverButton';
import { saveRowParts } from './save-row-parts';

const idOf = (save: NormalSaveInfo) => save.id;
const nameOf = (save: NormalSaveInfo) => save.name;

const NormalSavesSection = (props: HomeTabColumnsProps) => {
  const { saves, isGameRunning } = props;
  const { normalSaves, normalScreenshots, busyNormal } = saves;
  const { handleCreateNormalSave, handleLoadNormal, handleOverwriteNormal, handleDeleteNormal, handleRenameNormal } = saves;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const render = useCallback((save: NormalSaveInfo) => saveRowParts({
    screenshotUrl: normalScreenshots[save.id] ?? null,
    timestamp: save.timestamp,
    busy: busyNormal === save.id,
  }), [normalScreenshots, busyNormal]);

  const rowActions = useCallback((save: NormalSaveInfo, row: ItemListRowState) => (
    <SaveOverButton
      label="Save over"
      disabledReason={isGameRunning ? undefined : NO_GAME_REASON}
      tabIndex={row.tabIndex}
      onSave={() => void handleOverwriteNormal(save.id)}
    />
  ), [isGameRunning, handleOverwriteNormal]);

  const create = useCallback<ItemListCreate>((close) => {
    const handleCreate = (name: string) => {
      void handleCreateNormalSave(name).then((id) => {
        if (id) setSelectedId(id);
        close();
      });
    };
    return <CreateSaveForm onCreate={handleCreate} onCancel={close} />;
  }, [handleCreateNormalSave]);

  const handleActivate = useCallback((id: string) => {
    if (busyNormal === null) void handleLoadNormal(id);
  }, [busyNormal, handleLoadNormal]);

  const handleRename = useCallback((id: string, name: string) => void handleRenameNormal(id, name), [handleRenameNormal]);

  return (
    <ItemList
      title="Saves"
      items={normalSaves}
      getId={idOf}
      getName={nameOf}
      render={render}
      rowActions={rowActions}
      create={create}
      newDisabled={isGameRunning ? false : NO_GAME_REASON}
      createLabel="New save"
      selectedId={selectedId}
      onSelect={setSelectedId}
      onActivate={handleActivate}
      onRename={handleRename}
      onDelete={handleDeleteNormal}
      undoDelete={UNDO_WINDOW_MS}
      deleteKey
      empty="No saves yet"
    />
  );
};

export { NormalSavesSection };
