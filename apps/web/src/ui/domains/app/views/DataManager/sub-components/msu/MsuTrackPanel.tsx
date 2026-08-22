/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { DELUXE_TRACK_THRESHOLD } from '@shared/types/msu-manifest';
import { Box } from '@ds/primitives/Box';
import { IconButton } from '@ds/primitives/IconButton';
import { Text } from '@ds/primitives/Text';
import type { SelectOption } from '@ds/primitives/Select';
import { formatBytes } from '@app/utils/formatBytes';
import { MsuPackHeader } from './MsuPackHeader';
import { TrackDetail } from './TrackDetail';
import { TrackSection } from './TrackSection';
import { useOriginalPreview } from './behavior/useOriginalPreview';
import { trackTarget } from './behavior/layer-target';
import type { ExportFormat } from './behavior/usePackExport';
import type { PreviewReportStore } from './behavior/preview-report-store';
import type { MatchedTrack, MsuFile, PackFormat } from './msu.type';
import './msu-studio.css';

interface MsuTrackPanelProps {
  selected: string;
  files: MsuFile[];
  manifest: MsuPackManifest;
  saveBase: MsuPackManifest;
  format: PackFormat;
  totalSize: number;
  isDeluxe: boolean;
  hasOpuz: boolean;
  rows: MatchedTrack[];
  unusedFiles: MsuFile[];
  fileOptions: SelectOption[];
  playing: number | null;
  /** The preview's live per-layer feed, read only by the readouts that draw it. */
  reportStore: PreviewReportStore;
  openTrack: number | null;
  busy: boolean;
  exporting: ExportFormat | null;
  statusMessage: string | null;
  statusOk: boolean;
  onTrackAssign: (trackNum: number, fileName: string) => void;
  onTrackUpload: (trackNum: number, files: File[]) => void;
  onToggleLayers: (trackNum: number) => void;
  onPreview: (trackNum: number) => void;
  onStopPreview: () => void;
  onRename: (name: string) => void;
  onExport: (format: ExportFormat) => void;
  onDeleteFile: (fileName: string) => void;
  onReload: () => void;
}

const MsuTrackPanel = (props: MsuTrackPanelProps) => {
  const {
    selected, files, manifest, saveBase, format, totalSize, isDeluxe, hasOpuz, rows, unusedFiles, fileOptions,
    playing, reportStore, openTrack, busy, exporting, statusMessage, statusOk,
    onTrackAssign, onTrackUpload, onToggleLayers, onPreview, onStopPreview, onRename, onExport,
    onDeleteFile, onReload,
  } = props;

  const filled = rows.filter((r) => r.fileName !== null).length;

  // The chip's own music, for hearing a slot as the game plays it. Owned here rather than passed
  // in: it needs no pack context, only the slot number.
  const original = useOriginalPreview('music');

  // One thing sounds at a time, so each start silences the other.
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
      uploading={busy}
      onUpload={onTrackUpload}
      onSaved={onReload}
    />
  ), [selected, manifest, saveBase, files, format, reportStore, busy, onTrackUpload, onReload]);

  const sectionProps = {
    files, fileOptions, playing, reportStore, openTrack, busy,
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
                <Text className="track-list__num">—</Text>
                <Text className="track-list__name">{file.name}</Text>
                <Text className="track-list__size">{formatBytes(file.size)}</Text>
                <IconButton
                  variant="ghost" size="sm" label={`Delete ${file.name}`} disabled={busy}
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
export type { MsuTrackPanelProps };
