/* @layer renderer-components @kind component */
import { useState } from 'react';
import { EmptyState } from '@drizztdourden08/tessera/primitives';
import { ListDetailLayout } from '@drizztdourden08/tessera/composites';
import { MsuListPane } from './msu-manager/MsuListPane';
import { useMsuPackActions } from './msu-manager/useMsuPackActions';
import { PACK_SECTIONS } from './MsuManager.constants';
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

  return (
    <ListDetailLayout
      listShowTitle={false}
      listContainers={PACK_SECTIONS.map(({ section, title }) => ({
        title,
        content: (
          <MsuListPane
            section={section}
            msu={msu}
            nameInstalled={packFor(msu.newPackName.trim()) !== null}
            error={uninstallError}
            isInstalled={isInstalled}
            onDelete={handleDelete}
          />
        ),
      }))}
      detail={studio}
      emptyDetail={<EmptyState message={NO_PACK_MESSAGE} />}
      detailScroll={false}
      storageKey="msu-studio.list"
      listLabel="MSU studio"
      detailLabel="Music editor"
    />
  );
};

export { MsuManager };
