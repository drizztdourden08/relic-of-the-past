/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import { StudioBody } from '@app/studio';
import { MsuTrackPanel } from './MsuTrackPanel';
import { TrackDetail } from './TrackDetail';
import { useTrackPreviewSwitch } from './behavior/useTrackPreviewSwitch';
import { DETAILS_PANEL, EDITOR_LABELS } from './studio-frame/studio-frame.constants';
import type { MsuMusicTabProps } from './MsuMusicTab.type';
import type { TrackPreviewControls } from './msu.type';

const MsuMusicTab = (props: MsuMusicTabProps) => {
  const { msu, pack, readOnly, tabs, packPanel, onDeleteConfirm } = props;
  const { handleDeleteFile, openTrack, selectTrack, onPreview, onStopPreview } = msu;
  const { original, previewTrack, playOriginal } = useTrackPreviewSwitch({ onPreview, onStopPreview });

  const confirmDeleteFile = useCallback((fileName: string) => {
    onDeleteConfirm('Delete Audio File', `Delete "${fileName}" from this pack? This cannot be undone.`, () => {
      handleDeleteFile(fileName);
    });
  }, [onDeleteConfirm, handleDeleteFile]);

  const controls = useMemo<TrackPreviewControls>(() => ({
    playing: msu.playing,
    playingOriginal: original.playing,
    onPreview: (trackNum) => { selectTrack(trackNum); previewTrack(trackNum); },
    onStopPreview,
    onPlayOriginal: (trackNum) => { selectTrack(trackNum); playOriginal(trackNum); },
  }), [msu.playing, original.playing, selectTrack, previewTrack, onStopPreview, playOriginal]);

  const row = openTrack === null ? undefined : msu.rows.find((candidate) => candidate.trackNum === openTrack);
  const detail = row === undefined ? packPanel : (
    <TrackDetail
      msu={msu}
      pack={pack}
      row={row}
      readOnly={readOnly}
      controls={controls}
      onClose={() => selectTrack(null)}
      onConfirm={onDeleteConfirm}
    />
  );

  return (
    <StudioBody editorLabel={EDITOR_LABELS.music} toolbar={tabs} end={{ ...DETAILS_PANEL, content: detail }}>
      <MsuTrackPanel
        rows={msu.rows}
        files={msu.files}
        unusedFiles={msu.unusedFiles}
        busy={msu.busy}
        readOnly={readOnly}
        selected={openTrack}
        note={original.note}
        controls={controls}
        onSelect={msu.handleToggleTrack}
        onDeleteFile={confirmDeleteFile}
      />
    </StudioBody>
  );
};

export { MsuMusicTab };
