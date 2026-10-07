/* @layer renderer-components @kind component */
/**
 * The music packs: the list with create and import, and the selected pack's studio. A pack
 * installed from the Hookshop is read only: its row carries the lock, its studio opens under
 * the origin bar, and Delete uninstalls it the way the Hookshop tab does.
 */
import { useCallback, useState } from 'react';
import { ImportForm } from './ImportForm';
import { Text } from '../../../../../design-system/primitives/Text';
import { MasterDetailLayout } from '../../../../../design-system/composites/MasterDetailLayout';
import { deleteMsuPack } from '@app/lib/storage/msu-store';
import { useInstalledKind } from '@app/hooks/useInstalledKind';
import { InstalledOriginBar, useConfirmUninstall } from '@domains/app/views/InstalledOriginBar';
import { useMsuManager } from './msu/useMsuManager';
import { MsuPackList } from './msu/MsuPackList';
import { MsuPackToolbar } from './msu/MsuPackToolbar';
import { MsuStudio } from './msu/MsuStudio';
import type { StudioTab } from './msu/sound-labels';
import type { MsuManagerProps } from './msu/msu.type';

const MsuManager = (props: MsuManagerProps) => {
  const { onDeleteConfirm, onRefresh } = props;
  const msu = useMsuManager(onRefresh);
  const { selected, setSelected, refresh } = msu;
  const [tab, setTab] = useState<StudioTab>('music');
  const { pack: installed, packFor } = useInstalledKind('music', selected);
  const { confirmUninstall, uninstallError } = useConfirmUninstall(onDeleteConfirm);
  const nameInstalled = packFor(msu.newPackName.trim()) !== null;

  const isInstalled = useCallback((name: string) => packFor(name) !== null, [packFor]);

  // After a duplicate or an update the pack to show may be one the list has not read yet.
  const select = useCallback((name: string) => {
    void refresh().then(() => setSelected(name));
  }, [refresh, setSelected]);

  const forget = useCallback(async (packName: string) => {
    if (selected === packName) setSelected(null);
    await refresh();
  }, [selected, setSelected, refresh]);

  const handleDelete = useCallback((packName: string) => {
    const owner = packFor(packName);
    if (owner) {
      confirmUninstall(owner, () => { void forget(packName); });
      return;
    }
    onDeleteConfirm('Delete Music Pack', `Delete pack "${packName}"? This cannot be undone.`, async () => {
      await deleteMsuPack(packName);
      await forget(packName);
    });
  }, [packFor, confirmUninstall, forget, onDeleteConfirm]);

  const handleUninstalled = useCallback(() => {
    if (selected !== null) void forget(selected);
  }, [selected, forget]);

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
        placeholder="Paste pack download URL..."
        accept={['.msul', '.zip', '.7z', '.rar']}
        dropLabel="Drop a pack here"
        dropHint=".msul, or a .zip / .7z / .rar archive of audio"
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
    <InstalledOriginBar pack={installed} onDuplicated={select} onUpdated={select} onUninstalled={handleUninstalled} />
  );

  const detail = selected === null
    ? <Text>Select a music pack to edit its slots, layers and sounds</Text>
    : msu.loadingFiles
      ? <Text>Loading...</Text>
      : (
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

  return <MasterDetailLayout list={list} detail={detail} detailEmpty={!selected} />;
};

export { MsuManager };
export type { MsuManagerProps };
