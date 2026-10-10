/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { DELUXE_TRACK_THRESHOLD } from '@rotp/hub-contracts';
import { Box, IconButton, Text } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@drizztdourden08/brock-core';
import { MsuPackHeader } from './MsuPackHeader';
import { TrackDetail } from './TrackDetail';
import { TrackSection } from './TrackSection';
import { useOriginalPreview } from './behavior/useOriginalPreview';
import { trackTarget } from './behavior/layer-target';
import type { MsuTrackPanelProps } from './MsuTrackPanel.type';
import './msu-studio.css';
import './msu-files.css';

const MsuTrackPanel = (props: MsuTrackPanelProps) => {
  const {
    selected, files, manifest, saveBase, format, totalSize, isDeluxe, hasOpuz, rows, unusedFiles, fileOptions,
    playing, reportStore, openTrack, busy, readOnly, exporting, statusMessage, statusOk,
    onTrackAssign, onToggleLayers, onPreview, onStopPreview, onRename, onExport,
    onDeleteFile, onConfirm, onReload,
  } = props;

  const filled = rows.filter((r) => r.fileName !== null).length;

  const original = useOriginalPreview('music');

  const previewTrack = useCallback((trackNum: number) => {
    original.stop();
    onPreview(trackNum);
  }, [original, onPreview]);

  const playOriginal = useCallback((trackNum: number) => {
    onStopPreview();
    original.play(trackNum);
  }, [original, onStopPreview]);

  const renderDetail = useCallback((trackNum: number) => (
    <TrackDetail
      pack={selected}
      trackNum={trackNum}
      target={trackTarget(trackNum)}
      manifest={manifest}
      saveBase={saveBase}
      availableFiles={files.map((f) => f.name)}
      isLayered={format === 'layered'}
      reportStore={reportStore}
      onConfirm={onConfirm}
      onSaved={onReload}
      readOnly={readOnly}
    />
  ), [selected, manifest, saveBase, files, format, reportStore, onConfirm, onReload, readOnly]);

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

      {unusedFiles.length > 0 && (
        <Box className="detail-panel__section">
          <Text as="h4" className="detail-panel__section-title">
            Unused Audio ({unusedFiles.length})
          </Text>
          <Box className="track-list">
            {unusedFiles.map((file) => (
              <Box key={file.name} className="track-list__item">
                <Text className="track-list__num">-</Text>
                <Text className="track-list__name">{file.name}</Text>
                <Text className="track-list__size">{formatBytes(file.size)}</Text>
                <IconButton
                  variant="ghost" size="sm" label={`Delete ${file.name}`} disabled={busy || readOnly}
                  onClick={() => onDeleteFile(file.name)}
                >
                  ✕
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export { MsuTrackPanel };
