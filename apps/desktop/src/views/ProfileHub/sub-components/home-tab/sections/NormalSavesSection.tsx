/* @layer renderer-components @kind component */
import { useCallback, useState } from 'react';
import { ItemList } from '@drizztdourden08/tessera/composites';
import type { ItemListCreate, ItemListRowState } from '@drizztdourden08/tessera/composites';
import type { NormalSaveInfo } from '@rotp/game-core';
import { SaveRowActions } from '@app/compounds/SaveRowActions';
import { NO_GAME_REASON } from '../home-tab.constants';
import type { HomeTabColumnsProps } from '../home-tab.type';
import { useArmedRow } from '../useArmedRow';
import { CreateSaveForm } from './CreateSaveForm';
import { saveRowParts } from './save-row-parts';

const idOf = (save: NormalSaveInfo) => save.id;
const nameOf = (save: NormalSaveInfo) => save.name;

const NormalSavesSection = (props: HomeTabColumnsProps) => {
  const { saves, isGameRunning } = props;
  const { normalSaves, normalScreenshots, busyNormal } = saves;
  const { handleCreateNormalSave, handleLoadNormal, handleOverwriteNormal, handleDeleteNormal, handleRenameNormal } = saves;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { armedOf, reportArmed } = useArmedRow();

  const render = useCallback((save: NormalSaveInfo) => saveRowParts({
    screenshotUrl: normalScreenshots[save.id] ?? null,
    timestamp: save.timestamp,
    busy: busyNormal === save.id,
    armed: armedOf(save.id),
  }), [normalScreenshots, busyNormal, armedOf]);

  const rowActions = useCallback((save: NormalSaveInfo, row: ItemListRowState) => (
    <SaveRowActions
      name={save.name}
      busy={busyNormal !== null}
      tabIndex={row.tabIndex}
      overwriteDisabledReason={isGameRunning ? undefined : NO_GAME_REASON}
      onLoad={() => void handleLoadNormal(save.id)}
      onOverwrite={() => void handleOverwriteNormal(save.id)}
      onDelete={() => void handleDeleteNormal(save.id)}
      onArmedChange={(armed) => reportArmed(save.id, armed)}
    />
  ), [busyNormal, isGameRunning, handleLoadNormal, handleOverwriteNormal, handleDeleteNormal, reportArmed]);

  const create = useCallback<ItemListCreate>((close) => {
    const handleCreate = (name: string) => {
      void handleCreateNormalSave(name).then((id) => {
        if (id) setSelectedId(id);
        close();
      });
    };
    return <CreateSaveForm onCreate={handleCreate} onCancel={close} />;
  }, [handleCreateNormalSave]);

  const handleRename = useCallback((id: string, name: string) => void handleRenameNormal(id, name), [handleRenameNormal]);

  return (
    <ItemList
      title="Saves"
      items={normalSaves}
      getId={idOf}
      getName={nameOf}
      render={render}
      rowActions={rowActions}
      actionVisibility="always"
      maxRows={6}
      create={create}
      newDisabled={isGameRunning ? false : NO_GAME_REASON}
      createLabel="New save"
      selectedId={selectedId}
      onSelect={setSelectedId}
      onRename={handleRename}
      renameInline
      empty="No saves yet"
    />
  );
};

export { NormalSavesSection };
