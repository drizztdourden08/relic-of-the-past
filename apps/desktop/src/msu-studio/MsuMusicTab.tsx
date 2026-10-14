/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { MsuTrackPanel } from './MsuTrackPanel';
import type { MsuMusicTabProps } from './MsuMusicTab.type';

const MsuMusicTab = (props: MsuMusicTabProps) => {
  const { msu, pack, readOnly, onDeleteConfirm } = props;
  const { handleDeleteFile } = msu;

  const confirmDeleteFile = useCallback((fileName: string) => {
    onDeleteConfirm('Delete Audio File', `Delete "${fileName}" from this pack? This cannot be undone.`, () => {
      handleDeleteFile(fileName);
    });
  }, [onDeleteConfirm, handleDeleteFile]);

  return (
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
  );
};

export { MsuMusicTab };
