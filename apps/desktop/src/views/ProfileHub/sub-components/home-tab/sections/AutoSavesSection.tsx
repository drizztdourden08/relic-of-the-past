/* @layer renderer-components @kind component */
import { useCallback, useState } from 'react';
import { ItemList } from '@drizztdourden08/tessera/composites';
import type { ItemListRowState } from '@drizztdourden08/tessera/composites';
import type { AutoSaveInfo } from '@rotp/game-core';
import { SaveRowActions } from '@app/compounds/SaveRowActions';
import { useT, useText } from '@drizztdourden08/brock-react';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { HomeTabColumnsProps } from '../home-tab.type';
import { useArmedRow } from '../useArmedRow';
import { saveRowParts } from './save-row-parts';

const idOf = (save: AutoSaveInfo) => save.id;
const nameOf = (save: AutoSaveInfo, t: I18n['t']) => (save.trigger === 'timer' ? t('profiles:home.auto.timer') : t('profiles:home.auto.quit'));

const AutoSavesSection = (props: HomeTabColumnsProps) => {
  const { saves } = props;
  const t = useT();
  const text = useText();
  const { autoSaves, autoScreenshots, busyAuto, handleLoadAuto, handleDeleteAuto } = saves;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { armedOf, reportArmed } = useArmedRow();

  const render = useCallback((save: AutoSaveInfo) => saveRowParts({
    screenshotUrl: autoScreenshots[save.id] ?? null,
    timestamp: save.timestamp,
    busy: busyAuto === save.id,
    armed: armedOf(save.id),
  }, text), [autoScreenshots, busyAuto, armedOf, text]);

  const rowActions = useCallback((save: AutoSaveInfo, row: ItemListRowState) => (
    <SaveRowActions
      name={t('profiles:home.auto.row-name', { name: nameOf(save, t).toLowerCase() })}
      busy={busyAuto !== null}
      tabIndex={row.tabIndex}
      onLoad={() => void handleLoadAuto(save.id)}
      onDelete={() => void handleDeleteAuto(save.id)}
      onArmedChange={(armed) => reportArmed(save.id, armed)}
    />
  ), [busyAuto, handleLoadAuto, handleDeleteAuto, reportArmed, t]);

  return (
    <ItemList
      title={t('profiles:home.auto.title')}
      items={autoSaves}
      getId={idOf}
      getName={(save) => nameOf(save, t)}
      render={render}
      rowActions={rowActions}
      actionVisibility="always"
      maxRows={6}
      selectedId={selectedId}
      onSelect={setSelectedId}
      empty={t('profiles:home.auto.empty')}
    />
  );
};

export { AutoSavesSection };
