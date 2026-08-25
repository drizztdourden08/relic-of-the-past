/* @layer renderer-components @kind component */
import { useCallback, useEffect, useState } from 'react';
import { ImportForm } from './ImportForm';
import { Box } from '../../../../../design-system/primitives/Box';
import { TabBar } from '../../../../../design-system/primitives/TabBar';
import { Text } from '../../../../../design-system/primitives/Text';
import { MasterDetailLayout } from '../../../../../design-system/composites/MasterDetailLayout';
import { deleteMsuPack } from '@app/lib/storage/msu-store';
import { useMsuManager } from './msu/useMsuManager';
import { MsuPackList } from './msu/MsuPackList';
import { MsuPackToolbar } from './msu/MsuPackToolbar';
import { MsuEffectsPanel } from './msu/MsuEffectsPanel';
import { MsuFilePanel } from './msu/MsuFilePanel';
import { MsuSoundPanel } from './msu/MsuSoundPanel';
import { MsuTrackPanel } from './msu/MsuTrackPanel';
import { STUDIO_TABS } from './msu/sound-labels';
import type { StudioTab } from './msu/sound-labels';
import type { MsuManagerProps } from './msu/msu.type';

const MsuManager = (props: MsuManagerProps) => {
  const { onDeleteConfirm, onRefresh } = props;
  const msu = useMsuManager(onRefresh);
  const { selected, setSelected, refresh } = msu;
  const [tab, setTab] = useState<StudioTab>('music');

  // A music audition is owned above the tabs, so leaving the music tab has to silence it — the
  // sound tabs stop themselves by unmounting.
  const { onStopPreview } = msu;
  useEffect(() => {
    if (tab !== 'music') onStopPreview();
  }, [tab, onStopPreview]);

  const handleDelete = useCallback((packName: string) => {
    onDeleteConfirm('Delete Music Pack', `Delete pack "${packName}"? This cannot be undone.`, async () => {
      await deleteMsuPack(packName);
      if (selected === packName) setSelected(null);
      await refresh();
    });
  }, [selected, refresh, onDeleteConfirm, setSelected]);

  const { handleDeleteFile } = msu;
  const confirmDeleteFile = useCallback((fileName: string) => {
    onDeleteConfirm('Delete Audio File', `Delete "${fileName}" from this pack? This cannot be undone.`, () => {
      handleDeleteFile(fileName);
    });
  }, [onDeleteConfirm, handleDeleteFile]);

  const list = (
    <>
      <MsuPackToolbar
        name={msu.newPackName}
        busy={msu.busy}
        onNameChange={msu.setNewPackName}
        onCreate={msu.handleCreatePack}
      />
      <ImportForm
        kind="msu"
        placeholder="Paste pack download URL…"
        accept={['.msul', '.zip', '.7z', '.rar']}
        dropLabel="Drop a pack here"
        dropHint=".msul, or a .zip / .7z / .rar archive of audio"
        onUrlImport={msu.handleUrlImport}
        onFileImport={msu.handleFileImport}
      />
      <MsuPackList
        packs={msu.packs}
        selected={selected}
        onSelect={setSelected}
        onDelete={handleDelete}
      />
    </>
  );

  const studio = selected === null ? null : (
    <Box className="msu-studio">
      <TabBar tabs={STUDIO_TABS} activeTab={tab} onTabChange={(id) => setTab(id as StudioTab)} />
      {tab === 'ambient' && (
        <MsuSoundPanel
          pack={selected}
          channel="ambient"
          manifest={msu.resolved}
          saveBase={msu.manifest ?? msu.resolved}
          files={msu.files}
          isLayered={msu.format === 'layered'}
          onDeleteConfirm={onDeleteConfirm}
          onReload={msu.reload}
        />
      )}
      {tab === 'effects' && (
        // Both effect ports, one section each — see MsuEffectsPanel for why they are not merged.
        <MsuEffectsPanel
          pack={selected}
          manifest={msu.resolved}
          saveBase={msu.manifest ?? msu.resolved}
          files={msu.files}
          isLayered={msu.format === 'layered'}
          onDeleteConfirm={onDeleteConfirm}
          onReload={msu.reload}
        />
      )}
      {tab === 'files' && (
        // saveBase is the pack's OWN manifest: a rename must not hand a classic pack one.
        <MsuFilePanel
          pack={selected}
          manifest={msu.resolved}
          saveBase={msu.manifest}
          files={msu.files}
          onDeleteConfirm={onDeleteConfirm}
          onReload={msu.reload}
        />
      )}
      {tab === 'music' && (
        <MsuTrackPanel
          selected={selected}
          files={msu.files}
          manifest={msu.resolved}
          saveBase={msu.manifest ?? msu.resolved}
          format={msu.format}
          totalSize={msu.totalSize}
          isDeluxe={msu.isDeluxe}
          hasOpuz={msu.hasOpuz}
          rows={msu.rows}
          unusedFiles={msu.unusedFiles}
          fileOptions={msu.fileOptions}
          playing={msu.playing}
          reportStore={msu.reportStore}
          openTrack={msu.openTrack}
          busy={msu.busy}
          exporting={msu.exporting}
          statusMessage={msu.statusMessage}
          statusOk={msu.statusOk}
          onTrackAssign={msu.handleTrackAssign}
          onTrackUpload={msu.handleTrackUpload}
          onToggleLayers={msu.handleToggleLayers}
          onPreview={msu.onPreview}
          onStopPreview={msu.onStopPreview}
          onRename={msu.handleRenamePack}
          onExport={msu.handleExport}
          onDeleteFile={confirmDeleteFile}
          onConfirm={onDeleteConfirm}
          onReload={msu.reload}
        />
      )}
    </Box>
  );

  const detail = selected === null
    ? <Text>Select a music pack to edit its slots, layers and sounds</Text>
    : msu.loadingFiles ? <Text>Loading…</Text> : studio;

  return <MasterDetailLayout list={list} detail={detail} detailEmpty={!selected} />;
};

export { MsuManager };
export type { MsuManagerProps };
