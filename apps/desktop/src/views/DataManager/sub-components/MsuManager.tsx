/* @layer renderer-components @kind component */
import { useCallback, useState } from 'react';
import { EmptyState, Text } from '@drizztdourden08/tessera/primitives';
import { ListDetailLayout } from '@drizztdourden08/tessera/composites';
import { MsuCreateWizard } from './msu-manager/MsuCreateWizard';
import { MsuListPane } from './msu-manager/MsuListPane';
import { useMsuPackActions } from './msu-manager/useMsuPackActions';
import { CreateListPane } from '@app/compounds/CreateListPane';
import { useCreateFlow } from '@app/hooks/useCreateFlow';
import { useInstalledKind } from '@app/hooks/useInstalledKind';
import { InstalledOriginBar, useConfirmUninstall } from '@app/views/InstalledOriginBar';
import { useMsuManager } from '../../../msu-studio/useMsuManager';
import { MsuStudio } from '../../../msu-studio/MsuStudio';
import { NO_PACK_MESSAGE } from '../../../msu-studio/studio-frame/studio-frame.constants';
import type { StudioTab } from '../../../msu-studio/sound-labels';
import type { MsuManagerProps } from '../../../msu-studio/msu.type';

const MsuManager = (props: MsuManagerProps) => {
  const { onDeleteConfirm, onRefresh } = props;
  const msu = useMsuManager(onRefresh);
  const { selected, setSelected, refresh } = msu;
  const flow = useCreateFlow({ onSelect: setSelected });
  const [tab, setTab] = useState<StudioTab>('music');
  const { pack: installed, packFor } = useInstalledKind('music', selected);
  const { confirmUninstall, uninstallError } = useConfirmUninstall(onDeleteConfirm);

  const { isInstalled, refreshThenSelect, handleDelete, handleUninstalled } = useMsuPackActions({
    selected, setSelected, refresh, packFor, confirmUninstall, onDeleteConfirm,
  });

  const origin = installed === null ? null : (
    <InstalledOriginBar pack={installed} onDuplicated={refreshThenSelect} onUpdateInstalled={refreshThenSelect} onUninstalled={handleUninstalled} />
  );

  const studio = selected && (
    <MsuStudio
      msu={msu}
      pack={selected}
      readOnly={installed !== null}
      origin={origin}
      tab={tab}
      onTabChange={setTab}
      onDeleteConfirm={onDeleteConfirm}
    />
  );

  const isTaken = useCallback(
    (name: string) => packFor(name) !== null || msu.packs.some((pack) => pack.name === name),
    [packFor, msu.packs],
  );

  const notice = uninstallError === null ? null : <Text variant="caption" tone="danger" role="alert">{uninstallError}</Text>;

  const list = (
    <CreateListPane label="New MSU pack" creating={flow.creating} onCreate={flow.start} notice={notice}>
      <MsuListPane
        msu={msu}
        selected={flow.creating ? null : selected}
        isInstalled={isInstalled}
        onSelect={flow.select}
        onDelete={handleDelete}
      />
    </CreateListPane>
  );

  const detail = flow.creating
    ? <MsuCreateWizard refresh={refresh} isTaken={isTaken} onCancel={flow.cancel} onCreated={flow.select} />
    : studio;

  return (
    <ListDetailLayout
      listShowTitle={false}
      listContainers={[{ title: 'MSU packs', content: list }]}
      collapsed={flow.listCollapsed}
      onCollapsedChange={flow.setListCollapsed}
      detail={detail}
      emptyDetail={<EmptyState message={NO_PACK_MESSAGE} />}
      detailScroll={false}
      storageKey="msu-studio.list"
      listLabel="MSU studio"
      detailLabel="Music editor"
    />
  );
};

export { MsuManager };
