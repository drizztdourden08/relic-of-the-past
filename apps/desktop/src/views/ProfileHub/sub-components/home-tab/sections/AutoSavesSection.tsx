/* @layer renderer-components @kind component */
import { useCallback, useState } from 'react';
import { ItemList } from '@drizztdourden08/tessera/composites';
import type { ItemListRowState } from '@drizztdourden08/tessera/composites';
import type { AutoSaveInfo } from '@rotp/game-core';
import { SaveRowActions } from '@app/compounds/SaveRowActions';
import { AUTO_TRIGGER_LABELS } from '../home-tab.constants';
import type { HomeTabColumnsProps } from '../home-tab.type';
import { useArmedRow } from '../useArmedRow';
import { saveRowParts } from './save-row-parts';

const idOf = (save: AutoSaveInfo) => save.id;
const nameOf = (save: AutoSaveInfo) => AUTO_TRIGGER_LABELS[save.trigger];

const AutoSavesSection = (props: HomeTabColumnsProps) => {
  const { saves } = props;
  const { autoSaves, autoScreenshots, busyAuto, handleLoadAuto, handleDeleteAuto } = saves;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { armedOf, reportArmed } = useArmedRow();

  const render = useCallback((save: AutoSaveInfo) => saveRowParts({
    screenshotUrl: autoScreenshots[save.id] ?? null,
    timestamp: save.timestamp,
    busy: busyAuto === save.id,
    armed: armedOf(save.id),
  }), [autoScreenshots, busyAuto, armedOf]);

  const rowActions = useCallback((save: AutoSaveInfo, row: ItemListRowState) => (
    <SaveRowActions
      name={`auto-save ${nameOf(save).toLowerCase()}`}
      busy={busyAuto !== null}
      tabIndex={row.tabIndex}
      onLoad={() => void handleLoadAuto(save.id)}
      onDelete={() => void handleDeleteAuto(save.id)}
      onArmedChange={(armed) => reportArmed(save.id, armed)}
    />
  ), [busyAuto, handleLoadAuto, handleDeleteAuto, reportArmed]);

  return (
    <ItemList
      title="Auto-saves"
      items={autoSaves}
      getId={idOf}
      getName={nameOf}
      render={render}
      rowActions={rowActions}
      actionVisibility="always"
      selectedId={selectedId}
      onSelect={setSelectedId}
      empty="No auto-saves yet"
    />
  );
};

export { AutoSavesSection };
