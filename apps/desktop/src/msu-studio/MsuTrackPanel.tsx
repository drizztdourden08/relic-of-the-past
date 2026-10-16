/* @layer renderer-components @kind component */
import { DELUXE_TRACK_THRESHOLD } from '@rotp/hub-contracts';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { TrackSection } from './TrackSection';
import { UnusedAudio } from './UnusedAudio';
import { useTrackPreviewSwitch } from './behavior/useTrackPreviewSwitch';
import { useTrackDetailRenderer } from './behavior/useTrackDetailRenderer';
import type { MsuTrackPanelProps } from './MsuTrackPanel.type';

const MsuTrackPanel = (props: MsuTrackPanelProps) => {
  const {
    files, rows, unusedFiles, fileOptions,
    playing, reportStore, openTrack, busy, readOnly,
    onTrackAssign, onToggleLayers, onPreview, onStopPreview, onDeleteFile,
  } = props;

  const { original, previewTrack, playOriginal } = useTrackPreviewSwitch({ onPreview, onStopPreview });

  const renderDetail = useTrackDetailRenderer(props);

  const sectionProps = {
    files, fileOptions, playing, reportStore, openTrack, busy, readOnly,
    playingOriginal: original.playing,
    onAssign: onTrackAssign, onPreview: previewTrack, onStopPreview, onPlayOriginal: playOriginal,
    onToggleLayers, renderDetail,
  };

  return (
    <Box className="msu-panel">
      {original.note !== null && <Text className="msu-status msu-status--error">{original.note}</Text>}

      <TrackSection
        title="Standard Slots"
        rows={rows.filter((r) => r.trackNum < DELUXE_TRACK_THRESHOLD)}
        {...sectionProps}
      />
      <TrackSection
        title="Extended Slots"
        rows={rows.filter((r) => r.trackNum >= DELUXE_TRACK_THRESHOLD)}
        {...sectionProps}
      />

      <UnusedAudio unusedFiles={unusedFiles} busy={busy} readOnly={readOnly} onDeleteFile={onDeleteFile} />
    </Box>
  );
};

export { MsuTrackPanel };
