/* @layer renderer-components @kind component */
import { useCallback, useState } from 'react';
import { ItemList } from '@drizztdourden08/tessera/composites';
import type { ItemListCreate, ItemListRowState } from '@drizztdourden08/tessera/composites';
import type { NormalSaveInfo } from '@rotp/game-core';
import { SaveRowActions } from '@app/compounds/SaveRowActions';
import { useT, useText } from '@drizztdourden08/brock-react';
import type { HomeTabColumnsProps } from '../home-tab.type';
import { useArmedRow } from '../useArmedRow';
import { CreateSaveForm } from './CreateSaveForm';
import { saveRowParts } from './save-row-parts';

const idOf = (save: NormalSaveInfo) => save.id;
const nameOf = (save: NormalSaveInfo) => save.name;

const NormalSavesSection = (props: HomeTabColumnsProps) => {
  const { saves, isGameRunning } = props;
  const t = useT();
  const text = useText();
  const { normalSaves, normalScreenshots, busyNormal } = saves;
  const { handleCreateNormalSave, handleLoadNormal, handleOverwriteNormal, handleDeleteNormal, handleRenameNormal } = saves;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { armedOf, reportArmed } = useArmedRow();

  const render = useCallback((save: NormalSaveInfo) => saveRowParts({
    screenshotUrl: normalScreenshots[save.id] ?? null,
    timestamp: save.timestamp,
    busy: busyNormal === save.id,
    armed: armedOf(save.id),
  }, text), [normalScreenshots, busyNormal, armedOf, text]);

  const rowActions = useCallback((save: NormalSaveInfo, row: ItemListRowState) => (
    <SaveRowActions
      name={save.name}
      busy={busyNormal !== null}
      tabIndex={row.tabIndex}
      overwriteDisabledReason={isGameRunning ? undefined : t('profiles:home.saves.no-game')}
      onLoad={() => void handleLoadNormal(save.id)}
      onOverwrite={() => void handleOverwriteNormal(save.id)}
      onDelete={() => void handleDeleteNormal(save.id)}
      onArmedChange={(armed) => reportArmed(save.id, armed)}
    />
  ), [busyNormal, isGameRunning, handleLoadNormal, handleOverwriteNormal, handleDeleteNormal, reportArmed, t]);

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
      title={t('profiles:home.saves.title')}
      items={normalSaves}
      getId={idOf}
      getName={nameOf}
      render={render}
      rowActions={rowActions}
      actionVisibility="always"
      maxRows={6}
      create={create}
      newDisabled={isGameRunning ? false : t('profiles:home.saves.no-game')}
      createLabel={t('profiles:home.saves.new')}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onRename={handleRename}
      renameInline
      empty={t('profiles:home.saves.empty')}
    />
  );
};

export { NormalSavesSection };
