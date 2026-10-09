/* @layer renderer-components @kind component */
import { useCallback, useEffect } from 'react';
import { Box } from '@ds/primitives/Box';
import { TabBar } from '@ds/primitives/TabBar';
import { MsuEffectsPanel } from './MsuEffectsPanel';
import { MsuFilePanel } from './MsuFilePanel';
import { MsuSoundPanel } from './MsuSoundPanel';
import { MsuTrackPanel } from './MsuTrackPanel';
import { STUDIO_TABS } from './sound-labels';
import type { StudioTab } from './sound-labels';
import type { MsuStudioProps } from './MsuStudio.type';

const MsuStudio = (props: MsuStudioProps) => {
  const { msu, pack, readOnly, origin, tab, onTabChange, onDeleteConfirm } = props;

  const { onStopPreview, handleDeleteFile } = msu;
  useEffect(() => {
    if (tab !== 'music') onStopPreview();
  }, [tab, onStopPreview]);

  const confirmDeleteFile = useCallback((fileName: string) => {
    onDeleteConfirm('Delete Audio File', `Delete "${fileName}" from this pack? This cannot be undone.`, () => {
      handleDeleteFile(fileName);
    });
  }, [onDeleteConfirm, handleDeleteFile]);

  const soundProps = {
    pack,
    manifest: msu.resolved,
    saveBase: msu.manifest ?? msu.resolved,
    files: msu.files,
    isLayered: msu.format === 'layered',
    readOnly,
    onDeleteConfirm,
    onReload: msu.reload,
  };

  return (
    <Box className="msu-studio">
      {origin}
      <TabBar tabs={STUDIO_TABS} activeTab={tab} onTabChange={(id) => onTabChange(id as StudioTab)} />
      {tab === 'ambient' && <MsuSoundPanel channel="ambient" {...soundProps} />}
      {tab === 'effects' && <MsuEffectsPanel {...soundProps} />}
      {tab === 'files' && (
        <MsuFilePanel
          pack={pack}
          manifest={msu.resolved}
          saveBase={msu.manifest}
          files={msu.files}
          readOnly={readOnly}
          onDeleteConfirm={onDeleteConfirm}
          onReload={msu.reload}
        />
      )}
      {tab === 'music' && (
        <MsuTrackPanel
          selected={pack}
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
          readOnly={readOnly}
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
};

export { MsuStudio };
