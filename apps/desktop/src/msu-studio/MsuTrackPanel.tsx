/* @layer renderer-components @kind component */
import { DELUXE_TRACK_THRESHOLD } from '@rotp/hub-contracts';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { MsuPackHeader } from './MsuPackHeader';
import { TrackSection } from './TrackSection';
import { UnusedAudio } from './UnusedAudio';
import { useTrackPreviewSwitch } from './behavior/useTrackPreviewSwitch';
import { useTrackDetailRenderer } from './behavior/useTrackDetailRenderer';
import type { MsuTrackPanelProps } from './MsuTrackPanel.type';

const MsuTrackPanel = (props: MsuTrackPanelProps) => {
  const {
    selected, files, format, totalSize, isDeluxe, hasOpuz, rows, unusedFiles, fileOptions,
    playing, reportStore, openTrack, busy, readOnly, exporting, statusMessage, statusOk,
    onTrackAssign, onToggleLayers, onPreview, onStopPreview, onRename, onExport, onDeleteFile,
  } = props;

  const filled = rows.filter((r) => r.fileName !== null).length;
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
      <MsuPackHeader
        pack={selected}
        format={format}
        slotCount={filled}
        fileCount={files.length}
        totalSize={totalSize}
        isDeluxe={isDeluxe}
        hasOpuz={hasOpuz}
        busy={busy}
        readOnly={readOnly}
        exporting={exporting}
        onRename={onRename}
        onExport={onExport}
      />

      {(original.note ?? statusMessage) != null && (
        <Text className={`msu-status${original.note === null && statusOk ? '' : ' msu-status--error'}`}>
          {original.note ?? statusMessage}
        </Text>
      )}

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
