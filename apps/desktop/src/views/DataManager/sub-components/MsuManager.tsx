/* @layer renderer-components @kind component */
import { useState } from 'react';
import { ImportForm } from './ImportForm';
import { MSU_IMPORT_COPY } from './msu-manager/msu-manager.constants';
import { useMsuPackActions } from './msu-manager/useMsuPackActions';
import { EmptyState, Text } from '@drizztdourden08/tessera/primitives';
import { ListDetailLayout } from '@drizztdourden08/tessera/composites';
import { useInstalledKind } from '@app/hooks/useInstalledKind';
import { InstalledOriginBar, useConfirmUninstall } from '@app/views/InstalledOriginBar';
import { useMsuManager } from '../../../msu-studio/useMsuManager';
import { MsuPackList } from '../../../msu-studio/MsuPackList';
import { MsuPackToolbar } from '../../../msu-studio/MsuPackToolbar';
import { MsuStudio } from '../../../msu-studio/MsuStudio';
import type { StudioTab } from '../../../msu-studio/sound-labels';
import type { MsuManagerProps } from '../../../msu-studio/msu.type';

const MsuManager = (props: MsuManagerProps) => {
  const { onDeleteConfirm, onRefresh } = props;
  const msu = useMsuManager(onRefresh);
  const { selected, setSelected, refresh } = msu;
  const [tab, setTab] = useState<StudioTab>('music');
  const { pack: installed, packFor } = useInstalledKind('music', selected);
  const { confirmUninstall, uninstallError } = useConfirmUninstall(onDeleteConfirm);
  const nameInstalled = packFor(msu.newPackName.trim()) !== null;

  const { isInstalled, refreshThenSelect, handleDelete, handleUninstalled } = useMsuPackActions({
    selected, setSelected, refresh, packFor, confirmUninstall, onDeleteConfirm,
  });

  const list = (
    <>
      <MsuPackToolbar
        name={msu.newPackName}
        busy={msu.busy}
        nameInstalled={nameInstalled}
        onNameChange={msu.setNewPackName}
        onCreate={msu.handleCreatePack}
      />
      <ImportForm
        kind="msu"
        {...MSU_IMPORT_COPY}
        disabled={nameInstalled}
        onUrlImport={msu.handleUrlImport}
        onFileImport={msu.handleFileImport}
      />
      {uninstallError !== null && <Text className="import-form__status import-form__status--error">{uninstallError}</Text>}
      <MsuPackList
        packs={msu.packs}
        selected={selected}
        isInstalled={isInstalled}
        onSelect={setSelected}
        onDelete={handleDelete}
      />
    </>
  );

  const origin = installed === null ? null : (
    <InstalledOriginBar pack={installed} onDuplicated={refreshThenSelect} onUpdateInstalled={refreshThenSelect} onUninstalled={handleUninstalled} />
  );

  const studio = msu.loadingFiles || selected === null ? <Text>Loading...</Text> : (
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
      list={list}
      detail={selected === null ? null : studio}
      emptyDetail={<EmptyState message="Select a music pack to edit its slots, layers and sounds" />}
    />
  );
};

export { MsuManager };
